import React from 'react';
import '../styles/Careers.css';

const Careers: React.FC = () => (
  <div className="careers-container">
    <section className="careers-hero">
      <h1>Cơ Hội Nghề Nghiệp</h1>
      <p>Gia nhập PersonalityQuiz để cùng xây dựng nền tảng định hướng nghề nghiệp hàng đầu!</p>
    </section>
    <section className="careers-values">
      <h2>Giá Trị Cốt Lõi</h2>
      <ul>
        <li>Đổi mới sáng tạo</li>
        <li>Hợp tác và phát triển</li>
        <li>Chia sẻ tri thức</li>
      </ul>
    </section>
    <section className="careers-openings">
      <h2>Vị Trí Đang Tuyển</h2>
      <ul>
        <li>
          <strong>Frontend Developer</strong> – TP.HCM<br />
          <span>Phát triển giao diện web hiện đại, thân thiện người dùng.</span>
        </li>
        <li>
          <strong>Chuyên viên Marketing</strong> – Remote<br />
          <span>Xây dựng chiến lược truyền thông và phát triển thương hiệu.</span>
        </li>
      </ul>
      <p>Gửi CV về <a href="mailto:hr@personalityquiz.vn">hr@personalityquiz.vn</a></p>
    </section>
  </div>
);

export default Careers; 