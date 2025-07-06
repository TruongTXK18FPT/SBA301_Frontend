import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaUserFriends } from 'react-icons/fa';
import { Category } from '../../services/quizService';

interface QuizIntroProps {
  onStart: (type: 'DISC' | 'MBTI') => void;
  availableTypes?: { type: 'MBTI' | 'DISC'; category: Category }[];
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onStart }) => {
  return (
    <motion.div
      className="quiz-intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h1>Khám Phá Tính Cách Của Bạn</h1>
      <p className="intro-description">
        Chọn một trong hai bài trắc nghiệm tính cách dưới đây để hiểu rõ hơn về bản thân
      </p>

      <div className="quiz-types">
        <motion.div
          className="quiz-type-card mbti"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart('MBTI')}
        >
          <FaBrain className="quiz-type-icon" />
          <h2>MBTI</h2>
          <p>Myers-Briggs Type Indicator</p>
          <ul>
            <li>16 loại tính cách</li>
            <li>Phân tích chi tiết</li>
            <li>Định hướng nghề nghiệp</li>
          </ul>
          <motion.button 
            className="start-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Bắt đầu
          </motion.button>
        </motion.div>

        <motion.div
          className="quiz-type-card disc"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart('DISC')}
        >
          <FaUserFriends className="quiz-type-icon" />
          <h2>DISC</h2>
          <p>Dominance Influence Steadiness Conscientiousness</p>
          <ul>
            <li>4 nhóm tính cách chính</li>
            <li>Phong cách làm việc</li>
            <li>Kỹ năng giao tiếp</li>
          </ul>
          <motion.button 
            className="start-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Bắt đầu
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuizIntro; 