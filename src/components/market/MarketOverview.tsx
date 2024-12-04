import React, { useState } from 'react';
import { CryptoAsset } from '../../types/crypto';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import useThemeStore from '../../store/themeStore';

interface MarketOverviewProps {
  assets: CryptoAsset[];
}

type SortField = 'symbol' | 'current_price' | 'price_change_percentage_24h' | 'market_cap';
type SortDirection = 'asc' | 'desc';

const MarketOverview: React.FC<MarketOverviewProps> = ({ assets: initialAssets }) => {
  const { theme } = useThemeStore();
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAssets = [...initialAssets].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return multiplier * fieldA.localeCompare(fieldB);
    }
    return multiplier * (Number(fieldA) - Number(fieldB));
  });

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 group"
    >
      <span>{label}</span>
      <ArrowUpDown className={`w-4 h-4 ${
        sortField === field 
          ? 'opacity-100' 
          : 'opacity-0 group-hover:opacity-50'
      } transition-opacity`} />
    </button>
  );

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Market Overview
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <SortButton field="symbol" label="Asset" />
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="current_price" label="Price" />
                </div>
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="price_change_percentage_24h" label="24h Change" />
                </div>
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="market_cap" label="Market Cap" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y ${
            theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            {sortedAssets.map((asset) => (
              <tr 
                key={asset.id} 
                className={`${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } transition-colors duration-150`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{asset.symbol}</div>
                    <div className={`ml-2 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{asset.name}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${asset.current_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`flex items-center justify-end text-sm ${
                    asset.price_change_percentage_24h >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {asset.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
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