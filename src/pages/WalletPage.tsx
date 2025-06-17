import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  CreditCard, 
  History,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Coins,
  PieChart,
  Target
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const WalletPage: React.FC = () => {
  const { user, updateBalance } = useAuthStore();
  const { theme } = useThemeStore();
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transactionType === 'withdraw' && numAmount > user!.balance.usd) {
      setError('Insufficient balance');
      return;
    }

    try {
      if (transactionType === 'deposit') {
        updateBalance('buy', numAmount, 1, 'usd');
      } else {
        updateBalance('sell', numAmount, 1, 'usd');
      }
      
      setSuccess(`Successfully ${transactionType}ed $${numAmount.toFixed(2)}`);
      setAmount('');
    } catch (err) {
      setError('Transaction failed. Please try again.');
    }
  };

  const mockTransactions = [
    { type: 'deposit', amount: 1000, date: '2024-03-15 14:30', status: 'completed', id: 'TXN001' },
    { type: 'withdraw', amount: 500, date: '2024-03-14 09:15', status: 'completed', id: 'TXN002' },
    { type: 'deposit', amount: 2500, date: '2024-03-13 16:45', status: 'completed', id: 'TXN003' },
    { type: 'trade', amount: 1200, date: '2024-03-12 11:20', status: 'completed', id: 'TXN004', crypto: 'BTC' },
    { type: 'trade', amount: 800, date: '2024-03-11 08:30', status: 'completed', id: 'TXN005', crypto: 'ETH' },
  ];

  const totalPortfolioValue = user ? 
    user.balance.usd + (user.balance.btc * 45000) + (user.balance.eth * 3000) : 0;

  const portfolioAllocation = user ? [
    { name: 'USD', value: user.balance.usd, percentage: (user.balance.usd / totalPortfolioValue) * 100, color: 'bg-blue-500' },
    { name: 'BTC', value: user.balance.btc * 45000, percentage: ((user.balance.btc * 45000) / totalPortfolioValue) * 100, color: 'bg-orange-500' },
    { name: 'ETH', value: user.balance.eth * 3000, percentage: ((user.balance.eth * 3000) / totalPortfolioValue) * 100, color: 'bg-purple-500' },
  ] : [];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            Wallet Overview
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your funds and track your portfolio performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card gradient className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Portfolio
                    </p>
                    <p className="text-3xl font-bold text-blue-500">
                      ${totalPortfolioValue.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-green-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">+12.5%</span>
                    </div>
                  </div>
                  <PieChart className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Available Cash
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${user?.balance.usd.toLocaleString()}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Ready for trading
                    </p>
                  </div>
                  <DollarSign className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Crypto Value
                    </p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${((user?.balance.btc || 0) * 45000 + (user?.balance.eth || 0) * 3000).toLocaleString()}
                    </p>
                    <div className="flex items-center mt-1 text-green-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-xs">+8.2%</span>
                    </div>
                  </div>
                  <Coins className="w-6 h-6 text-purple-500" />
                </div>
              </Card>
            </div>

            {/* Portfolio Allocation */}
            <Card className="p-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                <Target className="w-6 h-6 mr-2 text-blue-500" />
                Portfolio Allocation
              </h3>
              
              <div className="space-y-4">
                {portfolioAllocation.map((asset, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${asset.color}`}></div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {asset.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${asset.value.toLocaleString()}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {asset.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-2 rounded-full ${asset.color}`}
                        style={{ width: `${asset.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Holdings Details */}
            <Card className="p-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
                Holdings Details
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Bitcoin className="w-8 h-8 text-orange-500" />
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Bitcoin (BTC)
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user?.balance.btc.toFixed(8)} BTC
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${((user?.balance.btc || 0) * 45000).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-500">+5.2%</div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Coins className="w-8 h-8 text-purple-500" />
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Ethereum (ETH)
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user?.balance.eth.toFixed(8)} ETH
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${((user?.balance.eth || 0) * 3000).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-500">+3.8%</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Transaction History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <History className="w-6 h-6 mr-2 text-blue-500" />
                  Recent Transactions
                </h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {mockTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit'
                          ? 'bg-blue-500/10 text-blue-500'
                          : transaction.type === 'withdraw'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : transaction.type === 'withdraw' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <TrendingUp className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.type === 'deposit' ? 'Deposit' : 
                           transaction.type === 'withdraw' ? 'Withdrawal' : 
                           `${transaction.crypto} Trade`}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.date} • {transaction.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'deposit'
                          ? 'text-blue-500'
                          : transaction.type === 'withdraw'
                          ? 'text-purple-500'
                          : 'text-green-500'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : transaction.type === 'withdraw' ? '-' : '+'}
                        ${transaction.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Deposit/Withdraw Form */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Manage Funds
                </h3>
              </div>

              <div className="flex space-x-2 mb-6">
                <Button
                  onClick={() => setTransactionType('deposit')}
                  variant={transactionType === 'deposit' ? 'primary' : 'ghost'}
                  className="flex-1"
                  icon={ArrowDownLeft}
                >
                  Deposit
                </Button>
                
                <Button
                  onClick={() => setTransactionType('withdraw')}
                  variant={transactionType === 'withdraw' ? 'primary' : 'ghost'}
                  className="flex-1"
                  icon={ArrowUpRight}
                >
                  Withdraw
                </Button>
              </div>

              {(error || success) && (
                <div className={`p-4 rounded-xl mb-4 ${
                  error 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                }`}>
                  {error || success}
                </div>
              )}

              <form onSubmit={handleTransaction} className="space-y-6">
                <Input
                  label="Amount (USD)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  icon={DollarSign}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  icon={transactionType === 'deposit' ? ArrowDownLeft : ArrowUpRight}
                >
                  {transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} Funds
                </Button>
              </form>

              <div className={`mt-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Quick Actions
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {['$100', '$500', '$1000'].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setAmount(amount.slice(1))}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Today's P&L
                  </span>
                  <span className="font-bold text-green-500">+$234.56</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Week
                  </span>
                  <span className="font-bold text-green-500">+$1,234.56</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Month
                  </span>
                  <span className="font-bold text-green-500">+$3,456.78</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    All Time
                  </span>
                  <span className="font-bold text-green-500">+$12,345.67</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;