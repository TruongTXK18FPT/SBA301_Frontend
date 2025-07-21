import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FaBrain, 
  FaUserGraduate, 
  FaChartLine, 
  FaRobot, 
  FaUsers,
  FaUniversity,
  FaPlay,
  FaArrowRight,
  FaStar,
  FaQuoteLeft,
  FaLightbulb,
  FaBullseye,
  FaGraduationCap,
  FaHeart,
  FaUserTie,
  FaChevronRight,
  FaCrown,
  FaFire,
  FaBolt,
  FaCheck,
  FaGem,
  FaMagic,
  FaRocket,
  FaShieldAlt,
  FaHeadset,
  FaChartBar,
  FaUserFriends,
  FaBookOpen,
} from "react-icons/fa";
import Footer from "../components/Footer";
import "../styles/Home.css";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  gradient: string;
}

interface TestimonialCard {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  number: number;
}

interface PricingPlan {
  id: number;
  name: string;
  icon: React.ReactElement;
  price: number;
  period: string;
  originalPrice: number | null;
  discount: string | null;
  popular: boolean;
  features: string[];
  premiumFeatures?: string[];
  color: string;
  gradient: string;
}

const featureCards: FeatureCard[] = [
  {
    id: "mbti",
    title: "MBTI Assessment",
    description: "Khám phá 16 kiểu tính cách Myers-Briggs với độ chính xác cao",
    icon: <FaBrain />,
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: "disc",
    title: "DISC Profiling",
    description: "Phân tích phong cách hành vi và giao tiếp cá nhân",
    icon: <FaUsers />,
    color: "#f093fb",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    id: "career",
    title: "Career Recommendation",
    description: "Gợi ý nghề nghiệp phù hợp dựa trên kết quả tính cách",
    icon: <FaUserTie />,
    color: "#4facfe",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    id: "university",
    title: "University Matching",
    description: "Tìm trường đại học phù hợp với sở thích và năng lực",
    icon: <FaUniversity />,
    color: "#43e97b",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    id: "ai-chat",
    title: "AI Chatbot",
    description: "Tư vấn cá nhân hóa từ trí tuệ nhân tạo 24/7",
    icon: <FaRobot />,
    color: "#fa709a",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    id: "parent-dashboard",
    title: "Parent Dashboard",
    description: "Theo dõi tiến trình con em và nhận báo cáo chi tiết",
    icon: <FaHeart />,
    color: "#a8edea",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  }
];

const testimonials: TestimonialCard[] = [
  {
    id: "1",
    name: "Nguyễn Minh Anh",
    role: "Học sinh lớp 12",
    content: "Nhờ bài test này mà em đã tự tin hơn trong việc chọn ngành học. Kết quả rất chính xác!",
    avatar: "👩‍🎓",
    rating: 5
  },
  {
    id: "2",
    name: "Trần Văn Nam",
    role: "Sinh viên năm 2",
    content: "Platform này giúp mình hiểu rõ hơn về bản thân và định hướng tương lai. Rất hữu ích!",
    avatar: "👨‍💼",
    rating: 5
  },
  {
    id: "3",
    name: "Bà Lê Thị Hoa",
    role: "Phụ huynh",
    content: "Tôi có thể theo dõi con mình và hiểu con tốt hơn qua báo cáo chi tiết. Tuyệt vời!",
    avatar: "👩‍💼",
    rating: 5
  }
];

const processSteps: ProcessStep[] = [
  {
    id: "register",
    title: "Đăng ký",
    description: "Tạo tài khoản miễn phí chỉ trong 30 giây",
    icon: <FaUserGraduate />,
    number: 1
  },
  {
    id: "quiz",
    title: "Làm bài test",
    description: "Hoàn thành bài test tính cách trong 15-20 phút",
    icon: <FaPlay />,
    number: 2
  },
  {
    id: "result",
    title: "Nhận kết quả",
    description: "Xem phân tích chi tiết về tính cách của bạn",
    icon: <FaChartLine />,
    number: 3
  },
  {
    id: "career",
    title: "Gợi ý nghề nghiệp",
    description: "Khám phá những nghề nghiệp phù hợp với bạn",
    icon: <FaBullseye />,
    number: 4
  },
  {
    id: "university",
    title: "Chọn trường đại học",
    description: "Tìm trường đại học phù hợp với sở thích",
    icon: <FaGraduationCap />,
    number: 5
  }
];

const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: 'Sinh Viên',
    icon: <FaBookOpen />,
    price: 1000,
    period: 'tháng',
    originalPrice: 100000,
    discount: '50%',
    popular: false,
    features: [
      'Không giới hạn bài test',
      'AI Chatbot cá nhân',
      'Báo cáo chi tiết',
      'Tư vấn nghề nghiệp'
    ],
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    name: 'Hàng Tháng',
    icon: <FaCrown />,
    price: 2000,
    period: 'tháng',
    originalPrice: null,
    discount: null,
    popular: true,
    features: [
      'Không giới hạn bài test',
      'AI Chatbot cá nhân',
      'Báo cáo chi tiết',
      'Tư ván nghề nghiệp',
      'Parent Dashboard',
      'Hỗ trợ 24/7'
    ],
    premiumFeatures: [
      '🎮 Game hóa trải nghiệm học tập',
      '🎥 Video hướng dẫn cá nhân hóa',
      '🏆 Hệ thống thành tích & phần thưởng',
      '🎵 Âm nhạc thư giãn trong bài test',
      '🎨 Giao diện tùy chỉnh theo sở thích'
    ],
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    name: 'Hàng Năm',
    icon: <FaCrown />,
    price: 3000,
    period: 'năm',
    originalPrice: 3000000,
    discount: '17%',
    popular: false,
    features: [
      'Không giới hạn bài test',
      'AI Chatbot cá nhân',
      'Báo cáo chi tiết',
      'Tư vấn nghề nghiệp',
      'Parent Dashboard',
      'Hỗ trợ 24/7',
      'Tính năng độc quyền',
      'Ưu tiên hỗ trợ'
    ],
    premiumFeatures: [
      '🎁 Quà tặng độc quyền hàng tháng',
      '🎪 Sự kiện VIP & Workshop',
      '👑 Cộng đồng Elite với mentor',
      '🎯 Coaching 1-on-1 không giới hạn',
      '🌟 Truy cập sớm tính năng mới'
    ],
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
];

const Home: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<number | null>(2);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate floating particles
    const particleArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(particleArray);
  }, []);

  const handleStartQuiz = () => {
    navigate('/quiz');
  };
  
  const handleBuyPremium = (planId: number) => {
    navigate('/premium', { state: { selectedPlan: planId } });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="particles-container">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="particle"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut"
                }}
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`
                }}
              />
            ))}
          </div>
          <div className="wave-animation">
            <svg viewBox="0 0 1000 300" className="wave-svg">
              <path d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 L1000,300 L0,300 Z" className="wave-path" />
            </svg>
          </div>
        </div>
        
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FaStar /> Công nghệ AI tiên tiến
          </motion.div>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Discover Your Personality.
            <br />
            <span className="home-gradient-text">Design Your Future.</span>
          </motion.h1>
          
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Khám phá tiềm năng bản thân qua các bài test khoa học, định hướng nghề nghiệp 
            và lựa chọn trường đại học phù hợp với tính cách của bạn.
          </motion.p>
          
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button className="btn-primary" onClick={handleStartQuiz}>
              <FaPlay />
              Bắt đầu bài test
            </button>
          </motion.div>
        </div>
      </section>

      {/* Personality Types Introduction Section */}
      <section className="personality-intro-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Khám phá các loại tính cách
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Hiểu rõ bản thân thông qua các phương pháp đánh giá tính cách được công nhận trên toàn thế giới
          </motion.p>
        </div>

        <div className="personality-types-grid">
          <motion.div
            className="personality-type-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="type-icon">
              <FaBrain />
            </div>
            <h3>MBTI - Myers-Briggs</h3>
            <p>
              Phân loại tính cách thành 16 kiểu dựa trên 4 cặp thang đo: Hướng nội/Hướng ngoại (I/E), 
              Cảm giác/Trực giác (S/N), Suy nghĩ/Cảm xúc (T/F), Phán đoán/Nhận thức (J/P).
            </p>
            <div className="type-examples">
              <span>INTJ</span>
              <span>ENFP</span>
              <span>ISTP</span>
              <span>ESFJ</span>
            </div>
          </motion.div>

          <motion.div
            className="personality-type-card"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="type-icon">
              <FaUsers />
            </div>
            <h3>DISC Assessment</h3>
            <p>
              Đánh giá phong cách hành vi qua 4 yếu tố chính: Dominant (Quyết đoán), 
              Influence (Ảnh hưởng), Steadiness (Ổn định), Conscientiousness (Tỉ mỉ).
            </p>
            <div className="type-examples">
              <span>D - Dominant</span>
              <span>I - Influence</span>
              <span>S - Steadiness</span>
              <span>C - Conscientiousness</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Tính năng nổi bật
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Trải nghiệm công nghệ hiện đại với các tính năng được thiết kế riêng cho học sinh và phụ huynh
          </motion.p>
        </div>

        <div className="features-grid">
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={`feature-card ${activeCard === feature.id ? 'active' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onMouseEnter={() => setActiveCard(feature.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="feature-header" style={{ background: feature.gradient }}>
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-glow"></div>
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">
                  <FaChevronRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="process-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Quy trình đơn giản
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Chỉ 5 bước đơn giản để khám phá bản thân và định hướng tương lai
          </motion.p>
        </div>

        <div className="process-timeline">
          {processSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <motion.div 
                className="process-step-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)"
                }}
              >
                <motion.div 
                  className="step-circle"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360,
                    boxShadow: "0 0 25px rgba(37, 99, 235, 0.8)"
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {step.number}
                </motion.div>
                <motion.div 
                  className="step-icon"
                  whileHover={{ 
                    scale: 1.3,
                    color: "#3b82f6"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.icon}
                </motion.div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <motion.div 
                  className="step-glow"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                />
              </motion.div>
              {index < processSteps.length - 1 && (
                <motion.div 
                  className="process-connector"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <span className="connector-line" />
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    <FaArrowRight className="connector-arrow" />
                  </motion.div>
                  <span className="connector-line" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Phản hồi từ người dùng
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Hàng nghìn học sinh và phụ huynh đã tin tưởng và đạt được kết quả tích cực
          </motion.p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="testimonial-quote">
                <FaQuoteLeft />
              </div>
              <div className="testimonial-content">
                <p>"{testimonial.content}"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                  <div className="rating">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section className="pricing-section">
        <div className="section-header">
          <motion.div
            className="premium-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <FaCrown />
            <span>Premium Experience</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Nâng cấp trải nghiệm của bạn
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Mở khóa toàn bộ tiềm năng với các tính năng premium độc quyền và trải nghiệm cá nhân hóa
          </motion.p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${activePlan === plan.id ? 'active' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onMouseEnter={() => setActivePlan(plan.id)}
              onMouseLeave={() => setActivePlan(2)}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <FaFire />
                  <span>Phổ biến nhất</span>
                </div>
              )}
              
              {plan.discount && (
                <div className="discount-badge">
                  <FaBolt />
                  <span>Tiết kiệm {plan.discount}</span>
                </div>
              )}

              <div className="pricing-header" style={{ background: plan.gradient }}>
                <div className="plan-icon">{plan.icon}</div>
                <div className="plan-glow"></div>
              </div>

              <div className="pricing-content">
                <h3>{plan.name}</h3>
                
                <div className="price-container">
                  {plan.originalPrice && (
                    <div className="original-price">
                      {plan.originalPrice.toLocaleString()}đ
                    </div>
                  )}
                  <div className="current-price">
                    <span className="currency">₫</span>
                    <span className="amount">{plan.price.toLocaleString()}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                </div>

                <div className="features-list">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <FaCheck className="check-icon" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.premiumFeatures && (
                  <div className="premium-features">
                    <div 
                      className="premium-toggle"
                      onClick={() => setShowPremiumFeatures(
                        showPremiumFeatures === plan.id ? null : plan.id
                      )}
                    >
                      <FaGem />
                      <span>Tính năng Premium</span>
                      <FaChevronRight className={`arrow ${showPremiumFeatures === plan.id ? 'rotated' : ''}`} />
                    </div>
                    
                    <motion.div
                      className="premium-features-list"
                      initial={false}
                      animate={{
                        height: showPremiumFeatures === plan.id ? 'auto' : 0,
                        opacity: showPremiumFeatures === plan.id ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {plan.premiumFeatures.map((feature, idx) => (
                        <div key={idx} className="premium-feature-item">
                          <FaMagic className="magic-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                )}

                <motion.button
                  className={`pricing-btn ${plan.popular ? 'popular-btn' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ background: plan.gradient }}
                  onClick={() => handleBuyPremium(plan.id)}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaRocket />
                  </motion.div>
                  {plan.popular ? '🚀 Mua Premium Ngay!' : '✨ Nâng Cấp Premium'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="pricing-benefits"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <motion.h3
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎉 Tại sao chọn Premium? 🎉
          </motion.h3>
          <div className="benefits-grid">
            <motion.div 
              className="benefit-item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <FaShieldAlt className="benefit-icon" />
              </motion.div>
              <h4>🛡️ Bảo mật tuyệt đối</h4>
              <p>Dữ liệu được mã hóa và bảo vệ 100%</p>
            </motion.div>
            <motion.div 
              className="benefit-item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaHeadset className="benefit-icon" />
              </motion.div>
              <h4>🎧 Hỗ trợ 24/7</h4>
              <p>Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ</p>
            </motion.div>
            <motion.div 
              className="benefit-item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaChartBar className="benefit-icon" />
              </motion.div>
              <h4>📊 Phân tích sâu</h4>
              <p>Báo cáo chi tiết với AI tiên tiến</p>
            </motion.div>
            <motion.div 
              className="benefit-item"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaUserFriends className="benefit-icon" />
              </motion.div>
              <h4>👥 Cộng đồng VIP</h4>
              <p>Kết nối với cộng đồng học viên ưu tú</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="cta-particle"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="cta-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Bắt đầu hành trình khám phá bản thân
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Hãy để chúng tôi đồng hành cùng bạn trong việc tìm hiểu về chính mình 
            và định hướng tương lai một cách khoa học và chính xác nhất.
          </motion.p>
          
          <motion.button
            className="cta-button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartQuiz}
          >
            <FaLightbulb />
            Khám phá ngay
          </motion.button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;