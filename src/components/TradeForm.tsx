import React, { useState } from 'react';
import { ArrowDownUp, TrendingUp, TrendingDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import api from '../services/api';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

const TradeForm: React.FC = () => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('45000');
  const [crypto, setCrypto] = useState<string>('BTC');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { wallets, fetchWallets } = useAuthStore();
  const { theme } = useThemeStore();

  const availableCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: 45000 },
    { symbol: 'ETH', name: 'Ethereum', price: 3000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.5 },
    { symbol: 'DOT', name: 'Polkadot', price: 7 },
    { symbol: 'LINK', name: 'Chainlink', price: 15 },
    { symbol: 'LTC', name: 'Litecoin', price: 100 },
    { symbol: 'BNB', name: 'Binance Coin', price: 300 },
    { symbol: 'SOL', name: 'Solana', price: 100 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.08 },
    { symbol: 'AVAX', name: 'Avalanche', price: 35 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      const numPrice = parseFloat(price);

      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (isNaN(numPrice) || numPrice <= 0) {
        setError('Please enter a valid price');
        return;
      }

      await api.post('/trading/order', {
        symbol: crypto,
        side: tradeType,
        amount: numAmount,
        price: numPrice,
      });

      setAmount('');
      setSuccess(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${numAmount} ${crypto}`);
      
      // Refresh wallets
      await fetchWallets();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = () => {
    if (tradeType === 'buy') {
      const usdWallet = wallets.find(w => w.currency === 'USD');
      const maxBuy = usdWallet ? usdWallet.balance / parseFloat(price) : 0;
      setAmount(maxBuy.toFixed(8));
    } else {
      const cryptoWallet = wallets.find(w => w.currency === crypto);
      const maxSell = cryptoWallet ? cryptoWallet.balance : 0;
      setAmount(maxSell.toString());
    }
  };

  const totalValue = (parseFloat(amount) || 0) * (parseFloat(price) || 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Place Order
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
        {(error || success) && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            success 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {error || success}
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Cryptocurrency
          </label>
          <select
            value={crypto}
            onChange={(e) => {
              setCrypto(e.target.value);
              const selectedCrypto = availableCryptos.find(c => c.symbol === e.target.value);
              if (selectedCrypto) {
                setPrice(selectedCrypto.price.toString());
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {availableCryptos.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount ({crypto})
            </label>
            <Button
              type="button"
              onClick={maxAmount}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Max
            </Button>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            step="0.00000001"
          />
        </div>
        
        <Input
          label="Price (USD)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Value:
            </span>
            <span className={`font-bold text-lg ${
              totalValue > 0 ? 'text-green-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              ${totalValue.toFixed(2)}
            </span>
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