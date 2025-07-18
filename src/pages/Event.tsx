import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaEye, FaTicketAlt, FaSearch, FaFilter } from 'react-icons/fa';
import { getEvents } from '../services/eventService';
import { EventStatus, EventOverviewResponse, PageEventOverviewResponse } from '../components/event/dto/event.dto';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Event.css';

const Event: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadEvents = async (page: number = 0) => {
    try {
      setLoading(true);
      const response: PageEventOverviewResponse = await getEvents({
        name: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        size: 12,
        sortBy: 'startTime',
        sortDirection: 'asc'
      });
      
      setEvents(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
    } catch (err: any) {
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(0);
  }, [searchTerm, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(0);
  };

  const handleBookNow = (event: EventOverviewResponse) => {
    console.log("slug event", event);
    // Navigate to booking page (you can implement this later)
    // navigate(`/events/${eventSlug}/book`);
  };

  const handleViewDetails = (eventSlug: string) => {
    navigate(`/events/${eventSlug}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      'DRAFT': { label: 'Bản nháp', class: 'draft' },
      'PENDING': { label: 'Chờ duyệt', class: 'pending' },
      'UPCOMING': { label: 'Sắp diễn ra', class: 'approved' },
      'ONGOING': { label: 'Đang diễn ra', class: 'ongoing' },
      'COMPLETED': { label: 'Đã hoàn thành', class: 'completed' },
      'REJECTED': { label: 'Bị từ chối', class: 'rejected' },
      'CANCELLED': { label: 'Đã hủy', class: 'cancelled' }
    };

    const config = statusConfig[status] || { label: status, class: 'default' };
    return <span className={`event-page__status-badge event-page__status-badge--${config.class}`}>{config.label}</span>;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadEvents(newPage);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="event-page">
        <div className="event-page__container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="event-page">
      <div className="event-page__container">
        {/* Header Section */}
        <div className="event-page__header">
          <div className="event-page__header-content">
            <h1 className="event-page__title">
              <FaCalendarAlt className="event-page__title-icon" />
              Sự Kiện Đặc Biệt
            </h1>
            <p className="event-page__subtitle">
              Khám phá những sự kiện thú vị và tham gia cùng cộng đồng
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="event-page__controls">
          <form onSubmit={handleSearch} className="event-page__search-form">
            <div className="event-page__search-filter-row">
              <div className="event-page__search-input-group">
                <FaSearch className="event-page__search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="event-page__search-input"
                />
              </div>
              <div className="event-page__filter-group">
                <FaFilter className="event-page__filter-icon" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
                  className="event-page__filter-select"
                >
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="ONGOING">Đang diễn ra</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results Info */}
        <div className="event-page__results-info">
          <p>Hiển thị {events.length} trong tổng số {totalElements} sự kiện</p>
        </div>

        {/* Events Grid */}
        {error ? (
          <div className="event-page__error-message">
            <p>{error}</p>
            <button onClick={() => loadEvents(currentPage)} className="event-page__retry-button">
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <div className="event-page__events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-page__event-card">
                  <div className="event-page__event-image">
                    {event.bannerUrl ? (
                      <img src={event.bannerUrl} alt={event.name} />
                    ) : (
                      <div className="event-page__placeholder-image">
                        <FaCalendarAlt />
                      </div>
                    )}
                    <div className="event-page__status-overlay">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>

                  <div className="event-page__event-content">
                    <h3 className="event-page__event-title">{event.name}</h3>
                    
                    {/* Show price if available */}
                    {event.price && (
                      <div className="event-page__event-price">
                        <span className="event-page__price-label">Giá vé:</span>
                        <span className="event-page__price-value">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(event.price)}
                        </span>
                      </div>
                    )}

                    <div className="event-page__event-meta">
                      <div className="event-page__meta-item">
                        <FaCalendarAlt className="event-page__meta-icon" />
                        <span>{formatDate(event.startTime)}</span>
                      </div>
                      {event.startTime && (
                        <div className="event-page__meta-item">
                          <FaClock className="event-page__meta-icon" />
                          <span>{formatTime(event.startTime)}</span>
                        </div>
                      )}
                    </div>

                    <div className="event-page__event-actions">
                      <button
                        onClick={() => handleViewDetails(event.slug)}
                        className="event-page__btn event-page__btn--outline"
                      >
                        <FaEye />
                        Xem Chi Tiết
                      </button>
                      <button
                        onClick={() => handleBookNow(event)}
                        className="event-page__btn event-page__btn--primary"
                        disabled={event.status !== 'UPCOMING' && event.status !== 'ONGOING'}
                      >
                        <FaTicketAlt />
                        Book Ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {events.length === 0 && !loading && (
              <div className="event-page__no-events">
                <FaCalendarAlt className="event-page__no-events-icon" />
                <h3>Không có sự kiện nào</h3>
                <p>Hiện tại chưa có sự kiện nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="event-page__pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="event-page__pagination-btn"
                >
                  ‹ Trước
                </button>
                
                <div className="event-page__pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`event-page__pagination-number ${currentPage === i ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="event-page__pagination-btn"
                >
                  Sau ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Event;
