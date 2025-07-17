import React from 'react';
import '../styles/About.css';

const About: React.FC = () => (
  <div className="about-container">
    <section className="about-hero">
      <h1>Về Chúng Tôi</h1>
      <p>
        PersonalityQuiz giúp bạn khám phá bản thân, định hướng nghề nghiệp và chọn trường đại học phù hợp thông qua các bài test khoa học.
      </p>
    </section>
    <section className="about-mission-vision">
      <div className="about-card">
        <h2>Sứ Mệnh</h2>
        <p>Đồng hành cùng bạn trẻ trên hành trình hiểu bản thân và phát triển sự nghiệp.</p>
      </div>
      <div className="about-card">
        <h2>Tầm Nhìn</h2>
        <p>Trở thành nền tảng định hướng nghề nghiệp hàng đầu Việt Nam dựa trên công nghệ và khoa học tâm lý.</p>
      </div>
    </section>
    <section className="about-cta">
      <h2>Khám phá bản thân cùng chúng tôi!</h2>
      <a href="/quiz" className="btn-primary">Bắt đầu bài test</a>
    </section>
  </div>
);

export default About;
