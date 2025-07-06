import React from 'react';
import { motion } from 'framer-motion';
import '../styles/LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Đang tải...', 
  size = 'medium' 
}) => {
  return (
    <div className="loading-spinner-container">
      <motion.div 
        className={`loading-spinner ${size}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="spinner-ring">
          <div className="spinner-circle"></div>
        </div>
        <motion.p 
          className="loading-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
