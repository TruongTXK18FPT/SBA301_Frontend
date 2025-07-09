import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaTimes,
  FaCrown,
  FaTicketAlt,
  FaBook
} from 'react-icons/fa';
import '../styles/Alert.css';

export type AlertType = 'success' | 'info' | 'warning' | 'error' | 'premium' | 'ticket' | 'quiz';

interface AlertProps {
  type: AlertType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'success':
      return <FaCheckCircle className="alert-icon" />;
    case 'premium':
      return <FaCrown className="alert-icon premium-icon" />;
    case 'ticket':
      return <FaTicketAlt className="alert-icon ticket-icon" />;
    case 'quiz':
      return <FaBook className="alert-icon quiz-icon" />;
    case 'warning':
      return <FaExclamationTriangle className="alert-icon" />;
    case 'error':
      return <FaExclamationTriangle className="alert-icon" />;
    default:
      return <FaInfoCircle className="alert-icon" />;
  }
};

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  message,
  description,
  duration = 2500,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      const interval = setInterval(() => {
        setProgress((prev) => Math.max(prev - (100 / (duration / 100)), 0));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose]);  if (!isVisible) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        {getAlertIcon(type)}
        
        <div className="alert-text">
          <h4 className="alert-message">{message}</h4>
          {description && <p className="alert-description">{description}</p>}
        </div>

        {action && (
          <button className="alert-action" onClick={action.onClick}>
            {action.label}
          </button>
        )}

        {onClose && (
          <button className="alert-close" onClick={() => {
            setIsVisible(false);
            onClose();
          }}>
            <FaTimes />
          </button>
        )}
      </div>

      {duration > 0 && (
        <div className="alert-progress">
          <div 
            className="alert-progress-bar" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
};

export default Alert;