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
  isMobile?: boolean;
  isTablet?: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  totalQuestions,
  currentQuestion,
  answers,
  questions,
  onQuestionSelect,
  isMobile = false,
  isTablet = false,
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
    <div className={`question-list ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <h3 className="question-list-title">
        {isMobile ? 'Tiến Độ' : 'Câu Hỏi'}
      </h3>
      <div className="question-circles">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <button
            key={index}
            className={`question-circle ${index === currentQuestion ? 'current' : ''} ${
              isAnswered(index) ? 'answered' : ''
            }`}
            onClick={() => onQuestionSelect(index)}
            aria-label={`Đi tới câu hỏi ${index + 1}${isAnswered(index) ? ' (đã trả lời)' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {(isMobile || isTablet) && (
        <div className="progress-summary">
          <span className="answered-count">
            {Object.keys(answers).length} trong {totalQuestions} đã trả lời
          </span>
        </div>
      )}
      {!isMobile && !isTablet && (
        <div className="progress-summary">
          <span className="progress-text">
            {Object.keys(answers).length}/{totalQuestions} hoàn thành
          </span>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
