import { useState } from 'react';
import { 
  FaUsers, 
  FaCalendar, 
  FaQuestionCircle,
  FaDev,
  FaChevronLeft,
  FaChevronRight,
  FaUniversity,
  FaCalculator
} from 'react-icons/fa';
import '../styles/Tab.css';
import Admin from '../assets/Admin.jpeg'; // Assuming you have an admin icon
interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface TabProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({ activeTab: externalActiveTab, onTabChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const tabs: TabItem[] = [
    { id: 'dashboard', icon: <FaCalculator />, label: 'Dashboard' },
    { id: 'users', icon: <FaUsers />, label: 'Users' },
    { id: 'quizzes', icon: <FaQuestionCircle />, label: 'Quizzes',  },
    { id: 'events', icon: <FaCalendar />, label: 'Events' },
    {id: 'universities', icon: <FaUniversity />, label: 'Universities' },
    { id: 'careers', icon: <FaDev />, label: 'Careers' },
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