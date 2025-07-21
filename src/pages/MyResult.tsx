import React, { useEffect, useState } from 'react';
import { FaSearch, FaEye, FaDownload, FaSpinner, FaTimesCircle, FaSync, FaUser, FaBrain, FaUsers, FaChartLine, FaUserGraduate, FaUniversity, FaCalendarAlt } from 'react-icons/fa';
import quizService from '../services/quizService';
import pdfService from '../services/pdfService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MyResult.css'; // Sử dụng lại file CSS riêng

// Định nghĩa interface
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

const MyResult: React.FC = () => {
  const [userResultsData, setUserResultsData] = useState<UserQuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [search, setSearch] = useState('');
  const [downloadLoading, setDownloadLoading] = useState<number | null>(null);
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  

  useEffect(() => {
    const fetchMyResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await quizService.getMyQuizResults();
        if (data && Array.isArray(data.results)) {
          setUserResultsData(data);
        } else {
          setUserResultsData(data || null);
        }
      } catch (err) {
        if (err instanceof Error) {
          const errorMessage = err.message.toLowerCase();
          if (errorMessage.includes('unauthenticated') || errorMessage.includes('401')) {
            setError('⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else {
            setError('❌ Không thể tải kết quả. Vui lòng thử lại sau.');
          }
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyResults();
  }, []);

  const handleRetry = () => window.location.reload();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredResults = userResultsData?.results.filter(r => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
        r.personalityCode?.toLowerCase().includes(searchLower) ||
        r.quizType?.toLowerCase().includes(searchLower) ||
        r.nickname?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
    );
  }) || [];
  
  
  const downloadQuizResult = async (result: QuizResult) => {
    if (!userResultsData) return;
    setDownloadLoading(result.id);
     const careerText = Array.isArray(result.careerRecommendations)
    ? result.careerRecommendations.join('\n\n')
    : result.careerRecommendations || '';

  const universityText = Array.isArray(result.universityRecommendations)
    ? result.universityRecommendations.join('\n\n')
    : result.universityRecommendations || '';
    try {
    await pdfService.downloadQuizResultPDF(userResultsData, {
      ...result,
      careerRecommendations: careerText,
      universityRecommendations: universityText,
    });
    } catch (error) {
      setError('Không thể tải file PDF. Vui lòng thử lại.');
    } finally {
      setDownloadLoading(null);
    }
  };

  const downloadAllQuizResults = async () => {
    if (!userResultsData) return;
    setDownloadAllLoading(true);
    try {
      await pdfService.downloadAllQuizResultsPDF(userResultsData);
    } catch (error) {
      setError('Không thể tải file PDF. Vui lòng thử lại.');
    } finally {
      setDownloadAllLoading(false);
    }
  };

  const renderLoading = () => (
      <div className="my-result-page">
        <div className="my-result-container">
          <LoadingSpinner />
        </div>
      </div>
  );

  const renderError = () => (
      <div className="my-result-page">
        <div className="my-result-container">
          <div className="my-result-error-message">
            <div className="my-result-error-icon"><FaTimesCircle /></div>
            <h3 className="my-result-error-title">Đã có lỗi xảy ra</h3>
            <p>{error}</p>
            <button className="my-result-retry-btn" onClick={handleRetry}>
              <FaSync /> Thử lại
            </button>
          </div>
        </div>
      </div>
  );

  if (loading) return renderLoading();
  if (error && !userResultsData) return renderError();

  return (
      <div className="my-result-page">
        <div className="my-result-container">
          <header className="my-result-header">
            <h1>
              <FaUser />
              Kết Quả Của Tôi
            </h1>
            <p>Xem lại tất cả các bài trắc nghiệm bạn đã hoàn thành</p>
          </header>

          <main className="my-result-content">
            {userResultsData && (
                <header className="my-result-user-header">
                  <div className="my-result-user-info">
                    <FaUserGraduate className="icon" />
                    <div>
                      <h3>{userResultsData.fullName || userResultsData.email}</h3>
                      <p>{userResultsData.email}</p>
                    </div>
                  </div>
                  <div className="my-result-actions-header">
                    <div className="my-result-count">
                      <span>{userResultsData.results.length} bài test</span>
                    </div>
                    {userResultsData.results.length > 0 && (
                        <button
                            className="my-result-download-all-btn"
                            onClick={downloadAllQuizResults}
                            disabled={downloadAllLoading}
                        >
                          {downloadAllLoading ? <FaSpinner className="spinner" /> : <FaDownload />}
                          <span>{downloadAllLoading ? 'Đang tải...' : 'Tải Tất Cả'}</span>
                        </button>
                    )}
                  </div>
                </header>
            )}

            <div className="my-result-search-form">
              <div className="my-result-search-group">
                <input
                    type="text"
                    placeholder="Tìm theo mã, loại, biệt danh, mô tả..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button className="my-result-search-btn">
                  <FaSearch />
                  <span>Tìm</span>
                </button>
              </div>
            </div>

            {filteredResults.length > 0 ? (
                <div className="my-result-grid">
                  {filteredResults.map((result) => (
                      <article
                          key={result.id}
                          className="my-result-card"
                          onClick={() => setSelectedResult(result)}
                      >
                        <header className="my-result-card-header">
                          <div className="my-result-card-type">
                            {result.quizType === 'MBTI' ? <FaBrain /> : <FaUsers />}
                            <span>{result.quizType}</span>
                          </div>
                          <div className="my-result-card-date">
                            {formatDate(result.submittedAt)}
                          </div>
                        </header>
                        <section className="my-result-card-personality">
                          <div className="my-result-card-code">{result.personalityCode}</div>
                          {result.nickname && (
                              <div className="my-result-card-nickname">"{result.nickname}"</div>
                          )}
                        </section>
                        <p className="my-result-card-description">{result.description}</p>
                        <footer className="my-result-card-actions">
                          <button
                              className="my-result-card-btn view"
                              onClick={(e) => { e.stopPropagation(); setSelectedResult(result); }}
                          >
                            <FaEye /> Xem Chi Tiết
                          </button>
                          <button
                              className="my-result-card-btn download"
                              onClick={(e) => { e.stopPropagation(); downloadQuizResult(result); }}
                              disabled={downloadLoading === result.id}
                          >
                            {downloadLoading === result.id ? <FaSpinner className="spinner" /> : <FaDownload />}
                            <span>{downloadLoading === result.id ? 'Đang tải' : 'Tải Về'}</span>
                          </button>
                        </footer>
                      </article>
                  ))}
                </div>
            ) : (
                <div className="my-result-empty-state">
                  <div className="my-result-empty-state-icon"><FaSearch /></div>
                  <h3 className="my-result-empty-state-title">
                    {search ? 'Không tìm thấy kết quả' : 'Chưa có kết quả'}
                  </h3>
                  <p>
                    {search ? `Không có kết quả nào khớp với "${search}".` : 'Bạn chưa hoàn thành bài trắc nghiệm nào.'}
                  </p>
                </div>
            )}
          </main>

          {selectedResult && (
              <div className="my-result-modal-overlay" onClick={() => setSelectedResult(null)}>
                <div className="my-result-modal-content" onClick={(e) => e.stopPropagation()}>
                  <header className="my-result-modal-header">
                    <h2 className="my-result-modal-title">
                      <div className="icon">
                        {selectedResult.quizType === 'MBTI' ? <FaBrain /> : <FaUsers />}
                      </div>
                      Chi Tiết Kết Quả {selectedResult.quizType}
                    </h2>
                    <button className="my-result-modal-close" onClick={() => setSelectedResult(null)}>×</button>
                  </header>
                  <div className="my-result-modal-body">
                    <section className="my-result-modal-personality-display">
                      <div className="my-result-modal-personality-code">{selectedResult.personalityCode}</div>
                      {selectedResult.nickname && (
                          <div className="my-result-modal-personality-nickname">"{selectedResult.nickname}"</div>
                      )}
                    </section>

                    <section className="my-result-modal-section">
                      <h3 className="my-result-modal-section-title"><FaUser />Mô tả tính cách</h3>
                      <div className="my-result-modal-section-content">{selectedResult.description}</div>
                    </section>

                    {selectedResult.keyTraits && (
                        <section className="my-result-modal-section">
                          <h3 className="my-result-modal-section-title"><FaChartLine />Đặc điểm chính</h3>
                          <div className="my-result-modal-section-content">{selectedResult.keyTraits}</div>
                        </section>
                    )}

                    {selectedResult.scores && Object.keys(selectedResult.scores).length > 0 && (
                        <section className="my-result-modal-section">
                          <h3 className="my-result-modal-section-title"><FaChartLine />Điểm số chi tiết</h3>
                          <div className="my-result-modal-section-content">{JSON.stringify(selectedResult.scores)}</div>
                        </section>
                    )}

                    {selectedResult.careerRecommendations && (
                        <section className="my-result-modal-section">
                          <h3 className="my-result-modal-section-title"><FaUserGraduate />Nghề nghiệp phù hợp</h3>
                          <div className="my-result-modal-section-content">{selectedResult.careerRecommendations}</div>
                        </section>
                    )}

                    {selectedResult.universityRecommendations && (
                        <section className="my-result-modal-section">
                          <h3 className="my-result-modal-section-title"><FaUniversity />Trường đại học phù hợp</h3>
                          <div className="my-result-modal-section-content">{selectedResult.universityRecommendations}</div>
                        </section>
                    )}

                    <section className="my-result-modal-section">
                      <h3 className="my-result-modal-section-title"><FaCalendarAlt />Thông tin bài test</h3>
                      <div className="my-result-modal-section-content">
                        <p><strong>Ngày thực hiện:</strong> {formatDate(selectedResult.submittedAt)}</p>
                        <p><strong>Loại test:</strong> {selectedResult.quizType}</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default MyResult;
