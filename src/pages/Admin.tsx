import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaTrophy, 
  FaCalendar,   
  FaCrown, 
  FaArrowUp,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlus,
  FaSearch,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaDollarSign,
  FaUserCheck,
  FaExclamationTriangle,
  FaSync,
  FaGraduationCap,
  FaInfinity,
  FaCalendarAlt
} from 'react-icons/fa';
import quizService from '../services/quizService';
import { getCurrentUser } from '../services/userService';
import { getToken } from '../services/localStorageService';
import Table from '../components/Table';
import Button from '../components/Button';
import Tab from '../components/Tab';
import Alert from '../components/Alert';
import '../styles/Admin.css';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  lastLogin?: string;
  isParent?: boolean;
  phone?: string;
  address?: string;
  roleRequest?: 'EVENT_ORGANIZER' | null;
  requestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  totalQuestions: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  completions: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: string;
}

interface PremiumPackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  completedAt?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalQuizzes: number;
  totalEvents: number;
  totalRevenue: number;
  activeUsers: number;
  pendingRequests: number;
  monthlyGrowth: number;
  completedQuizzes: number;
}

// StatCard component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-info">
          <h3 className="stat-card-title">{title}</h3>
          <p className="stat-card-value">{value}</p>
          {change && (
            <div className={`stat-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
              {change >= 0 ? <FaArrowUp /> : <FaArrowUp style={{ transform: 'rotate(180deg)' }} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`stat-card-icon ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuizzes: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingRequests: 0,
    monthlyGrowth: 0,
    completedQuizzes: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [premiumPackages, setPremiumPackages] = useState<PremiumPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper function to get package icon
  const getPackageIcon = (packageName: string) => {
    switch (packageName) {
      case 'Student':
        return <FaGraduationCap />;
      case 'Monthly':
        return <FaCalendarAlt />;
      default:
        return <FaInfinity />;
    }
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      showAlert('error', 'Please log in to access admin features.');
      setIsLoading(false);
      return;
    }

    try {
      await Promise.all([
        loadUsers(),
        loadQuizzes(),
        loadEvents(),
        loadPremiumPackages(),
        loadTransactions()
      ]);
      calculateDashboardStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      try {
        // Try to get the current user as a sample
        const currentUser = await getCurrentUser();
        
        // Mock additional users for demonstration
        const mockUsers: User[] = [
          {
            id: currentUser.id || '1',
            fullName: currentUser.fullName || 'Current User',
            email: currentUser.email || 'current@example.com',
            role: currentUser.role || 'USER',
            status: 'ACTIVE',
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2024-01-20T14:22:00Z',
            isParent: currentUser.isParent || false,
            phone: currentUser.phone || '+1234567890',
            address: currentUser.address || 'Unknown',
            roleRequest: 'EVENT_ORGANIZER',
            requestStatus: 'PENDING'
          },
          {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: 'EVENT_ORGANIZER',
            status: 'ACTIVE',
            createdAt: '2024-01-10T09:15:00Z',
            lastLogin: '2024-01-21T16:45:00Z',
            isParent: true,
            phone: '+1234567891',
            address: 'Los Angeles, CA'
          },
          {
            id: '3',
            fullName: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'USER',
            status: 'INACTIVE',
            createdAt: '2024-01-12T11:20:00Z',
            isParent: false,
            phone: '+1234567892',
            address: 'Chicago, IL'
          }
        ];
        
        setUsers(mockUsers);
      } catch (userError) {
        console.warn('Could not fetch current user, using mock data:', userError);
        
        // If getCurrentUser fails, use mock data
        const mockUsers: User[] = [
          {
            id: '1',
            fullName: 'Admin User',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2024-01-15T10:30:00Z',
            lastLogin: '2024-01-20T14:22:00Z',
            isParent: false,
            phone: '+1234567890',
            address: 'Admin Office',
            roleRequest: null,
            requestStatus: null
          },
          {
            id: '2',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: 'EVENT_ORGANIZER',
            status: 'ACTIVE',
            createdAt: '2024-01-10T09:15:00Z',
            lastLogin: '2024-01-21T16:45:00Z',
            isParent: true,
            phone: '+1234567891',
            address: 'Los Angeles, CA'
          },
          {
            id: '3',
            fullName: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'USER',
            status: 'INACTIVE',
            createdAt: '2024-01-12T11:20:00Z',
            isParent: false,
            phone: '+1234567892',
            address: 'Chicago, IL'
          }
        ];
        
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showAlert('error', 'Failed to load users');
      setUsers([]);
    }
  };

  const loadQuizzes = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use the new method to get all quizzes with questions
      const allQuizzes = await quizService.getAllQuizzesWithQuestions();
      
      // Transform the data to match our Quiz interface
      const transformedQuizzes = allQuizzes.map(quiz => ({
        ...quiz,
        status: 'ACTIVE' as const,
        createdAt: '2024-01-01T00:00:00Z',
        completions: Math.floor(Math.random() * 1000)
      }));
      
      setQuizzes(transformedQuizzes);
    } catch (error: any) {
      console.error('Error loading quizzes:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        showAlert('error', 'Authentication expired. Please log in again.');
      } else if (error.message === 'No authentication token found') {
        showAlert('error', 'Please log in to access admin features.');
      } else {
        showAlert('error', 'Failed to load quizzes. Please try again.');
      }
      
      // Set empty array to prevent UI crashes
      setQuizzes([]);
    }
  };

  const loadEvents = async () => {
    try {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Career Development Workshop',
          description: 'A comprehensive workshop on career planning and development',
          organizerId: '2',
          organizerName: 'Jane Smith',
          status: 'PENDING',
          startDate: '2024-02-15T10:00:00Z',
          endDate: '2024-02-15T16:00:00Z',
          location: 'Virtual Event',
          maxParticipants: 100,
          currentParticipants: 0,
          createdAt: '2024-01-20T12:00:00Z'
        },
        {
          id: '2',
          title: 'Leadership Training',
          description: 'Training session for developing leadership skills',
          organizerId: '2',
          organizerName: 'Jane Smith',
          status: 'APPROVED',
          startDate: '2024-02-20T09:00:00Z',
          endDate: '2024-02-20T17:00:00Z',
          location: 'Conference Hall A',
          maxParticipants: 50,
          currentParticipants: 35,
          createdAt: '2024-01-18T14:30:00Z'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      showAlert('error', 'Failed to load events');
    }
  };

  const loadPremiumPackages = async () => {
    try {
      const mockPackages: PremiumPackage[] = [
        {
          id: 'student',
          name: 'Student',
          price: 99000,
          duration: 1,
          features: [
            'Không giới hạn bài test',
            'AI Chatbot cá nhân',
            'Báo cáo chi tiết',
            'Tư vấn nghề nghiệp',
            'Hỗ trợ email'
          ],
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'monthly',
          name: 'Monthly',
          price: 199000,
          duration: 1,
          features: [
            'Không giới hạn bài test',
            'AI Chatbot cá nhân',
            'Báo cáo chi tiết',
            'Tư vấn nghề nghiệp',
            'Parent Dashboard',
            'Hỗ trợ 24/7'
          ],
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'yearly',
          name: 'Yearly',
          price: 1990000,
          duration: 12,
          features: [
            'Không giới hạn bài test',
            'AI Chatbot cá nhân',
            'Báo cáo chi tiết',
            'Tư vấn nghề nghiệp',
            'Parent Dashboard',
            'Hỗ trợ 24/7',
            'Tính năng độc quyền',
            'Ưu tiên hỗ trợ'
          ],
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      setPremiumPackages(mockPackages);
    } catch (error) {
      console.error('Error loading premium packages:', error);
      showAlert('error', 'Failed to load premium packages');
    }
  };

  const loadTransactions = async () => {
    try {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          packageId: 'student',
          packageName: 'Student Package',
          amount: 99000,
          status: 'COMPLETED',
          createdAt: '2024-01-15T10:30:00Z',
          completedAt: '2024-01-15T10:35:00Z'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          packageId: 'monthly',
          packageName: 'Monthly Package',
          amount: 199000,
          status: 'PENDING',
          createdAt: '2024-01-20T14:22:00Z'
        },
        {
          id: '3',
          userId: '3',
          userName: 'Mike Johnson',
          packageId: 'yearly',
          packageName: 'Yearly Package',
          amount: 1990000,
          status: 'COMPLETED',
          createdAt: '2024-01-18T09:45:00Z',
          completedAt: '2024-01-18T09:50:00Z'
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      showAlert('error', 'Failed to load transactions');
    }
  };

  const calculateDashboardStats = () => {
    const stats: DashboardStats = {
      totalUsers: users.length,
      totalQuizzes: quizzes.length,
      totalEvents: events.length,
      totalRevenue: transactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0),
      activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      pendingRequests: users.filter(u => u.requestStatus === 'PENDING').length +
                      events.filter(e => e.status === 'PENDING').length,
      monthlyGrowth: 12.5,
      completedQuizzes: quizzes.reduce((sum, q) => sum + q.completions, 0)
    };
    setDashboardStats(stats);
  };

  const handleUserRoleRequest = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const updatedUsers = users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              requestStatus: action === 'approve' ? 'APPROVED' as const : 'REJECTED' as const,
              role: action === 'approve' ? 'EVENT_ORGANIZER' : user.role
            }
          : user
      );
      setUsers(updatedUsers);
      calculateDashboardStats();
      showAlert('success', `User role request ${action}d successfully`);
    } catch (error) {
      console.error('Error updating user role request:', error);
      showAlert('error', 'Failed to update user role request');
    }
  };

  const handleEventRequest = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, status: action === 'approve' ? 'APPROVED' as const : 'REJECTED' as const }
          : event
      );
      setEvents(updatedEvents);
      calculateDashboardStats();
      showAlert('success', `Event ${action}d successfully`);
    } catch (error) {
      console.error('Error updating event request:', error);
      showAlert('error', 'Failed to update event request');
    }
  };

  const handleQuizStatusToggle = async (quizId: number) => {
    try {
      const updatedQuizzes = quizzes.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, status: quiz.status === 'ACTIVE' ? 'INACTIVE' as const : 'ACTIVE' as const }
          : quiz
      );
      setQuizzes(updatedQuizzes);
      showAlert('success', 'Quiz status updated successfully');
    } catch (error) {
      console.error('Error updating quiz status:', error);
      showAlert('error', 'Failed to update quiz status');
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p>Monitor your platform performance and key metrics</p>
        </div>
        <Button 
          variant="primary" 
          onClick={loadDashboardData} 
          isLoading={isLoading}
          icon={<FaSync />}
        >
          Refresh
        </Button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers}
          change={dashboardStats.monthlyGrowth}
          icon={<FaUsers />}
          color="blue"
        />
        <StatCard
          title="Active Quizzes"
          value={dashboardStats.totalQuizzes}
          icon={<FaTrophy />}
          color="green"
        />
        <StatCard
          title="Total Events"
          value={dashboardStats.totalEvents}
          icon={<FaCalendar />}
          color="purple"
        />
        <StatCard
          title="Revenue"
          value={`$${dashboardStats.totalRevenue.toFixed(2)}`}
          icon={<FaDollarSign />}
          color="orange"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <FaExclamationTriangle className="warning-icon" />
              Pending Requests
            </h3>
            <p>Items requiring your attention</p>
          </div>
          <div className="card-content">
            <div className="pending-item">
              <div className="pending-info">
                <strong>Role Requests</strong>
                <span>{users.filter(u => u.requestStatus === 'PENDING').length} pending</span>
              </div>
              <div className="pending-badge">
                {users.filter(u => u.requestStatus === 'PENDING').length}
              </div>
            </div>
            <div className="pending-item">
              <div className="pending-info">
                <strong>Event Approvals</strong>
                <span>{events.filter(e => e.status === 'PENDING').length} pending</span>
              </div>
              <div className="pending-badge">
                {events.filter(e => e.status === 'PENDING').length}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <FaChartLine className="activity-icon" />
              System Activity
            </h3>
            <p>Recent platform statistics</p>
          </div>
          <div className="card-content">
            <div className="activity-item">
              <span>Active Users</span>
              <strong>{dashboardStats.activeUsers}</strong>
            </div>
            <div className="activity-item">
              <span>Quiz Completions</span>
              <strong>{dashboardStats.completedQuizzes}</strong>
            </div>
            <div className="activity-item">
              <span>Approved Events</span>
              <strong>{events.filter(e => e.status === 'APPROVED').length}</strong>
            </div>
            <div className="activity-item">
              <span>Premium Subscribers</span>
              <strong>{transactions.filter(t => t.status === 'COMPLETED').length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const userColumns = [
      {
        key: 'fullName' as keyof User,
        title: 'Name',
        render: (value: string, record: User) => (
          <div className="user-cell">
            <div className="user-avatar">
              {value.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">{value}</div>
              <div className="user-email">{record.email}</div>
            </div>
          </div>
        )
      },
      {
        key: 'role' as keyof User,
        title: 'Role',
        render: (value: string) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value}
          </span>
        )
      },
      {
        key: 'status' as keyof User,
        title: 'Status',
        render: (value: string) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value}
          </span>
        )
      },
      {
        key: 'roleRequest' as keyof User,
        title: 'Role Request',
        render: (value: string | null, record: User) => {
          if (!value || !record.requestStatus) return '-';
          
          return (
            <div className="role-request-cell">
              <span className="status-badge secondary">{value}</span>
              {record.requestStatus === 'PENDING' && (
                <div className="action-buttons">
                  <button
                    className="action-btn approve"
                    onClick={() => handleUserRoleRequest(record.id, 'approve')}
                    title="Approve"
                  >
                    <FaCheck />
                  </button>
                  <button
                    className="action-btn reject"
                    onClick={() => handleUserRoleRequest(record.id, 'reject')}
                    title="Reject"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          );
        }
      },
      {
        key: 'createdAt' as keyof User,
        title: 'Created',
        render: (value: string) => new Date(value).toLocaleDateString()
      }
    ];

    return (
      <div className="management-content">
        <div className="management-header">
          <div>
            <h2>User Management</h2>
            <p>Manage users and role requests</p>
          </div>
          <Button variant="primary" icon={<FaPlus />}>
            Add User
          </Button>
        </div>

        <div className="filters-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="table-container">
          <Table
            data={filteredUsers}
            columns={userColumns}
            isLoading={isLoading}
            pagination={{
              pageSize,
              currentPage,
              totalItems: filteredUsers.length,
              onPageChange: setCurrentPage
            }}
          />
        </div>
      </div>
    );
  };

  const renderQuizManagement = () => {
    const filteredQuizzes = quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || quiz.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const quizColumns = [
      {
        key: 'title' as keyof Quiz,
        title: 'Quiz Title',
        render: (value: string, record: Quiz) => (
          <div className="quiz-cell">
            <div className="quiz-title">{value}</div>
            <div className="quiz-description">{record.description}</div>
          </div>
        )
      },
      {
        key: 'category' as keyof Quiz,
        title: 'Category',
        render: (value: any) => (
          <span className="status-badge outline">{value.name}</span>
        )
      },
      {
        key: 'totalQuestions' as keyof Quiz,
        title: 'Questions',
        render: (value: number) => `${value} questions`
      },
      {
        key: 'completions' as keyof Quiz,
        title: 'Completions',
        render: (value: number) => (
          <div className="completion-cell">
            <FaUserCheck className="completion-icon" />
            {value}
          </div>
        )
      },
      {
        key: 'status' as keyof Quiz,
        title: 'Status',
        render: (value: string, record: Quiz) => (
          <div className="status-cell">
            <span className={`status-badge ${value.toLowerCase()}`}>
              {value}
            </span>
            <button
              className="toggle-btn"
              onClick={() => handleQuizStatusToggle(record.id)}
            >
              {value === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )
      },
      {
        key: 'id' as keyof Quiz,
        title: 'Actions',
        render: (_value: number) => (
          <div className="action-buttons">
            <button className="action-btn view" title="View">
              <FaEye />
            </button>
            <button className="action-btn edit" title="Edit">
              <FaEdit />
            </button>
          </div>
        )
      }
    ];

    return (
      <div className="management-content">
        <div className="management-header">
          <div>
            <h2>Quiz Management</h2>
            <p>Manage MBTI and DISC quizzes</p>
          </div>
          <Button variant="primary" icon={<FaPlus />}>
            Create Quiz
          </Button>
        </div>

        <div className="filters-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="quiz-stats">
          <div className="stat-item">
            <FaTrophy className="stat-icon yellow" />
            <div>
              <span className="stat-label">Total Quizzes</span>
              <span className="stat-value">{quizzes.length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaChartLine className="stat-icon green" />
            <div>
              <span className="stat-label">Active Quizzes</span>
              <span className="stat-value">{quizzes.filter(q => q.status === 'ACTIVE').length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaChartBar className="stat-icon blue" />
            <div>
              <span className="stat-label">MBTI Quizzes</span>
              <span className="stat-value">{quizzes.filter(q => q.category.name.includes('MBTI')).length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaChartPie className="stat-icon purple" />
            <div>
              <span className="stat-label">DISC Quizzes</span>
              <span className="stat-value">{quizzes.filter(q => q.category.name.includes('DISC')).length}</span>
            </div>
          </div>
        </div>

        <div className="table-container">
          <Table
            data={filteredQuizzes}
            columns={quizColumns}
            isLoading={isLoading}
            pagination={{
              pageSize,
              currentPage,
              totalItems: filteredQuizzes.length,
              onPageChange: setCurrentPage
            }}
          />
        </div>
      </div>
    );
  };

  const renderEventManagement = () => {
    const filteredEvents = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.organizerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const eventColumns = [
      {
        key: 'title' as keyof Event,
        title: 'Event',
        render: (value: string, record: Event) => (
          <div className="event-cell">
            <div className="event-title">{value}</div>
            <div className="event-description">{record.description}</div>
          </div>
        )
      },
      {
        key: 'organizerName' as keyof Event,
        title: 'Organizer',
        render: (value: string) => (
          <div className="organizer-cell">
            <div className="organizer-avatar">
              {value.charAt(0)}
            </div>
            <span>{value}</span>
          </div>
        )
      },
      {
        key: 'startDate' as keyof Event,
        title: 'Date',
        render: (value: string) => (
          <div className="date-cell">
            <div className="date-value">{new Date(value).toLocaleDateString()}</div>
            <div className="time-value">{new Date(value).toLocaleTimeString()}</div>
          </div>
        )
      },
      {
        key: 'currentParticipants' as keyof Event,
        title: 'Participants',
        render: (value: number, record: Event) => (
          <div className="participants-cell">
            <FaUsers className="participants-icon" />
            {value}/{record.maxParticipants}
          </div>
        )
      },
      {
        key: 'status' as keyof Event,
        title: 'Status',
        render: (value: string, record: Event) => (
          <div className="status-cell">
            <span className={`status-badge ${value.toLowerCase()}`}>
              {value}
            </span>
            {value === 'PENDING' && (
              <div className="action-buttons">
                <button
                  className="action-btn approve"
                  onClick={() => handleEventRequest(record.id, 'approve')}
                  title="Approve"
                >
                  <FaCheck />
                </button>
                <button
                  className="action-btn reject"
                  onClick={() => handleEventRequest(record.id, 'reject')}
                  title="Reject"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        )
      },
      {
        key: 'id' as keyof Event,
        title: 'Actions',
        render: (_value: string) => (
          <div className="action-buttons">
            <button className="action-btn view" title="View">
              <FaEye />
            </button>
            <button className="action-btn edit" title="Edit">
              <FaEdit />
            </button>
          </div>
        )
      }
    ];

    return (
      <div className="management-content">
        <div className="management-header">
          <div>
            <h2>Event Management</h2>
            <p>Review and manage event requests</p>
          </div>
          <Button variant="primary" icon={<FaPlus />}>
            Create Event
          </Button>
        </div>

        <div className="filters-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="event-stats">
          <div className="stat-item">
            <FaCalendar className="stat-icon blue" />
            <div>
              <span className="stat-label">Total Events</span>
              <span className="stat-value">{events.length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaCheck className="stat-icon green" />
            <div>
              <span className="stat-label">Approved</span>
              <span className="stat-value">{events.filter(e => e.status === 'APPROVED').length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaExclamationTriangle className="stat-icon yellow" />
            <div>
              <span className="stat-label">Pending</span>
              <span className="stat-value">{events.filter(e => e.status === 'PENDING').length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaTimes className="stat-icon red" />
            <div>
              <span className="stat-label">Rejected</span>
              <span className="stat-value">{events.filter(e => e.status === 'REJECTED').length}</span>
            </div>
          </div>
        </div>

        <div className="table-container">
          <Table
            data={filteredEvents}
            columns={eventColumns}
            isLoading={isLoading}
            pagination={{
              pageSize,
              currentPage,
              totalItems: filteredEvents.length,
              onPageChange: setCurrentPage
            }}
          />
        </div>
      </div>
    );
  };

  const renderPremiumManagement = () => {
    const packageColumns = [
      {
        key: 'name' as keyof PremiumPackage,
        title: 'Package Name',
        render: (value: string, record: PremiumPackage) => (
          <div className="package-cell">
            <div className="package-name">{value}</div>
            <div className="package-duration">{record.duration} month{record.duration > 1 ? 's' : ''}</div>
          </div>
        )
      },
      {
        key: 'price' as keyof PremiumPackage,
        title: 'Price',
        render: (value: number) => (
          <div className="price-cell">₫{formatPrice(value)}</div>
        )
      },
      {
        key: 'features' as keyof PremiumPackage,
        title: 'Features',
        render: (value: string[]) => (
          <div className="features-cell">
            {value.slice(0, 2).map((feature) => (
              <div key={feature} className="feature-item">{feature}</div>
            ))}
            {value.length > 2 && (
              <div className="feature-more">+{value.length - 2} more</div>
            )}
          </div>
        )
      },
      {
        key: 'status' as keyof PremiumPackage,
        title: 'Status',
        render: (value: string) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value}
          </span>
        )
      },
      {
        key: 'id' as keyof PremiumPackage,
        title: 'Actions',
        render: (_value: string) => (
          <div className="action-buttons">
            <button className="action-btn edit" title="Edit">
              <FaEdit />
            </button>
            <button className="action-btn delete" title="Delete">
              <FaTrash />
            </button>
          </div>
        )
      }
    ];

    const transactionColumns = [
      {
        key: 'userName' as keyof Transaction,
        title: 'User',
        render: (value: string, record: Transaction) => (
          <div className="user-cell">
            <div className="user-avatar">
              {value.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">{value}</div>
              <div className="package-name">{record.packageName}</div>
            </div>
          </div>
        )
      },
      {
        key: 'amount' as keyof Transaction,
        title: 'Amount',
        render: (value: number) => (
          <div className="amount-cell">₫{formatPrice(value)}</div>
        )
      },
      {
        key: 'status' as keyof Transaction,
        title: 'Status',
        render: (value: string) => (
          <span className={`status-badge ${value.toLowerCase()}`}>
            {value}
          </span>
        )
      },
      {
        key: 'createdAt' as keyof Transaction,
        title: 'Date',
        render: (value: string) => new Date(value).toLocaleDateString()
      }
    ];

    return (
      <div className="management-content">
        <div className="management-header">
          <div>
            <h2>Premium Management</h2>
            <p>Manage premium packages and transactions</p>
          </div>
          <Button variant="primary" icon={<FaPlus />}>
            Create Package
          </Button>
        </div>

        <div className="premium-stats">
          <div className="stat-item">
            <FaCrown className="stat-icon yellow" />
            <div>
              <span className="stat-label">Total Packages</span>
              <span className="stat-value">{premiumPackages.length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaDollarSign className="stat-icon green" />
            <div>
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${dashboardStats.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaUsers className="stat-icon blue" />
            <div>
              <span className="stat-label">Subscribers</span>
              <span className="stat-value">{transactions.filter(t => t.status === 'COMPLETED').length}</span>
            </div>
          </div>
          <div className="stat-item">
            <FaExclamationTriangle className="stat-icon yellow" />
            <div>
              <span className="stat-label">Pending</span>
              <span className="stat-value">{transactions.filter(t => t.status === 'PENDING').length}</span>
            </div>
          </div>
        </div>

        <div className="premium-grid">
          <div className="premium-section">
            <h3>Premium Packages</h3>
            
            {/* Premium Package Cards */}
            <div className="premium-packages-display">
              {premiumPackages.map((pkg) => (
                <div key={pkg.id} className="premium-package-card">
                  <div className="package-header">
                    <div className="package-icon">
                      {getPackageIcon(pkg.name)}
                    </div>
                    <h4 className="package-name">{pkg.name}</h4>
                    <div className="package-price">
                      <span className="currency">₫</span>
                      <span className="amount">{formatPrice(pkg.price)}</span>
                      <span className="period">/{pkg.duration} month{pkg.duration > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="package-features">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={`${pkg.id}-feature-${featureIndex}`} className="feature-item">
                        <FaCheck className="check-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="package-actions">
                    <button className="action-btn edit" title="Edit Package">
                      <FaEdit />
                    </button>
                    <button className="action-btn delete" title="Delete Package">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="table-container">
              <Table
                data={premiumPackages}
                columns={packageColumns}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="premium-section">
            <h3>Recent Transactions</h3>
            <div className="table-container">
              <Table
                data={transactions}
                columns={transactionColumns}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'quizzes':
        return renderQuizManagement();
      case 'events':
        return renderEventManagement();
      case 'premium':
        return renderPremiumManagement();
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {alert && (
        <div className="alert-container">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}
      
      <div className="admin-layout">
        <Tab activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="admin-main">
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Modern tech-themed administration panel</p>
          </div>
          
          <div className="admin-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;