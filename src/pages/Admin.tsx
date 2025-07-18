import { useState, useEffect } from 'react';
import Tab from '../components/Tab';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { 
  FaSearch, FaBell, FaUserCircle, FaPlus, 
  FaUsers, FaQuestionCircle, FaCalendarAlt,
  FaChartLine, FaCog, FaCrown, FaArrowUp,
  FaChevronDown
} from 'react-icons/fa';
import UserManagement from '../components/admin/UserManagement';
import QuizManagement from '../components/admin/QuizManagement';
import EventManagement from '../components/admin/EventManagement';
import Analytics from '../components/admin/Analytics';
import Settings from '../components/admin/Settings';
import '../styles/Admin.css';
import EventPrivateList from '@/components/event/EventPrivateList';

export interface AdminStats {
  totalUsers: number;
  activeQuizzes: number;
  completedQuizzes: number;
  pendingEvents: number;
  revenue: number;
  premiumUsers: number;
}

type AlertType = 'success' | 'info' | 'warning' | 'error';
type ActiveView = 'dashboard' | 'users' | 'quizzes' | 'events' | 'analytics' | 'settings' | 
                 'premium' | 'calendar' | 'notifications';

const Admin = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [alerts, setAlerts] = useState<Array<{ id: number; type: AlertType; message: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    pendingEvents: 0,
    revenue: 0,
    premiumUsers: 0
  });

  const navItems = [
    { id: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { id: 'users', icon: <FaUsers />, label: 'Users', notification: 2 },
    { id: 'quizzes', icon: <FaQuestionCircle />, label: 'Quizzes', notification: 3 },
    { id: 'events', icon: <FaCalendarAlt />, label: 'Events', notification: 5 },
    { id: 'analytics', icon: <FaChartLine />, label: 'Analytics' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' }
  ];

  useEffect(() => {
    // Simulate loading stats with counting animation
    const finalStats = {
      totalUsers: 1234,
      activeQuizzes: 15,
      completedQuizzes: 789,
      pendingEvents: 8,
      revenue: 45600,
      premiumUsers: 342
    };

    const duration = 2000; // 2 seconds animation
    const steps = 60; // 60 steps for smooth animation
    const interval = duration / steps;

    Object.entries(finalStats).forEach(([key, finalValue]) => {
      let currentStep = 0;
      const stepValue = finalValue / steps;

      const timer = setInterval(() => {
        if (currentStep < steps) {
          setStats(prev => ({
            ...prev,
            [key]: Math.round(stepValue * currentStep)
          }));
          currentStep++;
        } else {
          setStats(prev => ({
            ...prev,
            [key]: finalValue
          }));
          clearInterval(timer);
        }
      }, interval);
    });

    // Show scroll to top button on scroll
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    showAlert('info', 'Welcome to the admin dashboard');

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showAlert = (type: AlertType, message: string) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement onAlert={showAlert} />;
      case 'quizzes':
        return <QuizManagement onAlert={showAlert} />;
      case 'events':
        return <EventPrivateList />;
      case 'analytics':
        return <Analytics stats={stats} />;
      case 'premium':
        return <div>Premium Management Coming Soon</div>;
      case 'calendar':
        return <div>Calendar View Coming Soon</div>;
      case 'notifications':
        return <div>Notifications Center Coming Soon</div>;
      case 'settings':
        return <Settings onAlert={showAlert} />;
      default:
        return (
          <>
            <section className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
                  <div className="stat-trend positive">
                    <FaChevronDown style={{ transform: 'rotate(180deg)' }} />
                    +12.5%
                  </div>
                </div>
                <div className="stat-card premium">
                  <h3>Premium Users</h3>
                  <p className="stat-number">{stats.premiumUsers.toLocaleString()}</p>
                  <div className="stat-trend positive">
                    <FaChevronDown style={{ transform: 'rotate(180deg)' }} />
                    +15.2%
                  </div>
                </div>
                <div className="stat-card revenue">
                  <h3>Revenue</h3>
                  <p className="stat-number">${stats.revenue.toLocaleString()}</p>
                  <div className="stat-trend positive">
                    <FaChevronDown style={{ transform: 'rotate(180deg)' }} />
                    +18.7%
                  </div>
                </div>
                <div className="stat-card events">
                  <h3>Pending Events</h3>
                  <p className="stat-number">{stats.pendingEvents}</p>
                  <div className="stat-trend warning">
                    <FaChevronDown />
                    +2.4%
                  </div>
                </div>
              </div>
            </section>

            <section className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                {[
                  { label: 'Create Quiz', icon: <FaQuestionCircle />, color: 'blue' },
                  { label: 'Add Event', icon: <FaCalendarAlt />, color: 'green' },
                  { label: 'Manage Users', icon: <FaUsers />, color: 'purple' },
                  { label: 'Premium Settings', icon: <FaCrown />, color: 'gold' }
                ].map((action, index) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="lg"
                    icon={action.icon}
                    className={`quick-action-btn ${action.color}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => {
                      setActiveView(action.label.toLowerCase().split(' ')[1] as ActiveView);
                      showAlert('info', `Navigating to ${action.label}`);
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="admin-layout">
      <Tab 
        activeTab={activeView}
        onTabChange={(tabId) => setActiveView(tabId as ActiveView)}
      />
      
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="header-actions">
              <Button
                variant="gradient"
                size="sm"
                icon={<FaPlus />}
                onClick={() => showAlert('info', 'Create new feature coming soon!')}
              >
                Create New
              </Button>

              <button 
                className="notification-btn" 
                onClick={() => showAlert('warning', 'You have 3 new notifications')}
                title="Notifications"
              >
                <FaBell />
                <span className="notification-badge">3</span>
              </button>

              <button className="profile-btn" title="Profile">
                <FaUserCircle />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>

        {showScrollTop && (
          <button
            className="scroll-top-btn"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <FaArrowUp />
          </button>
        )}

        <div className="admin-alerts">
          {alerts.map(({ id, type, message }) => (
            <Alert
              key={id}
              type={type}
              message={message}
              onClose={() => setAlerts(prev => prev.filter(alert => alert.id !== id))}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;