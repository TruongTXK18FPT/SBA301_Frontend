import React from 'react';
import { motion } from 'framer-motion';

interface Option {
  id: number;
  text: string;
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

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, selectedAnswer, onAnswer }) => {
  const handleOptionClick = (optionText: string) => {
    onAnswer(question.id, optionText);
  };

  return (
    <motion.div 
      className="quiz-question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="question-text">{question.content}</h2>
      <div className="options-grid">
        {question.options.map((option) => (
          <motion.button
            key={option.id}
            className={`option-button ${selectedAnswer === option.text ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.text)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: option.id * 0.1
            }}
          >
            <div className="option-content">
              <div className={`option-circle ${selectedAnswer === option.text ? 'selected' : ''}`}>
                <div className={`option-inner ${selectedAnswer === option.text ? 'selected' : ''}`} />
              </div>
              <span className="option-text">{option.text}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizQuestion; 