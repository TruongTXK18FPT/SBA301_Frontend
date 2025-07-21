import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <h1>Liên Hệ</h1>
        <p>Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ bạn!</p>
      </section>
      <section className="contact-info">
        <div>
          <strong>Email:</strong> <a href="mailto:support@personalityquiz.vn">support@personalityquiz.vn</a>
        </div>
        <div>
          <strong>Địa chỉ:</strong> 7 Đường D1, Long Thạnh Mỹ, Thủ Đức, TP.HCM
        </div>
      </section>
      <section className="contact-form-section">
        <h2>Gửi tin nhắn cho chúng tôi</h2>
        {submitted ? (
          <div className="contact-success">Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.</div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Nội dung"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
            />
            <button type="submit" className="btn-primary">Gửi</button>
          </form>
        )}
      </section>
    </div>
  );
};

export default Contact; 