import React from 'react';
import { motion } from 'framer-motion';
import { FaUserAstronaut, FaChartPie } from 'react-icons/fa';
import '../styles/Quiz.css';

interface QuizIntroProps {
  onSelectQuizType: (type: 'mbti' | 'disc') => void;
}

const QuizIntro: React.FC<QuizIntroProps> = ({ onSelectQuizType }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="quiz-intro"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 variants={itemVariants}>
        Discover Your Personality Type
      </motion.h1>
      
      <motion.p 
        className="intro-description"
        variants={itemVariants}
      >
        Choose between two comprehensive personality assessments to gain deeper insights into your character, 
        work style, and potential career paths. Each test offers unique perspectives on your personality.
      </motion.p>

      <div className="quiz-types">
        <motion.div
          className="quiz-type-card mbti"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelectQuizType('mbti')}
        >
          <motion.div variants={iconVariants} whileHover="hover" className="quiz-type-icon">
            <FaUserAstronaut />
          </motion.div>
          <motion.h3 variants={itemVariants}>MBTI Assessment</motion.h3>
          <motion.p variants={itemVariants}>
            Explore your personality through 16 distinct types based on how you perceive the world and make decisions.
          </motion.p>
        </motion.div>

        <motion.div
          className="quiz-type-card disc"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelectQuizType('disc')}
        >
          <motion.div variants={iconVariants} whileHover="hover" className="quiz-type-icon">
            <FaChartPie />
          </motion.div>
          <motion.h3 variants={itemVariants}>DISC Assessment</motion.h3>
          <motion.p variants={itemVariants}>
            Understand your behavioral style and how you interact with others in various situations.
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="intro-footer"
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p>Both assessments take approximately 15-20 minutes to complete</p>
      </motion.div>
    </motion.div>
  );
};

export default QuizIntro; 