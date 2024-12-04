import { useState, useEffect, useCallback } from 'react';
import { CryptoAsset } from '../types/crypto';
import { fetchMarketData } from '../services/api/market';

export const useMarketData = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarketData = useCallback(async () => {
    try {
      const data = await fetchMarketData();
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
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const initializeData = async () => {
      if (!mounted) return;
      await loadMarketData();
      
      // Set up polling only if the component is still mounted
      if (mounted) {
        intervalId = setInterval(loadMarketData, 30000);
      }
    };

    initializeData();

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadMarketData]);

  return { assets, loading, error };
};