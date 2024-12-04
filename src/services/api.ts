import axios from 'axios';
import { CryptoAsset } from '../types/crypto';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: COINGECKO_API,
  timeout: 10000,
});

export const fetchMarketData = async (): Promise<CryptoAsset[]> => {
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        sparkline: false,
      },
    });

    return response.data.map((item: any) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      current_price: item.current_price,
      price_change_percentage_24h: item.price_change_percentage_24h,
      market_cap: item.market_cap,
      volume_24h: item.total_volume,
    }));
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const fetchCryptoPrice = async (id: string): Promise<number> => {
  try {
    const response = await api.get('/simple/price', {
      params: {
        ids: id,
        vs_currencies: 'usd',
      },
    });
    return response.data[id]?.usd || 0;
  } catch (error) {
    console.error('Error fetching price:', error);
    return 0;
  }
};

export { api };