import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const coinmarketcapApiKey = Deno.env.get('COINMARKETCAP_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);
const supabaseService = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, symbols } = await req.json();
    console.log('CoinMarketCap API request:', { endpoint, symbols });

    if (!coinmarketcapApiKey) {
      throw new Error('CoinMarketCap API key not configured');
    }

    let apiUrl: string;
    let params: URLSearchParams;

    switch (endpoint) {
      case 'quotes':
        // Get current prices for specific symbols
        apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
        params = new URLSearchParams({
          symbol: Array.isArray(symbols) ? symbols.join(',') : symbols,
          convert: 'USD'
        });
        break;

      case 'listings':
        // Get top cryptocurrencies
        apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
        params = new URLSearchParams({
          start: '1',
          limit: '100',
          convert: 'USD'
        });
        break;

      case 'global-metrics':
        // Get global crypto market metrics
        apiUrl = 'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest';
        params = new URLSearchParams({
          convert: 'USD'
        });
        break;

      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const fullUrl = `${apiUrl}?${params.toString()}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': coinmarketcapApiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('CoinMarketCap API response received');

    // Cache price data in our database
    if (endpoint === 'quotes' && data.data) {
      const priceUpdates = [];
      
      for (const [symbol, coinData] of Object.entries(data.data as any)) {
        const quote = (coinData as any).quote.USD;
        
        priceUpdates.push({
          symbol: symbol,
          price_usd: quote.price,
          market_cap: quote.market_cap,
          volume_24h: quote.volume_24h,
          change_24h: quote.percent_change_24h,
          last_updated: new Date().toISOString()
        });
      }

      // Upsert price data using service role for RLS bypass
      if (priceUpdates.length > 0) {
        const { error: upsertError } = await supabaseService
          .from('crypto_prices')
          .upsert(priceUpdates, { onConflict: 'symbol' });

        if (upsertError) {
          console.error('Error caching price data:', upsertError);
        } else {
          console.log(`Successfully cached prices for ${priceUpdates.length} symbols`);
        }
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in coinmarketcap-api function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});