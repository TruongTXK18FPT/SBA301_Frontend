import React from 'react';

interface DISCAnswer {
  most?: 'D' | 'I' | 'S' | 'C';
  least?: 'D' | 'I' | 'S' | 'C';
}

type Answer = string | DISCAnswer;

interface QuestionListProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: Record<number, Answer>;
  questions: Array<{ id: number }>;  // Add questions to get the correct IDs
  onQuestionSelect: (index: number) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  totalQuestions,
  currentQuestion,
  answers,
  questions,
  onQuestionSelect,
}) => {
  const isAnswered = (index: number) => {
    // Use the question ID instead of index
    const questionId = questions[index]?.id;
    const answer = answers[questionId];
    if (!answer) return false;
    if (typeof answer === 'string') return true;
    return answer.most !== undefined && answer.least !== undefined;
  };

  return (
    <div className="question-list">
      <h3 className="question-list-title">Questions</h3>
      <div className="question-circles">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <button
            key={index}
            className={`question-circle ${index === currentQuestion ? 'current' : ''} ${
              isAnswered(index) ? 'answered' : ''
            }`}
            onClick={() => onQuestionSelect(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionList;
