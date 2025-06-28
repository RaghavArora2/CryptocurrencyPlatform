import React, { useState } from 'react';
import { DivideIcon as LucideIcon, Eye, EyeOff } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  icon: Icon,
  iconPosition = 'left',
  variant = 'default',
  inputSize = 'md',
  className = '',
  type,
  ...props
}) => {
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  const getVariantClasses = () => {
    const baseClasses = 'w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    
    switch (variant) {
      case 'filled':
        return `${baseClasses} ${
          theme === 'dark' 
            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
        }`;
      case 'outlined':
        return `${baseClasses} bg-transparent border-2 ${
          theme === 'dark' 
            ? 'border-gray-600 text-white placeholder-gray-400' 
            : 'border-gray-300 text-gray-900 placeholder-gray-500'
        }`;
      default:
        return `${baseClasses} ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`;
    }
  };

  const getStateClasses = () => {
    if (error) {
      return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    }
    if (success) {
      return 'border-green-500 focus:ring-green-500 focus:border-green-500';
    }
    if (isFocused) {
      return 'ring-2 ring-blue-500 border-blue-500 shadow-glow';
    }
    return '';
  };

  const iconClasses = `absolute ${
    iconPosition === 'left' ? 'left-3' : 'right-3'
  } top-1/2 transform -translate-y-1/2 w-5 h-5 ${
    error ? 'text-red-500' : 
    success ? 'text-green-500' : 
    isFocused ? 'text-blue-500' :
    'text-gray-400'
  } transition-colors duration-200`;

  const inputClasses = `
    ${getVariantClasses()} 
    ${sizeClasses[inputSize]} 
    ${getStateClasses()}
    ${Icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : ''} 
    ${isPassword ? 'pr-11' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium transition-colors duration-200 ${
          error ? 'text-red-500' :
          success ? 'text-green-500' :
          isFocused ? 'text-blue-500' :
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className={iconClasses} />
        )}
        
        <input 
          type={inputType}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props} 
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            } transition-colors duration-200`}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
      
      {(error || success) && (
        <div className={`text-sm font-medium animate-slide-up ${
          error ? 'text-red-500' : 'text-green-500'
        }`}>
          {error || success}
        </div>
      )}
    </div>
  );
};

export default Input;