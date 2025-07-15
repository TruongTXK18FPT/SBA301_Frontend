import React, { useState, useEffect } from 'react';
import { FaEdit, FaSearch } from 'react-icons/fa';
import Button from '../Button';
import quizService, { QuizData, Category } from '../../services/quizService';
import QuizEditPage from './QuizEditPage';
import '../../styles/Admin.css';

interface QuizManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ onAlert }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPage, setShowEditPage] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  useEffect(() => {
    loadQuizzes();
    loadCategories();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);

      // For this implementation, we'll create a hardcoded list of 2 quizzes
      // that correspond to the main personality test types
      const categoriesData = await quizService.getAllCategories();

      // Find MBTI and DISC categories
      const mbtiCategory = categoriesData.find(cat =>
        cat.name.toUpperCase().includes('MBTI') ||
        cat.name.toUpperCase().includes('MYERS')
      );

      const discCategory = categoriesData.find(cat =>
        cat.name.toUpperCase().includes('DISC')
      );

      // Create the 2 fixed quizzes
      const fixedQuizzes: QuizData[] = [];

      if (mbtiCategory) {
        fixedQuizzes.push({
          id: 1,
          title: 'MBTI Personality Assessment',
          categoryId: mbtiCategory.id,
          description: 'Comprehensive Myers-Briggs Type Indicator personality test to discover your personality type',
          questionQuantity: 60,
          categoryName: mbtiCategory.name
        });
      }

      if (discCategory) {
        fixedQuizzes.push({
          id: 2,
          title: 'DISC Behavioral Assessment',
          categoryId: discCategory.id,
          description: 'DISC assessment to understand your behavioral style and communication preferences',
          questionQuantity: 24,
          categoryName: discCategory.name
        });
      }

      setQuizzes(fixedQuizzes);
    } catch (error: any) {
      onAlert('error', 'Failed to load quizzes: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await quizService.getAllCategories();
      setCategories(categoriesData);
    } catch (error: any) {
      onAlert('error', 'Failed to load categories: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditQuiz = (quizId: number) => {
    setEditingQuizId(quizId);
    setShowEditPage(true);
  };

  const handleBackFromEdit = () => {
    setShowEditPage(false);
    setEditingQuizId(null);
    loadQuizzes(); // Reload quizzes when coming back from edit
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.categoryName && quiz.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show edit page if editing
  if (showEditPage && editingQuizId) {
    return (
      <QuizEditPage
        quizId={editingQuizId}
        onBack={handleBackFromEdit}
        onAlert={onAlert}
      />
    );
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Quiz Management</h2>
        <div className="quiz-info-badge">
          <span>2 Personality Tests Available for Editing</span>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search quizzes by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}

      <div className="table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Description</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="title-cell">
                  <strong>{quiz.title}</strong>
                </td>
                <td>
                  <span className="category-badge">
                    {quiz.categoryName}
                  </span>
                </td>
                <td className="description-cell">
                  {quiz.description || 'No description'}
                </td>
                <td className="questions-cell">
                  <span className="question-count-badge">
                    {quiz.questionQuantity} questions
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => handleEditQuiz(quiz.id)}
                      disabled={loading}
                      title="Edit Quiz & Questions"
                    >
                      Edit Quiz
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuizzes.length === 0 && !loading && (
          <div className="empty-state">
            {searchTerm ? 'No quizzes found matching your search' : 'No quizzes available'}
          </div>
        )}
      </div>

      <div className="quiz-management-info">
        <div className="info-card">
          <h3>📝 Quiz Management Guide</h3>
          <ul>
            <li><strong>Edit Quiz:</strong> Click "Edit Quiz" to modify quiz details, questions, and options</li>
            <li><strong>Add Questions:</strong> Use the "Add New Question" button in the edit page</li>
            <li><strong>Question Types:</strong> MBTI quizzes have 3 options per question, DISC quizzes have 4 trait options</li>
            <li><strong>Auto-save:</strong> Changes are saved when you click "Save Changes"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;

