import { useState, useEffect } from 'react';
import Tab from '../components/Tab';
import Alert from '../components/Alert';
import { 
  FaUsers, FaQuestionCircle, FaCalendarAlt,
 FaArrowUp,
} from 'react-icons/fa';
import UserManagement from '../components/admin/UserManagement';
import QuizManagement from '../components/admin/QuizManagement';
import '../styles/Admin.css';
import EventPrivateList from '@/components/event/EventPrivateList';
import UniversityManagementPage from '@/components/admin/UniversityManagementPage';
import CareerManagement from '@/components/admin/CareerManagement';
import AdminDashboard from '@/components/admin/AdminDashboard';

type AlertType = 'success' | 'info' | 'warning' | 'error';
type ActiveView = 'dashboard'|'users' | 'quizzes' | 'events' |
                  'universities'| 'careers';

const Admin = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [alerts, setAlerts] = useState<Array<{ id: number; type: AlertType; message: string }>>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    // Simulate loading stats with counting animation

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
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement onAlert={showAlert} />;
      case 'quizzes':
        return <QuizManagement onAlert={showAlert} />;
      case 'events':
        return <EventPrivateList />;
      case 'universities':
        return <UniversityManagementPage/>;
      case 'careers':
        return <CareerManagement/>;
    }
  };

  return (
    <div className="admin-layout">
      <Tab 
        activeTab={activeView}
        onTabChange={(tabId) => setActiveView(tabId as ActiveView)}
      />
      
      <main className="admin-main">

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