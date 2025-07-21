import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { EventPrivateDetailResponse } from '../components/event/dto/event.dto';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Ticket.css';

interface Ticket {
  id: string;
  eventId: number;
  ticketNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  bookingDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  qrCode: string;
  price: number;
}

const TicketPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventPrivateDetailResponse | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEventAndTicket();
    }
  }, [eventId]);

  const fetchEventAndTicket = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventResponse = await eventService.getEventById(parseInt(eventId!));
      setEvent(eventResponse);
      
      // Simulate ticket creation (in real app, this would come from booking API)
      const ticketData = `TICKET:${Date.now()}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketData)}`;
      
      const mockTicket: Ticket = {
        id: `ticket_${Date.now()}`,
        eventId: parseInt(eventId!),
        ticketNumber: `TK${Date.now().toString().slice(-8)}`,
        attendeeName: 'Người tham gia', // In real app, get from user profile
        attendeeEmail: 'user@example.com', // In real app, get from user profile
        attendeePhone: '0123456789', // In real app, get from user profile
        bookingDate: new Date().toISOString(),
        status: 'CONFIRMED',
        qrCode: qrCodeUrl,
        price: eventResponse.showtimes?.[0]?.tickets?.[0]?.price || 0 // Get price from first ticket if available
      };
      
      setTicket(mockTicket);
      
    } catch (err: any) {
      setError('Không thể tải thông tin vé. Vui lòng thử lại.');
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
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

  const formatPrice = (price: number) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    const ticketData = {
      event: event,
      ticket: ticket
    };
    
    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket?.ticketNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'CONFIRMED': { text: 'Đã xác nhận', class: 'confirmed' },
      'PENDING': { text: 'Đang xử lý', class: 'pending' },
      'CANCELLED': { text: 'Đã hủy', class: 'cancelled' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'pending' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !event || !ticket) {
    return (
      <div className="ticket-page">
        <div className="container">
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h2>Không thể tải thông tin vé</h2>
            <p>{error || 'Vé không tồn tại hoặc đã bị hủy.'}</p>
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
    <div className="ticket-page">
      <div className="container">
        {/* Header */}
        <div className="ticket-header">
          <button 
            onClick={() => navigate('/events')}
            className="back-button"
          >
            ← Quay lại danh sách sự kiện
          </button>
          
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">🎫</span>
              Vé Tham Gia Sự Kiện
            </h1>
            <p className="success-message">
              🎉 Chúc mừng! Bạn đã đặt vé thành công!
            </p>
          </div>

          <div className="ticket-actions">
            <button 
              onClick={handlePrintTicket}
              className="btn btn-outline"
            >
              <span>🖨️</span>
              In vé
            </button>
            <button 
              onClick={handleDownloadTicket}
              className="btn btn-primary"
            >
              <span>📥</span>
              Tải về
            </button>
          </div>
        </div>

        {/* Ticket Card */}
        <div className="ticket-card-container">
          <div className="ticket-card">
            {/* Ticket Header */}
            <div className="ticket-card-header">
              <div className="ticket-info">
                <h2 className="ticket-title">VÉ THAM GIA SỰ KIỆN</h2>
                <div className="ticket-number">
                  <span className="label">Số vé:</span>
                  <span className="value">{ticket.ticketNumber}</span>
                </div>
                <div className="ticket-status">
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
              <div className="qr-code-container">
                <img 
                  src={ticket.qrCode} 
                  alt="QR Code" 
                  className="qr-code"
                />
                <p className="qr-label">Quét mã để check-in</p>
              </div>
            </div>

            {/* Event Details */}
            <div className="event-details-section">
              <h3 className="section-title">
                <span className="title-icon">🎪</span>
                Thông tin sự kiện
              </h3>
              
              <div className="event-info-grid">
                <div className="info-card">
                  <h4 className="event-name">{event.name}</h4>
                  <p className="event-description">{event.description}</p>
                </div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <div className="info-content">
                      <strong>Ngày bắt đầu</strong>
                      <span>{event.showtimes?.[0]?.startTime ? formatDate(event.showtimes[0].startTime) : 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">🏁</span>
                    <div className="info-content">
                      <strong>Ngày kết thúc</strong>
                      <span>{event.showtimes?.[0]?.endTime ? formatDate(event.showtimes[0].endTime) : 'Chưa có thông tin'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <div className="info-content">
                      <strong>Địa điểm</strong>
                      <span>Thông tin sẽ được cập nhật</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-icon">💰</span>
                    <div className="info-content">
                      <strong>Giá vé</strong>
                      <span>{formatPrice(ticket.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendee Details */}
            <div className="attendee-details-section">
              <h3 className="section-title">
                <span className="title-icon">👤</span>
                Thông tin người tham gia
              </h3>
              
              <div className="attendee-info-grid">
                <div className="info-item">
                  <span className="info-icon">🏷️</span>
                  <div className="info-content">
                    <strong>Họ và tên</strong>
                    <span>{ticket.attendeeName}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div className="info-content">
                    <strong>Email</strong>
                    <span>{ticket.attendeeEmail}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  <div className="info-content">
                    <strong>Số điện thoại</strong>
                    <span>{ticket.attendeePhone}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <span className="info-icon">📆</span>
                  <div className="info-content">
                    <strong>Ngày đặt vé</strong>
                    <span>{formatDate(ticket.bookingDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Contact */}
            <div className="organizer-contact-section">
              <h3 className="section-title">
                <span className="title-icon">🏢</span>
                Liên hệ ban tổ chức
              </h3>
              
              <div className="organizer-info">
                {event.organizerId && (
                  <div className="contact-item">
                    <span className="contact-icon">👤</span>
                    <div className="contact-content">
                      <strong>ID Tổ chức:</strong> {event.organizerId}
                    </div>
                  </div>
                )}
                
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div className="contact-content">
                    <strong>Email:</strong> 
                    <span>Thông tin liên hệ sẽ được cập nhật</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div className="contact-content">
                    <strong>Điện thoại:</strong>
                    <span>Thông tin liên hệ sẽ được cập nhật</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="important-notes-section">
              <h3 className="section-title">
                <span className="title-icon">⚠️</span>
                Lưu ý quan trọng
              </h3>
              
              <div className="notes-content">
                <ul className="notes-list">
                  <li>Vui lòng mang theo vé này (bản in hoặc hiển thị trên điện thoại) khi tham gia sự kiện</li>
                  <li>Vé này chỉ có giá trị cho người có tên trên vé</li>
                  <li>Vui lòng đến trước giờ bắt đầu sự kiện 15-30 phút để check-in</li>
                  <li>Mọi thay đổi về sự kiện sẽ được thông báo qua email</li>
                  <li>Vé không được hoàn tiền trừ khi sự kiện bị hủy bởi ban tổ chức</li>
                </ul>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="ticket-footer">
              <div className="ticket-footer-content">
                <p className="ticket-footer-text">
                  Cảm ơn bạn đã đăng ký tham gia sự kiện! 
                  Chúng tôi rất mong được gặp bạn tại sự kiện.
                </p>
                <div className="ticket-footer-branding">
                  <span>🎪 PersonalityQuiz Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bottom-actions">
          <button 
            onClick={() => navigate('/events')}
            className="btn btn-outline"
          >
            Xem thêm sự kiện khác
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="btn btn-primary"
          >
            Quản lý vé của tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
