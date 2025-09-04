import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

interface PortfolioData {
  time: string;
  value: number;
  change: number;
}

const CryptoChart: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--primary))",
    },
  };

  useEffect(() => {
    // Generate realistic portfolio performance data
    const generatePortfolioData = () => {
      const data: PortfolioData[] = [];
      const now = new Date();
      const baseValue = 12500; // Starting portfolio value
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
        const trendFactor = (24 - i) / 24 * 0.03; // Slight upward trend
        const value = baseValue * (1 + variation + trendFactor);
        const change = i === 23 ? 0 : ((value - data[data.length - 1]?.value) / data[data.length - 1]?.value) * 100;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value * 100) / 100,
          change: Math.round(change * 100) / 100
        });
      }
      return data;
    };

    setTimeout(() => {
      setPortfolioData(generatePortfolioData());
      setLoading(false);
    }, 500);

    // Update data every minute for live effect
    const interval = setInterval(() => {
      setPortfolioData(generatePortfolioData());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const currentValue = portfolioData[portfolioData.length - 1]?.value || 0;
  const initialValue = portfolioData[0]?.value || 0;
  const totalChange = currentValue - initialValue;
  const changePercentage = initialValue > 0 ? ((totalChange / initialValue) * 100) : 0;
  const isPositive = changePercentage >= 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Portfolio Performance
        </CardTitle>
        <CardDescription>
          Real-time tracking of your cryptocurrency investments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold">
                ${currentValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Current Portfolio Value</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
              <span className="font-medium">
                {isPositive ? '+' : ''}{changePercentage.toFixed(2)}% 
                ({isPositive ? '+' : ''}${totalChange.toLocaleString()})
              </span>
            </div>
          </div>
          
          <div className="h-64">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Portfolio Value"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className={`mt-4 p-4 rounded-lg border ${
            isPositive 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
              <h4 className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                Portfolio {isPositive ? 'Growth' : 'Update'}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Your portfolio has {isPositive ? 'gained' : 'fluctuated by'} 
              <strong className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {' '}{Math.abs(changePercentage).toFixed(2)}%
              </strong> in the last 24 hours.
              {isPositive && ' Keep up the great work!'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoChart;