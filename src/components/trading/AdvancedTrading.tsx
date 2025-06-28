import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, DollarSign } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Position, Order } from '../../types/trading';

const AdvancedTrading: React.FC = () => {
  const { theme } = useThemeStore();
  const { wallets } = useAuthStore();
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [leverage, setLeverage] = useState(1);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableSymbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'LTC', 'BNB', 'SOL', 'DOGE', 'AVAX'];
  const leverageOptions = [1, 2, 3, 5, 10, 20, 50, 100];

  useEffect(() => {
    fetchPositions();
    fetchOrders();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await api.get('/trading/positions');
      setPositions(response.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/trading/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOpenPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const numAmount = parseFloat(amount);
      const numPrice = orderType === 'market' ? undefined : parseFloat(price);
      const numStopLoss = stopLoss ? parseFloat(stopLoss) : undefined;
      const numTakeProfit = takeProfit ? parseFloat(takeProfit) : undefined;

      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (orderType !== 'market' && (!numPrice || numPrice <= 0)) {
        setError('Please enter a valid price');
        return;
      }

      await api.post('/trading/position', {
        symbol: selectedSymbol,
        type: positionType,
        amount: numAmount,
        price: numPrice,
        leverage,
        stop_loss: numStopLoss,
        take_profit: numTakeProfit,
        order_type: orderType,
      });

      setSuccess(`${positionType.toUpperCase()} position opened successfully`);
      setAmount('');
      setPrice('');
      setStopLoss('');
      setTakeProfit('');
      
      await fetchPositions();
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to open position');
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      await api.post(`/trading/position/${positionId}/close`);
      setSuccess('Position closed successfully');
      await fetchPositions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close position');
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.delete(`/trading/order/${orderId}`);
      setSuccess('Order cancelled successfully');
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const calculateMargin = () => {
    const numAmount = parseFloat(amount) || 0;
    const numPrice = parseFloat(price) || 45000; // Default BTC price
    return (numAmount * numPrice) / leverage;
  };

  const calculatePnL = (position: Position) => {
    const priceDiff = position.current_price - position.entry_price;
    const multiplier = position.type === 'long' ? 1 : -1;
    return (priceDiff * position.size * multiplier * position.leverage);
  };

  const usdWallet = wallets.find(w => w.currency === 'USD');
  const availableMargin = usdWallet?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Position Opening Form */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Target className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Advanced Trading
          </h2>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-xl mb-6 ${
            success 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleOpenPosition} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symbol Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Trading Pair
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableSymbols.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}/USD
                  </option>
                ))}
              </select>
            </div>

            {/* Position Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Position Type
              </label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={() => setPositionType('long')}
                  variant={positionType === 'long' ? 'success' : 'ghost'}
                  className="flex-1"
                  icon={TrendingUp}
                >
                  Long
                </Button>
                <Button
                  type="button"
                  onClick={() => setPositionType('short')}
                  variant={positionType === 'short' ? 'danger' : 'ghost'}
                  className="flex-1"
                  icon={TrendingDown}
                >
                  Short
                </Button>
              </div>
            </div>

            {/* Order Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as any)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="market">Market Order</option>
                <option value="limit">Limit Order</option>
                <option value="stop">Stop Order</option>
              </select>
            </div>

            {/* Leverage */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Leverage: {leverage}x
              </label>
              <div className="flex flex-wrap gap-2">
                {leverageOptions.map((lev) => (
                  <Button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(lev)}
                    variant={leverage === lev ? 'primary' : 'ghost'}
                    size="sm"
                    className="text-xs"
                  >
                    {lev}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <Input
              label={`Amount (${selectedSymbol})`}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00000000"
              step="0.00000001"
            />

            {/* Price (for limit orders) */}
            {orderType !== 'market' && (
              <Input
                label="Price (USD)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            )}

            {/* Stop Loss */}
            <Input
              label="Stop Loss (Optional)"
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />

            {/* Take Profit */}
            <Input
              label="Take Profit (Optional)"
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          {/* Position Summary */}
          <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Required Margin:
                </span>
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${calculateMargin().toFixed(2)}
                </div>
              </div>
              <div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available Margin:
                </span>
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${availableMargin.toFixed(2)}
                </div>
              </div>
              <div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Leverage:
                </span>
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {leverage}x
                </div>
              </div>
              <div>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Position Size:
                </span>
                <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {amount || '0'} {selectedSymbol}
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant={positionType === 'long' ? 'success' : 'danger'}
            className="w-full"
            size="lg"
            loading={loading}
            icon={positionType === 'long' ? TrendingUp : TrendingDown}
            disabled={calculateMargin() > availableMargin}
          >
            Open {positionType.toUpperCase()} Position
          </Button>
        </form>
      </Card>

      {/* Open Positions */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Open Positions
        </h3>
        
        {positions.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No open positions
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Symbol
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Type
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Size
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Entry Price
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Current Price
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    PnL
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {positions.map((position) => {
                  const pnl = calculatePnL(position);
                  return (
                    <tr key={position.id}>
                      <td className={`px-4 py-4 whitespace-nowrap font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {position.symbol}/USD
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          position.type === 'long'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {position.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {position.size.toFixed(8)}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        ${position.entry_price.toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        ${position.current_price.toFixed(2)}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap font-medium ${
                        pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${pnl.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => closePosition(position.id)}
                          variant="danger"
                          size="sm"
                        >
                          Close
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Open Orders */}
      <Card className="p-6">
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
          Open Orders
        </h3>
        
        {orders.filter(o => o.status === 'pending').length === 0 ? (
          <div className="text-center py-8">
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No open orders
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Symbol
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Type
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Side
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Amount
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Price
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  } uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {orders.filter(o => o.status === 'pending').map((order) => (
                  <tr key={order.id}>
                    <td className={`px-4 py-4 whitespace-nowrap font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {order.symbol}/USD
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {order.type.toUpperCase()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.side === 'buy'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {order.amount.toFixed(8)}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {order.price ? `$${order.price.toFixed(2)}` : 'Market'}
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Button
                        onClick={() => cancelOrder(order.id)}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdvancedTrading;