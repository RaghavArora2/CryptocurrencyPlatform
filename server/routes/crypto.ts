import express from 'express';
import axios from 'axios';
import { dbRun, dbAll } from '../database/init.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const COINGECKO_API_KEY = 'CG-V6pwLsTyaMiWPdFmWVQY8gVX';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

const coinGeckoApi = axios.create({
  baseURL: COINGECKO_BASE_URL,
  timeout: 10000,
  headers: {
    'x-cg-demo-api-key': COINGECKO_API_KEY,
  },
});

// Get market data
router.get('/market', async (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    
    const response = await coinGeckoApi.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: Math.min(Number(per_page), 250),
        page: Number(page),
        sparkline: false,
        price_change_percentage: '24h,7d,30d',
      },
    });

    const formattedData = response.data.map((coin: any) => ({
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
    logger.error('Error fetching market data:', error);
    res.status(500).json({ message: 'Failed to fetch market data' });
  }
});

// Get coin details
router.get('/coin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await coinGeckoApi.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: true,
        sparkline: false,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(`Error fetching coin details for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch coin details' });
  }
});

// Get historical data
router.get('/coin/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30, interval = 'daily' } = req.query;
    
    const response = await coinGeckoApi.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: Number(days),
        interval: interval,
      },
    });

    const formattedData = response.data.prices.map(([timestamp, price]: [number, number]) => ({
      time: new Date(timestamp).toISOString().split('T')[0],
      value: price,
      timestamp,
    }));

    res.json(formattedData);
  } catch (error) {
    logger.error(`Error fetching historical data for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch historical data' });
  }
});

// Search coins
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const response = await coinGeckoApi.get('/search', {
      params: { query: q },
    });

    res.json(response.data.coins || []);
  } catch (error) {
    logger.error('Error searching coins:', error);
    res.status(500).json({ message: 'Failed to search coins' });
  }
});

// Get trending coins
router.get('/trending', async (req, res) => {
  try {
    const response = await coinGeckoApi.get('/search/trending');
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching trending coins:', error);
    res.status(500).json({ message: 'Failed to fetch trending coins' });
  }
});

// Get price for specific coin
router.get('/price/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await coinGeckoApi.get('/simple/price', {
      params: {
        ids: id,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_24hr_vol: true,
        include_market_cap: true,
      },
    });

    res.json(response.data[id] || null);
  } catch (error) {
    logger.error(`Error fetching price for ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch price' });
  }
});

export default router;