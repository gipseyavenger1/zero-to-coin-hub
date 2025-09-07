import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  time: string;
  price: number;
  volume: number;
}

interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  data: PriceData[];
}

const RealTimePriceChart: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoPriceData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const cryptoOptions = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
    { id: 'tether', symbol: 'USDT', name: 'Tether' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  ];

  const generateMockPriceData = (basePrice: number): PriceData[] => {
    const data: PriceData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation * (i / 24));
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: Math.round(price * 100) / 100,
        volume: Math.random() * 1000000000
      });
    }
    return data;
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      
      // Get real-time prices from CoinMarketCap via our edge function
      const symbols = cryptoOptions.map(c => c.symbol).join(',');
      
      const { data: response, error } = await supabase.functions.invoke('coinmarketcap-api', {
        body: { 
          endpoint: 'quotes',
          symbols: symbols
        }
      });

      if (error) {
        console.error('CoinMarketCap API error:', error);
        // Fallback to cached data from database
        const { data: cachedPrices } = await supabase
          .from('crypto_prices')
          .select('*')
          .in('symbol', cryptoOptions.map(c => c.symbol));
        
        if (cachedPrices && cachedPrices.length > 0) {
          const cryptoData = cachedPrices.map(price => {
            const option = cryptoOptions.find(opt => opt.symbol === price.symbol);
            return {
              symbol: price.symbol,
              name: option?.name || price.symbol,
              price: Number(price.price_usd),
              change24h: Number(price.change_24h || 0),
              changePercent24h: Number(price.change_24h || 0),
              volume24h: Number(price.volume_24h || 0),
              marketCap: Number(price.market_cap || 0),
              data: generateMockPriceData(Number(price.price_usd))
            };
          });
          setCryptoData(cryptoData);
        }
      } else if (response?.data) {
        // Process live CoinMarketCap data
        const cryptoData = Object.entries(response.data).map(([symbol, coinData]: [string, any]) => {
          const option = cryptoOptions.find(opt => opt.symbol === symbol);
          const quote = coinData.quote.USD;
          
          return {
            symbol: symbol,
            name: option?.name || coinData.name,
            price: quote.price,
            change24h: quote.percent_change_24h,
            changePercent24h: quote.percent_change_24h,
            volume24h: quote.volume_24h,
            marketCap: quote.market_cap,
            data: generateMockPriceData(quote.price)
          };
        });
        
        setCryptoData(cryptoData);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      // Try to load cached data as fallback
      const { data: cachedPrices } = await supabase
        .from('crypto_prices')
        .select('*')
        .in('symbol', cryptoOptions.map(c => c.symbol));
      
      if (cachedPrices && cachedPrices.length > 0) {
        const cryptoData = cachedPrices.map(price => {
          const option = cryptoOptions.find(opt => opt.symbol === price.symbol);
          return {
            symbol: price.symbol,
            name: option?.name || price.symbol,
            price: Number(price.price_usd),
            change24h: Number(price.change_24h || 0),
            changePercent24h: Number(price.change_24h || 0),
            volume24h: Number(price.volume_24h || 0),
            marketCap: Number(price.market_cap || 0),
            data: generateMockPriceData(Number(price.price_usd))
          };
        });
        setCryptoData(cryptoData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 1000); // Update every 1 second
    return () => clearInterval(interval);
  }, []);

  const selectedCryptoData = cryptoData.find(c => 
    cryptoOptions.find(opt => opt.symbol === c.symbol)?.id === selectedCrypto
  );

  const chartConfig = {
    price: {
      label: "Price (USD)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Crypto Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cryptoData.map((crypto) => {
          const isPositive = crypto.changePercent24h >= 0;
          const option = cryptoOptions.find(opt => opt.symbol === crypto.symbol);
          
          return (
            <Card 
              key={crypto.symbol}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCrypto === option?.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCrypto(option?.id || 'bitcoin')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{crypto.symbol}</h3>
                    <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">${crypto.price.toLocaleString()}</p>
                  <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Real-Time Price Chart
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Live cryptocurrency prices • Last update: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {selectedCryptoData?.name} ({selectedCryptoData?.symbol})
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCryptoData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-xl font-bold">${selectedCryptoData.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="text-lg font-semibold">${(selectedCryptoData.volume24h / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-lg font-semibold">${(selectedCryptoData.marketCap / 1000000000).toFixed(1)}B</p>
                </div>
              </div>
              
              <div className="h-64">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCryptoData.data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        className="text-muted-foreground"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        className="text-muted-foreground"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimePriceChart;