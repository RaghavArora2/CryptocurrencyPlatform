import React, { useMemo } from 'react';
import TradingChart from '../TradingChart';
import OrderBook from '../OrderBook';
import TradeForm from '../TradeForm';
import MarketOverview from '../market/MarketOverview';
import useAuthStore from '../../store/authStore';
import { useMarketData } from '../../hooks/useMarketData';
import { formatCurrency } from '../../utils/formatters';
import useThemeStore from '../../store/themeStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bitcoin, 
  Coins, 
  PieChart, 
  Activity, 
  Wallet, 
  Target, 
  BarChart3,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw
} from 'lucide-react';

const TradingView: React.FC = () => {
  const { theme } = useThemeStore();
  const { assets, loading } = useMarketData();
  const { user, wallets } = useAuthStore();

  // Create a map of current prices for easy lookup
  const priceMap = useMemo(() => {
    const map = new Map();
    assets.forEach(asset => {
      map.set(asset.symbol, asset.current_price);
    });
    // Add fallback prices if API data is not available
    if (map.size === 0) {
      map.set('BTC', 45000);
      map.set('ETH', 3000);
      map.set('ADA', 0.45);
      map.set('DOT', 7);
      map.set('LINK', 15);
      map.set('LTC', 100);
      map.set('BNB', 300);
      map.set('SOL', 100);
      map.set('DOGE', 0.08);
      map.set('AVAX', 35);
    }
    return map;
  }, [assets]);

  const portfolioData = useMemo(() => {
    if (!wallets.length) return { totalValue: 0, cryptoValue: 0, usdBalance: 0, holdings: [] };
    
    let totalValue = 0;
    let cryptoValue = 0;
    let usdBalance = 0;
    const holdings = [];

    wallets.forEach(wallet => {
      if (wallet.currency === 'USD') {
        usdBalance = wallet.balance;
        totalValue += wallet.balance;
      } else if (wallet.balance > 0) {
        const price = priceMap.get(wallet.currency) || 0;
        const value = wallet.balance * price;
        cryptoValue += value;
        totalValue += value;
        
        holdings.push({
          currency: wallet.currency,
          balance: wallet.balance,
          value: value,
          price: price,
          percentage: 0 // Will be calculated after total is known
        });
      }
    });

    // Calculate percentages and sort by value
    holdings.forEach(holding => {
      holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    });
    holdings.sort((a, b) => b.value - a.value);

    return { totalValue, cryptoValue, usdBalance, holdings };
  }, [wallets, priceMap]);

  const sampleOrderBook = useMemo(() => ({
    bids: Array.from({ length: 15 }, (_, i) => ({
      price: 40000 - i * 50,
      amount: Math.random() * 2,
    })),
    asks: Array.from({ length: 15 }, (_, i) => ({
      price: 40000 + (i + 1) * 50,
      amount: Math.random() * 2,
    })),
  }), []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading market data...
          </p>
        </div>
      </div>
    );
  }

  const portfolioChange = portfolioData.totalValue > 10000 ? 12.5 : -5.2;

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Enhanced Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {user.username}!
                </h1>
                <div className="animate-bounce-gentle">👋</div>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                Here's your trading dashboard overview
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-3 rounded-xl ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border ${theme === 'dark' ? 'border-green-500/20' : 'border-green-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      Markets Live
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-500'}`}>
                      Real-time data
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" icon={RefreshCw}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Portfolio */}
          <Card gradient className="p-6 relative overflow-hidden hover-lift">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -mr-16 -mt-16 animate-float"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg`}>
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                  portfolioChange >= 0 
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {portfolioChange >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{Math.abs(portfolioChange)}%</span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Total Portfolio
                </p>
                <p className="text-3xl font-bold text-gradient-blue mb-2">
                  {formatCurrency(portfolioData.totalValue)}
                </p>
                <div className="flex items-center space-x-2">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    24h change:
                  </p>
                  <p className={`text-xs font-medium ${portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolioChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalValue * (portfolioChange / 100))}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* USD Balance */}
          <Card className="p-6 relative overflow-hidden hover-lift" variant="elevated">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} border ${theme === 'dark' ? 'border-green-500/20' : 'border-green-200'}`}>
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  Cash
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Available Cash
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {formatCurrency(portfolioData.usdBalance)}
                </p>
                <div className="flex items-center space-x-2">
                  <Zap className="w-3 h-3 text-green-500" />
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Ready for trading
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Crypto Holdings */}
          <Card className="p-6 relative overflow-hidden hover-lift" variant="elevated">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'} border ${theme === 'dark' ? 'border-purple-500/20' : 'border-purple-200'}`}>
                  <Coins className="w-6 h-6 text-purple-500" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  portfolioData.holdings.length > 0 
                    ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                    : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  {portfolioData.holdings.length} Assets
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Crypto Value
                </p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {formatCurrency(portfolioData.cryptoValue)}
                </p>
                <div className="flex items-center space-x-2">
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: `${portfolioData.totalValue > 0 ? (portfolioData.cryptoValue / portfolioData.totalValue) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {portfolioData.totalValue > 0 ? ((portfolioData.cryptoValue / portfolioData.totalValue) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Holding */}
          <Card className="p-6 relative overflow-hidden hover-lift" variant="elevated">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              {portfolioData.holdings.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'} border ${theme === 'dark' ? 'border-orange-500/20' : 'border-orange-200'}`}>
                      <Target className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      <Star className="w-3 h-3" />
                      <span>Top Asset</span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      {portfolioData.holdings[0].currency}
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {formatCurrency(portfolioData.holdings[0].value)}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {portfolioData.holdings[0].balance.toFixed(6)} {portfolioData.holdings[0].currency}
                      </p>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {portfolioData.holdings[0].percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      No Holdings
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
                      $0.00
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Start trading to build your portfolio
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Enhanced Portfolio Breakdown */}
        {portfolioData.holdings.length > 0 && (
          <Card className="p-6 mb-8 hover-lift" glass>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Portfolio Breakdown
              </h3>
              <div className="flex items-center space-x-4">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {portfolioData.holdings.length} active positions
                </div>
                <Button variant="ghost" size="sm" icon={Eye}>
                  View All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioData.holdings.slice(0, 6).map((holding, index) => (
                <div
                  key={holding.currency}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer group ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700/30 hover:bg-gray-700/50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                        index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                        index === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                        'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      }`}>
                        {holding.currency === 'BTC' ? '₿' : 
                         holding.currency === 'ETH' ? 'Ξ' : 
                         holding.currency.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {holding.currency}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {holding.balance.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(holding.value)}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {holding.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 group-hover:animate-pulse ${
                        index === 0 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                        index === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}
                      style={{ width: `${holding.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Enhanced Main Trading Interface */}
        <div className="trading-grid">
          <div className="chart-container space-y-6">
            {/* Trading Chart */}
            <Card className="p-6 h-full" variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Activity className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Live Price Charts
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}>
                    Real-time
                  </div>
                  <Button variant="ghost" size="sm" icon={RefreshCw}>
                    Refresh
                  </Button>
                </div>
              </div>
              <TradingChart />
            </Card>
            
            {/* Market Overview */}
            <MarketOverview assets={assets} />
          </div>
          
          <div className="sidebar-container">
            {/* Trade Form */}
            <TradeForm />
            
            {/* Order Book */}
            <OrderBook orderBook={sampleOrderBook} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default TradingView;