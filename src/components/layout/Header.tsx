import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
  BarChart3,
  Settings,
  Target,
  Shield,
  Bell,
  Search
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, wallets, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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
      label: 'Security', 
      icon: Shield, 
      onClick: () => navigate('/security'),
      description: 'Security settings and 2FA'
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

  const navigationItems = [
    { path: '/trading', label: 'Trading', icon: BarChart3 },
    { path: '/advanced-trading', label: 'Advanced', icon: Target },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/security', label: 'Security', icon: Shield },
  ];

  // Calculate total portfolio value from wallets array with proper price mapping
  const priceMap = new Map([
    ['USD', 1],
    ['BTC', 45000],
    ['ETH', 3000],
    ['ADA', 0.45],
    ['DOT', 7],
    ['LINK', 15],
    ['LTC', 100],
    ['BNB', 300],
    ['SOL', 100],
    ['DOGE', 0.08],
    ['AVAX', 35],
  ]);

  const totalPortfolioValue = user && wallets ? 
    wallets.reduce((total, wallet) => {
      const price = priceMap.get(wallet.currency) || 0;
      return total + (wallet.balance * price);
    }, 0) : 0;

  const mockNotifications = [
    { id: 1, title: 'BTC Price Alert', message: 'Bitcoin reached $45,000', time: '2 min ago', type: 'price' },
    { id: 2, title: 'Trade Executed', message: 'Your ETH buy order was filled', time: '5 min ago', type: 'trade' },
    { id: 3, title: 'Security Alert', message: 'New login from Chrome', time: '1 hour ago', type: 'security' },
  ];

  return (
    <header className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700' 
        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
    } shadow-xl border-b backdrop-blur-sm sticky top-0 z-40`}>
      <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/trading" className="flex items-center space-x-3 group">
            <div className="relative">
              <TrendingUp className={`h-8 w-8 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              } group-hover:scale-110 transition-transform duration-200`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className={`text-2xl font-bold bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                CryptoTrade
              </span>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Professional Trading
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-600 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {user && (
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="sm"
                icon={Search}
                className="hidden lg:flex"
              />

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  variant="ghost"
                  size="sm"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute top-12 right-0 w-80 z-50 animate-fade-in">
                    <Card className="py-2 shadow-2xl">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 transition-colors ${
                              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notification.message}
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                              {notification.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Portfolio Value */}
              <Card className="hidden lg:block px-4 py-2">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Portfolio Value
                </div>
                <div className={`font-bold text-lg ${
                  totalPortfolioValue > 10000 ? 'text-green-500' : 'text-blue-500'
                }`}>
                  ${totalPortfolioValue.toLocaleString()}
                </div>
              </Card>

              {/* User Info */}
              <div className={`hidden md:flex items-center space-x-3 px-4 py-2 rounded-xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.is_verified ? 'Verified Trader' : 'Active Trader'}
                  </div>
                </div>
              </div>
              
              {/* Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  variant="ghost"
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`} />
                </Button>

                {isMenuOpen && (
                  <div className="absolute top-12 right-0 w-80 z-50 animate-fade-in">
                    <Card className="py-2 shadow-2xl">
                      {menuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-start px-4 py-3 text-left transition-all duration-200 ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700' 
                              : 'hover:bg-gray-50'
                          }`}
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
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;