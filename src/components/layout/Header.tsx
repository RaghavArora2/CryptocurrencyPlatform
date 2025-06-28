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
  Search,
  Zap,
  Globe,
  Activity
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
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
    { path: '/trading', label: 'Trading', icon: BarChart3, description: 'Live trading dashboard' },
    { path: '/advanced-trading', label: 'Advanced', icon: Target, description: 'Professional tools' },
    { path: '/wallet', label: 'Wallet', icon: Wallet, description: 'Manage funds' },
    { path: '/profile', label: 'Profile', icon: User, description: 'Account settings' },
    { path: '/security', label: 'Security', icon: Shield, description: 'Security center' },
  ];

  // Calculate total portfolio value with proper price mapping
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

  const portfolioChange = totalPortfolioValue > 10000 ? 12.5 : -5.2;

  const mockNotifications = [
    { id: 1, title: 'BTC Price Alert', message: 'Bitcoin reached $45,000', time: '2 min ago', type: 'price', unread: true },
    { id: 2, title: 'Trade Executed', message: 'Your ETH buy order was filled', time: '5 min ago', type: 'trade', unread: true },
    { id: 3, title: 'Security Alert', message: 'New login from Chrome', time: '1 hour ago', type: 'security', unread: false },
    { id: 4, title: 'Market Update', message: 'Weekly market summary available', time: '2 hours ago', type: 'info', unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  return (
    <header className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700' 
        : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200'
    } shadow-2xl border-b backdrop-blur-sm sticky top-0 z-40 transition-all duration-300`}>
      <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Enhanced Logo */}
          <Link to="/trading" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg`}></div>
              <div className={`relative p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-110`}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className={`text-2xl font-bold bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300`}>
                CryptoTrade
              </span>
              <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} group-hover:text-blue-500 transition-colors duration-300`}>
                Professional Trading
              </div>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl"></div>
                  )}
                </Link>
                
                {/* Tooltip */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                } shadow-lg`}>
                  {item.description}
                  <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-900'
                  }`}></div>
                </div>
              </div>
            ))}
          </nav>
          
          {user && (
            <div className="flex items-center space-x-3">
              {/* Enhanced Search */}
              <div className="relative hidden md:block" ref={searchRef}>
                <Button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  variant="ghost"
                  size="sm"
                  icon={Search}
                  className="relative"
                />
                
                {isSearchOpen && (
                  <div className="absolute top-12 right-0 w-80 z-50 animate-scale-in">
                    <Card className="p-4 shadow-2xl" glass>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search cryptocurrencies..."
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        {['Bitcoin', 'Ethereum', 'Cardano'].map((crypto) => (
                          <div key={crypto} className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {crypto.charAt(0)}
                              </div>
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {crypto}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Enhanced Notifications */}
              <div className="relative" ref={notificationsRef}>
                <Button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  variant="ghost"
                  size="sm"
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{unreadCount}</span>
                    </div>
                  )}
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute top-12 right-0 w-96 z-50 animate-scale-in">
                    <Card className="shadow-2xl" glass>
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Notifications
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark' ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {unreadCount} new
                            </span>
                            <Button variant="ghost" size="xs">
                              Mark all read
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 transition-colors border-l-4 ${
                              notification.unread 
                                ? 'border-blue-500 bg-blue-500/5' 
                                : 'border-transparent'
                            } ${
                              theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'price' ? 'bg-green-500/10 text-green-500' :
                                notification.type === 'trade' ? 'bg-blue-500/10 text-blue-500' :
                                notification.type === 'security' ? 'bg-red-500/10 text-red-500' :
                                'bg-gray-500/10 text-gray-500'
                              }`}>
                                {notification.type === 'price' ? <TrendingUp className="w-4 h-4" /> :
                                 notification.type === 'trade' ? <Activity className="w-4 h-4" /> :
                                 notification.type === 'security' ? <Shield className="w-4 h-4" /> :
                                 <Globe className="w-4 h-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </h4>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="ghost" size="sm" fullWidth>
                          View all notifications
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Enhanced Portfolio Value */}
              <Card className="hidden xl:block px-4 py-3" variant="elevated">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    portfolioChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <Wallet className={`w-4 h-4 ${
                      portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Portfolio Value
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`font-bold text-lg ${
                        portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${totalPortfolioValue.toLocaleString()}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        portfolioChange >= 0 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {portfolioChange >= 0 ? '+' : ''}{portfolioChange}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Enhanced User Info */}
              <div className={`hidden lg:flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100/50 hover:bg-gray-100'
              }`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                  </div>
                  <div className={`text-xs flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Zap className="w-3 h-3" />
                    <span>{user.is_verified ? 'Verified Trader' : 'Active Trader'}</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Menu className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`} />
                </Button>

                {isMenuOpen && (
                  <div className="absolute top-12 right-0 w-80 z-50 animate-scale-in">
                    <Card className="py-2 shadow-2xl" glass>
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {user.username}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {menuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-start px-4 py-3 text-left transition-all duration-200 group ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700/50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg mr-3 transition-colors ${
                            theme === 'dark' ? 'bg-gray-700 group-hover:bg-gray-600' : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <item.icon className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          </div>
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