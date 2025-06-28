import { useState, useEffect, useCallback } from 'react';
import { getMarketData } from '../services/api/coinGecko';
import { wsService } from '../services/websocket';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
}

export const useMarketData = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarketData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMarketData(1, 100);
      setAssets(data);
      setError(null);
    } catch (err) {
      setError('Failed to load market data');
      console.error('Error loading market data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();

    // Listen for real-time price updates
    const handlePriceUpdate = (data: any) => {
      if (data.type === 'price_update') {
        setAssets(prevAssets => 
          prevAssets.map(asset => {
            const priceData = data.data[asset.id.toLowerCase()];
            if (priceData) {
              return {
                ...asset,
                current_price: priceData.usd,
                price_change_percentage_24h: priceData.usd_24h_change || 0,
              };
            }
            return asset;
          })
        );
      }
    };

    wsService.on('price_update', handlePriceUpdate);

    return () => {
      wsService.off('price_update', handlePriceUpdate);
    };
  }, [loadMarketData]);

  return { assets, loading, error, refetch: loadMarketData };
};