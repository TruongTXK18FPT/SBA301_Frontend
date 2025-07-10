import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignInAlt, FaSignOutAlt, FaCalendarAlt, FaCrown, FaNewspaper, FaCog, FaRobot, FaBrain, FaUsers } from 'react-icons/fa';
import '../styles/NavBar.css';
import Logo from '../assets/Logo.jpeg';

interface NavBarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  userRole?: string;
}

const NavBar = ({ isAuthenticated, onLogout, userRole }: NavBarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Normalize role to lowercase for comparison
  const normalizedRole = userRole?.toLowerCase();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
        <button 
          className="mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Navigation Menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Main Navigation */}
          <div className="nav-section main-nav">
            <Link 
              to="/events" 
              className={`nav-item ${location.pathname === '/events' ? 'active' : ''}`}
            >
              <FaCalendarAlt />
              <span className="nav-text">Sự Kiện</span>
            </Link>
            <Link 
              to="/quiz" 
              className={`nav-item ${location.pathname === '/quiz' ? 'active' : ''}`}
            >
              <FaBrain />
              <span className="nav-text">Trắc Nghiệm</span>
            </Link>
            {/* Show additional authenticated user links */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/blog" 
                  className={`nav-item ${location.pathname === '/blog' ? 'active' : ''}`}
                >
                  <FaNewspaper />
                  <span className="nav-text">Bài Viết</span>
                </Link>
                <Link 
                  to="/chat-ai" 
                  className={`nav-item ${location.pathname === '/chat-ai' ? 'active' : ''}`}
                >
                  <FaRobot />
                  <span className="nav-text">AI Tư Vấn</span>
                </Link>
              </>
            )}
            {/* Show blog for non-authenticated users */}
            {!isAuthenticated && (
              <Link 
                to="/blog" 
                className={`nav-item ${location.pathname === '/blog' ? 'active' : ''}`}
              >
                <FaNewspaper />
                <span className="nav-text">Bài Viết</span>
              </Link>
            )}
            {/* Admin link - only show for admin users */}
            {normalizedRole === 'admin' && (
              <Link 
                to="/admin" 
                className={`nav-item admin-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                <FaCog />
                <span className="nav-text">Quản Trị</span>
              </Link>
            )}
            {/* Parent Dashboard link - only show for parent users */}
            {normalizedRole === 'parent' && (
              <Link 
                to="/parent" 
                className={`nav-item parent-link ${location.pathname === '/parent' ? 'active' : ''}`}
              >
                <FaUsers />
                <span className="nav-text">DashBoard</span>
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="nav-section auth-nav">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className={`nav-item profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
                  title="Hồ Sơ"
                >
                  <FaUserCircle />
                </Link>
                <Link to="/premium" className="auth-button premium">
                  <FaCrown />
                  <span className="auth-text">Premium</span>
                </Link>
                <button onClick={onLogout} className="auth-button logout" title="Đăng xuất">
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <>
                <Link to="/premium" className="auth-button premium">
                  <FaCrown />
                  <span className="auth-text">Premium</span>
                </Link>
                <Link to="/login" className="auth-button login">
                  <FaSignInAlt />
                  <span className="auth-text">Đăng nhập</span>
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