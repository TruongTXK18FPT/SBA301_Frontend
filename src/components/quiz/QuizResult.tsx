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
  FaRocket,
  FaSpinner
} from 'react-icons/fa';
import pdfService from '../../services/pdfService';

interface QuizResultProps {
  type: 'DISC' | 'MBTI';
  result: {
    id?: number;
    type: string;
    description: string;
    careers: string[];
    universities: string[];
    personalityCode?: string;
    keyTraits?: string;
    nickname?: string;
    scores?: any;
    submittedAt?: string;
    quizType?: string;
  };
  onRetake?: () => void;
  userInfo?: {
    userId: string;
    email: string;
    fullName: string;
  };
}

const QuizResult: React.FC<QuizResultProps> = ({ type, result, onRetake, userInfo }) => {
  const [downloadLoading, setDownloadLoading] = React.useState(false);

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

  const handleDownloadPDF = async () => {
    try {
      setDownloadLoading(true);

      // Create a mock UserQuizResults object for PDF generation
      const userResults = {
        userId: userInfo?.userId || 'current-user',
        email: userInfo?.email || 'user@example.com',
        fullName: userInfo?.fullName || 'Người dùng',
        results: [{
          id: result.id || Date.now(),
          personalityCode: result.personalityCode || result.type,
          nickname: result.nickname,
          keyTraits: result.keyTraits,
          description: result.description,
          careerRecommendations: result.careers.join('\n\n'),
          universityRecommendations: result.universities.join('\n\n'),
          scores: result.scores,
          submittedAt: result.submittedAt || new Date().toISOString(),
          quizType: result.quizType || type
        }]
      };

      await pdfService.downloadQuizResultPDF(userResults, userResults.results[0]);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Không thể tải file PDF. Vui lòng thử lại.');
    } finally {
      setDownloadLoading(false);
    }
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

  // Helper function to render multiline recommendation text
  const renderRecommendationText = (text: string) => {
    return text.split('\n').map((line, index) => (
        <p key={index} className="recommendation-line">
          {line}
        </p>
    ));
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
                        key={index}
                        className="recommendation-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <FaRocket className="item-icon" />
                      <div className="recommendation-text">
                        {renderRecommendationText(career)}
                      </div>
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
                        key={index}
                        className="recommendation-item"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <FaGraduationCap className="item-icon" />
                      <div className="recommendation-text">
                        {renderRecommendationText(university)}
                      </div>
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
              onClick={handleDownloadPDF}
              disabled={downloadLoading}
          >
            {downloadLoading ? (
                <>
                  <FaSpinner className="button-icon spinner" />
                  <span>Đang tải...</span>
                </>
            ) : (
                <>
                  <FaDownload className="button-icon" />
                  <span>Tải Về PDF</span>
                </>
            )}
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
          <div className="result-footer-content">
            <FaHeart className="result-footer-icon" />
            <p>Tính cách của bạn là siêu năng lực. Hãy sử dụng những hiểu biết này để phát huy hết tiềm năng của mình!</p>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default QuizResult;