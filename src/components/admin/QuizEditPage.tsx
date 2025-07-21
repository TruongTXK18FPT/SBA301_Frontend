import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaEye, FaEyeSlash, FaPlus, FaTrash } from 'react-icons/fa';
import quizService, { Category, QuizOptionsDTO } from '../../services/quizService';
import '../../styles/QuizEditPage.css';
import '../../styles/QuizEditPage2.css';

interface QuizEditPageProps {
  quizId: number;
  onBack: () => void;
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

interface EditableOption {
  id?: number;
  optionText: string;
  targetTrait?: string;
  scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO';
  questionId?: number;
}

interface EditableQuestion {
  id?: number;
  content: string;
  orderNumber: number;
  dimension: string;
  quizId: number;
  options: EditableOption[];
}

interface EditableQuiz {
  id: number;
  title: string;
  categoryId: number;
  description: string;
  questionQuantity: number;
  questions: EditableQuestion[];
}

const QuizEditPage: React.FC<QuizEditPageProps> = ({ quizId, onBack, onAlert }) => {
  const [quiz, setQuiz] = useState<EditableQuiz | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<EditableQuestion | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOptions, setEditingOptions] = useState<Set<string>>(new Set()); // questionIndex-optionIndex

  useEffect(() => {
    loadQuizData();
    loadCategories();
  }, [quizId]);

  const loadCategories = async () => {
    try {
      const categoriesData = await quizService.getAllCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      onAlert('error', 'Failed to load categories: ' + (error.message || 'Unknown error'));
    }
  };

  const loadQuizData = async () => {
    try {
      setLoading(true);

      // Load quiz basic info
      const quizData = await quizService.getQuizById(quizId);

      // Load quiz questions with options using the new API
      const questionsData = await quizService.getQuizQuestions(quizId);

      // Find the selected category first
      const category = categories.find(cat => cat.id === quizData.categoryId) ||
                     await quizService.getAllCategories().then(cats => cats.find(cat => cat.id === quizData.categoryId));
      setSelectedCategory(category || null);

      // Determine if this is a DISC quiz
      const isDiscQuiz = category?.name.toUpperCase().includes('DISC') || false;

      // Transform to editable format
      const editableQuestions: EditableQuestion[] = await Promise.all(
        questionsData.map(async q => {
          // Get options for this question using the new QuizOptionsController
          const optionsData = await quizService.getOptionsByQuestionId(q.id);

          return {
            id: q.id,
            content: q.content,
            orderNumber: q.orderNumber,
            dimension: q.dimension,
            quizId: q.quizId,
            options: optionsData.map(opt => ({
              id: opt.id,
              optionText: opt.optionText,
              targetTrait: opt.targetTrait,
              scoreValue: quizService.convertNumberToScoreValue(
                typeof opt.scoreValue === 'number' ? opt.scoreValue : (typeof opt.scoreValue === 'string' ? quizService.convertScoreValueToNumber(opt.scoreValue as any) : 0)
              ) as 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO',
              questionId: (opt.questionId !== undefined ? opt.questionId : 0)
            }))
          };
        })
      );

      const editableQuiz: EditableQuiz = {
        id: quizData.id,
        title: quizData.title,
        categoryId: quizData.categoryId,
        description: quizData.description,
        questionQuantity: quizData.questionQuantity,
        questions: editableQuestions
      };

      setQuiz(editableQuiz);

    } catch (error: any) {
      onAlert('error', 'Failed to load quiz data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuizInfoChange = (field: keyof EditableQuiz, value: string | number) => {
    if (!quiz) return;

    setQuiz(prev => {
      if (!prev) return prev;

      const updated = { ...prev, [field]: value };

      // If category changed, update selected category
      if (field === 'categoryId') {
        const category = categories.find(cat => cat.id === value);
        setSelectedCategory(category || null);
      }

      // If question quantity changed, validate it must be even for MBTI
      if (field === 'questionQuantity' && typeof value === 'number') {
        const isDiscQuiz = selectedCategory?.name.toUpperCase().includes('DISC');

        // Validate that MBTI question quantity must be even
        if (!isDiscQuiz && value % 2 !== 0) {
          onAlert('error', 'MBTI quiz question quantity must be an even number (2, 4, 6, 8, etc.)');
          return prev; // Don't update if odd number for MBTI
        }

        // If question quantity increased, add new questions
        if (value > prev.questions.length) {
          const newQuestions: EditableQuestion[] = [];

          for (let i = prev.questions.length; i < value; i++) {
            const newQuestion: EditableQuestion = {
              content: '',
              orderNumber: i + 1,
              dimension: isDiscQuiz ? 'DISC' : 'E/I', // Default to E/I for MBTI
              quizId: prev.id,
              options: []
            };

            // Create appropriate options based on quiz type
            if (isDiscQuiz) {
              // DISC quiz: 4 options with traits D, I, S, C and score value DISC_TWO (2)
              newQuestion.options = [
                { optionText: '', targetTrait: 'D', scoreValue: 'DISC_TWO', questionId: prev.id },
                { optionText: '', targetTrait: 'I', scoreValue: 'DISC_TWO', questionId: prev.id },
                { optionText: '', targetTrait: 'S', scoreValue: 'DISC_TWO', questionId: prev.id },
                { optionText: '', targetTrait: 'C', scoreValue: 'DISC_TWO', questionId: prev.id }
              ];
            } else {
              // MBTI quiz: 3 options with scores -1, 0, 1
              newQuestion.options = [
                { optionText: '', scoreValue: 'NEGATIVE_ONE', questionId: prev.id },
                { optionText: '', scoreValue: 'ZERO', questionId: prev.id },
                { optionText: '', scoreValue: 'POSITIVE_ONE', questionId: prev.id }
              ];
            }

            newQuestions.push(newQuestion);
          }

          updated.questions = [...prev.questions, ...newQuestions];
        } else if (value < prev.questions.length) {
          // If question quantity decreased, remove questions
          updated.questions = prev.questions.slice(0, value);
        }
      }

      return updated;
    });
  };

  const handleOptionChange = async (questionIndex: number, optionIndex: number, field: string, value: string) => {
    if (!quiz) return;

    setQuiz(prev => {
      if (!prev) return prev;

      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];

      if (field === 'optionText') {
        updatedOptions[optionIndex].optionText = value;
      } else if (field === 'scoreValue') {
        updatedOptions[optionIndex].scoreValue = value as 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO';
      } else if (field === 'targetTrait') {
        updatedOptions[optionIndex].targetTrait = value;
      }

      updatedQuestions[questionIndex].options = updatedOptions;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Add new question
  const addNewQuestion = async () => {
    if (!quiz || !selectedCategory) return;

    try {
      const isDiscQuiz = selectedCategory.name.toUpperCase().includes('DISC');
      const newQuestion: EditableQuestion = {
        id: undefined,
        content: '',
        orderNumber: quiz.questions.length, // This will be the correct order number
        dimension: isDiscQuiz ? 'DISC' : 'E/I',
        quizId: quiz.id,
        options: []
      };

      // Create appropriate options based on quiz type
      if (isDiscQuiz) {
        newQuestion.options = [
          { id: undefined, optionText: '', targetTrait: 'D', scoreValue: 'DISC_TWO', questionId: quiz.id },
          { id: undefined, optionText: '', targetTrait: 'I', scoreValue: 'DISC_TWO', questionId: quiz.id },
          { id: undefined, optionText: '', targetTrait: 'S', scoreValue: 'DISC_TWO', questionId: quiz.id },
          { id: undefined, optionText: '', targetTrait: 'C', scoreValue: 'DISC_TWO', questionId: quiz.id }
        ];
      } else {
        newQuestion.options = [
          { id: undefined, optionText: '', scoreValue: 'NEGATIVE_ONE', questionId: quiz.id },
          { id: undefined, optionText: '', scoreValue: 'ZERO', questionId: quiz.id },
          { id: undefined, optionText: '', scoreValue: 'POSITIVE_ONE', questionId: quiz.id }
        ];
      }

      // Add to local state first
      setQuiz(prev => {
        if (!prev) return prev;
        
        const updatedQuestions = [...prev.questions, newQuestion];
        return {
          ...prev,
          questions: updatedQuestions,
          questionQuantity: updatedQuestions.length
        };
      });

      // Get the index of the new question
      const newQuestionIndex = quiz.questions.length; // This is the correct index
      
      // Expand the new question automatically
      setExpandedQuestions(prev => new Set([...prev, newQuestionIndex]));

      // Save the new question
      // We don't need to get the last question ID since we just created it
      await saveQuestion(null); // Pass null to indicate it's a new question

      onAlert('success', 'New question added successfully!');

    } catch (error: any) {
      onAlert('error', 'Failed to add new question: ' + (error.message || 'Unknown error'));
    }
  };

  // Helper function to format MBTI dimension
  const formatMBTIDimension = (dimension: string): string => {
    const dimensionMap: { [key: string]: string } = {
      'E': 'E/I',
      'I': 'E/I',
      'S': 'S/N',
      'N': 'S/N',
      'T': 'T/F',
      'F': 'T/F',
      'J': 'J/P',
      'P': 'J/P'
    };
    return dimensionMap[dimension] || dimension;
  };

  // Update question dimension
  const updateQuestionDimension = async (questionIndex: number, dimension: string) => {
    if (!quiz) return;

    const isDiscQuiz = selectedCategory?.name?.toUpperCase().includes('DISC');
    if (!isDiscQuiz) {
      // Format MBTI dimension
      const formattedDimension = formatMBTIDimension(dimension);
      setQuiz(prev => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[questionIndex].dimension = formattedDimension;
        return { ...prev, questions: updatedQuestions };
      });
    }
  };

  // Toggle question expansion
  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  // Open edit modal for question
  const openEditModal = (question: EditableQuestion, index: number) => {
    setEditingQuestion({ ...question });
    setEditingQuestionIndex(index);
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingQuestion(null);
    setEditingQuestionIndex(null);
    setShowEditModal(false);
  };

  const saveQuestionFromModal = async () => {
  if (!editingQuestion || !quiz) return;

  // Allow partial save: do not require content or options here
  const validOptions = editingQuestion.options; // allow empty or incomplete options

  try {
    setSaving(true);

    // Update local quiz state with modal changes BEFORE saving to backend
    setQuiz(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map((q, idx) =>
        editingQuestionIndex !== null && idx === editingQuestionIndex
          ? {
              ...q,
              ...editingQuestion,
              options: validOptions.map(opt => ({
                ...opt,
                scoreValue: opt.scoreValue as 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO',
                questionId: (typeof opt.questionId === 'number' ? opt.questionId : (quiz.id !== undefined ? quiz.id : 0))
              }))
            }
          : q
      );
      return { ...prev, questions: updatedQuestions };
    });

    if (editingQuestion.id) {
      // Update existing question
      await quizService.updateQuizQuestion(editingQuestion.id, {
        content: editingQuestion.content,
        orderNumber: editingQuestion.orderNumber,
        dimension: editingQuestion.dimension,
        quizId: quiz.id,
        options: validOptions.map(opt => ({
          id: opt.id,
          optionText: opt.optionText,
          targetTrait: opt.targetTrait,
          scoreValue: opt.scoreValue,
          questionId: editingQuestion.id
        }))
      });

      onAlert('success', `Question ${editingQuestion.orderNumber} updated successfully!`);
    } else {
      // Create new question
      const newQuestion = await quizService.createQuizQuestion({
        content: editingQuestion.content,
        orderNumber: editingQuestion.orderNumber,
        dimension: editingQuestion.dimension,
        quizId: editingQuestion.quizId,
        options: []
      });

      // Create options in bulk after question is created
      if (validOptions.length > 0) {
        const optionsToCreate = validOptions.map(opt => ({
          optionText: opt.optionText,
          targetTrait: opt.targetTrait,
          scoreValue: opt.scoreValue,
          questionId: newQuestion.id
        }));

        await quizService.createQuizOptions(optionsToCreate);
      }

      // Update local state with new ID
      setQuiz(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map(q =>
            q.id === editingQuestion.id ? { ...q, id: newQuestion.id } : q
          )
        };
      });

      onAlert('success', `Question ${editingQuestion.orderNumber} created successfully!`);
    }

    closeEditModal();
  } catch (error: any) {
    onAlert('error', 'Failed to update question: ' + (error.message || 'Unknown error'));
  } finally {
    setSaving(false);
  }
};

  // Toggle option editing
  const toggleOptionEditing = (questionIndex: number, optionIndex: number) => {
    const key = `${questionIndex}-${optionIndex}`;
    setEditingOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

// Create a new question and its options
const createQuestion = async () => {
  if (!quiz) return;

  try {
    setSavingQuestionId(null);

    // Create new question
    const lastQuestion = quiz.questions[quiz.questions.length - 1];
    const newQuestion = await quizService.createQuizQuestion({
      content: lastQuestion.content,
      orderNumber: lastQuestion.orderNumber,
      dimension: lastQuestion.dimension,
      quizId: quiz.id,
      options: []
    });

    // Create options in bulk
    const optionsToCreate = lastQuestion.options
      .filter(opt => opt.optionText.trim())
      .map(opt => ({
        optionText: opt.optionText,
        targetTrait: opt.targetTrait,
        scoreValue: opt.scoreValue,
        questionId: newQuestion.id
      }));

    if (optionsToCreate.length > 0) {
      await quizService.createQuizOptions(optionsToCreate);
    }

    // Fetch the updated question and options from backend
    const updatedQuestion = await quizService.getQuizQuestionById(newQuestion.id);
    const updatedOptions = await quizService.getOptionsByQuestionId(newQuestion.id);

    // Update local state for just the last question
    setQuiz(prev => {
  if (!prev) return prev;
  const updatedQuestions = prev.questions.map((q, idx) =>
    idx === prev.questions.length - 1
      ? {
          ...q,
          ...updatedQuestion,
          options: updatedOptions.map(opt => ({
            id: opt.id,
            optionText: opt.optionText,
            targetTrait: opt.targetTrait,
            scoreValue: quizService.convertNumberToScoreValue(
              typeof opt.scoreValue === 'number' ? opt.scoreValue : (typeof opt.scoreValue === 'string' ? quizService.convertScoreValueToNumber(opt.scoreValue as any) : 0)
            ),
            questionId: opt.questionId
          }))
        }
      : q
  );
  return { ...prev, questions: updatedQuestions };
});

    onAlert('success', `Question ${lastQuestion.orderNumber + 1} created successfully!`);
  } catch (error: any) {
    onAlert('error', 'Failed to create question: ' + (error.message || 'Unknown error'));
  } finally {
    setSavingQuestionId(null);
  }
};

// Update an existing question and its options
const updateQuestion = async (questionId: number) => {
  if (!quiz) return;

  try {
    setSavingQuestionId(questionId);

    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      console.error('Question not found');
      onAlert('error', 'Question not found');
      return;
    }

    const question = quiz.questions[questionIndex];

    if (typeof question.id !== 'number') {
      onAlert('error', 'Invalid question ID.');
      return;
    }
    // Update existing question
    await quizService.updateQuizQuestion(question.id, {
      content: question.content,
      orderNumber: question.orderNumber,
      dimension: question.dimension,
      quizId: question.quizId,
      options: question.options.map(opt => ({
        id: opt.id,
        optionText: opt.optionText,
        targetTrait: opt.targetTrait,
        scoreValue: opt.scoreValue,
        questionId: question.id
      }))
    });

    // Update options in bulk
    const optionsToUpdate = question.options
      .filter(opt => opt.id && opt.optionText.trim() && typeof question.id === 'number')
      .map(opt => ({
        id: opt.id,
        optionText: opt.optionText,
        targetTrait: opt.targetTrait,
        scoreValue: opt.scoreValue as 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO',
        questionId: question.id as number
      }));

    if (optionsToUpdate.length > 0) {
      await quizService.createQuizOptions(optionsToUpdate);
    }

    // Fetch the updated question and options from backend
    if (typeof question.id === 'number') {
      const updatedQuestion = await quizService.getQuizQuestionById(question.id);
      const updatedOptions = await quizService.getOptionsByQuestionId(question.id);

      // Update local state for just this question
      setQuiz(prev => {
        if (!prev) return prev;
        const updatedQuestions = prev.questions.map(q =>
          q.id === question.id
            ? {
                ...q,
                ...updatedQuestion,
                options: updatedOptions.map(opt => ({
                  id: opt.id,
                  optionText: opt.optionText,
                  targetTrait: opt.targetTrait,
                  scoreValue: quizService.convertNumberToScoreValue(
                    typeof opt.scoreValue === 'number' ? opt.scoreValue : (typeof opt.scoreValue === 'string' ? quizService.convertScoreValueToNumber(opt.scoreValue as any) : 0)
                  ),
                  questionId: opt.questionId
                }))
              }
            : q
        );
        return { ...prev, questions: updatedQuestions };
      });

      onAlert('success', `Question ${question.orderNumber} updated successfully!`);
    }
  } catch (error: any) {
    onAlert('error', 'Failed to update question: ' + (error.message || 'Unknown error'));
  } finally {
    setSavingQuestionId(null);
  }
};

const saveOption = async (questionIndex: number, optionIndex: number) => {
  if (!quiz) return;

  const question = quiz.questions[questionIndex];
  const option = question.options[optionIndex];

  if (typeof question.id !== 'number') {
    onAlert('error', 'Please save the question first before saving its options.');
    return;
  }

  try {
    setSaving(true);

    if (option.id) {
      // Update existing option
      await quizService.updateQuizOption(option.id, {
        optionText: option.optionText,
        targetTrait: option.targetTrait,
        scoreValue: option.scoreValue,
        questionId: (option.questionId !== undefined ? option.questionId : (typeof question.id === 'number' ? question.id : 0))
      });

      onAlert('success', `Option ${optionIndex + 1} updated successfully!`);
    } else {
      // Create new option
      const createdOption = await quizService.createQuizOption({
        optionText: option.optionText,
        targetTrait: option.targetTrait,
        scoreValue: option.scoreValue,
        questionId: (typeof question.id === 'number' ? question.id : 0)
      });

      // Update local state with new option ID
      setQuiz(prev => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        const updatedOptions = [...updatedQuestions[questionIndex].options];
        updatedOptions[optionIndex] = { ...option, id: createdOption.id };
        updatedQuestions[questionIndex].options = updatedOptions;
        return { ...prev, questions: updatedQuestions };
      });

      onAlert('success', `Option ${optionIndex + 1} created successfully!`);
    }

    // Toggle editing off
    toggleOptionEditing(questionIndex, optionIndex);
  } catch (error: any) {
    onAlert('error', 'Failed to save option: ' + (error.message || 'Unknown error'));
  } finally {
    setSaving(false);
  }
};

// Main saveQuestion function
const saveQuestion = async (questionId: number | null) => {
  if (questionId === null) {
    await createQuestion();
  } else {
    await updateQuestion(questionId);
  }
};

  const validateQuiz = (): string[] => {
    if (!quiz || !selectedCategory) return ['Quiz data not loaded'];

    const errors: string[] = [];
    const isDiscQuiz = selectedCategory.name.toUpperCase().includes('DISC');

    // Basic quiz validation
    if (!quiz.title.trim()) {
      errors.push('Quiz title is required');
    }

    if (!quiz.categoryId) {
      errors.push('Category is required');
    }

    // MBTI vs DISC specific validations
    if (isDiscQuiz) {
      // DISC validation: Each question must have exactly 4 options (D, I, S, C)
      quiz.questions.forEach((question, qIndex) => {
        if (!question.content.trim()) {
          errors.push(`Question ${qIndex + 1}: Content is required`);
        }

        if (!question.dimension.trim()) {
          errors.push(`Question ${qIndex + 1}: Dimension is required`);
        }

        // Check if question has exactly 4 options
        if (question.options.length !== 4) {
          errors.push(`Question ${qIndex + 1}: DISC questions must have exactly 4 options (D, I, S, C)`);
        } else {
          // Check if all 4 DISC traits are present
          const traits = question.options.map(opt => opt.targetTrait).filter(Boolean);
          const uniqueTraits = [...new Set(traits)];
          const requiredTraits = ['D', 'I', 'S', 'C'];

          for (const trait of requiredTraits) {
            if (!uniqueTraits.includes(trait)) {
              errors.push(`Question ${qIndex + 1}: Missing trait "${trait}". All DISC options (D, I, S, C) must be present`);
            }
          }

          // Check for duplicate traits
          if (traits.length !== uniqueTraits.length) {
            errors.push(`Question ${qIndex + 1}: Duplicate traits found. Each trait (D, I, S, C) should appear only once`);
          }

          // Validate that all options have DISC_TWO score value
          question.options.forEach((option, oIndex) => {
            if (option.scoreValue !== 'DISC_TWO') {
              errors.push(`Question ${qIndex + 1}, Option ${oIndex + 1}: DISC options must have score value "Most Like Me (2)"`);
            }
          });
        }

        // Validate option text
        question.options.forEach((option, oIndex) => {
          if (!option.optionText.trim()) {
            errors.push(`Question ${qIndex + 1}, Option ${oIndex + 1}: Text is required`);
          }
        });
      });
    } else {
      // MBTI validation: Question quantity must be even
      if (quiz.questionQuantity % 2 !== 0) {
        errors.push('MBTI quiz must have an even number of questions (2, 4, 6, 8, etc.)');
      }

      quiz.questions.forEach((question, qIndex) => {
        if (!question.content.trim()) {
          errors.push(`Question ${qIndex + 1}: Content is required`);
        }

        if (!question.dimension.trim()) {
          errors.push(`Question ${qIndex + 1}: Dimension is required`);
        }

        // MBTI questions should typically have 3 options (Disagree, Neutral, Agree)
        if (question.options.length !== 3) {
          errors.push(`Question ${qIndex + 1}: MBTI questions should have exactly 3 options (Disagree, Neutral, Agree)`);
        }

        // Validate that options have correct score values
        const expectedScoreValues = ['NEGATIVE_ONE', 'ZERO', 'POSITIVE_ONE'];
        const actualScoreValues = question.options.map(opt => opt.scoreValue);

        for (const expectedValue of expectedScoreValues) {
          if (!actualScoreValues.includes(expectedValue as any)) {
            errors.push(`Question ${qIndex + 1}: Missing score value "${expectedValue}". MBTI questions need Disagree (-1), Neutral (0), and Agree (1) options`);
          }
        }

        question.options.forEach((option, oIndex) => {
          if (!option.optionText.trim()) {
            errors.push(`Question ${qIndex + 1}, Option ${oIndex + 1}: Text is required`);
          }
        });
      });
    }

    return errors;
  };

  const handleSave = async () => {
  if (!quiz) return;

  // Force DISC score value in local state before validation
  const isDiscQuiz = selectedCategory?.name.toUpperCase().includes('DISC') || false;
  if (isDiscQuiz) {
    setQuiz(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
          ...opt,
          scoreValue: 'DISC_TWO' as 'DISC_TWO',
        }))
      }));
      return { ...prev, questions: updatedQuestions, questionQuantity: updatedQuestions.length };
    });
  }

  // Wait for state update before validating
  await new Promise(resolve => setTimeout(resolve, 0));

  const validationErrors = validateQuiz();
  if (validationErrors.length > 0) {
    onAlert('error', 'Please fix the following errors:\n' + validationErrors.join('\n'));
    return;
  }

  try {
    setSaving(true);

    // Update basic quiz info
    await quizService.updateQuiz(quiz.id, {
      title: quiz.title,
      categoryId: quiz.categoryId,
      description: quiz.description,
      questionQuantity: quiz.questions.length
    });

    // Process each question and its options
    for (const question of quiz.questions) {
      // Already forced DISC score value above
      if (!isDiscQuiz) {
        // Force MBTI score values
        const mbtiScoreValues = ['NEGATIVE_ONE', 'ZERO', 'POSITIVE_ONE'];
        question.options = question.options.map((opt, idx) => ({
          ...opt,
          scoreValue: (mbtiScoreValues[idx] || opt.scoreValue) as 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO'
        }));
      }

      // First update the question
      await quizService.updateQuizQuestion(typeof question.id === 'number' ? question.id : 0, {
        content: question.content,
        orderNumber: question.orderNumber,
        dimension: question.dimension,
        quizId: quiz.id,
        options: [] // Don't send options in the question update
      });

      // Get existing options for this question
      const existingOptions = await quizService.getOptionsByQuestionId(typeof question.id === 'number' ? question.id : 0);

      // Process options
      const optionsToUpdate: QuizOptionsDTO[] = [];
      const optionsToCreate: QuizOptionsDTO[] = [];

      for (const option of question.options) {
        if (option.id) {
          // Existing option - update it
          const existingOption = existingOptions.find(opt => opt.id === option.id);
          if (existingOption) {
            optionsToUpdate.push({
              id: option.id,
              optionText: option.optionText,
              targetTrait: option.targetTrait,
              scoreValue: option.scoreValue,
              questionId: (typeof question.id === 'number' ? question.id : 0)
            });
          }
        } else {
          // New option - create it
          optionsToCreate.push({
            optionText: option.optionText,
            targetTrait: option.targetTrait,
            scoreValue: option.scoreValue,
            questionId: (typeof question.id === 'number' ? question.id : 0)
          });
        }
      }

      // Update existing options
      if (optionsToUpdate.length > 0) {
        await quizService.createQuizOptions(optionsToUpdate);
      }

      // Create new options
      if (optionsToCreate.length > 0) {
        await quizService.createQuizOptions(optionsToCreate);
      }
    }

    onAlert('success', 'Quiz updated successfully!');
    await loadQuizData();

  } catch (error: any) {
    onAlert('error', 'Failed to save quiz: ' + (error.message || 'Unknown error'));
  } finally {
    setSaving(false);
  }
};

  const getMBTIDimensions = () => ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
  const getDISCTraits = () => ['D', 'I', 'S', 'C'];

  // Get appropriate score options based on quiz type
  const getScoreOptions = (isDiscQuiz: boolean) => {
    return quizService.getScoreValuesForQuizType(isDiscQuiz);
  };

  if (loading) {
    return (
      <div className="quiz-edit-container">
        <div className="quiz-edit-loading">Loading quiz data...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-edit-container">
        <div className="quiz-edit-error">Quiz not found</div>
      </div>
    );
  }

  const isDiscQuiz = selectedCategory?.name.toUpperCase().includes('DISC') || false;

  return (
    <div className="quiz-edit-container">
      <div className="quiz-edit-content">
        {/* Header */}
        <div className="quiz-edit-header">
          <h1>Edit Quiz</h1>
          <p className="quiz-edit-subtitle">{quiz.title} ({isDiscQuiz ? 'DISC' : 'MBTI'} Type)</p>
        </div>

        {/* Basic Quiz Information */}
        <div className="quiz-info-section">
          <h3>Quiz Information</h3>

          <div className="quiz-edit-form">
            <div className="form-group-modern">
              <label htmlFor="quiz-title">Quiz Title *</label>
              <input
                id="quiz-title"
                type="text"
                value={quiz.title}
                onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="form-group-modern">
              <label htmlFor="quiz-category">Category *</label>
              <select
                id="quiz-category"
                value={quiz.categoryId}
                onChange={(e) => handleQuizInfoChange('categoryId', parseInt(e.target.value))}
                required
              >
                <option value={0}>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-modern">
              <label htmlFor="quiz-description">Description</label>
              <textarea
                id="quiz-description"
                value={quiz.description}
                onChange={(e) => handleQuizInfoChange('description', e.target.value)}
                placeholder="Enter quiz description"
                rows={4}
              />
            </div>

            <div className="form-group-modern">
              <label htmlFor="quiz-quantity">
                Number of Questions *
                {!isDiscQuiz && <span className="dimension-hint">(Must be even for MBTI)</span>}
              </label>
              <input
                id="quiz-quantity"
                type="number"
                min="1"
                max="100"
                value={quiz.questionQuantity}
                readOnly
                tabIndex={-1}
                style={{ background: '#f3f4f6', cursor: 'not-allowed', pointerEvents: 'none' }}
              />
            </div>

            <div className="quiz-type-info">
              <h4>Quiz Type Information:</h4>
              <div className="type-details">
                {isDiscQuiz ? (
                  <div className="disc-info">
                    <span className="type-badge disc">DISC Assessment</span>
                    <ul>
                      <li>Each question has 4 options (D, I, S, C traits)</li>
                      <li>Score value: 2 points for "Most Like Me"</li>
                      <li>Measures behavioral preferences</li>
                    </ul>
                  </div>
                ) : (
                  <div className="mbti-info">
                    <span className="type-badge mbti">MBTI Assessment</span>
                    <ul>
                      <li>Each question has 3 options (Disagree: -1, Neutral: 0, Agree: 1)</li>
                      <li>Question quantity must be even</li>
                      <li>Measures personality preferences</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="questions-section">
          <div className="questions-header">
            <h3>Questions ({quiz.questions.length})</h3>
          </div>

          <div className="questions-list">
            {quiz.questions.map((question, index) => (
              <div key={question.id || `new-question-${index}`} className="question-card-modern">
                {/* Question Header */}
                <div className="question-header-modern">
                  <div className="question-badge">
                    Question {question.orderNumber}
                    {question.id === null && <span className="new-indicator">NEW</span>}
                  </div>
                  <div className="question-actions-modern">
                      <button
                        type="button"
                        className="secondary-btn action-btn"
                        onClick={() => openEditModal(question, index)}
                        title="Edit Question"
                      >
                        <FaEdit style={{ marginRight: '0.4em' }} /> Edit
                      </button>
                      <button
                        type="button"
                        className={expandedQuestions.has(index) ? "primary-btn action-btn" : "outline-btn action-btn"}
                        onClick={() => toggleQuestionExpansion(index)}
                        title={expandedQuestions.has(index) ? "Hide Options" : "Show Options"}
                      >
                        {expandedQuestions.has(index) ? <FaEyeSlash style={{ marginRight: '0.4em' }} /> : <FaEye style={{ marginRight: '0.4em' }} />}
                        {expandedQuestions.has(index) ? 'Hide' : 'Show'} Options
                      </button>
                      <button
                        type="button"
                        className="primary-btn action-btn"
                        onClick={() => saveQuestion(question.id ?? null)}
                        title="Save Question"
                        disabled={savingQuestionId === question.id}
                      >
                        <FaSave style={{ marginRight: '0.4em' }} /> {savingQuestionId === question.id ? 'Saving...' : 'Save Question'}
                      </button>
                    </div>
                </div>

                <div className="question-content-modern">
                  {editingQuestion?.id === question.id ? (
                    <div className="question-edit-form">
                      <div className="form-group-modern">
                        <label htmlFor={`question-content-${index}`}>Question Text *</label>
                        <textarea
                          id={`question-content-${index}`}
                          value={question.content}
                          onChange={(e) => {
                            const newContent = e.target.value;
                            setQuiz(prev => {
                              if (!prev) return prev;
                              const updatedQuestions = [...prev.questions];
                              updatedQuestions[index] = { ...updatedQuestions[index], content: newContent };
                              return { ...prev, questions: updatedQuestions };
                            });
                          }}
                          placeholder="Enter question text..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="question-text-modern">
                      {question.content}
                    </div>
                  )}
                </div>

                {/* Options (Collapsible) */}
                {expandedQuestions.has(index) && (
                  <div className="options-section-modern">
                    <h5>Options ({isDiscQuiz ? 'DISC Traits' : 'MBTI Scale'})</h5>
                    <div className="options-grid-modern">
                      {question.options.map((option, optionIndex) => {
                        const editKey = `${index}-${optionIndex}`;
                        const isEditing = editingOptions.has(editKey);
                        const scoreOptions = getScoreOptions(isDiscQuiz);

                        return (
                          <div key={option.id || `new-option-${index}-${optionIndex}`} className="option-card-modern">
                            <div className="option-header-modern">
                              <div className="option-badge">
                                Option {optionIndex + 1}
                                {isDiscQuiz && option.targetTrait && (
                                  <span className={`trait-indicator trait-${option.targetTrait.toLowerCase()}`}>
                                    {option.targetTrait}
                                  </span>
                                )}
                                {!isDiscQuiz && (
                                  <span className="score-indicator">
                                    {quizService.convertScoreValueToNumber(option.scoreValue)}
                                  </span>
                                )}
                                {option.id === null && <span className="new-indicator">NEW</span>}
                              </div>
                              <button
                                type="button"
                                className={isEditing ? "primary-btn action-btn" : "outline-btn action-btn"}
                                onClick={() => isEditing ? saveOption(index, optionIndex) : toggleOptionEditing(index, optionIndex)}
                                title={isEditing ? "Save Option" : "Edit Option"}
                                disabled={saving}
                              >
                                <FaEdit style={{ marginRight: '0.4em' }} /> {isEditing ? 'Save' : 'Edit'}
                              </button>
                            </div>

                            <div className="option-content-modern">
                              {isEditing ? (
                                <div className="option-edit-form">
                                  <div className="form-group-modern">
                                    <label htmlFor={`option-text-${index}-${optionIndex}`}>Option Text *</label>
                                    <textarea
                                      id={`option-text-${index}-${optionIndex}`}
                                      value={option.optionText}
                                      onChange={(e) => handleOptionChange(index, optionIndex, 'optionText', e.target.value)}
                                      placeholder="Enter option text..."
                                      rows={2}
                                      required
                                    />
                                  </div>

                                  {isDiscQuiz ? (
  <div className="form-group-modern">
    <label htmlFor={`target-trait-${index}-${optionIndex}`}>Target Trait *</label>
    <select
      id={`target-trait-${index}-${optionIndex}`}
      value={option.targetTrait || 'D'}
      onChange={(e) => handleOptionChange(index, optionIndex, 'targetTrait', e.target.value)}
      required
    >
      {getDISCTraits().map(trait => (
        <option key={trait} value={trait}>
          {trait} - {trait === 'D' ? 'Dominance' : trait === 'I' ? 'Influence' : trait === 'S' ? 'Steadiness' : 'Conscientiousness'}
        </option>
      ))}
    </select>
    {/* Always set scoreValue to DISC_TWO for DISC */}
    <input type="hidden" value="DISC_TWO" />
  </div>
) : (
                                    <div className="form-group-modern">
                                      <label htmlFor={`score-value-${index}-${optionIndex}`}>Score Value *</label>
                                      <select
                                        id={`score-value-${index}-${optionIndex}`}
                                        value={option.scoreValue}
                                        onChange={(e) => handleOptionChange(index, optionIndex, 'scoreValue', e.target.value)}
                                        required
                                      >
                                        {scoreOptions.map(score => (
                                          <option key={score.value} value={score.value}>
                                            {score.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="option-text-modern">
                                  {option.optionText}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Edit Question Modal */}
        {showEditModal && editingQuestion && (
          <div className="modal-overlay-modern">
            <div className="modal-content-modern">
              <div className="modal-header-modern">
                <h3>Edit Question {editingQuestion.orderNumber}</h3>
                <button
                  type="button"
                  className="outline-btn action-btn modal-close-btn"
                  onClick={closeEditModal}
                  title="Close"
                >
                  ×
                </button>
              </div>

              <div className="modal-body-modern">
                <div className="form-group-modern">
                  <label htmlFor="edit-question-content">Question Text *</label>
                  <textarea
                    id="edit-question-content"
                    value={editingQuestion.content}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, content: e.target.value } : null)}
                    placeholder="Enter your question here..."
                    rows={4}
                    required
                  />
                </div>

                {!isDiscQuiz && (
                  <div className="form-group-modern">
                    <label htmlFor="edit-question-dimension">Dimension *</label>
                    <select
                      id="edit-question-dimension"
                      value={editingQuestion.dimension}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, dimension: e.target.value } : null)}
                      required
                    >
                      <option value="">Select dimension</option>
                      <option value="E/I">E/I</option>
                      <option value="S/N">S/N</option>
                      <option value="T/F">T/F</option>
                      <option value="J/P">J/P</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer-modern">
                <button
                  type="button"
                  className="outline-btn action-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn action-btn"
                  onClick={saveQuestionFromModal}
                  disabled={saving}
                >
                  <FaSave style={{ marginRight: '0.4em' }} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="quiz-edit-actions">
          <div className="quiz-edit-actions-group">
            <button
              type="button"
              className="outline-btn action-btn"
              onClick={onBack}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-btn action-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave style={{ marginRight: '0.4em' }} /> {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditPage;
