import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Button from '../Button';
import '../../styles/AdminComponents.css';

interface Quiz {
  id: string;
  title: string;
  category: string;
  questions: number;
  participants: number;
  status: 'active' | 'draft' | 'archived';
}

interface QuizManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ onAlert }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Personality Type Indicator',
      category: 'Psychology',
      questions: 50,
      participants: 1200,
      status: 'active'
    },
    {
      id: '2',
      title: 'Career Path Finder',
      category: 'Career',
      questions: 30,
      participants: 800,
      status: 'active'
    },
    {
      id: '3',
      title: 'Leadership Style Assessment',
      category: 'Professional',
      questions: 40,
      participants: 600,
      status: 'draft'
    }
  ]);

  const handleCreateQuiz = () => {
    onAlert('info', 'Create quiz feature coming soon!');
  };

  const handleEditQuiz = (id: string) => {
    onAlert('info', `Editing quiz ${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    onAlert('warning', `Are you sure you want to delete quiz ${id}?`);
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-component">
      <header className="component-header">
        <h1>Quiz Management</h1>
        <Button
          variant="primary"
          size="md"
          icon={<FaPlus />}
          onClick={handleCreateQuiz}
        >
          Create Quiz
        </Button>
      </header>

      <div className="search-filters">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Questions</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="title-cell">{quiz.title}</td>
                <td>{quiz.category}</td>
                <td>{quiz.questions}</td>
                <td>{quiz.participants.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${quiz.status}`}>
                    {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="icon"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => handleEditQuiz(quiz.id)}
                      title="Edit Quiz"
                    />
                    <Button
                      variant="icon"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      title="Delete Quiz"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizManagement;