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
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins, PieChart, Activity, Wallet, Target, BarChart3 } from 'lucide-react';

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

    // Calculate percentages
    holdings.forEach(holding => {
      holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    });

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
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                Welcome back, {user.username}! 👋
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Here's your trading dashboard overview
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    Markets Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Portfolio */}
          <Card gradient className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <PieChart className="w-6 h-6 text-blue-500" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  portfolioChange >= 0 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {portfolioChange >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(portfolioChange)}%</span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  Total Portfolio
                </p>
                <p className="text-3xl font-bold text-blue-500 mb-2">
                  {formatCurrency(portfolioData.totalValue)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  24h change: {portfolioChange >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalValue * (portfolioChange / 100))}
                </p>
              </div>
            </div>
          </Card>

          {/* USD Balance */}
          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Ready for trading
                </p>
              </div>
            </div>
          </Card>

          {/* Crypto Holdings */}
          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <Coins className="w-6 h-6 text-purple-500" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  portfolioData.holdings.length > 0 
                    ? 'bg-purple-500/10 text-purple-500' 
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
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {portfolioData.totalValue > 0 ? ((portfolioData.cryptoValue / portfolioData.totalValue) * 100).toFixed(1) : 0}% of portfolio
                </p>
              </div>
            </div>
          </Card>

          {/* Top Holding */}
          <Card className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8"></div>
            <div className="relative">
              {portfolioData.holdings.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                      <Target className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                      Top Asset
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      {portfolioData.holdings[0].currency}
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {formatCurrency(portfolioData.holdings[0].value)}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {portfolioData.holdings[0].balance.toFixed(8)} {portfolioData.holdings[0].currency}
                    </p>
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

        {/* Portfolio Breakdown */}
        {portfolioData.holdings.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Portfolio Breakdown
              </h3>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {portfolioData.holdings.length} active positions
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioData.holdings.map((holding, index) => (
                <div
                  key={holding.currency}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0 ? 'bg-orange-500 text-white' :
                        index === 1 ? 'bg-purple-500 text-white' :
                        'bg-blue-500 text-white'
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
                  
                  <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-orange-500' :
                        index === 1 ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${holding.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Trading Chart */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Activity className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Price Charts
                </h2>
              </div>
              <TradingChart />
            </Card>
            
            {/* Market Overview */}
            <MarketOverview assets={assets} />
          </div>
          
          <div className="space-y-6">
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