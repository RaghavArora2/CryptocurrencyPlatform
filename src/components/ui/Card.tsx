import React from 'react';
import useThemeStore from '../../store/themeStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  interactive = false
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

  const hoverClasses = (hover || interactive)
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
    : '';

  const interactiveClasses = interactive
    ? 'active:scale-95 select-none'
    : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;