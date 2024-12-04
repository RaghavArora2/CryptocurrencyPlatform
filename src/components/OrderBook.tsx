import React from 'react';
import { OrderBook as OrderBookType, OrderBookEntry } from '../types/crypto';
import useThemeStore from '../store/themeStore';
import { formatNumber } from '../utils/formatters';

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
    <div className="relative">
      <div className={`absolute top-0 bottom-0 ${
        type === 'bid' ? 'right-0 bg-green-500/10' : 'left-0 bg-red-500/10'
      }`} style={{ width: `${volumePercentage}%` }} />
      <div className={`relative grid grid-cols-3 py-1.5 text-sm ${
        type === 'bid' 
          ? 'text-green-500' 
          : 'text-red-500'
      }`}>
        <span className="text-right pr-4">{formatNumber(entry.price, 2)}</span>
        <span className="text-right pr-4">{formatNumber(entry.amount, 4)}</span>
        <span className="text-right">{formatNumber(entry.amount * entry.price, 2)}</span>
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
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Order Book
        </h2>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Spread: ${formatNumber(orderBook.asks[0].price - orderBook.bids[0].price, 2)}
        </div>
      </div>

      <div className={`grid grid-cols-3 text-xs font-medium mb-2 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <span className="text-right pr-4">Price (USD)</span>
        <span className="text-right pr-4">Amount (BTC)</span>
        <span className="text-right">Total (USD)</span>
      </div>

      <div className="space-y-0.5">
        <div className={`text-xs text-right mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Ask Volume: ${formatNumber(totalAskVolume, 2)}
        </div>
        {orderBook.asks.slice(0, 12).map((ask, i) => (
          <OrderBookRow key={`ask-${i}`} entry={ask} type="ask" maxVolume={maxVolume} />
        ))}

        <div className={`border-t border-b my-2 py-2 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-center text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ${formatNumber((orderBook.asks[0].price + orderBook.bids[0].price) / 2, 2)}
          </div>
        </div>

        {orderBook.bids.slice(0, 12).map((bid, i) => (
          <OrderBookRow key={`bid-${i}`} entry={bid} type="bid" maxVolume={maxVolume} />
        ))}
        <div className={`text-xs text-right mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Total Bid Volume: ${formatNumber(totalBidVolume, 2)}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;