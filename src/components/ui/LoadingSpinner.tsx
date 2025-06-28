import React from 'react';
import useThemeStore from '../../store/themeStore';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const { theme } = useThemeStore();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`w-full h-full border-4 border-t-transparent rounded-full animate-spin ${
        theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
      }`}></div>
    </div>
  );
};

export default LoadingSpinner;