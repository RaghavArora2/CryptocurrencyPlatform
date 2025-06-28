import React, { useState } from 'react';
import { ArrowDownUp, TrendingUp, TrendingDown, Calculator, Zap, DollarSign, Coins } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { useToast } from '../hooks/useToast';
import api from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

const TradeForm: React.FC = () => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('45000');
  const [crypto, setCrypto] = useState<string>('BTC');
  const [loading, setLoading] = useState(false);
  const { wallets, fetchWallets } = useAuthStore();
  const { theme } = useThemeStore();
  const { success, error } = useToast();

  const availableCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: 45000, icon: '₿', color: 'from-orange-500 to-orange-600' },
    { symbol: 'ETH', name: 'Ethereum', price: 3000, icon: 'Ξ', color: 'from-purple-500 to-purple-600' },
    { symbol: 'ADA', name: 'Cardano', price: 0.5, icon: '₳', color: 'from-blue-500 to-blue-600' },
    { symbol: 'DOT', name: 'Polkadot', price: 7, icon: '●', color: 'from-pink-500 to-pink-600' },
    { symbol: 'LINK', name: 'Chainlink', price: 15, icon: '🔗', color: 'from-blue-600 to-blue-700' },
    { symbol: 'LTC', name: 'Litecoin', price: 100, icon: 'Ł', color: 'from-gray-500 to-gray-600' },
    { symbol: 'BNB', name: 'Binance Coin', price: 300, icon: '🟡', color: 'from-yellow-500 to-yellow-600' },
    { symbol: 'SOL', name: 'Solana', price: 100, icon: '◎', color: 'from-purple-600 to-purple-700' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.08, icon: '🐕', color: 'from-yellow-400 to-yellow-500' },
    { symbol: 'AVAX', name: 'Avalanche', price: 35, icon: '🔺', color: 'from-red-500 to-red-600' },
  ];

  const selectedCrypto = availableCryptos.find(c => c.symbol === crypto);
  const usdWallet = wallets.find(w => w.currency === 'USD');
  const cryptoWallet = wallets.find(w => w.currency === crypto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      const numPrice = parseFloat(price);

      if (isNaN(numAmount) || numAmount <= 0) {
        error('Invalid Amount', 'Please enter a valid amount');
        return;
      }

      if (isNaN(numPrice) || numPrice <= 0) {
        error('Invalid Price', 'Please enter a valid price');
        return;
      }

      await api.post('/trading/order', {
        symbol: crypto,
        side: tradeType,
        amount: numAmount,
        price: numPrice,
      });

      setAmount('');
      success(
        'Trade Executed Successfully! 🎉', 
        `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${numAmount} ${crypto} at $${numPrice.toLocaleString()}`
      );
      
      // Refresh wallets
      await fetchWallets();
    } catch (err: any) {
      error('Trade Failed', err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = () => {
    if (tradeType === 'buy') {
      const maxBuy = usdWallet ? usdWallet.balance / parseFloat(price) : 0;
      setAmount(maxBuy.toFixed(8));
    } else {
      const maxSell = cryptoWallet ? cryptoWallet.balance : 0;
      setAmount(maxSell.toString());
    }
  };

  const totalValue = (parseFloat(amount) || 0) * (parseFloat(price) || 0);
  const fee = totalValue * 0.001; // 0.1% fee
  const finalTotal = tradeType === 'buy' ? totalValue + fee : totalValue - fee;

  const quickAmounts = ['0.001', '0.01', '0.1', '1'];

  return (
    <Card className="p-6" variant="elevated" glow>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          Quick Trade
        </h2>
        <Button
          onClick={() => setTradeType(tradeType === 'buy' ? 'sell' : 'buy')}
          variant="ghost"
          size="sm"
          icon={ArrowDownUp}
          className="animate-pulse"
        />
      </div>

      {/* Enhanced Trade Type Selector */}
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => setTradeType('buy')}
          variant={tradeType === 'buy' ? 'success' : 'ghost'}
          className="flex-1 relative overflow-hidden"
          icon={TrendingUp}
          size="lg"
        >
          <span className="relative z-10">Buy</span>
          {tradeType === 'buy' && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-700/20 animate-pulse"></div>
          )}
        </Button>
        <Button
          onClick={() => setTradeType('sell')}
          variant={tradeType === 'sell' ? 'danger' : 'ghost'}
          className="flex-1 relative overflow-hidden"
          icon={TrendingDown}
          size="lg"
        >
          <span className="relative z-10">Sell</span>
          {tradeType === 'sell' && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-700/20 animate-pulse"></div>
          )}
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enhanced Cryptocurrency Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableCryptos.slice(0, 6).map((c) => (
              <button
                key={c.symbol}
                type="button"
                onClick={() => {
                  setCrypto(c.symbol);
                  setPrice(c.price.toString());
                }}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  crypto === c.symbol
                    ? `border-blue-500 bg-gradient-to-r ${c.color} text-white shadow-lg`
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${crypto === c.symbol ? 'animate-bounce' : ''}`}>
                    {c.icon}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${
                      crypto === c.symbol ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {c.symbol}
                    </div>
                    <div className={`text-xs ${
                      crypto === c.symbol ? 'text-white/80' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      ${c.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount ({crypto})
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Available: {tradeType === 'buy' 
                  ? `$${(usdWallet?.balance || 0).toLocaleString()}` 
                  : `${(cryptoWallet?.balance || 0).toFixed(6)} ${crypto}`
                }
              </span>
              <Button
                type="button"
                onClick={maxAmount}
                variant="ghost"
                size="xs"
                className="text-xs px-2 py-1 hover:bg-blue-500/10 hover:text-blue-500"
              >
                Max
              </Button>
            </div>
          </div>
          
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            step="0.00000001"
            icon={Coins}
            variant="filled"
            inputSize="lg"
          />
          
          {/* Quick Amount Buttons */}
          <div className="flex space-x-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                variant="outline"
                size="xs"
                className="flex-1 text-xs"
              >
                {quickAmount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Enhanced Price Input */}
        <div>
          <Input
            label={`Price (USD) - Market: $${selectedCrypto?.price.toLocaleString()}`}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            icon={DollarSign}
            variant="filled"
            inputSize="lg"
          />
        </div>

        {/* Enhanced Trade Summary */}
        <Card className={`p-5 ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50/50'
        }`} variant="filled">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 mr-2 text-blue-500" />
            <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Trade Summary
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Subtotal:
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${totalValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Trading Fee (0.1%):
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${fee.toFixed(2)}
              </span>
            </div>
            
            <div className={`flex justify-between items-center pt-3 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Total {tradeType === 'buy' ? 'Cost' : 'Received'}:
              </span>
              <span className={`font-bold text-xl ${
                finalTotal > 0 ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Button
          type="submit"
          variant={tradeType === 'buy' ? 'success' : 'danger'}
          className="w-full relative overflow-hidden"
          size="xl"
          loading={loading}
          icon={tradeType === 'buy' ? TrendingUp : TrendingDown}
        >
          <span className="relative z-10">
            {tradeType === 'buy' ? 'Buy' : 'Sell'} {crypto}
          </span>
          {!loading && (
            <div className={`absolute inset-0 bg-gradient-to-r ${
              tradeType === 'buy' 
                ? 'from-green-600/20 to-green-700/20' 
                : 'from-red-600/20 to-red-700/20'
            } animate-pulse`}></div>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default TradeForm;