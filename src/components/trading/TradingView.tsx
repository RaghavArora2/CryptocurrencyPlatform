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
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins, PieChart, Activity } from 'lucide-react';

const TradingView: React.FC = () => {
  const { theme } = useThemeStore();
  const { assets, loading } = useMarketData();
  const { user, wallets } = useAuthStore();

  const portfolioValue = useMemo(() => {
    if (!wallets.length) return 0;
    
    let total = 0;
    wallets.forEach(wallet => {
      if (wallet.currency === 'USD') {
        total += wallet.balance;
      } else {
        const asset = assets.find(a => a.symbol === wallet.currency);
        if (asset) {
          total += wallet.balance * asset.current_price;
        }
      }
    });
    return total;
  }, [wallets, assets]);

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

  const usdWallet = wallets.find(w => w.currency === 'USD');
  const btcWallet = wallets.find(w => w.currency === 'BTC');
  const ethWallet = wallets.find(w => w.currency === 'ETH');
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
              <PieChart className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  USD Balance
                </p>
                <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(usdWallet?.balance || 0)}
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
                  {(btcWallet?.balance || 0).toFixed(8)}
                </p>
                <p className="text-xs text-orange-500">
                  {formatCurrency((btcWallet?.balance || 0) * (assets.find(a => a.symbol === 'BTC')?.current_price || 0))}
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
                  {(ethWallet?.balance || 0).toFixed(8)}
                </p>
                <p className="text-xs text-purple-500">
                  {formatCurrency((ethWallet?.balance || 0) * (assets.find(a => a.symbol === 'ETH')?.current_price || 0))}
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