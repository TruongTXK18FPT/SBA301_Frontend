import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoNewspaper } from 'react-icons/io5';
import '../styles/NewsSlider.css';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  summary: string;
  link: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "Tìm hiểu về MBTI trong giáo dục",
    date: "2025-05-28",
    category: "Giáo dục",
    summary: "Cách các nhóm tính cách ảnh hưởng đến phong cách học tập...",
    link: "/news/mbti-education"
  },
  {
    id: 2,
    title: "Hội thảo nghề nghiệp sắp tới",
    date: "2025-06-01",
    category: "Sự kiện",
    summary: "Tham gia buổi chia sẻ tương tác về định hướng nghề nghiệp...",
    link: "/events/career-workshop"
  },
  {
    id: 3,
    title: "Ra mắt các tính năng AI mới",
    date: "2025-05-25",
    category: "Cập nhật",
    summary: "Khám phá công nghệ phân tích tính cách bằng AI nâng cao...",
    link: "/news/ai-features"
  },
  {
    id: 4,
    title: "Câu chuyện thành công của sinh viên",
    date: "2025-05-20",
    category: "Câu chuyện",
    summary: "Cùng đọc những câu chuyện thay đổi sự nghiệp nhờ hiểu rõ bản thân...",
    link: "/news/success-stories"
  }
];

const NewsSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => 
        current === newsItems.length - 1 ? 0 : current + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news-slider">
      <div className="news-header">
        <IoNewspaper className="news-icon" />
        <h3>Tin mới nhất</h3>
      </div>

      <div className="news-container">
        <AnimatePresence mode="wait">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`news-item ${index === activeIndex ? 'active' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onClick={() => window.location.href = item.link}
            >
              <div className="news-category">{item.category}</div>
              <h4>{item.title}</h4>
              <p>{item.summary}</p>
              <div className="news-date">{item.date}</div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="news-indicators">
          {newsItems.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSlider;
