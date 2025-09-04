import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  Target,
  ArrowUpDown
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface PortfolioManagerProps {
  user: User;
}

interface PortfolioData {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  allocation: number;
  performance24h: number;
  color: string;
}

interface Transaction {
  id: string;
  crypto_symbol: string;
  amount: number;
  transaction_type: string;
  created_at: string;
  status: string;
}

const PortfolioManager: React.FC<PortfolioManagerProps> = ({ user }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const cryptoColors = {
    BTC: '#f7931a',
    ETH: '#627eea',
    USDT: '#26a17b',
    BNB: '#f3ba2f',
    ADA: '#0033ad'
  };

  const mockPrices = {
    BTC: 45000,
    ETH: 3000,
    USDT: 1,
    BNB: 300,
    ADA: 0.5
  };

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      // Fetch recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionError) throw transactionError;

      // Calculate portfolio data
      const cryptos = [
        { symbol: 'BTC', name: 'Bitcoin', balance: balanceData.btc_balance },
        { symbol: 'ETH', name: 'Ethereum', balance: balanceData.eth_balance },
        { symbol: 'USDT', name: 'Tether', balance: balanceData.usdt_balance },
        { symbol: 'BNB', name: 'BNB', balance: balanceData.bnb_balance },
        { symbol: 'ADA', name: 'Cardano', balance: balanceData.ada_balance }
      ];

      let total = 0;
      const portfolio = cryptos.map((crypto) => {
        const price = mockPrices[crypto.symbol as keyof typeof mockPrices];
        const value = crypto.balance * price;
        total += value;
        
        return {
          symbol: crypto.symbol,
          name: crypto.name,
          balance: crypto.balance,
          value,
          allocation: 0, // Will calculate after total
          performance24h: (Math.random() - 0.5) * 10, // Mock 24h performance
          color: cryptoColors[crypto.symbol as keyof typeof cryptoColors]
        };
      }).filter(crypto => crypto.balance > 0);

      // Calculate allocations
      const portfolioWithAllocations = portfolio.map(crypto => ({
        ...crypto,
        allocation: total > 0 ? (crypto.value / total) * 100 : 0
      }));

      setPortfolioData(portfolioWithAllocations);
      setTotalValue(total);
      setTransactions(transactionData || []);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [user.id]);

  const rebalanceRecommendations = portfolioData.map(crypto => {
    const targetAllocation = 20; // Equal weight target
    const currentAllocation = crypto.allocation;
    const difference = targetAllocation - currentAllocation;
    
    return {
      symbol: crypto.symbol,
      current: currentAllocation,
      target: targetAllocation,
      difference,
      action: difference > 5 ? 'BUY' : difference < -5 ? 'SELL' : 'HOLD'
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol}`;
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

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">24h Change</span>
            </div>
            <p className="text-2xl font-bold text-green-500">+5.24%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Assets</span>
            </div>
            <p className="text-2xl font-bold">{portfolioData.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Diversification</span>
            </div>
            <p className="text-2xl font-bold">Good</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Portfolio Allocation
            </CardTitle>
            <CardDescription>
              Distribution of your crypto holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.symbol} ${entry.allocation.toFixed(1)}%`}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Value"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {portfolioData.map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: crypto.color }}
                    ></div>
                    <span className="text-sm font-medium">{crypto.name}</span>
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

        {/* Rebalancing Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              Rebalancing Recommendations
            </CardTitle>
            <CardDescription>
              Suggested actions to optimize your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rebalanceRecommendations.map((rec) => (
                <div key={rec.symbol} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{rec.symbol}</span>
                    <Badge 
                      variant={rec.action === 'BUY' ? 'default' : rec.action === 'SELL' ? 'destructive' : 'secondary'}
                    >
                      {rec.action}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Current: {rec.current.toFixed(1)}%</span>
                      <span>Target: {rec.target}%</span>
                    </div>
                    <Progress value={rec.current} className="h-2" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {rec.difference > 0 
                      ? `Consider buying ${Math.abs(rec.difference).toFixed(1)}% more`
                      : rec.difference < 0
                      ? `Consider selling ${Math.abs(rec.difference).toFixed(1)}%`
                      : 'Well balanced'
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest portfolio activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={transaction.transaction_type === 'deposit' ? 'default' : 'destructive'}>
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
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}
                      {formatCrypto(transaction.amount, transaction.crypto_symbol)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
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
      </div>
    </div>
  );
};

export default PortfolioManager;