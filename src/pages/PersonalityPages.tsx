import React, { useEffect, useState } from 'react';
import PersonalityCard from '../components/PersonalityCard';
import { analystTypes, diplomatTypes, sentinelTypes, explorerTypes } from '../data/personalityTypes';
import { Brain, Sparkles, Zap, Star, Atom, Orbit } from 'lucide-react';
import '../styles/PersonalityPage.css';

const PersonalityPage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['analysts', 'diplomats', 'sentinels', 'explorers'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`personality-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Animated Background */}
      <div className="personality-background">
        <div className="personality-bg-gradient-1"></div>
        <div className="personality-bg-gradient-2"></div>
        <div className="personality-bg-gradient-3"></div>
        <div className="personality-bg-mesh-pattern"></div>
        <div className="personality-bg-particles">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="personality-bg-particle" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <nav className="personality-nav">
        {['analysts', 'diplomats', 'sentinels', 'explorers'].map((section) => (
          <button
            key={section}
            className={`nav-dot ${activeSection === section ? 'active' : ''}`}
            onClick={() => {
              document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="personality-nav-dot-inner"></span>
            <span className="personality-nav-dot-label">{section}</span>
          </button>
        ))}
      </nav>

      {/* Hero Header */}
      <header className="personality-hero">
        <div className="personality-hero-content">
          <div className="personality-hero-icon-container">
            <Brain className="personality-hero-main-icon" />
            <Sparkles className="personality-hero-accent-icon icon-1" />
            <Zap className="personality-hero-accent-icon icon-2" />
            <Star className="personality-hero-accent-icon icon-3" />
            <Atom className="personality-hero-accent-icon icon-4" />
            <Orbit className="personality-hero-accent-icon icon-5" />
          </div>
          
          <h1 className="personality-hero-title">
            Discover Your Personality Type
          </h1>
          
          <p className="personality-hero-subtitle">
            Explore the fascinating world of personality types through stunning visual experiences
          </p>
          
          <div className="personality-hero-stats">
            <div className="personality-stat-item">
              <span className="personality-stat-number">16</span>
              <span className="personality-stat-label">Types</span>
            </div>
            <div className="personality-stat-divider"></div>
            <div className="personality-stat-item">
              <span className="personality-stat-number">4</span>
              <span className="personality-stat-label">Categories</span>
            </div>
            <div className="personality-stat-divider"></div>
            <div className="personality-stat-item">
              <span className="personality-stat-number">∞</span>
              <span className="personality-stat-label">Possibilities</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="personality-main">
        {/* Analysts Section */}
        <section id="analysts" className="personality-section analysts">
          <div className="personality-section-background">
            <div className="personality-section-gradient analysts-gradient"></div>
          </div>
          
          <div className="personality-section-header">
            <div className="personality-section-icon">
              <Brain className="personality-section-icon-main" />
              <div className="personality-icon-rings">
                <div className="personality-icon-ring ring-1"></div>
                <div className="personality-icon-ring ring-2"></div>
                <div className="personality-icon-ring ring-3"></div>
              </div>
            </div>
            
            <h2 className="personality-section-title">
              <span className="personality-title-bg">Analysts</span>
              <div className="personality-title-decoration">
                <div className="personality-decoration-line"></div>
                <div className="personality-decoration-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </h2>
            
            <p className="personality-section-description">
              Rational minds that embrace logic, strategy, and intellectual excellence. 
              These visionary thinkers excel at solving complex problems and creating innovative solutions.
            </p>
          </div>
          
          <div className="personality-cards-container">
            {analystTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 150}
              />
            ))}
          </div>
        </section>

        {/* Diplomats Section */}
        <section id="diplomats" className="personality-section diplomats">
          <div className="personality-section-background">
            <div className="personality-section-gradient diplomats-gradient"></div>
          </div>
          
          <div className="personality-section-header">
            <div className="personality-section-icon">
              <Sparkles className="personality-section-icon-main" />
              <div className="personality-icon-rings">
                <div className="personality-icon-ring ring-1"></div>
                <div className="personality-icon-ring ring-2"></div>
                <div className="personality-icon-ring ring-3"></div>
              </div>
            </div>
            
            <h2 className="personality-section-title">
              <span className="personality-title-bg">Diplomats</span>
              <div className="personality-title-decoration">
                <div className="personality-decoration-line"></div>
                <div className="personality-decoration-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </h2>
            
            <p className="personality-section-description">
              Empathetic souls driven by values, growth, and human potential. 
              These inspiring individuals create positive change through understanding and compassion.
            </p>
          </div>
          
          <div className="personality-cards-container">
            {diplomatTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 150 + 200}
              />
            ))}
          </div>
        </section>

        {/* Sentinels Section */}
        <section id="sentinels" className="personality-section sentinels">
          <div className="personality-section-background">
            <div className="personality-section-gradient sentinels-gradient"></div>
          </div>
          
          <div className="personality-section-header">
            <div className="personality-section-icon">
              <Star className="personality-section-icon-main" />
              <div className="personality-icon-rings">
                <div className="personality-icon-ring ring-1"></div>
                <div className="personality-icon-ring ring-2"></div>
                <div className="personality-icon-ring ring-3"></div>
              </div>
            </div>
            
            <h2 className="personality-section-title">
              <span className="personality-title-bg">Sentinels</span>
              <div className="personality-title-decoration">
                <div className="personality-decoration-line"></div>
                <div className="personality-decoration-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </h2>
            
            <p className="personality-section-description">
              Reliable guardians who value stability, tradition, and methodical excellence. 
              These dedicated individuals build strong foundations and maintain order.
            </p>
          </div>
          
          <div className="personality-cards-container">
            {sentinelTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 150 + 400}
              />
            ))}
          </div>
        </section>

        {/* Explorers Section */}
        <section id="explorers" className="personality-section explorers">
          <div className="personality-section-background">
            <div className="personality-section-gradient explorers-gradient"></div>
          </div>
          
          <div className="personality-section-header">
            <div className="personality-section-icon">
              <Zap className="personality-section-icon-main" />
              <div className="personality-icon-rings">
                <div className="personality-icon-ring ring-1"></div>
                <div className="personality-icon-ring ring-2"></div>
                <div className="personality-icon-ring ring-3"></div>
              </div>
            </div>
            
            <h2 className="personality-section-title">
              <span className="title-bg">Explorers</span>
              <div className="title-decoration">
                <div className="decoration-line"></div>
                <div className="decoration-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </h2>
            
            <p className="personality-section-description">
              Spontaneous adventurers who thrive on flexibility, action, and real-world experiences. 
              These dynamic individuals embrace change and live life to the fullest.
            </p>
          </div>
          
          <div className="personality-cards-container">
            {explorerTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 150 + 600}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="personality-footer">
        <div className="personality-footer-content">
          <div className="personality-footer-logo">
            <Brain className="personality-footer-icon" />
            <span>Personality Universe</span>
          </div>
          <p className="personality-footer-text">
            Discover the infinite possibilities within yourself
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PersonalityPage;