import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { ChartDataPoint } from '../types/chart';
import useThemeStore from '../store/themeStore';
import { getCoinHistoricalData, searchCoins } from '../services/api/coinGecko';
import { Search } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';

interface TradingChartProps {
  data: ChartDataPoint[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data: initialData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useThemeStore();
  const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum'>('bitcoin');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chartData, setChartData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const popularCryptos = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: theme === 'dark' ? '#1f2937' : '#ffffff' },
        textColor: theme === 'dark' ? '#9ca3af' : '#374151',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
        horzLines: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      },
    });

    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    const sortedData = [...chartData].sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    lineSeries.setData(sortedData);
    chartRef.current = chart;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData, theme]);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCoins(query);
      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error('Error searching coins:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadCryptoData = async (coinId: string) => {
    setLoading(true);
    try {
      const historicalData = await getCoinHistoricalData(coinId, 30);
      const formattedData = historicalData.map(([timestamp, price]) => ({
        time: new Date(timestamp).toISOString().split('T')[0],
        value: price,
      }));
      setChartData(formattedData);
      setSelectedCrypto(coinId as any);
    } catch (error) {
      console.error('Error loading crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSelect = (coinId: string) => {
    loadCryptoData(coinId);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {popularCryptos.find(c => c.id === selectedCrypto)?.name || 'Bitcoin'}/USD Price Chart
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              30-day price history with real-time data
            </p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              icon={Search}
            />
            
            {searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } border rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto`}>
                {searchResults.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => handleCryptoSelect(coin.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {coin.name}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {coin.symbol}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Cryptos */}
        <div className="flex flex-wrap gap-2">
          {popularCryptos.map((crypto) => (
            <Button
              key={crypto.id}
              onClick={() => handleCryptoSelect(crypto.id)}
              variant={selectedCrypto === crypto.id ? 'primary' : 'ghost'}
              size="sm"
              disabled={loading}
            >
              {crypto.symbol}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading chart data...
            </p>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className={`w-full h-[400px] ${loading ? 'opacity-50' : ''}`} />
    </div>
  );
};

export default TradingChart;