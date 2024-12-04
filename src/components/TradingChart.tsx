import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { ChartDataPoint } from '../types/chart';
import useThemeStore from '../store/themeStore';

interface TradingChartProps {
  data: ChartDataPoint[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useThemeStore();
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('BTC');

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

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

    const sortedData = [...data].sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    lineSeries.setData(sortedData);
    chartRef.current = chart;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, theme]);

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {selectedCrypto}/USD Price Chart
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            30-day price history
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCrypto('BTC')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCrypto === 'BTC'
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            BTC
          </button>
          <button
            onClick={() => setSelectedCrypto('ETH')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCrypto === 'ETH'
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ETH
          </button>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
};

export default TradingChart;