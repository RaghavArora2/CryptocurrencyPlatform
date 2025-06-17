import React from 'react';
import { OrderBook as OrderBookType, OrderBookEntry } from '../types/crypto';
import useThemeStore from '../store/themeStore';
import { formatNumber } from '../utils/formatters';
import Card from './ui/Card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface OrderBookProps {
  orderBook: OrderBookType;
}

const OrderBookRow: React.FC<{ 
  entry: OrderBookEntry; 
  type: 'bid' | 'ask';
  maxVolume: number;
}> = ({ entry, type, maxVolume }) => {
  const { theme } = useThemeStore();
  const volumePercentage = (entry.amount / maxVolume) * 100;
  
  return (
    <div className="relative group">
      <div 
        className={`absolute top-0 bottom-0 transition-all duration-300 ${
          type === 'bid' 
            ? 'right-0 bg-green-500/10 group-hover:bg-green-500/20' 
            : 'left-0 bg-red-500/10 group-hover:bg-red-500/20'
        }`} 
        style={{ width: `${volumePercentage}%` }} 
      />
      <div className={`relative grid grid-cols-3 py-2 px-3 text-sm transition-colors duration-200 ${
        theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
      } ${
        type === 'bid' 
          ? 'text-green-500' 
          : 'text-red-500'
      }`}>
        <span className="text-right pr-4 font-mono">${formatNumber(entry.price, 2)}</span>
        <span className="text-right pr-4 font-mono">{formatNumber(entry.amount, 4)}</span>
        <span className="text-right font-mono">${formatNumber(entry.amount * entry.price, 2)}</span>
      </div>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ orderBook }) => {
  const { theme } = useThemeStore();
  
  const maxVolume = Math.max(
    ...orderBook.asks.map(ask => ask.amount),
    ...orderBook.bids.map(bid => bid.amount)
  );

  const totalBidVolume = orderBook.bids.reduce((sum, bid) => sum + (bid.amount * bid.price), 0);
  const totalAskVolume = orderBook.asks.reduce((sum, ask) => sum + (ask.amount * ask.price), 0);
  const spread = orderBook.asks[0].price - orderBook.bids[0].price;
  const spreadPercentage = (spread / orderBook.bids[0].price) * 100;
  
  return (
    <Card className="overflow-hidden">
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } flex items-center`}>
            <BarChart3 className="w-5 h-5 mr-2" />
            Order Book
          </h2>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            BTC/USD
          </div>
        </div>
        
        {/* Spread Info */}
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Spread
            </span>
            <div className="text-right">
              <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${formatNumber(spread, 2)}
              </div>
              <div className="text-xs text-orange-500">
                {formatNumber(spreadPercentage, 3)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-3 text-xs font-medium py-3 px-3 ${
        theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-50'
      }`}>
        <span className="text-right pr-4">Price (USD)</span>
        <span className="text-right pr-4">Amount (BTC)</span>
        <span className="text-right">Total (USD)</span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Asks (Sell Orders) */}
        <div className="space-y-0">
          <div className={`px-3 py-2 text-xs font-medium flex items-center justify-between ${
            theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
          }`}>
            <div className="flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              <span>Sell Orders</span>
            </div>
            <span>${formatNumber(totalAskVolume, 0)}</span>
          </div>
          {orderBook.asks.slice(0, 12).reverse().map((ask, i) => (
            <OrderBookRow key={`ask-${i}`} entry={ask} type="ask" maxVolume={maxVolume} />
          ))}
        </div>

        {/* Current Price */}
        <div className={`border-t border-b py-4 px-3 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${formatNumber((orderBook.asks[0].price + orderBook.bids[0].price) / 2, 2)}
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Last Price
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0">
          <div className={`px-3 py-2 text-xs font-medium flex items-center justify-between ${
            theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
          }`}>
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Buy Orders</span>
            </div>
            <span>${formatNumber(totalBidVolume, 0)}</span>
          </div>
          {orderBook.bids.slice(0, 12).map((bid, i) => (
            <OrderBookRow key={`bid-${i}`} entry={bid} type="bid" maxVolume={maxVolume} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Bids
            </div>
            <div className="text-sm font-bold text-green-500">
              ${formatNumber(totalBidVolume / 1000, 0)}K
            </div>
          </div>
          <div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Asks
            </div>
            <div className="text-sm font-bold text-red-500">
              ${formatNumber(totalAskVolume / 1000, 0)}K
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderBook;