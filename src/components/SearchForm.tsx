import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserGraduate, FaEnvelope, FaPhone } from 'react-icons/fa';
import '../styles/SearchForm.css';

interface SearchFormData {
  email: string;
  phoneNumber: string;
}

const SearchForm: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    email: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // TODO: Implement actual API call here
    console.log('Searching for:', formData);
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div 
      className="search-form-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="search-header"
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <FaUserGraduate className="search-icon" />
        </motion.div>
        <h2>Tìm Kiếm Thông Tin Học Sinh</h2>
      </motion.div>
      
      <motion.form 
        className="search-form"
        onSubmit={handleSubmit}
      >
        <motion.div 
          className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="email">
            <FaEnvelope className="field-icon" />
            Email Học Sinh
          </label>
          <div className="input-container">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Nhập email học sinh"
              required
            />
            <div className="input-focus-effect" />
          </div>
        </motion.div>

        <motion.div 
          className={`form-group ${focusedField === 'phoneNumber' ? 'focused' : ''}`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label htmlFor="phoneNumber">
            <FaPhone className="field-icon" />
            Số Điện Thoại
          </label>
          <div className="input-container">
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onFocus={() => setFocusedField('phoneNumber')}
              onBlur={() => setFocusedField(null)}
              placeholder="Nhập số điện thoại"
              required
            />
            <div className="input-focus-effect" />
          </div>
        </motion.div>

        <motion.button
          type="submit"
          className="search-button"
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255, 159, 67, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <>
              <FaSearch className="search-btn-icon" />
              <span>Tìm Kiếm</span>
            </>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default SearchForm;