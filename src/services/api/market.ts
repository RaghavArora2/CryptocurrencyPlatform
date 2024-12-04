import { apiClient } from './config';
import { CryptoAsset } from '../../types/crypto';

const sanitizeNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const sanitizeString = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value || '');
};

export const fetchMarketData = async (): Promise<CryptoAsset[]> => {
  try {
    const { data } = await apiClient.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        sparkline: false,
      },
    });

    return data.map((item: any): CryptoAsset => ({
      id: sanitizeString(item.id),
      symbol: sanitizeString(item.symbol).toUpperCase(),
      name: sanitizeString(item.name),
      current_price: sanitizeNumber(item.current_price),
      price_change_percentage_24h: sanitizeNumber(item.price_change_percentage_24h),
      market_cap: sanitizeNumber(item.market_cap),
      volume_24h: sanitizeNumber(item.total_volume),
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const fetchCryptoPrice = async (id: string): Promise<number> => {
  try {
    const { data } = await apiClient.get('/simple/price', {
      params: {
        ids: id,
        vs_currencies: 'usd',
      },
    });
    return sanitizeNumber(data[id]?.usd);
  } catch (error) {
    console.error('Error fetching price:', error);
    return 0;
  }
};