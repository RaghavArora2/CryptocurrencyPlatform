import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useThemeStore();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-blue-500 ${theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} active:scale-95`,
    secondary: `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-gray-500 active:scale-95`,
    success: `bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-green-500 ${theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} active:scale-95`,
    danger: `bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-red-500 ${theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} active:scale-95`,
    ghost: `${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} focus:ring-gray-500 active:scale-95`
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <div className={`flex items-center ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'mr-2' : ''}`} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${children ? 'ml-2' : ''}`} />
        )}
      </div>
    </button>
  );
};

export default Button;