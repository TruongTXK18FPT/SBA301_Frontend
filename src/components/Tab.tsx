import { useState } from 'react';
import { 
  FaHome, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaCalendar, 
  FaBell,
  FaQuestionCircle,
  FaCrown
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
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
    { id: 'users', icon: <FaUsers />, label: 'Users', notification: 3 },
    { id: 'quizzes', icon: <FaQuestionCircle />, label: 'Quizzes', notification: 4 },
    { id: 'events', icon: <FaCalendar />, label: 'Events', notification: 1 },
    { id: 'premium', icon: <FaCrown />, label: 'Premium', notification: 2 },
    { id: 'analytics', icon: <FaChartBar />, label: 'Analytics' },
    { id: 'calendar', icon: <FaCalendar />, label: 'Calendar', notification: 2 },
    { id: 'notifications', icon: <FaBell />, label: 'Notifications', notification: 5 },
    { id: 'settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className={`admin-tab ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="tab-header">
        <img 
          src={Admin} 
          alt="Admin Logo" 
          className="admin-logo"
          loading = "eager"
        />
        <button 
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded? 'Collapse sidebar': 'Expand sidebar'}
        >
          {isExpanded ? '◄' : '►'}
        </button>
      </div>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${externalActiveTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
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