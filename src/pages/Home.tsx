import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainSlider from "../components/MainSlider";
import NewsSlider from "../components/NewsSlider";
import PersonalityTypes from "../components/PersonalityTypes";
import PremiumPackage from "../components/PremiumPackage.tsx";
import SearchForm from "../components/SearchForm";
import ChatbotPreview from "../components/ChatbotPreview";
import Footer from "../components/Footer.tsx";
import "../styles/Home.css";

const DarkModeToggle: React.FC<{
  isDarkMode: boolean;
  onToggle: () => void;
}> = ({ isDarkMode, onToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  //Lấy user details from Google API
  // const navigate = useNavigate();
  // const [userDetails, setUserDetails] = useState({});
  // const getUserDetails = async (accessToken: string) => {
  //   const response = await fetch(
  //     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
  //   );
  //   const data = await response.json();

  //   setUserDetails(data);
  // };

  return (
    <motion.button
      className={`dark-mode-toggle ${!isVisible ? "scrolled" : "visible"}`}
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? "🌞" : "🌙"}
    </motion.button>
  );
};

const Home: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Apply dark mode to body element
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };
  const navigate = useNavigate();
  const handleStartQuiz = () => {
    // Navigate to the quiz page
    navigate("/quiz");
  };

  return (
    <div className={`home-container ${isDarkMode ? "dark-mode" : ""}`}>
      <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Khám phá đúng tính cách của bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            Sử dụng phương thức MBTI và DISC giúp học sinh hiểu rõ hơn về bản
            thân của họ
          </motion.p>
          <motion.button
            className="cta-button"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px rgba(255, 159, 67, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            onClick={handleStartQuiz}
          >
            Bắt đầu kiểm tra ngay
          </motion.button>
        </motion.div>
      </motion.section>

      <div className="main-content">
        <motion.div
          className="main-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <div className="left-column">
            <PersonalityTypes />
          </div>

          <div className="center-column">
            <MainSlider />
            <PremiumPackage />
            <SearchForm />
          </div>

          <div className="right-column">
            <NewsSlider />
            <ChatbotPreview />
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
