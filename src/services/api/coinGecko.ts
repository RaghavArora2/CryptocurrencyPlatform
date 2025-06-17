import axios from 'axios';

const COINGECKO_API_KEY = 'CG-V6pwLsTyaMiWPdFmWVQY8gVX';
const BASE_URL = 'https://api.coingecko.com/api/v3';

const coinGeckoApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'x-cg-demo-api-key': COINGECKO_API_KEY,
  },
});

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
    const response = await coinGeckoApi.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });

    const data = response.data;
    return {
      id: data.id,
      current_price: data.market_data.current_price.usd,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      market_cap: data.market_data.market_cap.usd,
      volume_24h: data.market_data.total_volume.usd,
      last_updated: data.last_updated,
    };
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    return null;
  }
};

export const getCoinDetails = async (coinId: string): Promise<CoinDetails | null> => {
  try {
    const response = await coinGeckoApi.get(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: true,
        sparkline: false,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    return null;
  }
};

export const searchCoins = async (query: string): Promise<any[]> => {
  try {
    const response = await coinGeckoApi.get('/search', {
      params: { query },
    });
    return response.data.coins || [];
  } catch (error) {
    console.error('Error searching coins:', error);
    return [];
  }
};

export const getCoinHistoricalData = async (
  coinId: string,
  days: number = 30
): Promise<number[][]> => {
  try {
    const response = await coinGeckoApi.get(`/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
        interval: days <= 1 ? 'hourly' : 'daily',
      },
    });
    return response.data.prices || [];
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error);
    return [];
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