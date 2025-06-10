import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiMapPin } from 'react-icons/fi';
import '../styles/Footer.css';
import Logo from '../assets/Logo.jpeg';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface FooterLink {
  title: string;
  links: { name: string; path: string }[];
}

const Footer = () => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const socialLinks: SocialLink[] = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/personalityquiz',
      icon: (
        <svg className="social-icon-svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/personalityquiz',
      icon: (
        <svg className="social-icon-svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0-.795-.646-1.44-1.44-1.44-.795 0-1.44.646-1.44 1.44 0 .794.646 1.439 1.44 1.439.793-.001 1.44-.645 1.44-1.439z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/personalityquiz',
      icon: (
        <svg className="social-icon-svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
    }
  ];

  const footerLinks: FooterLink[] = [
    {
      title: 'Về Chúng Tôi',
      links: [
        { name: 'Giới Thiệu', path: '/about' },
        { name: 'Tuyển Dụng', path: '/careers' },
        { name: 'Liên Hệ', path: '/contact' },
      ],
    },
    {
      title: 'Dịch Vụ',
      links: [
        { name: 'Sản Phẩm', path: '/products' },
        { name: 'Giải Pháp', path: '/solutions' },
        { name: 'Hỗ Trợ', path: '/support' },
      ],
    },
    {
      title: 'Pháp Lý',
      links: [
        { name: 'Chính Sách Bảo Mật', path: '/privacy' },
        { name: 'Điều Khoản Dịch Vụ', path: '/terms' },
        { name: 'Chính Sách Cookie', path: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-gradient"></div>
      <div className="footer-content">
        <div className="company-info animate-fade-in">
          <img src={Logo} alt="Logo Công Ty" className="footer-logo animate-bounce" />
          <p className="company-description animate-slide-up">
            Khám phá tính cách thật của bạn thông qua các bài kiểm tra được thiết kế theo phương pháp khoa học
          </p>
        </div>

        <div className="footer-links animate-fade-in">
          {footerLinks.map((section, index) => (
            <div key={section.title} className="link-section animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <h3>{section.title}</h3>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={link.name} className="animate-slide-right" style={{ animationDelay: `${(index + linkIndex) * 0.1}s` }}>
                    <Link to={link.path}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`map-section ${isMapExpanded ? 'expanded' : ''} animate-fade-in`}>
          <h3>Vị Trí Của Chúng Tôi</h3>
          <div className="map-container">
            <button
              className="map-toggle"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              aria-label={isMapExpanded ? 'Ẩn bản đồ' : 'Hiện bản đồ'}
            >
              {isMapExpanded ? <FiMapPin /> : <FiMap />}
              <span>{isMapExpanded ? 'Ẩn Bản Đồ' : 'Hiện Bản Đồ'}</span>
            </button>
            
            {isMapExpanded && (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4842318813793!2d106.80769621533445!3d10.841127792277422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2s7%20%C4%90.%20D1%2C%20Long%20Th%E1%BA%A1nh%20M%E1%BB%B9%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh%2C%20Vietnam!5e0!3m2!1sen!2s!4v1621234567890"
                title="Bản Đồ Vị Trí Công Ty"
                width="100%"
                height={isMapExpanded ? "400" : "200"}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="animate-fade-in"
              />
            )}
          </div>
        </div>
      </div>

      <div className="social-links animate-fade-in">
        {socialLinks.map((social, index) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon animate-float"
            aria-label={social.name}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            {social.icon}
          </a>
        ))}
      </div>

      <div className="copyright animate-fade-in">
        <p>© {new Date().getFullYear()} PersonalityQuiz. Đã đăng ký bản quyền.</p>
      </div>
    </footer>
  );
};

export default Footer;