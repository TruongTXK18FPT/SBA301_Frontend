import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EventPrivateDetailResponse } from '../components/event/dto/event.dto';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import '../styles/EventDetails.css';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventPrivateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(parseInt(id!));
      setEvent(response);
    } catch (err: any) {
      setError('Không thể tải thông tin sự kiện. Vui lòng thử lại.');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = async () => {
    if (!event) return;

    try {
      setBookingLoading(true);
      // Simulate booking API call - replace with actual booking service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAlert({ 
        type: 'success', 
        message: 'Đặt vé thành công! Bạn sẽ được chuyển hướng đến trang thanh toán.' 
      });
      
      // Redirect to payment or ticket page after successful booking
      setTimeout(() => {
        navigate(`/ticket/${event.id}`);
      }, 2000);
      
    } catch (err: any) {
      setAlert({ 
        type: 'error', 
        message: 'Không thể đặt vé. Vui lòng thử lại sau.' 
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'DRAFT': { text: 'Bản nháp', class: 'draft' },
      'PENDING': { text: 'Chờ duyệt', class: 'pending' },
      'UPCOMING': { text: 'Sắp diễn ra', class: 'approved' },
      'ONGOING': { text: 'Đang diễn ra', class: 'ongoing' },
      'COMPLETED': { text: 'Đã hoàn thành', class: 'completed' },
      'REJECTED': { text: 'Từ chối', class: 'rejected' },
      'CANCELLED': { text: 'Đã hủy', class: 'cancelled' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'draft' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const canBookEvent = () => {
    if (!event) return false;
    return (event.status === 'UPCOMING' || event.status === 'ONGOING') && 
           event.showtimes?.[0]?.startTime && 
           new Date(event.showtimes[0].startTime) > new Date();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !event) {
    return (
      <div className="event-details-page">
        <div className="container">
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h2>Không thể tải sự kiện</h2>
            <p>{error || 'Sự kiện không tồn tại hoặc đã bị xóa.'}</p>
            <button 
              onClick={() => navigate('/events')}
              className="btn btn-primary"
            >
              ← Quay lại danh sách sự kiện
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      <div className="container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/events')}
          className="back-button"
        >
          ← Quay lại danh sách sự kiện
        </button>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Event Header */}
        <div className="event-header">
          <div className="event-image-container">
            {event.bannerUrl ? (
              <img src={event.bannerUrl} alt={event.name} className="event-banner" />
            ) : (
              <div className="placeholder-banner">
                <span className="placeholder-icon">🎪</span>
              </div>
            )}
            <div className="status-overlay">
              {getStatusBadge(event.status)}
            </div>
          </div>
          
          <div className="event-header-content">
            <h1 className="event-title">{event.name}</h1>
            <div className="event-meta-header">
              {event.showtimes?.[0]?.startTime && (
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <div className="meta-content">
                    <strong>Bắt đầu:</strong> {formatDate(event.showtimes[0].startTime)}
                  </div>
                </div>
              )}
              {event.showtimes?.[0]?.endTime && (
                <div className="meta-item">
                  <span className="meta-icon">🏁</span>
                  <div className="meta-content">
                    <strong>Kết thúc:</strong> {formatDate(event.showtimes[0].endTime)}
                  </div>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-icon">�</span>
                <div className="meta-content">
                  <strong>Địa điểm:</strong> Thông tin sẽ được cập nhật
                </div>
              </div>
              {!!(event.showtimes?.[0]?.tickets?.[0]?.price) && (
                <div className="meta-item">
                  <span className="meta-icon">�</span>
                  <div className="meta-content">
                    <strong>Giá vé:</strong> {formatPrice(event.showtimes[0].tickets[0].price)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Content */}
        <div className="event-content">
          <div className="event-main">
            {/* Description */}
            <div className="content-section">
              <h2 className="section-title">
                <span className="title-icon">📋</span>
                Mô tả sự kiện
              </h2>
              <div className="event-description">
                {event.description ? (
                  event.description.split('\n').map((paragraph, index) => (
                    <p key={`desc-${index}`}>{paragraph}</p>
                  ))
                ) : (
                  <p>Thông tin mô tả sẽ được cập nhật sớm.</p>
                )}
              </div>
            </div>

            {/* Note: Requirements and tags are not available in current EventPrivateDetailResponse */}
          </div>

          {/* Sidebar */}
          <div className="event-sidebar">
            {/* Booking Card */}
            <div className="booking-card">
              <h3 className="booking-title">Đặt vé tham gia</h3>
              <div className="price-display">
                <span className="price-label">Giá vé:</span>
                <span className="price-value">
                  {event.showtimes?.[0]?.tickets?.[0]?.price 
                    ? formatPrice(event.showtimes[0].tickets[0].price) 
                    : 'Thông tin giá sẽ được cập nhật'
                  }
                </span>
              </div>
              
              {canBookEvent() ? (
                <button 
                  onClick={handleBookEvent}
                  disabled={bookingLoading}
                  className="btn btn-primary booking-btn"
                >
                  {bookingLoading ? (
                    <>
                      <span className="booking-spinner">⏳</span>
                      Đang đặt vé...
                    </>
                  ) : (
                    <>
                      <span>🎫</span>
                      Đặt vé ngay
                    </>
                  )}
                </button>
              ) : (
                <div className="booking-unavailable">
                  {(event.status !== 'UPCOMING' && event.status !== 'ONGOING') ? (
                    <p>🚫 Sự kiện này không thể đặt vé</p>
                  ) : (
                    <p>⏰ Sự kiện đã diễn ra</p>
                  )}
                </div>
              )}
            </div>

            {/* Organizer Info */}
            <div className="organizer-card">
              <h3 className="organizer-title">
                <span className="title-icon">👤</span>
                Thông tin ban tổ chức
              </h3>
              <div className="organizer-info">
                {event.organizerId && (
                  <div className="organizer-item">
                    <strong>ID Tổ chức:</strong> {event.organizerId}
                  </div>
                )}
                <div className="organizer-item">
                  <strong>Email:</strong> 
                  <span>Thông tin liên hệ sẽ được cập nhật</span>
                </div>
                <div className="organizer-item">
                  <strong>Điện thoại:</strong>
                  <span>Thông tin liên hệ sẽ được cập nhật</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="share-card">
              <h3 className="share-title">
                <span className="title-icon">📤</span>
                Chia sẻ sự kiện
              </h3>
              <div className="share-buttons">
                <button 
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="share-btn"
                >
                  🔗 Sao chép liên kết
                </button>
                <button 
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
                  className="share-btn"
                >
                  📘 Facebook
                </button>
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.name)}`)}
                  className="share-btn"
                >
                  🐦 Twitter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
