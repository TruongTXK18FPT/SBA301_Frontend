import React, { useState, useEffect } from 'react';
import '../styles/PersonalityCard.css';

interface PersonalityCardProps {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  delay: number;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({
  image,
  title,
  subtitle,
  description,
  delay
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const cardStyle = {
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.9)',
    opacity: isVisible ? 1 : 0,
    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`
  };

  const titleStyle = {
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const subtitleStyle = {
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
  };

  const descriptionStyle = {
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
  };

  return (
    <div 
      className="personality-card"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="personality-card-inner">
        {/* Animated background gradient */}
        <div className="personality-card-bg-gradient" />
        
        {/* Floating particles */}
        <div className="personality-card-particles">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                animationDelay: `${i * 0.5}s`,
                left: `${20 + i * 15}%`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        {/* Shimmer effect */}
        <div className="personality-card-shimmer" />
        
        {/* Image container with enhanced effects */}
        <div className="personality-card-image-container">
          <div className="personality-card-image-ring" />
          <div className="personality-card-image-ring-2" />
          <img 
            src={image} 
            alt={title}
            className="personality-card-image"
          />
          <div className="personality-card-image-overlay" />
          <div className="personality-card-image-glow" />
        </div>
        
        {/* Content with staggered animations */}
        <div className="personality-card-content">
          <h3 
            className="personality-card-title"
            style={titleStyle}
          >
            {title}
          </h3>
          <p 
            className="personality-card-subtitle"
            style={subtitleStyle}
          >
            {subtitle}
          </p>
          <p 
            className="personality-card-description"
            style={descriptionStyle}
          >
            {description}
          </p>
        </div>
        
        {/* Interactive glow effect */}
        <div className="personality-card-glow" />
        
        {/* Border animation */}
        <div className="personality-card-border" />
      </div>
    </div>
  );
};

export default PersonalityCard;