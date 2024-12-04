import React from 'react';
import { CryptoAsset } from '../types/crypto';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewProps {
  assets: CryptoAsset[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ assets }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Market Overview</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{asset.symbol.toUpperCase()}</div>
                    <div className="ml-2 text-sm text-gray-500">{asset.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ${asset.current_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end text-sm ${
                    asset.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ${asset.market_cap.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;