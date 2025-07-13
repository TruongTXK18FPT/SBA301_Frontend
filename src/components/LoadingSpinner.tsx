import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Đang tải...', 
  size = 'medium' 
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const containerSizes = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main spinner container */}
      <div className="relative flex flex-col items-center space-y-8">
        {/* Outer ring with gradient */}
        <div className={`relative ${containerSizes[size]} flex items-center justify-center`}>
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin">
            <div className="absolute inset-1 rounded-full bg-slate-900" />
          </div>
          
          {/* Inner spinning elements */}
          <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            {/* Multiple rotating rings */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-r-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-400 animate-spin" style={{ animationDuration: '2s' }} />
            
            {/* Center pulsing dot */}
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2" />
          </div>
        </div>

        {/* Loading text with animated dots */}
        <div className="text-center">
          <p className={`${textSizes[size]} font-medium text-slate-200 tracking-wide`}>
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
                 style={{ 
                   width: '60%', 
                   animation: 'progress 2s ease-in-out infinite' 
                 }} />
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;