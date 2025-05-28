import type { ButtonHTMLAttributes, ReactNode } from 'react';
import '../styles/Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    icon && 'btn-with-icon',
    icon && `btn-icon-${iconPosition}`,
    isLoading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => (
    <span className="btn-icon">
      {icon}
    </span>
  );

  return (
    <button
      className={classes}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      <span className="btn-content">{children}</span>
      {icon && iconPosition === 'right' && renderIcon()}
      {isLoading && (
        <svg 
          className="btn-spinner" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </button>
  );
};

export default Button;