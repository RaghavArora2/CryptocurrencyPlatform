import React, { useState } from 'react';
import { CryptoAsset } from '../../types/crypto';
import { TrendingUp, TrendingDown, ArrowUpDown, Search } from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface MarketOverviewProps {
  assets: CryptoAsset[];
}

type SortField = 'symbol' | 'current_price' | 'price_change_percentage_24h' | 'market_cap';
type SortDirection = 'asc' | 'desc';

const MarketOverview: React.FC<MarketOverviewProps> = ({ assets: initialAssets }) => {
  const { theme } = useThemeStore();
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAssets = initialAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
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
      className={`flex items-center space-x-1 group transition-colors ${
        theme === 'dark' ? 'hover:text-blue-400' : 'hover:text-blue-600'
      }`}
    >
      <span>{label}</span>
      <ArrowUpDown className={`w-4 h-4 transition-all duration-200 ${
        sortField === field 
          ? 'opacity-100 text-blue-500' 
          : 'opacity-0 group-hover:opacity-50'
      }`} />
    </button>
  );

  return (
    <Card className="overflow-hidden">
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Market Overview
          </h2>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <SortButton field="symbol" label="Asset" />
              </th>
              <th className={`px-6 py-4 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="current_price" label="Price" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="price_change_percentage_24h" label="24h Change" />
                </div>
              </th>
              <th className={`px-6 py-4 text-right text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              } uppercase tracking-wider`}>
                <div className="flex justify-end">
                  <SortButton field="market_cap" label="Market Cap" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {sortedAssets.map((asset, index) => (
              <tr 
                key={asset.id} 
                className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${index % 2 === 0 ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : (theme === 'dark' ? 'bg-gray-750' : 'bg-gray-25')}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {asset.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {asset.symbol}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {asset.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${asset.current_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                    asset.price_change_percentage_24h >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {asset.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${(asset.market_cap / 1e9).toFixed(2)}B
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedAssets.length === 0 && (
        <div className="text-center py-12">
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No cryptocurrencies found matching your search.
          </p>
        </div>
      )}
    </Card>
  );
};

export default MarketOverview;