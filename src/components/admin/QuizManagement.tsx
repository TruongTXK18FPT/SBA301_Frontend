import React, { useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Button from '../Button';

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: 'personality' | 'assessment';
  question_quantity: number;
}

interface QuizManagementProps {
  onAlert: (type: 'success' | 'info' | 'warning' | 'error', message: string) => void;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ onAlert }) => {
  const [quizzes] = useState<Quiz[]>([
    { id: '1', title: 'Personality Test', description: 'Basic personality assessment', type: 'personality', question_quantity: 10 },
    { id: '2', title: 'IQ Test', description: 'Basic IQ test', type: 'assessment', question_quantity: 20 },
    { id: '3', title: 'Career Test', description: 'Career guidance test', type: 'personality', question_quantity: 15 },
  ]);

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Quiz Management</h2>
        <Button
          variant="primary"
          size="sm"
          icon={<FaPlus />}
          onClick={() => onAlert('info', 'Create quiz feature coming soon')}
        >
          Create Quiz
        </Button>
      </div>

      <div className="table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td><span className={`badge type-${quiz.type}`}>{quiz.type}</span></td>
                <td>{quiz.question_quantity}</td>
                <td>
                  <div className="action-buttons">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FaEdit />}
                      onClick={() => onAlert('info', 'Edit quiz feature coming soon')}
                    >
                      {null}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<FaTrash />}
                      onClick={() => onAlert('warning', 'Delete quiz feature coming soon')}
                    >
                      {/* No children needed for icon-only button */}
                      {/* Provide empty children to satisfy ButtonProps */}
                      {null}
                    </Button>
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