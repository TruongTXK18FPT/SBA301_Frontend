import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EventStatus, EventOverviewResponse } from '../components/event/dto/event.dto';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/EventManagerDashboard.css';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/atom/atom';

const EventManagerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventOverviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [statusFilter, setStatusFilter] = useState<string>(''); // Default: all
  const [sortBy, setSortBy] = useState<'name' | 'startTime' | 'status'>('startTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    fetchEvents();
    // eslint-disable-next-line
  }, [user, currentPage, debouncedSearchTerm, statusFilter, sortBy, sortOrder]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage - 1,
        size: 12,
        name: debouncedSearchTerm || undefined,
        sortBy,
        sortDirection: sortOrder,
        organizerId: user?.id || undefined,
      };
      // Chỉ truyền status nếu có filter
      if (statusFilter) params.status = statusFilter as EventStatus;

      const response = await eventService.getEvents(params);
      setEvents(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại.');
      setEvents([]);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;
    try {
      await eventService.deleteEvent(eventId);
      setAlert({ type: 'success', message: 'Đã xóa sự kiện thành công!' });
      fetchEvents();
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Không thể xóa sự kiện. Vui lòng thử lại.' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { text: 'Chờ duyệt', class: 'pending' },
      'UPCOMING': { text: 'Sắp diễn ra', class: 'approved' },
      'ONGOING': { text: 'Đang diễn ra', class: 'ongoing' },
      'COMPLETED': { text: 'Đã hoàn thành', class: 'completed' },
      'REJECTED': { text: 'Từ chối', class: 'rejected' },
      'CANCELLED': { text: 'Đã hủy', class: 'cancelled' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'draft' };
    return (
      <span className={`event-manager-dashboard__status-badge event-manager-dashboard__status-badge--${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = dayNames[date.getDay()];
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${time}, ${dayName}, ${day} tháng ${month.toString().padStart(2, '0')} ${year}`;
  };

  if (!user) return <LoadingSpinner message="Đang tải dữ liệu tài khoản..." />;
  if (loading) return <LoadingSpinner />;

  return (
    <div className="event-manager-dashboard">
      <div className="event-manager-dashboard__container">
        {/* Header */}
        <div className="event-manager-dashboard__header">
          <div className="event-manager-dashboard__header-content">
            <h1 className="event-manager-dashboard__title">
              <span className="event-manager-dashboard__title-icon">🎉</span>
              Bảng Điều Khiển Quản Lý Sự Kiện
            </h1>
            <p className="event-manager-dashboard__subtitle">
              Quản lý và theo dõi tất cả các sự kiện của bạn một cách dễ dàng
            </p>
          </div>
          <button
            className="event-manager-dashboard__create-btn"
            onClick={() => navigate('/event-manager/create')}
          >
            <span>➕</span>
            Tạo sự kiện mới
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Error */}
        {error && (
          <div className="event-manager-dashboard__error-message">
            <p>{error}</p>
            <button
              onClick={fetchEvents}
              className="event-manager-dashboard__retry-button"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="event-manager-dashboard__filters">
          <div className="event-manager-dashboard__filter-row">
            <div className="event-manager-dashboard__search-group">
              <div className="event-manager-dashboard__search-input-group">
                <span className="event-manager-dashboard__search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="event-manager-dashboard__search-input"
                />
              </div>
            </div>
            <div className="event-manager-dashboard__filter-group">
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="event-manager-dashboard__filter-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="ONGOING">Đang diễn ra</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="REJECTED">Từ chối</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
            <div className="event-manager-dashboard__sort-group">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'startTime' | 'status');
                  setSortOrder(order as 'asc' | 'desc');
                  setCurrentPage(1);
                }}
                className="event-manager-dashboard__sort-select"
              >
                <option value="startTime-desc">Mới nhất</option>
                <option value="startTime-asc">Cũ nhất</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <>
            <div className="event-manager-dashboard__events-grid">
              {events.map(event => (
                <div
                  key={event.id}
                  className="event-manager-dashboard__event-card"
                  onClick={() => navigate(`/organizer/events/${event.id}`)}
                >
                  <div className="event-manager-dashboard__event-image">
                    {event.bannerUrl ? (
                      <img src={event.bannerUrl} alt={event.name} />
                    ) : (
                      <div className="event-manager-dashboard__placeholder-image">
                        <span>🎪</span>
                      </div>
                    )}
                  </div>
                  <div className="event-manager-dashboard__event-content">
                    <h3 className="event-manager-dashboard__event-title">{event.name}</h3>
                    <div className="event-manager-dashboard__event-meta">
                      {event.startTime && (
                        <div className="event-manager-dashboard__meta-item">
                          <span className="event-manager-dashboard__meta-icon">📅</span>
                          <span>{formatDate(event.startTime)}</span>
                        </div>
                      )}
                      {/* Show status badge */}
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                  {/* Add a delete button per event if needed */}
                  {/* <button onClick={e => {e.stopPropagation(); handleDeleteEvent(event.id)}}>Xóa</button> */}
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="event-manager-dashboard__pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="event-manager-dashboard__pagination-btn"
                >
                  ← Trước
                </button>
                <div className="event-manager-dashboard__pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`event-manager-dashboard__pagination-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="event-manager-dashboard__pagination-btn"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="event-manager-dashboard__no-events">
            <div className="event-manager-dashboard__no-events-icon">📭</div>
            <h3>Chưa có sự kiện nào</h3>
            <p>Bạn chưa tạo sự kiện nào. Hãy bắt đầu bằng cách tạo sự kiện đầu tiên!</p>
            <button
              onClick={() => navigate('/event-manager/create')}
              className="event-manager-dashboard__btn event-manager-dashboard__btn--primary"
            >
              <span>➕</span>
              Tạo sự kiện đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagerDashboard;
