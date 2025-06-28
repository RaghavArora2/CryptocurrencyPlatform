import axios from 'axios';
import cron from 'node-cron';
import { WebSocketServer } from 'ws';
import { dbRun } from '../database/init.js';
import { logger } from '../utils/logger.js';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

const coinGeckoApi = axios.create({
  baseURL: COINGECKO_BASE_URL,
  timeout: 60000, // Increased from 30000ms to 60000ms (60 seconds)
  headers: {
    'x-cg-demo-api-key': COINGECKO_API_KEY,
  },
});

const TRACKED_COINS = [
  'bitcoin', 'ethereum', 'cardano', 'polkadot', 'chainlink',
  'litecoin', 'binancecoin', 'solana', 'dogecoin', 'avalanche-2'
];

class APIRateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval = 1000; // 1 second between requests

  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    
    try {
      return await requestFn();
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Rate limited, wait longer and retry
        const retryDelay = 5000; // 5 seconds
        logger.warn(`Rate limited, retrying in ${retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        this.lastRequestTime = Date.now();
        return await requestFn();
      }
      throw error;
    }
  }
}

const rateLimiter = new APIRateLimiter();

export async function fetchAndStorePrices() {
  try {
    const response = await rateLimiter.makeRequest(() =>
      coinGeckoApi.get('/simple/price', {
        params: {
          ids: TRACKED_COINS.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
      })
    );

    for (const [coinId, data] of Object.entries(response.data)) {
      const priceData = data as any;
      await dbRun(
        'INSERT INTO price_history (symbol, price, volume_24h, market_cap, price_change_24h) VALUES (?, ?, ?, ?, ?)',
        [
          coinId.toUpperCase(),
          priceData.usd,
          priceData.usd_24h_vol || 0,
          priceData.usd_market_cap || 0,
          priceData.usd_24h_change || 0,
        ]
      );
    }

    logger.info('Price data updated successfully');
    return response.data;
  } catch (error) {
    logger.error('Error fetching price data:', error);
    return null;
  }
}

export function startPriceUpdates(wss: WebSocketServer) {
  // Update prices every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const priceData = await fetchAndStorePrices();
    
    if (priceData) {
      // Broadcast price updates to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({
            type: 'price_update',
            data: priceData,
          }));
        }
      });
    }
  });

  // Initial price fetch
  fetchAndStorePrices();
}