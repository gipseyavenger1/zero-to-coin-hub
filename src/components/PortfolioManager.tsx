import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { calculatePortfolioMetrics, formatCurrency, formatPercentage, formatCrypto } from '@/utils/portfolioCalculations';
import TransactionForm from './TransactionForm';
import WalletSync from './WalletSync';
import type { User } from '@supabase/supabase-js';

interface PortfolioManagerProps {
  user: User;
}

interface Transaction {
  id: string;
  crypto_symbol: string;
  amount: number;
  transaction_type: string;
  purchase_price: number;
  fees: number;
  transaction_value: number;
  created_at: string;
  status: string;
}

interface PriceData {
  symbol: string;
  price_usd: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cryptoColors: Record<string, string> = {
    BTC: '#f7931a',
    ETH: '#627eea',
    USDT: '#26a17b',
    BNB: '#f3ba2f',
    ADA: '#0033ad',
    SOL: '#9945ff',
    XRP: '#23292f',
    DOT: '#e6007a'
  };

  const fetchRealTimePrices = async (symbols: string[]) => {
    try {
      const response = await supabase.functions.invoke('coinmarketcap-api', {
        body: {
          endpoint: 'quotes',
          symbols: symbols.join(',')
        }
      });

      if (response.error) throw new Error('Failed to fetch prices');
      
      const data = response.data;
      const prices: PriceData[] = [];
      
      if (data.data) {
        Object.entries(data.data).forEach(([symbol, coinData]: [string, any]) => {
          const quote = coinData.quote.USD;
          prices.push({
            symbol,
            price_usd: quote.price,
            change_24h: quote.percent_change_24h,
            market_cap: quote.market_cap,
            volume_24h: quote.volume_24h
          });
        });
      }
      
      setPriceData(prices);
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
      // Fallback to cached prices from database
      const { data: cachedPrices } = await supabase
        .from('crypto_prices')
        .select('*');
      
      if (cachedPrices) {
        const formattedPrices = cachedPrices.map(price => ({
          symbol: price.symbol,
          price_usd: parseFloat(price.price_usd.toString()),
          change_24h: parseFloat(price.change_24h?.toString() || '0'),
          market_cap: parseFloat(price.market_cap?.toString() || '0'),
          volume_24h: parseFloat(price.volume_24h?.toString() || '0')
        }));
        setPriceData(formattedPrices);
      }
    }
  };

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);

      // Fetch all transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      setTransactions(transactionData || []);

      // Get unique symbols from transactions
      const symbols = Array.from(new Set(transactionData?.map(tx => tx.crypto_symbol) || []));
      
      if (symbols.length > 0) {
        await fetchRealTimePrices(symbols);
      }

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrices = async () => {
    setRefreshing(true);
    const symbols = Array.from(new Set(transactions.map(tx => tx.crypto_symbol)));
    if (symbols.length > 0) {
      await fetchRealTimePrices(symbols);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [user.id]);

  useEffect(() => {
    if (transactions.length > 0 && priceData.length > 0) {
      const metrics = calculatePortfolioMetrics(transactions, priceData);
      setPortfolioMetrics(metrics);
    }
  }, [transactions, priceData]);

  const getPortfolioAllocationData = () => {
    if (!portfolioMetrics) return [];
    
    return portfolioMetrics.positions.map((position: any) => ({
      symbol: position.symbol,
      value: position.currentValue,
      allocation: (position.currentValue / portfolioMetrics.totalValue) * 100,
      color: cryptoColors[position.symbol] || '#8884d8'
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allocationData = getPortfolioAllocationData();

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(portfolioMetrics?.totalValue || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {portfolioMetrics?.totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Total P&L</span>
            </div>
            <p className={`text-2xl font-bold ${
              portfolioMetrics?.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatPercentage(portfolioMetrics?.totalPnLPercent || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Unrealized P&L</span>
            </div>
            <p className={`text-2xl font-bold ${
              portfolioMetrics?.totalUnrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(portfolioMetrics?.totalUnrealizedPnL || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Realized P&L</span>
            </div>
            <p className={`text-2xl font-bold ${
              portfolioMetrics?.totalRealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(portfolioMetrics?.totalRealizedPnL || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-orange-500" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshPrices}
                disabled={refreshing}
                className="h-auto p-0 text-sm font-medium"
              >
                {refreshing ? 'Updating...' : 'Refresh Prices'}
              </Button>
            </div>
            <p className="text-2xl font-bold">
              {portfolioMetrics?.positions.length || 0} Assets
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Add Transaction</TabsTrigger>
          <TabsTrigger value="sync">Wallet Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Portfolio Allocation
                </CardTitle>
                <CardDescription>
                  Distribution of your crypto holdings by value
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allocationData.length > 0 ? (
                  <>
                    <div className="h-64 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={(entry) => `${entry.symbol} ${entry.allocation.toFixed(1)}%`}
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [formatCurrency(value), "Value"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-2">
                      {allocationData.map((crypto) => (
                        <div key={crypto.symbol} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: crypto.color }}
                            ></div>
                            <span className="text-sm font-medium">{crypto.symbol}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{crypto.allocation.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(crypto.value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Position Details
                </CardTitle>
                <CardDescription>
                  Individual crypto performance and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioMetrics?.positions.map((position: any) => (
                    <div key={position.symbol} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: cryptoColors[position.symbol] || '#8884d8' }}
                          ></div>
                          <span className="font-semibold">{position.symbol}</span>
                        </div>
                        <Badge variant={position.unrealizedPnL >= 0 ? "default" : "destructive"}>
                          {formatPercentage(position.unrealizedPnLPercent)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Holdings</p>
                          <p className="font-medium">{formatCrypto(position.totalAmount, position.symbol)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-medium">{formatCurrency(position.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Cost</p>
                          <p className="font-medium">{formatCurrency(position.averagePrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-medium">{formatCurrency(position.currentPrice)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                        <span className={`font-semibold ${
                          position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatCurrency(position.unrealizedPnL)}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No positions found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest portfolio activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          transaction.transaction_type === 'buy' || transaction.transaction_type === 'deposit' 
                            ? 'default' 
                            : 'destructive'
                        }
                      >
                        {transaction.transaction_type}
                      </Badge>
                      <div>
                        <p className="font-medium">{transaction.crypto_symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCrypto(transaction.amount, transaction.crypto_symbol)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ {formatCurrency(transaction.purchase_price)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionForm user={user} onTransactionComplete={fetchPortfolioData} />
        </TabsContent>

        <TabsContent value="sync">
          <WalletSync onSyncComplete={fetchPortfolioData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManager;