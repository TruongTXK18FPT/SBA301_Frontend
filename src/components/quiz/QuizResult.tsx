import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaUniversity } from 'react-icons/fa';

interface QuizResultProps {
  type: 'DISC' | 'MBTI';
  result: {
    type: string;
    description: string;
    careers: string[];
    universities: string[];
  };
  onRetake?: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ type, result }) => {
  return (
    <motion.div
      className="quiz-result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="result-header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2>Your {type} Personality Type</h2>
        <motion.div
          className="personality-type"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {result.type}
        </motion.div>
      </motion.div>

      <motion.div
        className="result-description"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>{result.description}</p>
      </motion.div>

      <div className="result-sections">
        <motion.div
          className="career-section"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="section-header">
            <FaBriefcase className="section-icon" />
            <h3>Recommended Careers</h3>
          </div>
          <ul className="recommendation-list">
            {result.careers.map((career, index) => (
              <motion.li
                key={career}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {career}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="university-section"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="section-header">
            <FaUniversity className="section-icon" />
            <h3>Recommended Universities</h3>
          </div>
          <ul className="recommendation-list">
            {result.universities.map((university, index) => (
              <motion.li
                key={university}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                {university}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        className="result-actions"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.button
          className="share-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Share Results
        </motion.button>
        <motion.button
          className="retake-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Take Another Quiz
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default QuizResult; 