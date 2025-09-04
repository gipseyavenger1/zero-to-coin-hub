import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, RefreshCw } from 'lucide-react';

interface CryptoChartProps {
  onAddCrypto: (amount: number) => void;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ onAddCrypto }) => {
  const [chartData, setChartData] = useState([
    { time: '00:00', value: 10000, growth: 0 },
    { time: '04:00', value: 10500, growth: 5 },
    { time: '08:00', value: 11200, growth: 12 },
    { time: '12:00', value: 12000, growth: 20 },
    { time: '16:00', value: 12800, growth: 28 },
    { time: '20:00', value: 13000, growth: 30 },
  ]);

  const [isGrowing, setIsGrowing] = useState(false);
  const [totalGrowth, setTotalGrowth] = useState(30);

  const chartConfig = {
    value: {
      label: "Portfolio Value",
      color: "hsl(var(--primary))",
    },
  };

  const simulateGrowth = () => {
    setIsGrowing(true);
    const baseValue = chartData[0].value;
    
    // Simulate adding $1000 and show 30% growth
    const newBaseValue = baseValue + 1000;
    const growthTarget = 30;
    
    const newData = [
      { time: '00:00', value: newBaseValue, growth: 0 },
      { time: '04:00', value: newBaseValue * 1.05, growth: 5 },
      { time: '08:00', value: newBaseValue * 1.12, growth: 12 },
      { time: '12:00', value: newBaseValue * 1.20, growth: 20 },
      { time: '16:00', value: newBaseValue * 1.28, growth: 28 },
      { time: '20:00', value: newBaseValue * 1.30, growth: 30 },
    ];

    // Animate the chart update
    setTimeout(() => {
      setChartData(newData);
      setTotalGrowth(30);
      onAddCrypto(1000);
      setIsGrowing(false);
    }, 1000);
  };

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const initialValue = chartData[0]?.value || 0;
  const growthAmount = currentValue - initialValue;
  const growthPercentage = ((growthAmount / initialValue) * 100).toFixed(1);

  return (
    <Card className="crypto-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Your crypto investments are performing exceptionally well
            </CardDescription>
          </div>
          <Button 
            onClick={simulateGrowth}
            disabled={isGrowing}
            className="flex items-center gap-2"
          >
            {isGrowing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add $1000
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-2xl font-bold text-primary">
                ${currentValue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Current Portfolio Value</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">
                +{growthPercentage}% (+${growthAmount.toLocaleString()})
              </span>
            </div>
          </div>
          
          <div className="h-64">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
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
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h4 className="font-semibold text-green-500">Exceptional Growth!</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Your portfolio has grown by <strong className="text-green-500">{totalGrowth}%</strong> since you started investing. 
              Keep adding crypto to see even better returns!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoChart;