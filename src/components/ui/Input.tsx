import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const { theme } = useThemeStore();

  const inputClasses = `w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    Icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : ''
  } ${
    error 
      ? 'border-red-500 focus:ring-red-500' 
      : theme === 'dark'
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
  } ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`absolute ${
            iconPosition === 'left' ? 'left-3' : 'right-3'
          } top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            error ? 'text-red-500' : 'text-gray-400'
          }`} />
        )}
        <input className={inputClasses} {...props} />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;