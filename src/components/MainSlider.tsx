import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoArrowForward, IoArrowBack } from 'react-icons/io5';
import '../styles/MainSlider.css';
import Button from './Button';
import Workshop from '../assets/workshop.jpg';
import Career from '../assets/career.jpg';
import Leadership from '../assets/leadership.jpg';

interface SlideItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const slides: SlideItem[] = [
  {
    id: 1,
    title: "Personality Development Workshop",
    description: "Join our expert-led workshop to understand your MBTI type better",
    imageUrl: Workshop,
    link: "/events/workshop"
  },
  {
    id: 2,
    title: "Career Counseling Session",
    description: "Discover the best career paths based on your personality type",
    imageUrl: Career,
    link: "/events/counseling"
  },
  {
    id: 3,
    title: "Student Leadership Program",
    description: "Special program for emerging student leaders",
    imageUrl: Leadership,
    link: "/events/leadership"
  }
];

const MainSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const previousSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  return (
    <div className="main-slider">
      <div className="slider-container">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="slide"
            style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }}
          >
            <div className="slide-content">
              <h2>{slides[currentIndex].title}</h2>
              <p>{slides[currentIndex].description}</p>
              <Button 
                variant="gradient"
                size="lg"
                onClick={() => window.location.href = slides[currentIndex].link}
                icon={<IoArrowForward />}
                iconPosition="right"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          className="nav-button prev"
          onClick={previousSlide}
          aria-label="Previous Slide"
        >
          <IoArrowBack />
        </button>
        
        <button
          className="nav-button next"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          <IoArrowForward />
        </button>

        <div className="dots-container">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainSlider;