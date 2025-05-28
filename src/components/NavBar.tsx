import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignInAlt, FaSignOutAlt, FaListAlt, FaCalendarAlt, FaCrown, FaNewspaper } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/NavBar.css';
import Logo from '../assets/Logo.jpeg';

interface NavBarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const NavBar = ({ isAuthenticated, onLogout }: NavBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="navbar-brand">
          <img src={Logo} alt="Logo" className="navbar-logo" />
          <span className="brand-text">PersonalityQuiz</span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Main Navigation */}
          <div className="nav-section main-nav">
            <Link 
              to="/event" 
              className={`nav-item ${location.pathname === '/event' ? 'active' : ''}`}
            >
              <FaCalendarAlt />
              <span>Sự Kiện</span>
            </Link>
            <Link 
              to="/quiz" 
              className={`nav-item ${location.pathname === '/quiz' ? 'active' : ''}`}
            >
              <FaListAlt />
              <span>Kiểm Tra Tính Cách</span>
            </Link>
            <Link 
              to="/blog" 
              className={`nav-item ${location.pathname === '/blog' ? 'active' : ''}`}
            >
              <FaNewspaper />
              <span>Bài Viết</span>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="nav-section auth-nav">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-item profile">
                  <FaUserCircle />
                  <span>Thông tin cá nhân</span>
                </Link>
                <button onClick={onLogout} className="auth-button logout">
                  <FaSignOutAlt />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/premium" className="auth-button premium">
                  <FaCrown />
                  <span>Đăng ký Premium</span>
                </Link>
                <Link to="/login" className="auth-button login">
                  <FaSignInAlt />
                  <span>Đăng nhập</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;