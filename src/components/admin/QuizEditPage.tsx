import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Button from '../Button';
import quizService, { QuizData, Category, QuizQuestionResponse, QuizOptionResponse } from '../../services/quizService';
import '../../styles/QuizEditPage.css';

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
  isNew?: boolean;
}

interface EditableQuestion {
  id?: number;
  content: string;
  orderNumber: number;
  dimension: string;
  options: EditableOption[];
  isNew?: boolean;
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

      // Load quiz questions
      const questionsData = await quizService.getQuizQuestions(quizId);

      // Transform to editable format
      const editableQuestions: EditableQuestion[] = questionsData.map(q => ({
        id: q.id,
        content: q.content,
        orderNumber: q.orderNumber,
        dimension: q.dimension,
        options: q.options.map(opt => ({
          id: opt.id,
          optionText: opt.optionText,
          targetTrait: opt.targetTrait,
          scoreValue: mapScoreValueToEnum(opt.scoreValue),
          isNew: false
        }))
      }));

      const editableQuiz: EditableQuiz = {
        id: quizData.id,
        title: quizData.title,
        categoryId: quizData.categoryId,
        description: quizData.description,
        questionQuantity: quizData.questionQuantity,
        questions: editableQuestions
      };

      setQuiz(editableQuiz);

      // Find and set the selected category
      const category = categories.find(cat => cat.id === quizData.categoryId);
      setSelectedCategory(category || null);

    } catch (error: any) {
      onAlert('error', 'Failed to load quiz data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const mapScoreValueToEnum = (scoreValue: number): 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO' => {
    switch (scoreValue) {
      case -1: return 'NEGATIVE_ONE';
      case 0: return 'ZERO';
      case 1: return 'POSITIVE_ONE';
      case 2: return 'DISC_TWO';
      default: return 'ZERO';
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

      // If question quantity changed, validate it must be even
      if (field === 'questionQuantity' && typeof value === 'number') {
        // Validate that question quantity must be even
        if (value % 2 !== 0) {
          onAlert('error', 'Question quantity must be an even number (2, 4, 6, 8, etc.)');
          return prev; // Don't update if odd number
        }

        // If question quantity increased, add new questions
        if (value > prev.questions.length) {
          const newQuestions = [];
          const isDiscQuiz = selectedCategory?.name.toUpperCase().includes('DISC');

          for (let i = prev.questions.length; i < value; i++) {
            const newQuestion: EditableQuestion = {
              content: '',
              orderNumber: i + 1,
              dimension: isDiscQuiz ? 'DISC' : 'E',
              options: [],
              isNew: true
            };

            if (isDiscQuiz) {
              newQuestion.options = [
                { optionText: '', targetTrait: 'D', scoreValue: 'DISC_TWO', isNew: true },
                { optionText: '', targetTrait: 'I', scoreValue: 'DISC_TWO', isNew: true },
                { optionText: '', targetTrait: 'S', scoreValue: 'DISC_TWO', isNew: true },
                { optionText: '', targetTrait: 'C', scoreValue: 'DISC_TWO', isNew: true }
              ];
            } else {
              newQuestion.options = [
                { optionText: '', scoreValue: 'NEGATIVE_ONE', isNew: true },
                { optionText: '', scoreValue: 'ZERO', isNew: true },
                { optionText: '', scoreValue: 'POSITIVE_ONE', isNew: true }
              ];
            }

            newQuestions.push(newQuestion);
          }

          updated.questions = [...prev.questions, ...newQuestions];
        }
      }

      return updated;
    });
  };

  const handleQuestionChange = (questionIndex: number, field: string, value: string) => {
    if (!quiz) return;

    setQuiz(prev => {
      if (!prev) return prev;

      const updatedQuestions = [...prev.questions];
      if (field === 'content') {
        updatedQuestions[questionIndex].content = value;
      } else if (field === 'dimension') {
        updatedQuestions[questionIndex].dimension = value;
      }

      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: string, value: string) => {
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

  const addNewQuestion = () => {
    if (!quiz || !selectedCategory) return;

    const isDiscQuiz = selectedCategory.name.toUpperCase().includes('DISC');
    const newQuestion: EditableQuestion = {
      content: '',
      orderNumber: quiz.questions.length + 1,
      dimension: isDiscQuiz ? 'DISC' : 'E',
      options: [],
      isNew: true
    };

    if (isDiscQuiz) {
      newQuestion.options = [
        { optionText: '', targetTrait: 'D', scoreValue: 'DISC_TWO', isNew: true },
        { optionText: '', targetTrait: 'I', scoreValue: 'DISC_TWO', isNew: true },
        { optionText: '', targetTrait: 'S', scoreValue: 'DISC_TWO', isNew: true },
        { optionText: '', targetTrait: 'C', scoreValue: 'DISC_TWO', isNew: true }
      ];
    } else {
      newQuestion.options = [
        { optionText: '', scoreValue: 'NEGATIVE_ONE', isNew: true },
        { optionText: '', scoreValue: 'ZERO', isNew: true },
        { optionText: '', scoreValue: 'POSITIVE_ONE', isNew: true }
      ];
    }

    setQuiz(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
        questionQuantity: prev.questions.length + 1
      };
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (!quiz) return;

    setQuiz(prev => {
      if (!prev) return prev;

      const updatedQuestions = prev.questions.filter((_, index) => index !== questionIndex);
      // Update order numbers
      updatedQuestions.forEach((question, index) => {
        question.orderNumber = index + 1;
      });

      return {
        ...prev,
        questions: updatedQuestions,
        questionQuantity: updatedQuestions.length
      };
    });
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
        questionQuantity: quiz.questionQuantity
      });

      // Update/create questions and options
      for (const question of quiz.questions) {
        if (question.isNew) {
          // Create new question
          await quizService.createQuizQuestion({
            content: question.content,
            orderNumber: question.orderNumber,
            dimension: question.dimension,
            quizId: quiz.id,
            options: question.options.map(opt => ({
              optionText: opt.optionText,
              targetTrait: opt.targetTrait,
              scoreValue: opt.scoreValue
            }))
          });
        } else if (question.id) {
          // Update existing question
          await quizService.updateQuizQuestion(question.id, {
            content: question.content,
            orderNumber: question.orderNumber,
            dimension: question.dimension,
            quizId: quiz.id,
            options: question.options.map(opt => ({
              optionText: opt.optionText,
              targetTrait: opt.targetTrait,
              scoreValue: opt.scoreValue
            }))
          });
        }
      }

      onAlert('success', 'Quiz updated successfully!');
      onBack();

    } catch (error: any) {
      onAlert('error', 'Failed to save quiz: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const getMBTIDimensions = () => ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
  const getDISCTraits = () => ['D', 'I', 'S', 'C'];

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

  return (
    <div className="quiz-edit-container">
      <div className="quiz-edit-header">
        <Button
          variant="outline"
          size="sm"
          icon={<FaArrowLeft />}
          onClick={onBack}
        >
          Back to Quiz List
        </Button>
        <h2>Edit Quiz: {quiz.title}</h2>
      </div>

      {/* Basic Quiz Information */}
      <div className="quiz-info-section">
        <h3>Quiz Information</h3>

        <div className="quiz-edit-form">
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="quiz-description">Description</label>
            <textarea
              id="quiz-description"
              value={quiz.description}
              onChange={(e) => handleQuizInfoChange('description', e.target.value)}
              placeholder="Enter quiz description"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="quiz-quantity">Number of Questions *</label>
            <input
              id="quiz-quantity"
              type="number"
              min="1"
              max="50"
              value={quiz.questionQuantity}
              onChange={(e) => handleQuizInfoChange('questionQuantity', parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="questions-section">
        <h3>Questions ({quiz.questions.length})</h3>

        <div className="questions-container">
          {quiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-block">
              <div className="question-header">
                <h4>Question {question.orderNumber}</h4>
                {quiz.questions.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<FaTrash />}
                    onClick={() => removeQuestion(questionIndex)}
                    title="Remove Question"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="quiz-edit-form">
                <div className="form-group">
                  <label htmlFor={`question-content-${questionIndex}`}>Question Content *</label>
                  <textarea
                    id={`question-content-${questionIndex}`}
                    value={question.content}
                    onChange={(e) => handleQuestionChange(questionIndex, 'content', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`question-dimension-${questionIndex}`}>Dimension *</label>
                  {selectedCategory?.name.toUpperCase().includes('DISC') ? (
                    <select
                      id={`question-dimension-${questionIndex}`}
                      value={question.dimension}
                      onChange={(e) => handleQuestionChange(questionIndex, 'dimension', e.target.value)}
                      required
                    >
                      <option value="DISC">DISC</option>
                    </select>
                  ) : (
                    <select
                      id={`question-dimension-${questionIndex}`}
                      value={question.dimension}
                      onChange={(e) => handleQuestionChange(questionIndex, 'dimension', e.target.value)}
                      required
                    >
                      <option value="">Select dimension</option>
                      {getMBTIDimensions().map(dim => (
                        <option key={dim} value={dim}>{dim}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="options-container">
                <h4>Options</h4>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-block">
                    <div className="option-header">
                      <span>Option {optionIndex + 1}</span>
                      {selectedCategory?.name.toUpperCase().includes('DISC') && (
                        <span className={`trait-badge trait-${option.targetTrait}`}>
                          {option.targetTrait} Trait
                        </span>
                      )}
                      {!selectedCategory?.name.toUpperCase().includes('DISC') && (
                        <span className="dimension-badge">
                          Dimension: {question.dimension}
                        </span>
                      )}
                    </div>

                    <div className="option-fields">
                      <div className="form-group">
                        <label htmlFor={`option-text-${questionIndex}-${optionIndex}`}>
                          Option Text *
                          {!selectedCategory?.name.toUpperCase().includes('DISC') && (
                            <span className="dimension-hint">({question.dimension} dimension)</span>
                          )}
                        </label>
                        <input
                          id={`option-text-${questionIndex}-${optionIndex}`}
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'optionText', e.target.value)}
                          placeholder={`Enter option text for ${selectedCategory?.name.toUpperCase().includes('DISC') ? option.targetTrait + ' trait' : question.dimension + ' dimension'}`}
                          required
                        />
                      </div>

                      {selectedCategory?.name.toUpperCase().includes('DISC') ? (
                        <div className="form-group">
                          <label htmlFor={`option-trait-${questionIndex}-${optionIndex}`}>Target Trait</label>
                          <select
                            id={`option-trait-${questionIndex}-${optionIndex}`}
                            value={option.targetTrait || 'D'}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'targetTrait', e.target.value)}
                          >
                            {getDISCTraits().map(trait => (
                              <option key={trait} value={trait}>{trait}</option>
                            ))}
                          </select>
                          <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                            Note: DISC options always use score value 2 (ranked by most/least preference)
                          </small>
                        </div>
                      ) : (
                        <div className="form-group">
                          <label htmlFor={`option-score-${questionIndex}-${optionIndex}`}>
                            Score Value (for {question.dimension} dimension)
                          </label>
                          <select
                            id={`option-score-${questionIndex}-${optionIndex}`}
                            value={option.scoreValue}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'scoreValue', e.target.value)}
                          >
                            <option value="NEGATIVE_ONE">-1 (Disagree)</option>
                            <option value="ZERO">0 (Neutral)</option>
                            <option value="POSITIVE_ONE">1 (Agree)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="add-question-section">
            <Button
              variant="primary"
              icon={<FaPlus />}
              onClick={addNewQuestion}
            >
              Add New Question
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="quiz-edit-actions">
        <Button
          variant="danger"
          onClick={onBack}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          icon={<FaSave />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default QuizEditPage;
