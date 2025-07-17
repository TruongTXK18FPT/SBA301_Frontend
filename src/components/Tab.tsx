import { useState } from 'react';
import { 
  FaHome, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaCalendar, 
  FaBell,
  FaQuestionCircle,
  FaCrown,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import '../styles/Tab.css';
import Admin from '../assets/Admin.jpeg'; // Assuming you have an admin icon
interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  notification?: number;
}

interface TabProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({ activeTab: externalActiveTab, onTabChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const tabs: TabItem[] = [
    { id: 'users', icon: <FaUsers />, label: 'Users', notification: 3 },
    { id: 'quizzes', icon: <FaQuestionCircle />, label: 'Quizzes', notification: 4 },
    { id: 'events', icon: <FaCalendar />, label: 'Events', notification: 1 },
    { id: 'premium', icon: <FaCrown />, label: 'Premium', notification: 2 },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`admin-tab ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="tab-header">
        <div className="logo-container">
          <img 
            src={Admin} 
            alt="Admin Logo" 
            className="admin-logo"
            loading="eager"
          />
          {isExpanded && <span className="admin-title">Admin Panel</span>}
        </div>
        <button 
          className="toggle-button"
          onClick={toggleSidebar}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${externalActiveTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={!isExpanded ? tab.label : undefined}
          >
            <span className="tab-icon">{tab.icon}</span>
            {isExpanded && (
              <>
                <span className="tab-label">{tab.label}</span>
                {tab.notification && (
                  <span className="notification-badge">
                    {tab.notification}
                  </span>
                )}
              </>
            )}
            <div className="tab-highlight"></div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tab;