import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUser, FaLock } from 'react-icons/fa';
import '../styles/ChatbotPreview.css';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const previewMessages: Message[] = [
  {
    id: 1,
    text: "Xin chào! Tôi là trợ lý AI phân tích tính cách của bạn. Tôi có thể giúp bạn hiểu rõ hơn về kiểu tính cách MBTI của mình!",
    isBot: true
  },
  {
    id: 2,
    text: "Tôi thuộc kiểu tính cách INTJ. Bạn có thể giải thích điều đó có nghĩa là gì không?",
    isBot: false
  },
  {
    id: 3,
    text: "INTJ là viết tắt của Hướng nội (Introverted), Trực giác (Intuitive), Tư duy (Thinking) và Nguyên tắc (Judging). Để tôi giải thích từng đặc điểm...",
    isBot: true
  }
];

const ChatbotPreview: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (currentIndex < previewMessages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, previewMessages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
        setIsTyping(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <div className="chatbot-preview">
      <motion.div 
        className="chatbot-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <FaRobot className="bot-icon" />
        </motion.div>
        <h3>Trợ Lý AI</h3>
      </motion.div>

      <div className="chat-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.isBot ? 'bot' : 'user'}`}
              initial={{ opacity: 0, x: message.isBot ? -50 : 50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {message.isBot ? <FaRobot /> : <FaUser />}
              <p>{message.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            className="typing-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.div>
        )}
      </div>

      <motion.div 
        className="premium-overlay"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4, duration: 0.5 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <FaLock className="lock-icon" />
        </motion.div>
        <p>Mở khóa trợ lý AI với gói Premium</p>
        <motion.button
          className="unlock-button"
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 159, 67, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Nâng Cấp Premium
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ChatbotPreview;