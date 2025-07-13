import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../Button';
import quizService, { Category } from '../../services/quizService';

  // Handle option changeservices/quizService';
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<EditableQuestion | null>(null);
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
          const newQuestions: EditableQuestion[] = [];
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
  const openEditModal = (question: EditableQuestion, questionIndex: number) => {
    setEditingQuestion({ ...question, orderNumber: questionIndex });
    setShowEditModal(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingQuestion(null);
    setShowEditModal(false);
  };

  // Save question from modal
  const saveQuestionFromModal = async () => {
    if (!editingQuestion || !quiz) return;

    const questionIndex = editingQuestion.orderNumber;
    const errors: string[] = [];

    if (!editingQuestion.content.trim()) {
      errors.push('Question content is required');
    }

    if (!editingQuestion.dimension.trim()) {
      errors.push('Dimension is required');
    }

    if (errors.length > 0) {
      onAlert('error', 'Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    try {
      setSaving(true);

      if (editingQuestion.id) {
        await quizService.updateQuizQuestion(editingQuestion.id, {
          content: editingQuestion.content,
          orderNumber: editingQuestion.orderNumber + 1, // Convert back to 1-based
          dimension: editingQuestion.dimension,
          quizId: quiz.id,
          options: editingQuestion.options.map(opt => ({
            optionText: opt.optionText,
            targetTrait: opt.targetTrait,
            scoreValue: opt.scoreValue // Keep as enum string, backend will handle conversion
          }))
        });

        // Update local state
        setQuiz(prev => {
          if (!prev) return prev;
          const updatedQuestions = [...prev.questions];
          updatedQuestions[questionIndex] = { ...editingQuestion };
          return { ...prev, questions: updatedQuestions };
        });

        onAlert('success', `Question ${questionIndex + 1} updated successfully!`);
        closeEditModal();
      }
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

  // Save individual option
  const saveOption = async (questionIndex: number, optionIndex: number) => {
    if (!quiz) return;

    const question = quiz.questions[questionIndex];
    const option = question.options[optionIndex];

    if (!option.optionText.trim()) {
      onAlert('error', 'Option text is required');
      return;
    }

    try {
      setSaving(true);

      if (question.id) {
        await quizService.updateQuizQuestion(question.id, {
          content: question.content,
          orderNumber: question.orderNumber,
          dimension: question.dimension,
          quizId: quiz.id,
          options: question.options.map(opt => ({
            optionText: opt.optionText,
            targetTrait: opt.targetTrait,
            scoreValue: opt.scoreValue // Keep as enum string, backend will handle conversion
          }))
        });

        onAlert('success', `Option ${optionIndex + 1} updated successfully!`);
        toggleOptionEditing(questionIndex, optionIndex);
      }
    } catch (error: any) {
      onAlert('error', 'Failed to update option: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
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
          const createdQuestion = await quizService.createQuizQuestion({
            content: question.content,
            orderNumber: question.orderNumber,
            dimension: question.dimension,
            quizId: quiz.id,
            options: question.options.map(opt => ({
              optionText: opt.optionText,
              targetTrait: opt.targetTrait,
              scoreValue: opt.scoreValue // Keep as enum string, backend will handle conversion
            }))
          });
          
          // Update the question with the new ID so it can be individually updated later
          question.id = createdQuestion.id;
          question.isNew = false;
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
              scoreValue: opt.scoreValue // Keep as enum string, backend will handle conversion
            }))
          });
        }
      }

      onAlert('success', 'Quiz updated successfully!');
      
      // Refresh the quiz data to get the latest state
      await loadQuizData();

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
      <div className="quiz-edit-content">
        {/* Header */}
        <div className="quiz-edit-header">
          <h1>Edit Quiz</h1>
          <p className="quiz-edit-subtitle">{quiz.title}</p>
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

        <div className="questions-list">
          {quiz.questions.map((question, questionIndex) => (
            <div key={question.id || `new-question-${questionIndex}`} className="question-card">
              {/* Question Header */}
              <div className="question-header-modern">
                <div className="question-info">
                  <div className="question-number">Q{question.orderNumber}</div>
                  <div className="question-preview">
                    <h4>{question.content || 'Untitled Question'}</h4>
                    <span className="question-dimension">Dimension: {question.dimension}</span>
                  </div>
                </div>
                <div className="question-actions-modern">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FaEdit />}
                    onClick={() => openEditModal(question, questionIndex)}
                    title="Edit Question"
                  >
                    Edit
                  </Button>
                  <Button
                    variant={expandedQuestions.has(questionIndex) ? "primary" : "outline"}
                    size="sm"
                    icon={expandedQuestions.has(questionIndex) ? <FaEyeSlash /> : <FaEye />}
                    onClick={() => toggleQuestionExpansion(questionIndex)}
                    title={expandedQuestions.has(questionIndex) ? "Hide Options" : "Show Options"}
                  >
                    {expandedQuestions.has(questionIndex) ? 'Hide' : 'Show'} Options
                  </Button>
                </div>
              </div>

              {/* Options (Collapsible) */}
              {expandedQuestions.has(questionIndex) && (
                <div className="options-section-modern">
                  <h5>Options</h5>
                  <div className="options-grid-modern">
                    {question.options.map((option, optionIndex) => {
                      const editKey = `${questionIndex}-${optionIndex}`;
                      const isEditing = editingOptions.has(editKey);

                      return (
                        <div key={option.id || `new-option-${questionIndex}-${optionIndex}`} className="option-card-modern">
                          <div className="option-header-modern">
                            <div className="option-badge">
                              Option {optionIndex + 1}
                              {selectedCategory?.name.toUpperCase().includes('DISC') && option.targetTrait && (
                                <span className={`trait-indicator trait-${option.targetTrait.toLowerCase()}`}>
                                  {option.targetTrait}
                                </span>
                              )}
                            </div>
                            <Button
                              variant={isEditing ? "primary" : "outline"}
                              size="sm"
                              icon={<FaEdit />}
                              onClick={() => isEditing ? saveOption(questionIndex, optionIndex) : toggleOptionEditing(questionIndex, optionIndex)}
                              title={isEditing ? "Save Option" : "Edit Option"}
                            >
                              {isEditing ? 'Save' : 'Edit'}
                            </Button>
                          </div>
                          
                          <div className="option-content-modern">
                            {isEditing ? (
                              <div className="option-edit-form">
                                <div className="form-group-modern">
                                  <label htmlFor={`option-text-${questionIndex}-${optionIndex}`}>Option Text</label>
                                  <textarea
                                    id={`option-text-${questionIndex}-${optionIndex}`}
                                    value={option.optionText}
                                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'optionText', e.target.value)}
                                    placeholder="Enter option text..."
                                    rows={2}
                                  />
                                </div>
                                
                                {selectedCategory?.name.toUpperCase().includes('DISC') ? (
                                  <div className="form-group-modern">
                                    <label htmlFor={`target-trait-${questionIndex}-${optionIndex}`}>Target Trait</label>
                                    <select
                                      id={`target-trait-${questionIndex}-${optionIndex}`}
                                      value={option.targetTrait || 'D'}
                                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'targetTrait', e.target.value)}
                                    >
                                      {getDISCTraits().map(trait => (
                                        <option key={trait} value={trait}>{trait}</option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div className="form-group-modern">
                                    <label htmlFor={`score-value-${questionIndex}-${optionIndex}`}>Score Value</label>
                                    <select
                                      id={`score-value-${questionIndex}-${optionIndex}`}
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
                            ) : (
                              <div className="option-display">
                                <p className="option-text">{option.optionText || 'No text set'}</p>
                                <div className="option-meta">
                                  {selectedCategory?.name.toUpperCase().includes('DISC') ? (
                                    <span className="meta-item">Trait: {option.targetTrait}</span>
                                  ) : (
                                    <span className="meta-item">Score: {option.scoreValue}</span>
                                  )}
                                </div>
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
              <Button
                variant="outline"
                size="sm"
                onClick={closeEditModal}
              >
                ×
              </Button>
            </div>
            
            <div className="modal-body-modern">
              <div className="form-group-modern">
                <label htmlFor="edit-question-content">Question Content *</label>
                <textarea
                  id="edit-question-content"
                  value={editingQuestion.content}
                  onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, content: e.target.value } : null)}
                  placeholder="Enter your question here..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="edit-question-dimension">Dimension *</label>
                {selectedCategory?.name.toUpperCase().includes('DISC') ? (
                  <select
                    id="edit-question-dimension"
                    value={editingQuestion.dimension}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, dimension: e.target.value } : null)}
                    required
                  >
                    <option value="DISC">DISC</option>
                  </select>
                ) : (
                  <select
                    id="edit-question-dimension"
                    value={editingQuestion.dimension}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, dimension: e.target.value } : null)}
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
            
            <div className="modal-footer-modern">
              <Button
                variant="outline"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<FaSave />}
                onClick={saveQuestionFromModal}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default QuizEditPage;
