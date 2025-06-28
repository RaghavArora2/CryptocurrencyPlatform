import React from 'react';
import useThemeStore from '../../store/themeStore';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  interactive?: boolean;
  glass?: boolean;
  glow?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  interactive = false,
  glass = false,
  glow = false,
  variant = 'default'
}) => {
  const { theme } = useThemeStore();

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return `shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-0`;
      case 'outlined':
        return `border-2 ${theme === 'dark' ? 'border-gray-600 bg-transparent' : 'border-gray-300 bg-transparent'} shadow-none`;
      case 'filled':
        return `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border-0 shadow-md`;
      default:
        return theme === 'dark' 
          ? gradient 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-gray-800 border border-gray-700'
          : gradient
            ? 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
            : 'bg-white border border-gray-200';
    }
  };

  const baseClasses = `rounded-2xl transition-all duration-300 ${getVariantClasses()}`;
  
  const effectClasses = [
    glass && (theme === 'dark' ? 'glass-effect-dark' : 'glass-effect'),
    glow && 'shadow-glow',
    (hover || interactive) && 'hover-lift cursor-pointer',
    interactive && 'active:scale-95 select-none',
    'animate-fade-in'
  ].filter(Boolean).join(' ');

  return (
    <div className={`${baseClasses} ${effectClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;