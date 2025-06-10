import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Quiz.css';

interface QuizQuestionProps {
  question: string;
  options: string[];
  onSelect: (option: string) => void;
  currentQuestion: number;
  totalQuestions: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  onSelect,
  currentQuestion,
  totalQuestions,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: currentQuestion / totalQuestions,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question}
        className="quiz-question"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="quiz-progress"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p>Question {currentQuestion} of {totalQuestions}</p>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar"
              variants={progressVariants}
              initial="hidden"
              animate="visible"
            />
          </div>
        </motion.div>

        <motion.h2
          className="question-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {question}
        </motion.h2>

        <div className="options-grid">
          {options.map((option, index) => (
            <motion.div
              key={option}
              variants={itemVariants}
              className="option-card"
              onClick={() => onSelect(option)}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="option-content">
                <motion.span
                  className="option-number"
                  whileHover={{
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {index + 1}
                </motion.span>
                <p>{option}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizQuestion; 