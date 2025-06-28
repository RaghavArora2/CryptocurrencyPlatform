import api from '../api';

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

export const getCoinPrice = async (coinId: string): Promise<CoinPrice | null> => {
  try {
    const response = await api.get(`/crypto/price/${coinId}`);
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
    console.error(`Error fetching price for ${coinId}:`, error);
    return null;
  }
};

export const getCoinDetails = async (coinId: string): Promise<CoinDetails | null> => {
  try {
    const response = await api.get(`/crypto/coin/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    return null;
  }
};

export const searchCoins = async (query: string): Promise<any[]> => {
  try {
    const response = await api.get(`/crypto/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
};

export const getCoinHistoricalData = async (
  coinId: string,
  days: number = 30
): Promise<Array<{ time: number; value: number }>> => {
  try {
    const response = await api.get(`/crypto/coin/${coinId}/history?days=${days}`);
    const rawData = response.data;
    
    // Use a Map to ensure unique timestamps and keep the last occurrence for each second
    const uniqueDataMap = new Map<number, number>();
    
    rawData.forEach((item: { time: number; value: number }) => {
      uniqueDataMap.set(item.time, item.value);
    });
    
    // Convert Map back to array and sort by time in ascending order
    const uniqueData = Array.from(uniqueDataMap.entries())
      .map(([time, value]) => ({ time, value }))
      .sort((a, b) => a.time - b.time);
    
    return uniqueData;
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error);
    return [];
  }
};

export const getMarketData = async (page: number = 1, perPage: number = 50) => {
  try {
    const response = await api.get(`/crypto/market?page=${page}&per_page=${perPage}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const getTrendingCoins = async () => {
  try {
    const response = await api.get('/crypto/trending');
    return response.data;
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return { coins: [] };
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