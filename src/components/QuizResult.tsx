import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Quiz.css';

interface QuizResultProps {
  personalityType: string;
  description: string;
  traits: string[];
  careerSuggestions: string[];
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
}

const QuizResult: React.FC<QuizResultProps> = ({
  personalityType,
  description,
  traits,
  careerSuggestions,
  strengthsAndWeaknesses,
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
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
    }
  };

  const listItemVariants = {
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

  return (
    <motion.div
      className="quiz-result"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="personality-type"
        variants={cardVariants}
      >
        {personalityType}
      </motion.div>

      <motion.div
        className="result-description"
        variants={itemVariants}
      >
        <p>{description}</p>
      </motion.div>

      <motion.div className="traits-section" variants={itemVariants}>
        <h3>Key Traits</h3>
        <div className="traits-grid">
          {traits.map((trait, index) => (
            <motion.div
              key={trait}
              className="trait-card"
              variants={listItemVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              {trait}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="strengths-weaknesses" variants={itemVariants}>
        <div className="strengths">
          <h3>Strengths</h3>
          <ul>
            {strengthsAndWeaknesses.strengths.map((strength, index) => (
              <motion.li
                key={strength}
                variants={listItemVariants}
                custom={index}
                whileHover={{
                  x: 10,
                  transition: { duration: 0.2 }
                }}
              >
                {strength}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="weaknesses">
          <h3>Growth Areas</h3>
          <ul>
            {strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
              <motion.li
                key={weakness}
                variants={listItemVariants}
                custom={index}
                whileHover={{
                  x: 10,
                  transition: { duration: 0.2 }
                }}
              >
                {weakness}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div className="career-suggestions" variants={itemVariants}>
        <h3>Recommended Career Paths</h3>
        <div className="career-grid">
          {careerSuggestions.map((career, index) => (
            <motion.div
              key={career}
              className="career-card"
              variants={listItemVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              {career}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="share-results"
        variants={itemVariants}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <button className="share-button">
          Share Your Results
        </button>
      </motion.div>
    </motion.div>
  );
};

export default QuizResult; 