import React, { useEffect, useState } from 'react';
import quizService, { QuizResult } from '../services/quizService';
import { FaEye, FaFilePdf, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MyResult.css';

const MyResult: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    email: string;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching quiz results...');
        const data = await quizService.getMyQuizResults();
        console.log('API Response:', data);

        // The service returns an object with userId, email, fullName, and results
        if (data) {
          setUserInfo({
            userId: data.userId,
            email: data.email,
            fullName: data.fullName
          });

          // Check if results array exists and is valid
          if (Array.isArray(data.results)) {
            setResults(data.results);
            console.log(`Successfully loaded ${data.results.length} quiz results`);
          } else {
            console.warn('No results array found in response:', data);
            setResults([]);
          }
        } else {
          console.warn('No data received from API');
          setResults([]);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);

        // More specific error handling
        if (error instanceof Error) {
          if (error.message.includes('Unauthenticated') || error.message.includes('401')) {
            setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (error.message.includes('403')) {
            setError('Bạn không có quyền truy cập trang này.');
          } else if (error.message.includes('500')) {
            setError('Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
          } else {
            setError('Không thể tải kết quả. Vui lòng thử lại sau.');
          }
        } else {
          setError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
        }

        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleViewDetail = async (id: number) => {
    if (!id) {
      setError('ID kết quả không hợp lệ.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching details for result ID: ${id}`);
      const detail = await quizService.getQuizResultById(id);
      console.log('Result details:', detail);

      setSelectedResult(detail);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch result details:', error);

      if (error instanceof Error) {
        if (error.message.includes('404')) {
          setError('Không tìm thấy kết quả chi tiết.');
        } else if (error.message.includes('401')) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          setError('Không thể tải chi tiết kết quả. Vui lòng thử lại.');
        }
      } else {
        setError('Đã xảy ra lỗi không xác định khi tải chi tiết.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const filteredResults = results.filter(r => {
    if (!search.trim()) return true;

    const searchLower = search.toLowerCase();
    return (
        r.personalityCode?.toLowerCase().includes(searchLower) ||
        r.quizType?.toLowerCase().includes(searchLower) ||
        r.nickname?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading && results.length === 0) {
    return (
        <div className="my-result-page">
          <div className="my-result-page__header">
            <h2>Kết quả trắc nghiệm của tôi</h2>
          </div>
          <LoadingSpinner />
        </div>
    );
  }

  if (error && results.length === 0) {
    return (
        <div className="my-result-page">
          <div className="my-result-page__header">
            <h2>Kết quả trắc nghiệm của tôi</h2>
          </div>
          <div className="my-result-page__error">
            <p>{error}</p>
            <button
                onClick={handleRetry}
                className="my-result-page__retry-btn"
            >
              Thử lại
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="my-result-page">
        <div className="my-result-page__header">
          <h2>Kết quả trắc nghiệm của tôi</h2>
          {userInfo && (
              <div className="my-result-page__user-info">
                <p>Chào {userInfo.fullName} ({userInfo.email})</p>
              </div>
          )}
          <div className="my-result-page__search">
            <FaSearch />
            <input
                type="text"
                placeholder="Tìm theo mã, loại, biệt danh, mô tả..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
            <div className="my-result-page__error-banner">
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
        )}

        <div className="my-result-page__list">
          {filteredResults.length === 0 ? (
              <div className="my-result-page__empty">
                {search ?
                    `Không tìm thấy kết quả nào phù hợp với "${search}".` :
                    'Bạn chưa có kết quả trắc nghiệm nào.'
                }
              </div>
          ) : (
              filteredResults.map(result => (
                  <div className="my-result-card" key={result.id}>
                    <div className="my-result-card__info">
                      <div className="my-result-card__code">
                        {result.personalityCode || 'N/A'}
                      </div>
                      <div className="my-result-card__type">
                        {result.quizType || 'N/A'}
                      </div>
                      <div className="my-result-card__nickname">
                        {result.nickname || 'Chưa có biệt danh'}
                      </div>
                      <div className="my-result-card__date">
                        {result.submittedAt ? formatDate(result.submittedAt) : 'N/A'}
                      </div>
                      {result.description && (
                          <div className="my-result-card__description">
                            {result.description.length > 100
                                ? `${result.description.substring(0, 100)}...`
                                : result.description
                            }
                          </div>
                      )}
                    </div>
                    <div className="my-result-card__actions">
                      <button
                          className="my-result-card__btn"
                          onClick={() => handleViewDetail(result.id)}
                          disabled={loading}
                      >
                        <FaEye /> {loading ? 'Đang tải...' : 'Xem chi tiết'}
                      </button>
                      <a
                          className="my-result-card__btn"
                          href={`/api/quiz-results/${result.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                        <FaFilePdf /> Tải PDF
                      </a>
                    </div>
                  </div>
              ))
          )}
        </div>

        {/* Modal for detail */}
        {showModal && selectedResult && (
            <div className="my-result-modal" onClick={() => setShowModal(false)}>
              <div className="my-result-modal__content" onClick={e => e.stopPropagation()}>
                <button
                    className="my-result-modal__close"
                    onClick={() => setShowModal(false)}
                >
                  ×
                </button>
                <h3>Kết quả chi tiết</h3>

                <div className="my-result-modal__section">
                  <strong>Mã tính cách:</strong> {selectedResult.personalityCode || 'N/A'}
                </div>

                <div className="my-result-modal__section">
                  <strong>Biệt danh:</strong> {selectedResult.nickname || 'Chưa có biệt danh'}
                </div>

                <div className="my-result-modal__section">
                  <strong>Loại trắc nghiệm:</strong> {selectedResult.quizType || 'N/A'}
                </div>

                <div className="my-result-modal__section">
                  <strong>Ngày làm bài:</strong>{' '}
                  {selectedResult.submittedAt ? formatDate(selectedResult.submittedAt) : 'N/A'}
                </div>

                {selectedResult.keyTraits && (
                    <div className="my-result-modal__section">
                      <strong>Đặc điểm nổi bật:</strong>
                      <div className="my-result-modal__content-text">
                        {selectedResult.keyTraits}
                      </div>
                    </div>
                )}

                {selectedResult.description && (
                    <div className="my-result-modal__section">
                      <strong>Mô tả:</strong>
                      <div className="my-result-modal__content-text">
                        {selectedResult.description}
                      </div>
                    </div>
                )}

                {selectedResult.careerRecommendations && (
                    <div className="my-result-modal__section">
                      <strong>Khuyến nghị nghề nghiệp:</strong>
                      <div className="my-result-modal__content-text">
                        {selectedResult.careerRecommendations}
                      </div>
                    </div>
                )}

                {selectedResult.universityRecommendations && (
                    <div className="my-result-modal__section">
                      <strong>Khuyến nghị trường đại học:</strong>
                      <div className="my-result-modal__content-text">
                        {selectedResult.universityRecommendations}
                      </div>
                    </div>
                )}

                {selectedResult.scores && Object.keys(selectedResult.scores).length > 0 && (
                    <div className="my-result-modal__section">
                      <strong>Điểm số:</strong>
                      <div className="my-result-modal__scores">
                        {Object.entries(selectedResult.scores).map(([key, value]) => (
                            <div key={key} className="my-result-modal__score-item">
                              <span className="score-label">{key}:</span>
                              <span className="score-value">{value}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default MyResult;