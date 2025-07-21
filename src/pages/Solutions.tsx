import React from 'react';
import '../styles/Solutions.css';

const solutions = [
  {
    name: 'Định Hướng Nghề Nghiệp',
    description: 'Giải pháp giúp học sinh, sinh viên xác định ngành nghề phù hợp dựa trên tính cách và sở thích.',
  },
  {
    name: 'Tư Vấn Tuyển Sinh',
    description: 'Hỗ trợ các trường học, trung tâm tư vấn tuyển sinh hiệu quả hơn với công nghệ AI.',
  },
  {
    name: 'Dashboard Phụ Huynh',
    description: 'Công cụ giúp phụ huynh theo dõi tiến trình và kết quả của con em.',
  },
];

const Solutions: React.FC = () => (
  <div className="solutions-container">
    <section className="solutions-hero">
      <h1>Giải Pháp</h1>
      <p>Chúng tôi cung cấp các giải pháp toàn diện cho cá nhân, trường học và doanh nghiệp.</p>
    </section>
    <section className="solutions-list">
      {solutions.map((solution, idx) => (
        <div className="solution-card" key={solution.name} style={{ animationDelay: `${idx * 0.1}s` }}>
          <h2>{solution.name}</h2>
          <p>{solution.description}</p>
        </div>
      ))}
    </section>
    <section className="solutions-cta">
      <a href="/contact" className="btn-primary">Liên hệ tư vấn</a>
    </section>
  </div>
);

export default Solutions; 