import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard, History } from 'lucide-react';

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
    { type: 'deposit', amount: 1000, date: '2024-03-15 14:30' },
    { type: 'withdraw', amount: 500, date: '2024-03-14 09:15' },
    { type: 'deposit', amount: 2500, date: '2024-03-13 16:45' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balance Overview */}
          <div className="lg:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8`}>
              <div className="flex items-center space-x-3 mb-6">
                <Wallet className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Your Wallet
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Available Balance
                  </div>
                  <div className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${user?.balance.usd.toLocaleString()}
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    BTC Value
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.balance.btc.toFixed(8)} BTC
                  </div>
                  <div className="text-sm text-gray-500">
                    ${(user?.balance.btc * 45000).toLocaleString()}
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    ETH Value
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user?.balance.eth.toFixed(8)} ETH
                  </div>
                  <div className="text-sm text-gray-500">
                    ${(user?.balance.eth * 3000).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center space-x-3 mb-6">
                <History className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Transactions
                </h3>
              </div>

              <div className="space-y-4">
                {mockTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-purple-500/10 text-purple-500'
                      }`}>
                        {transaction.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.date}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'deposit'
                        ? 'text-blue-500'
                        : 'text-purple-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deposit/Withdraw Form */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 h-fit`}>
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Manage Funds
              </h3>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setTransactionType('deposit')}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  transactionType === 'deposit'
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit</span>
              </button>
              
              <button
                onClick={() => setTransactionType('withdraw')}
                className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  transactionType === 'withdraw'
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </button>
            </div>

            {(error || success) && (
              <div className={`p-4 rounded-lg mb-4 ${
                error 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'bg-green-500/10 text-green-500'
              }`}>
                {error || success}
              </div>
            )}

            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`pl-10 block w-full rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
              >
                {transactionType === 'deposit' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                <span>{transactionType === 'deposit' ? 'Deposit' : 'Withdraw'} USD</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;