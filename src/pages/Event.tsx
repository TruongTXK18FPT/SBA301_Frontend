import React from 'react';
import '../styles/Event.css';

const Event: React.FC = () => {
  return (
    <div className="event-page">
      <div className="event-container">
        <header className="event-header">
          <h1>Sự Kiện</h1>
          <p>Khám phá các sự kiện thú vị và hoạt động đang diễn ra</p>
        </header>
        
        <div className="events-grid">
          <div className="event-card">
            <div className="event-image">
              <div className="event-placeholder">📅</div>
            </div>
            <div className="event-content">
              <h3>Hội thảo Phát triển Tính cách</h3>
              <p className="event-date">25 Tháng 12, 2024</p>
              <p className="event-description">
                Tham gia hội thảo để tìm hiểu về cách phát triển tính cách tích cực và kỹ năng giao tiếp.
              </p>
              <button className="event-btn">Đăng ký</button>
            </div>
          </div>

          <div className="event-card">
            <div className="event-image">
              <div className="event-placeholder">🎯</div>
            </div>
            <div className="event-content">
              <h3>Workshop Tìm hiểu Bản thân</h3>
              <p className="event-date">30 Tháng 12, 2024</p>
              <p className="event-description">
                Workshop giúp bạn khám phá những điểm mạnh và cơ hội phát triển của bản thân.
              </p>
              <button className="event-btn">Đăng ký</button>
            </div>
          </div>

          <div className="event-card">
            <div className="event-image">
              <div className="event-placeholder">🌟</div>
            </div>
            <div className="event-content">
              <h3>Cuộc thi Tài năng Trẻ</h3>
              <p className="event-date">5 Tháng 1, 2025</p>
              <p className="event-description">
                Tham gia cuộc thi để khẳng định tài năng và thể hiện những kỹ năng đặc biệt của bạn.
              </p>
              <button className="event-btn">Tham gia</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
