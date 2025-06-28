import express from 'express';
import axios from 'axios';
import { dbRun, dbAll } from '../database/init.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Rate limiting and retry logic
class APIRateLimiter {
  private lastRequest = 0;
  private minInterval = 2000; // 2 seconds between requests
  private retryCount = new Map();
  private maxRetries = 3;

  async makeRequest(requestFn, key) {
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
    } catch (error) {
      const retries = this.retryCount.get(key) || 0;
      
      if ((error.response?.status === 429 || error.code === 'ECONNABORTED') && retries < this.maxRetries) {
        this.retryCount.set(key, retries + 1);
        const delay = Math.pow(2, retries) * 3000; // Exponential backoff starting at 3s
        logger.warn(`Rate limited or timeout, retrying in ${delay}ms... (attempt ${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(requestFn, key);
      }
      
      throw error;
    }
  }
}

const rateLimiter = new APIRateLimiter();

const coinGeckoApi = axios.create({
  baseURL: COINGECKO_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'x-cg-demo-api-key': COINGECKO_API_KEY,
  },
});

// Mock data fallback
const mockMarketData = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 2.5,
    price_change_percentage_7d_in_currency: 5.2,
    price_change_percentage_30d_in_currency: 12.8,
    total_volume: 25000000000,
    high_24h: 46500,
    low_24h: 44200,
    circulating_supply: 19500000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    ath_change_percentage: -34.8,
    atl: 67.81,
    atl_change_percentage: 66300.2,
    last_updated: new Date().toISOString()
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 3000,
    market_cap: 360000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 1.8,
    price_change_percentage_7d_in_currency: 3.5,
    price_change_percentage_30d_in_currency: 8.2,
    total_volume: 15000000000,
    high_24h: 3100,
    low_24h: 2950,
    circulating_supply: 120000000,
    total_supply: 120000000,
    max_supply: null,
    ath: 4878,
    ath_change_percentage: -38.5,
    atl: 0.432979,
    atl_change_percentage: 692800.1,
    last_updated: new Date().toISOString()
  }
];

const generateMockChartData = (days = 30, basePrice = 45000) => {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  for (let i = days - 1; i >= 0; i--) {
    const time = Math.floor((now - (i * dayMs)) / 1000);
    const volatility = 0.02;
    const trend = Math.sin(i / 10) * 0.01;
    const random = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trend + random);
    
    data.push({
      time,
      value: Math.round(price * 100) / 100
    });
  }
  
  return data;
};

// Get market data
router.get('/market', async (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: Math.min(Number(per_page), 250),
          page: Number(page),
          sparkline: false,
          price_change_percentage: '24h,7d,30d',
        },
      }),
      `market-${page}-${per_page}`
    );

    const formattedData = response.data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      fully_diluted_valuation: coin.fully_diluted_valuation,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      price_change_24h: coin.price_change_24h,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
      price_change_percentage_30d_in_currency: coin.price_change_percentage_30d_in_currency,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
      ath: coin.ath,
      ath_change_percentage: coin.ath_change_percentage,
      ath_date: coin.ath_date,
      atl: coin.atl,
      atl_change_percentage: coin.atl_change_percentage,
      atl_date: coin.atl_date,
      last_updated: coin.last_updated,
    }));

    res.json(formattedData);
  } catch (error) {
    logger.warn('Market data API failed, using mock data:', error.message);
    res.json(mockMarketData);
  }
});

// Get coin details
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true,
          sparkline: false,
        },
      }),
      `coin-${id}`
    );

    res.json(response.data);
  } catch (error) {
    logger.warn(`Coin details API failed for ${req.params.id}, using mock data:`, error.message);
    
    // Return mock data for bitcoin
    if (req.params.id === 'bitcoin') {
      res.json({
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: {
          thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
          small: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
          large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        market_data: {
          current_price: { usd: 45000 },
          market_cap: { usd: 850000000000 },
          total_volume: { usd: 25000000000 }
        }
      });
    } else {
      res.status(404).json({ message: 'Coin not found' });
    }
  }
});

// Get historical data
router.get('/coin/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30, interval = 'daily' } = req.query;
    
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: Number(days),
          interval: interval,
        },
      }),
      `history-${id}-${days}`
    );

    const formattedData = response.data.prices.map(([timestamp, price]) => ({
      time: Math.floor(timestamp / 1000),
      value: price,
    }));

    res.json(formattedData);
  } catch (error) {
    logger.warn(`Historical data API failed for ${req.params.id}, using mock data:`, error.message);
    
    const basePrice = req.params.id === 'bitcoin' ? 45000 : 
                     req.params.id === 'ethereum' ? 3000 : 1;
    const mockData = generateMockChartData(Number(req.query.days) || 30, basePrice);
    res.json(mockData);
  }
});

// Search coins
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get('/search', {
        params: { query: q },
      }),
      `search-${q}`
    );

    res.json(response.data.coins || []);
  } catch (error) {
    logger.warn('Search API failed, using mock results:', error.message);
    
    const mockResults = mockMarketData.filter(coin => 
      coin.name.toLowerCase().includes(req.query.q.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(req.query.q.toLowerCase())
    ).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      thumb: coin.image
    }));
    
    res.json(mockResults);
  }
});

// Get trending coins
router.get('/trending', async (req, res) => {
  try {
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get('/search/trending'),
      'trending'
    );
    res.json(response.data);
  } catch (error) {
    logger.warn('Trending API failed, using mock data:', error.message);
    res.json({ 
      coins: mockMarketData.slice(0, 7).map(coin => ({ item: coin }))
    });
  }
});

// Get price for specific coin
router.get('/price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get('/simple/price', {
        params: {
          ids: id,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
      }),
      `price-${id}`
    );

    res.json(response.data[id] || null);
  } catch (error) {
    logger.warn(`Price API failed for ${req.params.id}, using mock data:`, error.message);
    
    const mockCoin = mockMarketData.find(coin => coin.id === req.params.id);
    if (mockCoin) {
      res.json({
        usd: mockCoin.current_price,
        usd_24h_change: mockCoin.price_change_percentage_24h,
        usd_24h_vol: mockCoin.total_volume,
        usd_market_cap: mockCoin.market_cap
      });
    } else {
      res.status(404).json({ message: 'Price not found' });
    }
  }
});

export default router;