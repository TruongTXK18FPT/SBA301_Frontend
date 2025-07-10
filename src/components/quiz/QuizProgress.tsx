import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
  type: 'DISC' | 'MBTI';
}

const QuizProgress: React.FC<QuizProgressProps> = ({ current, total, type }) => {
  const progress = (current / total) * 100;

  return (
    <div className="quiz-progress">
      <div className="progress-info">
        <h3>Trắc Nghiệm Tính Cách {type}</h3>
        <p>Câu hỏi {current + 1} trong {total}</p>
      </div>
      
      <div className="progress-bar-container">
        <motion.div
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <div className="progress-markers">
          {Array.from({ length: total }, (_, i) => (
            <motion.div
              key={i}
              className={`progress-marker ${i <= current ? 'completed' : ''}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="progress-percentage"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={progress}
      >
        {Math.round(progress)}%
      </motion.div>
    </div>
  );
};

export default QuizProgress; 