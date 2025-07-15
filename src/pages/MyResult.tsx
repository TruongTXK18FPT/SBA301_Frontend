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

useEffect(() => {
  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await quizService.getMyQuizResults();
      setResults(data.results); // <-- Use .results, not the whole object
    } catch {
      setResults([]);
    }
    setLoading(false);
  };
  fetchResults();
}, []);

  const handleViewDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await quizService.getQuizResultById(id);
      setSelectedResult(detail);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(
    r =>
      r.personalityCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.quizType?.toLowerCase().includes(search.toLowerCase()) ||
      r.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="my-result-page">
      <div className="my-result-page__header">
        <h2>Kết quả trắc nghiệm của tôi</h2>
        <div className="my-result-page__search">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm theo mã, loại, biệt danh..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="my-result-page__list">
          {filteredResults.length === 0 ? (
            <div className="my-result-page__empty">Không có kết quả nào.</div>
          ) : (
            filteredResults.map(result => (
              <div className="my-result-card" key={result.id}>
                <div className="my-result-card__info">
                  <div className="my-result-card__code">{result.personalityCode}</div>
                  <div className="my-result-card__type">{result.quizType}</div>
                  <div className="my-result-card__nickname">{result.nickname}</div>
                  <div className="my-result-card__date">
                    {new Date(result.submittedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="my-result-card__actions">
                  <button
                    className="my-result-card__btn"
                    onClick={() => handleViewDetail(result.id)}
                  >
                    <FaEye /> Xem chi tiết
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
      )}

      {/* Modal for detail */}
      {showModal && selectedResult && (
        <div className="my-result-modal">
          <div className="my-result-modal__content">
            <button className="my-result-modal__close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3>Kết quả chi tiết</h3>
            <div className="my-result-modal__section">
              <strong>Mã tính cách:</strong> {selectedResult.personalityCode}
            </div>
            <div className="my-result-modal__section">
              <strong>Biệt danh:</strong> {selectedResult.nickname}
            </div>
            <div className="my-result-modal__section">
              <strong>Loại trắc nghiệm:</strong> {selectedResult.quizType}
            </div>
            <div className="my-result-modal__section">
              <strong>Ngày làm bài:</strong>{' '}
              {new Date(selectedResult.submittedAt).toLocaleString('vi-VN')}
            </div>
            <div className="my-result-modal__section">
              <strong>Đặc điểm nổi bật:</strong>
              <div>{selectedResult.keyTraits}</div>
            </div>
            <div className="my-result-modal__section">
              <strong>Mô tả:</strong>
              <div>{selectedResult.description}</div>
            </div>
            {selectedResult.careerRecommendations && (
              <div className="my-result-modal__section">
                <strong>Khuyến nghị nghề nghiệp:</strong>
                <div>{selectedResult.careerRecommendations}</div>
              </div>
            )}
            {selectedResult.universityRecommendations && (
              <div className="my-result-modal__section">
                <strong>Khuyến nghị trường đại học:</strong>
                <div>{selectedResult.universityRecommendations}</div>
              </div>
            )}
            {selectedResult.scores && (
              <div className="my-result-modal__section">
                <strong>Điểm số:</strong>
                <ul>
                  {Object.entries(selectedResult.scores).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResult;