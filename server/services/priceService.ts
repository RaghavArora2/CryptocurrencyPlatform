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
  private readonly minInterval = 3000; // Increased from 1000ms to 3000ms (3 seconds)
  private readonly maxRetries = 3;
  private retryTracking = new Map<string, number>();

  private isRetryableError(error: any): boolean {
    // Check for network-related errors
    if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
      return true;
    }
    
    // Check for socket hang up
    if (error.message && error.message.includes('socket hang up')) {
      return true;
    }
    
    // Check for timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return true;
    }
    
    // Check for rate limiting
    if (error.response?.status === 429) {
      return true;
    }
    
    // Check for temporary server errors
    if (error.response?.status >= 500 && error.response?.status < 600) {
      return true;
    }
    
    return false;
  }

  private calculateBackoffDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount * 1000ms, with jitter
    const baseDelay = Math.pow(2, retryCount) * 1000;
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
  }

  async makeRequest<T>(requestFn: () => Promise<T>, requestKey: string = 'default'): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    
    const currentRetryCount = this.retryTracking.get(requestKey) || 0;
    
    try {
      const result = await requestFn();
      // Reset retry count on success
      this.retryTracking.delete(requestKey);
      return result;
    } catch (error: any) {
      logger.warn(`Request failed (attempt ${currentRetryCount + 1}/${this.maxRetries + 1}):`, {
        error: error.message,
        code: error.code,
        status: error.response?.status
      });
      
      if (this.isRetryableError(error) && currentRetryCount < this.maxRetries) {
        const retryDelay = this.calculateBackoffDelay(currentRetryCount);
        logger.info(`Retrying request in ${retryDelay}ms...`);
        
        // Update retry count
        this.retryTracking.set(requestKey, currentRetryCount + 1);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        this.lastRequestTime = Date.now();
        
        // Recursive retry
        return this.makeRequest(requestFn, requestKey);
      }
      
      // Clean up retry tracking on final failure
      this.retryTracking.delete(requestKey);
      throw error;
    }
  }
}

const rateLimiter = new APIRateLimiter();

export async function fetchAndStorePrices() {
  try {
    const response = await rateLimiter.makeRequest(
      () => coinGeckoApi.get('/simple/price', {
        params: {
          ids: TRACKED_COINS.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
      }),
      'price-fetch' // Unique key for this request type
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
    logger.error('Error fetching price data after all retries:', error);
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