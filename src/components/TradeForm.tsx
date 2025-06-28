import React, { useState } from 'react';
import { ArrowDownUp, TrendingUp, TrendingDown, Calculator, Zap } from 'lucide-react';
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
    { symbol: 'BTC', name: 'Bitcoin', price: 45000, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', price: 3000, icon: 'Ξ' },
    { symbol: 'ADA', name: 'Cardano', price: 0.5, icon: '₳' },
    { symbol: 'DOT', name: 'Polkadot', price: 7, icon: '●' },
    { symbol: 'LINK', name: 'Chainlink', price: 15, icon: '🔗' },
    { symbol: 'LTC', name: 'Litecoin', price: 100, icon: 'Ł' },
    { symbol: 'BNB', name: 'Binance Coin', price: 300, icon: '🟡' },
    { symbol: 'SOL', name: 'Solana', price: 100, icon: '◎' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.08, icon: '🐕' },
    { symbol: 'AVAX', name: 'Avalanche', price: 35, icon: '🔺' },
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
        'Trade Executed', 
        `Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${numAmount} ${crypto}`
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

  return (
    <Card className="p-6">
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
        />
      </div>

      {/* Trade Type Selector */}
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => setTradeType('buy')}
          variant={tradeType === 'buy' ? 'success' : 'ghost'}
          className="flex-1"
          icon={TrendingUp}
        >
          Buy
        </Button>
        <Button
          onClick={() => setTradeType('sell')}
          variant={tradeType === 'sell' ? 'danger' : 'ghost'}
          className="flex-1"
          icon={TrendingDown}
        >
          Sell
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cryptocurrency Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableCryptos.slice(0, 6).map((c) => (
              <button
                key={c.symbol}
                type="button"
                onClick={() => {
                  setCrypto(c.symbol);
                  setPrice(c.price.toString());
                }}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  crypto === c.symbol
                    ? 'border-blue-500 bg-blue-500/10'
                    : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{c.icon}</span>
                  <div className="text-left">
                    <div className={`font-semibold text-sm ${
                      crypto === c.symbol ? 'text-blue-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {c.symbol}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${c.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
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
                size="sm"
                className="text-xs px-2 py-1"
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
          />
        </div>
        
        {/* Price Input */}
        <Input
          label={`Price (USD) - Current: $${selectedCrypto?.price.toLocaleString()}`}
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />

        {/* Trade Summary */}
        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex items-center mb-3">
            <Calculator className="w-4 h-4 mr-2 text-blue-500" />
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Trade Summary
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Subtotal:
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${totalValue.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Trading Fee (0.1%):
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${fee.toFixed(2)}
              </span>
            </div>
            
            <div className={`flex justify-between pt-2 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Total:
              </span>
              <span className={`font-bold text-lg ${
                finalTotal > 0 ? 'text-blue-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant={tradeType === 'buy' ? 'success' : 'danger'}
          className="w-full"
          size="lg"
          loading={loading}
          icon={tradeType === 'buy' ? TrendingUp : TrendingDown}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {crypto}
        </Button>
      </form>
    </Card>
  );
};

export default TradeForm;