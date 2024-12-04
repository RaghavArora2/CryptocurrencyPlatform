import React, { useMemo } from 'react';
import TradingChart from '../TradingChart';
import OrderBook from '../OrderBook';
import TradeForm from '../TradeForm';
import MarketOverview from '../market/MarketOverview';
import useAuthStore from '../../store/authStore';
import { useMarketData } from '../../hooks/useMarketData';
import { generateChartData, formatCurrency, calculatePortfolioValue } from '../../utils/chartUtils';
import useThemeStore from '../../store/themeStore';

const TradingView: React.FC = () => {
  const { theme } = useThemeStore();
  const { assets, loading } = useMarketData();
  const user = useAuthStore(state => state.user);

  const chartData = useMemo(() => generateChartData(), []);
  const portfolioValue = useMemo(() => 
    user ? calculatePortfolioValue(user.balance.btc, user.balance.eth, user.balance.usd) : 0,
  [user?.balance.btc, user?.balance.eth, user?.balance.usd]);

  const sampleOrderBook = useMemo(() => ({
    bids: Array.from({ length: 10 }, (_, i) => ({
      price: 40000 - i * 50,
      amount: Math.random() * 2,
    })),
    asks: Array.from({ length: 10 }, (_, i) => ({
      price: 40000 + (i + 1) * 50,
      amount: Math.random() * 2,
    })),
  }), []);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <TradingChart data={chartData} />
          </div>
          <MarketOverview assets={assets} />
        </div>
        
        <div className="space-y-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Your Portfolio
            </h2>
            <div className="mb-4">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Value
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {formatCurrency(portfolioValue)}
              </div>
            </div>
            <div className="space-y-3">
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>USD Balance:</span>
                <span className="font-medium">{formatCurrency(user.balance.usd)}</span>
              </div>
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>BTC Holdings:</span>
                <div className="text-right">
                  <div className="font-medium">{user.balance.btc.toFixed(8)} BTC</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(user.balance.btc * 45000)}
                  </div>
                </div>
              </div>
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>ETH Holdings:</span>
                <div className="text-right">
                  <div className="font-medium">{user.balance.eth.toFixed(8)} ETH</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(user.balance.eth * 3000)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <TradeForm />
          <OrderBook orderBook={sampleOrderBook} />
        </div>
      </div>
    </main>
  );
};

export default TradingView;