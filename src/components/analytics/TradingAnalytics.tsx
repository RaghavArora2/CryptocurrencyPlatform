import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Target, Award, Calendar } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';
import Card from '../ui/Card';
import { TradingStats } from '../../types/trading';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const TradingAnalytics: React.FC = () => {
  const { theme } = useThemeStore();
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTradingStats();
  }, [timeframe]);

  const fetchTradingStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trading/analytics?timeframe=${timeframe}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching trading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-12">
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          No trading data available
        </p>
      </div>
    );
  }

  const performanceMetrics = [
    {
      title: 'Total P&L',
      value: formatCurrency(stats.total_pnl),
      change: stats.total_pnl >= 0 ? '+' : '',
      icon: DollarSign,
      color: stats.total_pnl >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Win Rate',
      value: formatPercentage(stats.win_rate),
      change: '',
      icon: Target,
      color: stats.win_rate >= 50 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Total Trades',
      value: stats.total_trades.toString(),
      change: '',
      icon: BarChart3,
      color: 'text-blue-500',
    },
    {
      title: 'Best Trade',
      value: formatCurrency(stats.best_trade),
      change: '+',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Worst Trade',
      value: formatCurrency(Math.abs(stats.worst_trade)),
      change: '-',
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'Avg Trade Size',
      value: formatCurrency(stats.avg_trade_size),
      change: '',
      icon: Award,
      color: 'text-purple-500',
    },
  ];

  const timeframeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Trading Analytics
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className={`px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {timeframeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.title}
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {metric.change}{metric.value}
                </p>
              </div>
              <metric.icon className={`w-8 h-8 ${metric.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Summary */}
        <Card className="p-6">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Trading Summary
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Volume Traded
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.total_volume)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Fees Paid
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(stats.total_fees)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Winning Trades
              </span>
              <span className="font-bold text-green-500">
                {stats.winning_trades}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Losing Trades
              </span>
              <span className="font-bold text-red-500">
                {stats.losing_trades}
              </span>
            </div>
          </div>
        </Card>

        {/* Performance Breakdown */}
        <Card className="p-6">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Performance Breakdown
          </h3>
          
          <div className="space-y-4">
            {/* Win Rate Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Win Rate
                </span>
                <span className={`text-sm font-bold ${
                  stats.win_rate >= 50 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatPercentage(stats.win_rate)}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`h-2 rounded-full ${
                    stats.win_rate >= 50 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.win_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Profit Factor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Profit Factor
                </span>
                <span className={`text-sm font-bold ${
                  stats.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {(Math.abs(stats.best_trade) / Math.abs(stats.worst_trade || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Risk/Reward Ratio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Risk/Reward
                </span>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  1:{((stats.best_trade / Math.abs(stats.worst_trade || 1)) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Trading Insights */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Trading Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-xl ${
            stats.win_rate >= 60 
              ? 'bg-green-500/10 border border-green-500/20' 
              : stats.win_rate >= 40
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Target className={`w-5 h-5 ${
                stats.win_rate >= 60 ? 'text-green-500' : 
                stats.win_rate >= 40 ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <h4 className={`font-semibold ${
                stats.win_rate >= 60 ? 'text-green-600 dark:text-green-400' : 
                stats.win_rate >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                Win Rate Analysis
              </h4>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {stats.win_rate >= 60 
                ? 'Excellent win rate! You\'re consistently profitable.'
                : stats.win_rate >= 40
                ? 'Good win rate. Focus on risk management.'
                : 'Consider reviewing your trading strategy.'
              }
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            stats.total_pnl >= 0 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className={`w-5 h-5 ${
                stats.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
              <h4 className={`font-semibold ${
                stats.total_pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                Profitability
              </h4>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {stats.total_pnl >= 0 
                ? 'You\'re in profit! Keep up the good work.'
                : 'Focus on cutting losses and letting profits run.'
              }
            </p>
          </div>

          <div className={`p-4 rounded-xl ${
            stats.total_trades >= 50 
              ? 'bg-blue-500/10 border border-blue-500/20' 
              : 'bg-gray-500/10 border border-gray-500/20'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className={`w-5 h-5 ${
                stats.total_trades >= 50 ? 'text-blue-500' : 'text-gray-500'
              }`} />
              <h4 className={`font-semibold ${
                stats.total_trades >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                Trading Activity
              </h4>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {stats.total_trades >= 50 
                ? 'Good trading activity. You have enough data for analysis.'
                : 'Consider more trades to build a reliable track record.'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradingAnalytics;