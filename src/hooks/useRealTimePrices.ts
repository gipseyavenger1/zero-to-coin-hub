import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CRYPTO_CONFIG } from '@/config/cryptoConfig';

interface PriceData {
  symbol: string;
  price_usd: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
}

interface UseRealTimePricesOptions {
  symbols: string[];
  enabled: boolean;
  refreshInterval?: number; // in milliseconds
}

export const useRealTimePrices = ({
  symbols,
  enabled,
  refreshInterval = CRYPTO_CONFIG.PRICE_UPDATE_INTERVAL
}: UseRealTimePricesOptions) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = CRYPTO_CONFIG.MAX_RETRIES;

  const fetchPrices = useCallback(async (symbolsToFetch: string[]) => {
    if (!symbolsToFetch.length || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      // First try to get cached prices from database
      const { data: cachedPrices } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('symbol', symbolsToFetch)
        .order('last_updated', { ascending: false });

      if (cachedPrices?.length) {
        const formattedPrices = cachedPrices.map(price => ({
          symbol: price.symbol,
          price_usd: parseFloat(price.price_usd.toString()),
          change_24h: parseFloat(price.change_24h?.toString() || '0'),
          market_cap: parseFloat(price.market_cap?.toString() || '0'),
          volume_24h: parseFloat(price.volume_24h?.toString() || '0'),
          last_updated: price.last_updated
        }));
        setPrices(formattedPrices);
        setLastUpdate(new Date());
      }

      // Then fetch fresh prices from CoinMarketCap API
      const response = await supabase.functions.invoke('coinmarketcap-api', {
        body: {
          endpoint: 'quotes',
          symbols: symbolsToFetch.join(',')
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch prices');
      }
      
      const data = response.data;
      const freshPrices: PriceData[] = [];
      
      if (data?.data) {
        Object.entries(data.data).forEach(([symbol, coinData]: [string, any]) => {
          const quote = coinData.quote.USD;
          freshPrices.push({
            symbol,
            price_usd: quote.price,
            change_24h: quote.percent_change_24h,
            market_cap: quote.market_cap,
            volume_24h: quote.volume_24h,
            last_updated: coinData.last_updated
          });
        });
      }
      
      if (freshPrices.length > 0) {
        setPrices(freshPrices);
        setLastUpdate(new Date());
        retryCountRef.current = 0; // Reset retry count on success
      }

    } catch (error: any) {
      console.error('Error fetching real-time prices:', error);
      
      // Implement exponential backoff for retries
      retryCountRef.current++;
      
      if (retryCountRef.current <= maxRetries) {
        const retryDelay = Math.pow(2, retryCountRef.current) * CRYPTO_CONFIG.RETRY_DELAY_BASE; // Exponential backoff
        setTimeout(() => fetchPrices(symbolsToFetch), retryDelay);
      } else {
        setError(`Failed to fetch prices after ${maxRetries} retries: ${error.message}`);
        retryCountRef.current = 0; // Reset for next attempt
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const refreshPrices = useCallback(() => {
    if (symbols.length > 0) {
      fetchPrices(symbols);
    }
  }, [symbols, fetchPrices]);

  // Set up interval for automatic price updates
  useEffect(() => {
    if (enabled && symbols.length > 0) {
      // Fetch immediately
      fetchPrices(symbols);
      
      // Set up interval
      intervalRef.current = setInterval(() => {
        fetchPrices(symbols);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [symbols, enabled, refreshInterval, fetchPrices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    prices,
    loading,
    error,
    lastUpdate,
    refreshPrices,
    retryCount: retryCountRef.current
  };
};