import React, { memo } from 'react';

interface Option {
  id: number;
  text: string;
  value?: number;
}

interface MBTIQuestion {
  id: number;
  content: string;
  type: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  options: Option[];
}

interface QuizQuestionProps {
  question: MBTIQuestion;
  selectedAnswer?: string;
  onAnswer: (questionId: number, answer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = memo(({ question, selectedAnswer, onAnswer }) => {
  const handleOptionClick = (optionText: string) => {
    console.log(`MBTI Option clicked: ${optionText} for question ${question.id}`);
    onAnswer(question.id, optionText);
  };

  return (
    <div className="quiz-question">
      <h2 className="question-text">{question.content}</h2>
      <div className="options-grid">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.text;
          console.log(`MBTI Option ${option.id}: text="${option.text}", value=${option.value}, selected=${isSelected}`);

          return (
            <button
              key={option.id}
              className={`option-button ${isSelected ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.text)}
              disabled={false} // Ensure no options are disabled
            >
              <div className="option-content">
                <div className={`option-circle ${isSelected ? 'selected' : ''}`}>
                  <div className={`option-inner ${isSelected ? 'selected' : ''}`} />
                </div>
                <span className="option-text">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Set display names for debugging
QuizQuestion.displayName = 'QuizQuestion';

export default QuizQuestion;
