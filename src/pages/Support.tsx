import React from 'react';
import '../styles/Support.css';

const faqs = [
  {
    question: 'Làm thế nào để đăng ký tài khoản?',
    answer: 'Nhấn vào nút Đăng ký ở góc trên cùng và điền thông tin cá nhân của bạn.'
  },
  {
    question: 'Tôi quên mật khẩu, phải làm sao?',
    answer: 'Sử dụng chức năng Quên mật khẩu trên trang đăng nhập để đặt lại mật khẩu.'
  },
  {
    question: 'Kết quả bài test có chính xác không?',
    answer: 'Các bài test được xây dựng dựa trên phương pháp khoa học và kiểm nghiệm thực tế.'
  },
  {
    question: 'Tôi cần hỗ trợ thêm?',
    answer: 'Liên hệ với chúng tôi qua trang Liên Hệ hoặc email support@personalityquiz.vn.'
  },
];

const Support: React.FC = () => (
  <div className="support-container">
    <section className="support-hero">
      <h1>Hỗ Trợ</h1>
      <p>Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn tận tình.</p>
    </section>
    <section className="support-faqs">
      {faqs.map((faq, idx) => (
        <div className="faq-card" key={faq.question} style={{ animationDelay: `${idx * 0.1}s` }}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </div>
      ))}
    </section>
    <section className="support-cta">
      <a href="/contact" className="btn-primary">Liên hệ hỗ trợ</a>
    </section>
  </div>
);

export default Support; 