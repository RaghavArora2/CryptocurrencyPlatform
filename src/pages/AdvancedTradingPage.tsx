import React from 'react';
import useThemeStore from '../store/themeStore';
import AdvancedTrading from '../components/trading/AdvancedTrading';
import TradingAnalytics from '../components/analytics/TradingAnalytics';
import { Target, BarChart3 } from 'lucide-react';

const AdvancedTradingPage: React.FC = () => {
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = React.useState<'trading' | 'analytics'>('trading');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Advanced Trading
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Professional trading tools with leverage, positions, and advanced order types
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('trading')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'trading'
                  ? 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Advanced Trading</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'trading' ? <AdvancedTrading /> : <TradingAnalytics />}
      </div>
    </div>
  );
};

export default AdvancedTradingPage;