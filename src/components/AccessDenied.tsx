import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/AccessDenied.css';

interface AccessDeniedProps {
  userRole?: string;
  requiredRole?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  userRole = 'unknown', 
  requiredRole = 'admin' 
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      ADMIN: 'Quản trị viên',
      EVENTMANAGER: 'Quản lý sự kiện',
      PARENT: 'Phụ huynh',
      STUDENT: 'Học sinh'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="access-denied-container">
      <div className="access-denied-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <motion.div 
        className="access-denied-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="access-denied-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        >
          🚫
        </motion.div>

        <motion.h1 
          className="access-denied-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Không có quyền truy cập
        </motion.h1>

        <motion.p 
          className="access-denied-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Bạn không có quyền truy cập vào trang này. Chỉ có <strong>{getRoleDisplayName(requiredRole)}</strong> mới có thể truy cập.
        </motion.p>

        <motion.div 
          className="access-denied-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="role-info">
            <span className="role-label">Vai trò hiện tại:</span>
            <span className={`role-badge role-${userRole}`}>
              {getRoleDisplayName(userRole)}
            </span>
          </div>
          <div className="role-info">
            <span className="role-label">Vai trò yêu cầu:</span>
            <span className={`role-badge role-${requiredRole}`}>
              {getRoleDisplayName(requiredRole)}
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="access-denied-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button 
            className="btn btn-primary"
            onClick={handleGoHome}
          >
            <span className="btn-icon">🏠</span>
            {' '}Về trang chủ
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleGoBack}
          >
            <span className="btn-icon">↩️</span>
            {' '}Quay lại
          </button>
        </motion.div>

        <motion.div 
          className="access-denied-help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <p>
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với quản trị viên hệ thống.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
