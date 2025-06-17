import React, { useMemo } from 'react';
import TradingChart from '../TradingChart';
import OrderBook from '../OrderBook';
import TradeForm from '../TradeForm';
import MarketOverview from '../market/MarketOverview';
import useAuthStore from '../../store/authStore';
import { useMarketData } from '../../hooks/useMarketData';
import { generateChartData, formatCurrency, calculatePortfolioValue } from '../../utils/chartUtils';
import useThemeStore from '../../store/themeStore';
import Card from '../ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins } from 'lucide-react';

const TradingView: React.FC = () => {
  const { theme } = useThemeStore();
  const { assets, loading } = useMarketData();
  const user = useAuthStore(state => state.user);

  const chartData = useMemo(() => generateChartData(), []);
  const portfolioValue = useMemo(() => 
    user ? calculatePortfolioValue(user.balance.btc, user.balance.eth, user.balance.usd) : 0,
  [user?.balance.btc, user?.balance.eth, user?.balance.usd]);

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

  const portfolioChange = portfolioValue > 10000 ? 12.5 : -5.2;

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card gradient className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Portfolio
                </p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatCurrency(portfolioValue)}
                </p>
                <div className={`flex items-center mt-1 ${
                  portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {portfolioChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(portfolioChange)}%
                  </span>
                </div>
              </div>
              <DollarSign className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  USD Balance
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(user.balance.usd)}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Available for trading
                </p>
              </div>
              <DollarSign className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  BTC Holdings
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.balance.btc.toFixed(8)}
                </p>
                <p className="text-xs text-orange-500">
                  {formatCurrency(user.balance.btc * 45000)}
                </p>
              </div>
              <Bitcoin className="w-6 h-6 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  ETH Holdings
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user.balance.eth.toFixed(8)}
                </p>
                <p className="text-xs text-purple-500">
                  {formatCurrency(user.balance.eth * 3000)}
                </p>
              </div>
              <Coins className="w-6 h-6 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Trading Chart */}
            <Card className="p-6">
              <TradingChart data={chartData} />
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