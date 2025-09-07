import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Target,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock,
  Plus
} from 'lucide-react';
import { calculatePortfolioMetrics, formatCurrency, formatPercentage, formatCrypto } from '@/utils/portfolioCalculations';
import { useRealTimePrices } from '@/hooks/useRealTimePrices';
import TransactionForm from './TransactionForm';
import ZeroStatePortfolio from './ZeroStatePortfolio';
import { CRYPTO_CONFIG, getCryptoColor } from '@/config/cryptoConfig';
import type { User } from '@supabase/supabase-js';

interface RealTimePortfolioTrackerProps {
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

const RealTimePortfolioTracker: React.FC<RealTimePortfolioTrackerProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [performanceAlert, setPerformanceAlert] = useState<string | null>(null);

  // Get unique symbols from transactions
  const symbols = useMemo(() => {
    return Array.from(new Set(transactions.map(tx => tx.crypto_symbol)));
  }, [transactions]);

  // Use real-time prices hook - only enabled if we have assets
  const { 
    prices, 
    loading: pricesLoading, 
    error: pricesError, 
    lastUpdate, 
    refreshPrices,
    retryCount 
  } = useRealTimePrices({
    symbols,
    enabled: symbols.length > 0,
    refreshInterval: CRYPTO_CONFIG.PRICE_UPDATE_INTERVAL
  });

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

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data: transactionData, error: transactionError } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;
      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio metrics when transactions or prices change
  useEffect(() => {
    if (transactions.length > 0 && prices.length > 0) {
      const metrics = calculatePortfolioMetrics(transactions, prices);
      setPortfolioMetrics(metrics);
      
      // Check for performance milestones
      if (metrics.totalPnLPercent >= CRYPTO_CONFIG.PERFORMANCE_ALERT_THRESHOLD) {
        setPerformanceAlert(`🎉 Congratulations! Your portfolio has gained ${formatPercentage(metrics.totalPnLPercent)}!`);
      } else if (metrics.totalPnLPercent <= -CRYPTO_CONFIG.PERFORMANCE_ALERT_THRESHOLD) {
        setPerformanceAlert(`⚠️ Your portfolio has declined ${formatPercentage(Math.abs(metrics.totalPnLPercent))}. Consider reviewing your positions.`);
      } else if (metrics.totalPnLPercent >= CRYPTO_CONFIG.HIGH_PERFORMANCE_THRESHOLD) {
        setPerformanceAlert(`🚀 Outstanding performance! Your portfolio has gained ${formatPercentage(metrics.totalPnLPercent)}! You might consider taking some profits.`);
      }
    } else if (transactions.length === 0) {
      setPortfolioMetrics(null);
      setPerformanceAlert(null);
    }
  }, [transactions, prices]);

  useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const getPortfolioAllocationData = () => {
    if (!portfolioMetrics || portfolioMetrics.positions.length === 0) return [];
    
    return portfolioMetrics.positions.map((position: any) => ({
      symbol: position.symbol,
      value: position.currentValue,
      allocation: (position.currentValue / portfolioMetrics.totalValue) * 100,
      color: getCryptoColor(position.symbol)
    }));
  };

  const handleTransactionComplete = () => {
    fetchTransactions();
    setShowAddTransaction(false);
  };

  // Show zero state if no transactions
  if (!loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <ZeroStatePortfolio onAddFirstAsset={() => setShowAddTransaction(true)} />
        
        {showAddTransaction && (
          <Card>
            <CardHeader>
              <CardTitle>Add Your First Crypto Asset</CardTitle>
              <CardDescription>
                Start tracking your portfolio by adding a cryptocurrency transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm
                user={user}
                onTransactionComplete={handleTransactionComplete}
                onCancel={() => setShowAddTransaction(false)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const allocationData = getPortfolioAllocationData();
  const hasPositions = portfolioMetrics && portfolioMetrics.positions.length > 0;

  return (
    <div className="space-y-6">
      {/* Performance Alert */}
      {performanceAlert && (
        <Alert className={`border-l-4 ${
          performanceAlert.includes('🎉') 
            ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
            : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {performanceAlert}
          </AlertDescription>
        </Alert>
      )}

      {/* Real-Time Status Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pricesLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium">
                  {pricesLoading ? 'Updating prices...' : 'Live prices active'}
                </span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshPrices}
                disabled={pricesLoading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${pricesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowAddTransaction(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Asset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {pricesError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {pricesError} 
            {retryCount > 0 && ` (Retry ${retryCount}/3)`}
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Value</span>
              {pricesLoading && <Zap className="h-3 w-3 text-amber-500 animate-pulse" />}
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
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Active Assets</span>
            </div>
            <p className="text-2xl font-bold">
              {portfolioMetrics?.positions.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      {hasPositions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Asset Allocation
              </CardTitle>
              <CardDescription>
                Portfolio distribution by current market value
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Position Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Position Performance
              </CardTitle>
              <CardDescription>
                Individual asset performance and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {portfolioMetrics?.positions.map((position: any) => (
                  <div key={position.symbol} className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCryptoColor(position.symbol) }}
                        ></div>
                        <span className="font-semibold">{position.symbol}</span>
                        {pricesLoading && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>}
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
                      <span className="text-sm text-muted-foreground">P&L</span>
                      <span className={`font-semibold ${
                        position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(position.unrealizedPnL)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Add Crypto Transaction</CardTitle>
            <CardDescription>
              Add a new cryptocurrency transaction to track your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm
              user={user}
              onTransactionComplete={handleTransactionComplete}
              onCancel={() => setShowAddTransaction(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimePortfolioTracker;