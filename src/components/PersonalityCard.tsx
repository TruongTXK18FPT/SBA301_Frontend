import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';
import '../styles/PersonalityCard.css';

interface PersonalityCardProps {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  delay?: number;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({
  image,
  title,
  subtitle,
  description,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`personality-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="personality-card-inner">
        {/* Animated background layers */}
        <div className="personality-card-bg-gradient"></div>
        <div className="personality-card-mesh-gradient"></div>
        <div className="personality-card-shimmer"></div>
        <div className="personality-card-border"></div>
        <div className="personality-card-glow"></div>
        
        {/* Floating particles */}
        <div className="personality-card-particles">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Floating icons */}
        <div className="personality-card-floating-icons">
          <Sparkles className="floating-icon icon-1" />
          <Star className="floating-icon icon-2" />
          <Zap className="floating-icon icon-3" />
        </div>

        {/* Image section with advanced effects */}
        <div className="personality-card-image-container">
          <div className="personality-card-image-glow"></div>
          <div className="personality-card-image-ring"></div>
          <div className="personality-card-image-ring-2"></div>
          <div className="personality-card-image-ring-3"></div>
          <div className="personality-card-image-overlay"></div>
          <img 
            src={image} 
            alt={title}
            className="personality-card-image"
            onError={(e) => {
              e.currentTarget.src = `https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400`;
            }}
          />
          <div className="personality-card-image-pulse"></div>
        </div>

        {/* Content with enhanced typography */}
        <div className="personality-card-content">
          <h3 className="personality-card-title">
            <span className="title-text">{title}</span>
            <div className="title-underline"></div>
          </h3>
          
          <p className="personality-card-subtitle">
            <span className="subtitle-bg"></span>
            {subtitle}
          </p>
          
          <p className="personality-card-description">
            {description}
          </p>

          {/* Interactive elements */}
          <div className="personality-card-actions">
            <button className="card-action-btn primary">
              <span>Explore</span>
              <div className="btn-ripple"></div>
            </button>
            <button className="card-action-btn secondary">
              <span>Learn More</span>
              <div className="btn-ripple"></div>
            </button>
          </div>
        </div>

        {/* Hover reveal elements */}
        <div className="personality-card-hover-reveal">
          <div className="reveal-line line-1"></div>
          <div className="reveal-line line-2"></div>
          <div className="reveal-line line-3"></div>
          <div className="reveal-line line-4"></div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityCard;