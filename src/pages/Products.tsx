import React from 'react';
import '../styles/Products.css';

const products = [
  {
    name: 'Bài Test MBTI',
    description: 'Khám phá 16 kiểu tính cách Myers-Briggs với độ chính xác cao.',
  },
  {
    name: 'Bài Test DISC',
    description: 'Phân tích phong cách hành vi và giao tiếp cá nhân.',
  },
  {
    name: 'Gợi Ý Nghề Nghiệp',
    description: 'Đề xuất nghề nghiệp phù hợp dựa trên kết quả tính cách.',
  },
  {
    name: 'Tư Vấn AI',
    description: 'Chatbot AI hỗ trợ tư vấn định hướng 24/7.',
  },
];

const Products: React.FC = () => (
  <div className="products-container">
    <section className="products-hero">
      <h1>Sản Phẩm</h1>
      <p>Khám phá các sản phẩm nổi bật của PersonalityQuiz giúp bạn phát triển bản thân và sự nghiệp.</p>
    </section>
    <section className="products-list">
      {products.map((product, idx) => (
        <div className="product-card" key={product.name} style={{ animationDelay: `${idx * 0.1}s` }}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </section>
    <section className="products-cta">
      <a href="/quiz" className="btn-primary">Bắt đầu trải nghiệm</a>
    </section>
  </div>
);

export default Products; 