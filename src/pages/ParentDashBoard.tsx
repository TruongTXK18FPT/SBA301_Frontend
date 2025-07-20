import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaChild,
  FaTicketAlt,
  FaCreditCard,
  FaHistory,
  FaComments,
  FaChartLine,
  FaUserGraduate,
  FaArrowRight,
  FaTimesCircle,
  FaSpinner,
  FaCheckCircle,
  FaUser,
  FaUsers,
  FaUniversity,
  FaBrain,
  FaCalendarAlt,
  FaShoppingCart,
  FaEye,
  FaDownload,
  FaSignInAlt,
  FaSync
} from 'react-icons/fa';
import '../styles/ParentDashBoard.css';
import quizService from '../services/quizService';
import pdfService from '../services/pdfService';

interface QuizResult {
  id: number;
  personalityCode: string;
  nickname?: string;
  keyTraits?: string;
  description: string;
  careerRecommendations?: string;
  universityRecommendations?: string;
  scores?: Record<string, number>;
  submittedAt: string;
  quizType: string;
}

interface UserQuizResults {
  userId: string;
  email: string;
  fullName: string;
  results: QuizResult[];
}

interface SeminarTicket {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  speaker: string;
  category: string;
  image?: string;
}

interface Transaction {
  id: number;
  type: 'seminar' | 'premium';
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface UniversityChat {
  id: number;
  universityName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

const ParentDashBoard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'search' | 'seminars' | 'transactions' | 'chat'>('search');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserQuizResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [selectedChat, setSelectedChat] = useState<UniversityChat | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: number, sender: 'user' | 'university', message: string, timestamp: string}[]>([]);
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  
  // Seminar and transaction data (would come from API in real implementation)
  const [seminars] = useState<SeminarTicket[]>([
    {
      id: 1,
      title: 'Hướng dẫn chọn ngành nghề phù hợp',
      description: 'Seminar giúp phụ huynh hiểu cách định hướng nghề nghiệp cho con',
      date: '2024-12-20',
      time: '14:00',
      location: 'Hội trường A - Đại học Bách Khoa',
      price: 150000,
      speaker: 'TS. Nguyễn Văn A',
      category: 'Định hướng nghề nghiệp'
    },
    {
      id: 2,
      title: 'Tâm lý học phát triển con em',
      description: 'Hiểu về tâm lý và cách nuôi dạy con hiệu quả',
      date: '2024-12-25',
      time: '09:00',
      location: 'Trung tâm Hội nghị Quốc gia',
      price: 200000,
      speaker: 'ThS. Trần Thị B',
      category: 'Tâm lý học'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      type: 'seminar',
      title: 'Seminar Định hướng nghề nghiệp',
      amount: 150000,
      date: '2024-12-15',
      status: 'completed',
      description: 'Vé tham gia seminar hướng dẫn chọn ngành nghề'
    },
    {
      id: 2,
      type: 'premium',
      title: 'Gói Premium 1 tháng',
      amount: 99000,
      date: '2024-12-10',
      status: 'completed',
      description: 'Nâng cấp tài khoản Premium'
    }
  ]);

  // Helper functions
  const checkAuthentication = () => {
    const token = localStorage.getItem('accessToken');
    console.log('Authentication check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'No token'
    });
    return token && token.length > 0;
  };

  const handleAuthError = () => {
    setError('⚠️ Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tiếp tục sử dụng.');
  };

  const retryAfterLogin = () => {
    navigate('/login');
  };

  const searchChildResults = async () => {
    if (!searchEmail.trim()) {
      setError('Vui lòng nhập email của con em');
      return;
    }

    // Check authentication before making the request
    if (!checkAuthentication()) {
      handleAuthError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await quizService.getUserResultsByEmail(searchEmail);
      setSearchResults(results || {
        userId: '',
        email: searchEmail,
        fullName: '',
        results: []
      });

      // Only show "no results" error if results array is actually empty
      if (!results || !results.results || results.results.length === 0) {
        setError('Không tìm thấy kết quả trắc nghiệm cho email này');
      }

      // Log the actual results for debugging
      console.log('Search results:', results);
    } catch (err) {
      console.error('Search error:', err);
      
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('unauthenticated') || errorMessage.includes('401')) {
          setError('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục tìm kiếm.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          setError('🚫 Bạn không có quyền truy cập thông tin này. Vui lòng kiểm tra lại quyền tài khoản Parent.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          setError('🔍 Không tìm thấy kết quả trắc nghiệm cho email này. Vui lòng kiểm tra lại email.');
        } else if (errorMessage.includes('500') || errorMessage.includes('internal server error')) {
          setError('⚙️ Hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau vài phút hoặc liên hệ bộ phận hỗ trợ.');
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('🌐 Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          setError('❌ Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
        }
      } else {
        setError('Có lỗi không xác định xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // PDF Download functions
  const downloadQuizResult = async (result: QuizResult) => {
    if (!searchResults) return;

    setDownloadLoading(result.id);
    try {
      await pdfService.downloadQuizResultPDF(searchResults, result);
      // You could show a success message here if needed
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Không thể tải file PDF. Vui lòng thử lại.');
    } finally {
      setDownloadLoading(null);
    }
  };

  const downloadAllQuizResults = async () => {
    if (!searchResults) return;

    setDownloadAllLoading(true);
    try {
      await pdfService.downloadAllQuizResultsPDF(searchResults);
      // You could show a success message here if needed
    } catch (error) {
      console.error('Error downloading all results PDF:', error);
      setError('Không thể tải file PDF. Vui lòng thử lại.');
    } finally {
      setDownloadAllLoading(false);
    }
  };

  const openChatModal = (chat: UniversityChat) => {
    setSelectedChat(chat);
    // Initialize with some sample messages for the selected university
    setChatMessages([
      {
        id: 1,
        sender: 'university',
        message: `Xin chào! Cảm ơn bạn đã liên hệ với ${chat.universityName}. Chúng tôi có thể hỗ trợ gì cho bạn?`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const closeChatModal = () => {
    setSelectedChat(null);
    setChatMessages([]);
    setChatMessage('');
  };

  const sendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return;

    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user' as const,
      message: chatMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simulate university response after 2 seconds
    setTimeout(() => {
      const response = {
        id: chatMessages.length + 2,
        sender: 'university' as const,
        message: 'Cảm ơn bạn đã gửi tin nhắn. Chúng tôi sẽ phản hồi sớm nhất có thể.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, response]);
    }, 2000);
  };

  return (
    <div className="parent-dashboard">
      <div className="parent-dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <FaUsers className="header-icon" />
                Bảng Điều Khiển Phụ Huynh
              </h1>
              <p>Theo dõi tiến trình học tập và phát triển của con em</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <FaSearch />
              <span>Tìm Kiếm Kết Quả</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'seminars' ? 'active' : ''}`}
              onClick={() => setActiveTab('seminars')}
            >
              <FaTicketAlt />
              <span>Seminar</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="dashboard-content">
          {activeTab === 'search' && (
            <div className="tab-content">
              <div className="search-section">
                <div className="search-header">
                  <h2>
                    <FaSearch className="section-icon search-section-icon" />
                    Tìm Kiếm Kết Quả Trắc Nghiệm
                  </h2>
                  <p>Nhập email của con em để xem kết quả các bài trắc nghiệm</p>
                </div>

                <div className="search-form">
                  <div className="search-input-group">
                    <input
                      type="email"
                      placeholder="Nhập email của con em..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchChildResults()}
                    />
                    <button 
                      className="search-button"
                      onClick={searchChildResults}
                      disabled={loading}
                    >
                      {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
                      {loading ? 'Đang tìm...' : 'Tìm Kiếm'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <div className="error-content">
                      <FaTimesCircle />
                      <span>{error}</span>
                    </div>
                    <div className="error-actions">
                      {error.includes('đăng nhập') && (
                        <button 
                          className="retry-button login-button"
                          onClick={retryAfterLogin}
                        >
                          <FaSignInAlt />
                          Đăng nhập lại
                        </button>
                      )}
                      <button 
                        className="retry-button"
                        onClick={searchChildResults}
                        disabled={loading}
                      >
                        <FaSync />
                        Thử lại
                      </button>
                    </div>
                  </div>
                )}

                {searchResults && searchResults.results && (
                  <div className="search-results">
                    <div className="results-header">
                      <div className="student-info">
                        <FaUserGraduate className="student-icon" />
                        <div>
                          <h3>{searchResults.fullName || searchResults.email}</h3>
                          <p>{searchResults.email}</p>
                        </div>
                      </div>
                      <div className="results-count">
                        <span>{searchResults.results.length} bài test</span>
                      </div>
                      <div className="results-actions">
                        <button 
                          className="action-button download-all"
                          onClick={downloadAllQuizResults}
                          disabled={downloadAllLoading}
                        >
                          {downloadAllLoading ? (
                            <>
                              <FaSpinner className="spinner" />
                              Đang tải...
                            </>
                          ) : (
                            <>
                              <FaDownload />
                              Tải Tất Cả
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="results-grid">
                      {searchResults.results.map((result) => (
                        <div
                          key={result.id}
                          className="result-card"
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="result-header">
                            <div className="result-type">
                              {result.quizType === 'MBTI' ? <FaBrain /> : <FaUsers />}
                              <span>{result.quizType}</span>
                            </div>
                            <div className="result-date">
                              {formatDate(result.submittedAt)}
                            </div>
                          </div>
                          <div className="result-personality">
                            <div className="personality-code">
                              {result.personalityCode}
                            </div>
                            {result.nickname && (
                              <div className="personality-nickname">
                                "{result.nickname}"
                              </div>
                            )}
                          </div>
                          <div className="result-description">
                            <p>{result.description?.substring(0, 100)}...</p>
                          </div>
                          <div className="result-actions">
                            <button 
                              className="action-button view"
                              onClick={() => setSelectedResult(result)}
                            >
                              <FaEye />
                              Xem Chi Tiết
                            </button>
                            <button 
                              className="action-button download"
                              onClick={() => downloadQuizResult(result)}
                              disabled={downloadLoading === result.id}
                            >
                              {downloadLoading === result.id ? (
                                <>
                                  <FaSpinner className="spinner" />
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  <FaDownload />
                                  Tải Về
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'seminars' && (
            <div className="tab-content">
              <div className="seminars-section">
                <div className="section-header">
                  <h2>
                    <FaTicketAlt className="section-icon seminar-section-icon" />
                    Seminar Dành Cho Phụ Huynh
                  </h2>
                  <p>Các buổi seminar giúp bạn hiểu rõ hơn về con em</p>
                </div>

                <div className="seminars-grid">
                  {seminars.map((seminar) => (
                    <div
                      key={seminar.id}
                      className="seminar-card"
                    >
                      <div className="seminar-header">
                        <div className="seminar-category">
                          {seminar.category}
                        </div>
                        <div className="seminar-price">
                          {formatCurrency(seminar.price)}
                        </div>
                      </div>
                      <div className="seminar-content">
                        <h3>{seminar.title}</h3>
                        <p>{seminar.description}</p>
                        <div className="seminar-details">
                          <div className="detail-item">
                            <FaCalendarAlt />
                            <span>{new Date(seminar.date).toLocaleDateString('vi-VN')} - {seminar.time}</span>
                          </div>
                          <div className="detail-item">
                            <FaUniversity />
                            <span>{seminar.location}</span>
                          </div>
                          <div className="detail-item">
                            <FaUserGraduate />
                            <span>{seminar.speaker}</span>
                          </div>
                        </div>
                      </div>
                      <div className="seminar-actions">
                        <button className="buy-button">
                          <FaShoppingCart />
                          Mua Vé
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="tab-content">
              <div className="transactions-section">
                <div className="section-header">
                  <h2>
                    <FaHistory className="section-icon transaction-section-icon" />
                    Lịch Sử Giao Dịch
                  </h2>
                  <p>Theo dõi tất cả các giao dịch và thanh toán</p>
                </div>

                <div className="transactions-list">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="transaction-item"
                    >
                      <div className="transaction-icon">
                        {transaction.type === 'seminar' ? <FaTicketAlt /> : <FaCreditCard />}
                      </div>
                      <div className="transaction-content">
                        <div className="transaction-header">
                          <h3>{transaction.title}</h3>
                          <span className="transaction-amount">
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <p className="transaction-description">{transaction.description}</p>
                        <div className="transaction-footer">
                          <span className="transaction-date">
                            {formatDate(transaction.date)}
                          </span>
                          <span className={`transaction-status ${transaction.status}`}>
                            {transaction.status === 'completed' && <FaCheckCircle />}
                            {transaction.status === 'pending' && <FaSpinner />}
                            {transaction.status === 'failed' && <FaTimesCircle />}
                            {(() => {
                              switch (transaction.status) {
                                case 'completed':
                                  return 'Thành công';
                                case 'pending':
                                  return 'Đang xử lý';
                                default:
                                  return 'Thất bại';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        
      </div>

      {/* Enhanced Result Detail Modal */}
      
        {selectedResult && (
          <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <div className="modal-title-icon">
                    {selectedResult.quizType === 'MBTI' ? <FaBrain /> : <FaUsers />}
                  </div>
                  Chi Tiết Kết Quả {selectedResult.quizType}
                </div>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedResult(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {/* Personality Display */}
                <div className="modal-personality-display">
                  <div className="modal-personality-code">
                    {selectedResult.personalityCode}
                  </div>
                  {selectedResult.nickname && (
                    <div className="modal-personality-nickname">
                      "{selectedResult.nickname}"
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div className="modal-section">
                  <div className="modal-section-title">
                    <FaUser />
                    Mô tả tính cách
                  </div>
                  <div className="modal-section-content">
                    {selectedResult.description}
                  </div>
                </div>

                {/* Key Traits */}
                {selectedResult.keyTraits && (
                  <div className="modal-section">
                    <div className="modal-section-title">
                      <FaChartLine />
                      Đặc điểm chính
                    </div>
                    <div className="modal-section-content">
                      <div className="key-traits-list">
                        {selectedResult.keyTraits.split(',').map((trait, index) => (
                          <div key={index} className="trait-item">
                            {trait.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scores Display for DISC */}
                {selectedResult.scores && (
                  <div className="modal-section">
                    <div className="modal-section-title">
                      <FaChartLine />
                      Điểm số chi tiết
                    </div>
                    <div className="modal-section-content">
                      <div className="scores-grid">
                        {Object.entries(selectedResult.scores).map(([key, value]) => (
                          <div key={key} className="score-item">
                            <div className="score-letter">{key}</div>
                            <div className="score-value">{value}%</div>
                            <div className="score-bar">
                              <div 
                                className="score-fill"
                                style={{ width: `${value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Career Recommendations */}
                {selectedResult.careerRecommendations && (
                  <div className="modal-section">
                    <div className="modal-section-title">
                      <FaUserGraduate />
                      Nghề nghiệp phù hợp
                    </div>
                    <div className="modal-section-content">
                      {selectedResult.careerRecommendations}
                    </div>
                  </div>
                )}

                {/* University Recommendations */}
                {selectedResult.universityRecommendations && (
                  <div className="modal-section">
                    <div className="modal-section-title">
                      <FaUniversity />
                      Trường đại học phù hợp
                    </div>
                    <div className="modal-section-content">
                      {selectedResult.universityRecommendations}
                    </div>
                  </div>
                )}

                {/* Test Date */}
                <div className="modal-section">
                  <div className="modal-section-title">
                    <FaCalendarAlt />
                    Thông tin bài test
                  </div>
                  <div className="modal-section-content">
                    <p><strong>Ngày thực hiện:</strong> {formatDate(selectedResult.submittedAt)}</p>
                    <p><strong>Loại test:</strong> {selectedResult.quizType}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      
      {/* Chat Modal */}
      
        {selectedChat && (
          <div className="modal-overlay chat-modal-overlay" onClick={closeChatModal}>
            <div className="modal-content chat-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header chat-modal-header">
                <div className="chat-modal-title">
                  <div className="chat-modal-avatar">
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h2>{selectedChat.universityName}</h2>
                    <span className="chat-status">Đang hoạt động</span>
                  </div>
                </div>
                <button 
                  className="modal-close"
                  onClick={closeChatModal}
                >
                  ×
                </button>
              </div>
              
              <div className="chat-modal-body">
                <div className="chat-messages">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`chat-message-item ${msg.sender}`}>
                      <div className="chat-message-content">
                        <p>{msg.message}</p>
                        <span className="chat-message-time">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="chat-modal-footer">
                <div className="chat-input-group">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="chat-input"
                  />
                  <button 
                    className="chat-send-button"
                    onClick={sendMessage}
                    disabled={!chatMessage.trim()}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};

export default ParentDashBoard;

