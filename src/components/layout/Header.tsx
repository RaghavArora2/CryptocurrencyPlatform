import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { 
  LogOut, 
  User, 
  TrendingUp, 
  Menu, 
  Wallet, 
  Sun, 
  Moon,
  X,
  ChevronDown
} from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      label: 'Profile', 
      icon: User, 
      onClick: () => navigate('/profile'),
      description: 'Manage your account settings'
    },
    { 
      label: 'Wallet', 
      icon: Wallet, 
      onClick: () => navigate('/wallet'),
      description: 'View and manage your funds'
    },
    { 
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', 
      icon: theme === 'dark' ? Sun : Moon, 
      onClick: toggleTheme,
      description: 'Switch application theme'
    },
    { 
      label: 'Logout', 
      icon: LogOut, 
      onClick: handleLogout,
      description: 'Sign out of your account'
    },
  ];

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg relative z-50`}>
      <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/trading" className="flex items-center space-x-2 text-2xl font-bold">
          <TrendingUp className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`} />
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>CryptoTrade</span>
        </Link>
        
        {user && (
          <div className="flex items-center space-x-6">
            <div className={`hidden md:flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <User className="w-5 h-5" />
              <span>{user.username}</span>
            </div>
            <div className="hidden md:block text-sm">
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Portfolio Value</div>
              <div className={`font-medium ${
                (user.balance.usd + (user.balance.btc * 45000) + (user.balance.eth * 3000)) > 10000
                ? 'text-green-500'
                : 'text-red-500'
              }`}>
                ${(user.balance.usd + 
                   (user.balance.btc * 45000) + 
                   (user.balance.eth * 3000)).toLocaleString()}
              </div>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center space-x-2 p-2 rounded-md ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Menu className="w-6 h-6" />
                <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div className={`absolute top-12 right-0 w-72 rounded-lg shadow-lg py-2 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 transform transition-all z-50`}>
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.onClick();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-start px-4 py-3 text-left ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      } transition-colors duration-150`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 mt-0.5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {item.label}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;