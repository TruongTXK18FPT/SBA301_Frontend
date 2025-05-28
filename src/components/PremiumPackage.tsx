import React from 'react';
import { motion } from 'framer-motion';
import { FaCrown, FaInfinity, FaRobot, FaChartLine, FaLock } from 'react-icons/fa';
import '../styles/PremiumPackage.css';

interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FaInfinity />,
    title: "Không giới hạn bài trắc nghiệm",
    description: "Làm bài kiểm tra MBTI & DISC không giới hạn số lần"
  },
  {
    icon: <FaRobot />,
    title: "Trợ lý ảo AI thông minh",
    description: "Tư vấn định hướng học tập & nghề nghiệp cá nhân hóa"
  },
  {
    icon: <FaChartLine />,
    title: "Phân tích & thống kê chi tiết",
    description: "Theo dõi sự phát triển cá nhân qua từng bài test"
  }
];

const PremiumPackage: React.FC = () => {
  return (
    <motion.div 
      className="premium-container"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="premium-header"
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FaCrown className="crown-icon" />
        <h2>Gói Premium</h2>
      </motion.div>

      <div className="premium-content">
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="pricing-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="price">
            <span className="currency">₫</span>
            <span className="amount">99.000</span>
            <span className="period">/tháng</span>
          </div>
          <motion.button 
            className="upgrade-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaLock /> Nâng cấp ngay
          </motion.button>
          <p className="guarantee">Đảm bảo hoàn tiền trong vòng 30 ngày</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PremiumPackage;
