import React from 'react';
import useThemeStore from '../../store/themeStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false 
}) => {
  const { theme } = useThemeStore();

  const baseClasses = `rounded-2xl shadow-lg transition-all duration-300 ${
    theme === 'dark' 
      ? gradient 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
        : 'bg-gray-800 border border-gray-700'
      : gradient
        ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
        : 'bg-white border border-gray-200'
  }`;

  const hoverClasses = hover 
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;