import api from '../api';
import { mockMarketData, generateMockChartData, mockCoinDetails } from './mockData';

export interface CoinPrice {
  id: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    facebook_username: string;
    bitcointalk_thread_identifier: number;
    telegram_channel_identifier: string;
    subreddit_url: string;
    repos_url: {
      github: string[];
      bitbucket: string[];
    };
  };
}

// Rate limiting and retry logic
class APIRateLimiter {
  private lastRequest = 0;
  private minInterval = 1000; // 1 second between requests
  private retryCount = new Map<string, number>();
  private maxRetries = 3;

  async makeRequest<T>(requestFn: () => Promise<T>, key: string): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
    }
    
    this.lastRequest = Date.now();
    
    try {
      const result = await requestFn();
      this.retryCount.delete(key);
      return result;
    } catch (error: any) {
      const retries = this.retryCount.get(key) || 0;
      
      if (error.response?.status === 429 && retries < this.maxRetries) {
        this.retryCount.set(key, retries + 1);
        const delay = Math.pow(2, retries) * 2000; // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(requestFn, key);
      }
      
      throw error;
    }
  }
}

const rateLimiter = new APIRateLimiter();

export const getCoinPrice = async (coinId: string): Promise<CoinPrice | null> => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get(`/crypto/price/${coinId}`, { timeout: 30000 }),
      `price-${coinId}`
    );
    
    return {
      id: coinId,
      current_price: response.data.usd,
      price_change_24h: response.data.usd_24h_change || 0,
      price_change_percentage_24h: response.data.usd_24h_change || 0,
      market_cap: response.data.usd_market_cap || 0,
      volume_24h: response.data.usd_24h_vol || 0,
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`API failed for ${coinId}, using mock data:`, error);
    const mockCoin = mockMarketData.find(coin => coin.id === coinId);
    if (mockCoin) {
      return {
        id: coinId,
        current_price: mockCoin.current_price,
        price_change_24h: mockCoin.current_price * (mockCoin.price_change_percentage_24h / 100),
        price_change_percentage_24h: mockCoin.price_change_percentage_24h,
        market_cap: mockCoin.market_cap,
        volume_24h: mockCoin.total_volume,
        last_updated: mockCoin.last_updated,
      };
    }
    return null;
  }
};

export const getCoinDetails = async (coinId: string): Promise<CoinDetails | null> => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get(`/crypto/coin/${coinId}`, { timeout: 30000 }),
      `details-${coinId}`
    );
    return response.data;
  } catch (error) {
    console.warn(`API failed for ${coinId} details, using mock data:`, error);
    return mockCoinDetails[coinId as keyof typeof mockCoinDetails] || null;
  }
};

export const searchCoins = async (query: string): Promise<any[]> => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get(`/crypto/search?q=${encodeURIComponent(query)}`, { timeout: 15000 }),
      `search-${query}`
    );
    return response.data;
  } catch (error) {
    console.warn('Search API failed, using mock results:', error);
    return mockMarketData.filter(coin => 
      coin.name.toLowerCase().includes(query.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(query.toLowerCase())
    ).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.image
    }));
  }
};

export const getCoinHistoricalData = async (
  coinId: string,
  days: number = 30
): Promise<Array<{ time: number; value: number }>> => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get(`/crypto/coin/${coinId}/history?days=${days}`, { timeout: 30000 }),
      `history-${coinId}-${days}`
    );
    
    const rawData = response.data;
    const uniqueDataMap = new Map<number, number>();
    
    rawData.forEach((item: { time: number; value: number }) => {
      uniqueDataMap.set(item.time, item.value);
    });
    
    const uniqueData = Array.from(uniqueDataMap.entries())
      .map(([time, value]) => ({ time, value }))
      .sort((a, b) => a.time - b.time);
    
    return uniqueData;
  } catch (error) {
    console.warn(`Historical data API failed for ${coinId}, using mock data:`, error);
    const mockCoin = mockMarketData.find(coin => coin.id === coinId);
    const basePrice = mockCoin?.current_price || 45000;
    return generateMockChartData(days, basePrice);
  }
};

export const getMarketData = async (page: number = 1, perPage: number = 50) => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get(`/crypto/market?page=${page}&per_page=${perPage}`, { timeout: 30000 }),
      `market-${page}-${perPage}`
    );
    return response.data;
  } catch (error) {
    console.warn('Market data API failed, using mock data:', error);
    return mockMarketData;
  }
};

export const getTrendingCoins = async () => {
  try {
    const response = await rateLimiter.makeRequest(
      () => api.get('/crypto/trending', { timeout: 15000 }),
      'trending'
    );
    return response.data;
  } catch (error) {
    console.warn('Trending API failed, using mock data:', error);
    return { coins: mockMarketData.slice(0, 7).map(coin => ({ item: coin })) };
  }
};

// Common coin ID mappings
export const COIN_IDS: Record<string, string> = {
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  ethereum: 'ethereum',
  eth: 'ethereum',
  cardano: 'cardano',
  ada: 'cardano',
  polkadot: 'polkadot',
  dot: 'polkadot',
  chainlink: 'chainlink',
  link: 'chainlink',
  litecoin: 'litecoin',
  ltc: 'litecoin',
  'binance-coin': 'binancecoin',
  bnb: 'binancecoin',
  solana: 'solana',
  sol: 'solana',
  dogecoin: 'dogecoin',
  doge: 'dogecoin',
  avalanche: 'avalanche-2',
  avax: 'avalanche-2',
};

export const getCoinIdFromSymbol = (symbol: string): string => {
  const normalizedSymbol = symbol.toLowerCase();
  return COIN_IDS[normalizedSymbol] || normalizedSymbol;
};