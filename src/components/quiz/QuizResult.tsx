import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaBriefcase, 
  FaUniversity, 
  FaShare, 
  FaRedo, 
  FaDownload,
  FaStar,
  FaHeart,
  FaLightbulb,
  FaTrophy,
  FaRocket
} from 'react-icons/fa';

interface QuizResultProps {
  type: 'DISC' | 'MBTI';
  result: {
    type: string;
    description: string;
    careers: string[];
    universities: string[];
    personalityCode?: string;
    keyTraits?: string;
    nickname?: string;
    scores?: any;
  };
  onRetake?: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({ type, result, onRetake }) => {
  const getPersonalityIcon = (type: string) => {
    switch (type) {
      case 'DISC':
        return <FaTrophy className="personality-icon" />;
      case 'MBTI':
        return <FaRocket className="personality-icon" />;
      default:
        return <FaStar className="personality-icon" />;
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'DISC') return 'disc-result';
    if (type === 'MBTI') return 'mbti-result';
    return 'default-result';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      className={`quiz-result-container ${getTypeColor(type)}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
      </div>

      {/* Success celebration */}
      <motion.div
        className="celebration-header"
        variants={itemVariants}
      >
        <motion.div
          className="celebration-icon"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, ease: "easeInOut" },
            scale: { duration: 1, ease: "easeInOut" }
          }}
        >
          <FaTrophy />
        </motion.div>
        <h1 className="celebration-title">Đánh Giá Hoàn Thành!</h1>
        <p className="celebration-subtitle">Khám phá hồ sơ tính cách độc đáo của bạn</p>
      </motion.div>

      {/* Main Result Card */}
      <motion.div
        className="result-main-card"
        variants={itemVariants}
      >
        <div className="result-header">
          <div className="personality-badge">
            {getPersonalityIcon(type)}
            <span className="quiz-type-label">Đánh Giá {type}</span>
          </div>
          
          <motion.div
            className="personality-type-display"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="personality-code">
              {result.personalityCode || result.type}
            </div>
            {result.nickname && (
              <div className="personality-nickname">
                "{result.nickname}"
              </div>
            )}
          </motion.div>
        </div>

        <div className="result-description-section">
          <motion.div
            className="description-header"
            variants={itemVariants}
          >
            <FaLightbulb className="section-icon" />
            <h3>Hồ Sơ Tính Cách Của Bạn</h3>
          </motion.div>
          
          <motion.div
            className="description-content"
            variants={itemVariants}
          >
            <p>{result.description}</p>
          </motion.div>

          {result.keyTraits && (
            <motion.div
              className="key-traits-section"
              variants={itemVariants}
            >
              <h4>Đặc Điểm Chính</h4>
              <p className="key-traits">{result.keyTraits}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <motion.div
        className="recommendations-grid"
        variants={itemVariants}
      >
        <motion.div
          className="recommendation-card career-card"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-header">
            <div className="card-icon career-icon">
              <FaBriefcase />
            </div>
            <h3>Nghề Nghiệp Phù Hợp</h3>
          </div>
          <div className="card-content">
            <div className="recommendation-grid">
              {result.careers.slice(0, 6).map((career, index) => (
                <motion.div
                  key={career}
                  className="recommendation-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <FaRocket className="item-icon" />
                  <span>{career}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="recommendation-card university-card"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="card-header">
            <div className="card-icon university-icon">
              <FaUniversity />
            </div>
            <h3>Trường Đại Học Phù Hợp</h3>
          </div>
          <div className="card-content">
            <div className="recommendation-grid">
              {result.universities.slice(0, 6).map((university, index) => (
                <motion.div
                  key={university}
                  className="recommendation-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <FaGraduationCap className="item-icon" />
                  <span>{university}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="result-actions"
        variants={itemVariants}
      >
        <motion.button
          className="action-button share-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Kết Quả Đánh Giá ${type} Của Tôi`,
                text: `Tôi đã nhận được ${result.personalityCode || result.type} trong đánh giá tính cách ${type}!`,
                url: window.location.href
              });
            }
          }}
        >
          <FaShare className="button-icon" />
          <span>Chia Sẻ Kết Quả</span>
        </motion.button>

        <motion.button
          className="action-button download-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Generate PDF or download functionality here
            console.log('Download results');
          }}
        >
          <FaDownload className="button-icon" />
          <span>Tải Về PDF</span>
        </motion.button>

        <motion.button
          className="action-button retake-button"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetake}
        >
          <FaRedo className="button-icon" />
          <span>Làm Bài Khác</span>
        </motion.button>
      </motion.div>

      {/* Motivational Footer */}
      <motion.div
        className="result-footer"
        variants={itemVariants}
      >
        <div className="footer-content">
          <FaHeart className="footer-icon" />
          <p>Tính cách của bạn là siêu năng lực. Hãy sử dụng những hiểu biết này để phát huy hết tiềm năng của mình!</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResult; 