import { format, addDays } from 'date-fns';
import { ChartDataPoint } from '../types/chart';

export const generateChartData = (days: number = 30): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const startPrice = 40000;
  const volatility = 0.02;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const randomChange = 1 + (Math.random() - 0.5) * volatility;
    const price = i === 0 ? startPrice : data[i - 1].value * randomChange;
    
    data.push({
      time: format(date, 'yyyy-MM-dd'),
      value: Number(price.toFixed(2)),
    });
  }
  
  return data;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const calculatePortfolioValue = (
  btcBalance: number,
  ethBalance: number,
  usdBalance: number,
  btcPrice: number = 45000,
  ethPrice: number = 3000
): number => {
  return usdBalance + (btcBalance * btcPrice) + (ethBalance * ethPrice);
};