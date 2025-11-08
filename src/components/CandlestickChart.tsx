import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CandlestickChartProps {
  symbol?: string;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  color: string;
}

const CandlestickChart = ({ symbol = 'BTC' }: CandlestickChartProps) => {
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');

  const generateCandlestickData = (days: number): CandleData[] => {
    const candleData: CandleData[] = [];
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    let basePrice = 45000;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * dayInMs);
      const open = basePrice + (Math.random() - 0.5) * 2000;
      const close = open + (Math.random() - 0.5) * 3000;
      const high = Math.max(open, close) + Math.random() * 1000;
      const low = Math.min(open, close) - Math.random() * 1000;

      candleData.push({
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        open,
        high,
        low,
        close,
        color: close >= open ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
      });

      basePrice = close;
    }

    return candleData;
  };

  useEffect(() => {
    setLoading(true);
    const days = timeframe === '1D' ? 7 : timeframe === '1W' ? 30 : 90;
    const newData = generateCandlestickData(days);
    setData(newData);
    setTimeout(() => setLoading(false), 300);
  }, [timeframe]);

  const handleRefresh = () => {
    setLoading(true);
    const days = timeframe === '1D' ? 7 : timeframe === '1W' ? 30 : 90;
    const newData = generateCandlestickData(days);
    setData(newData);
    setTimeout(() => setLoading(false), 500);
  };

  const CandlestickBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, high, low, close } = payload;
    
    const isGreen = close >= open;
    const color = isGreen ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))';
    const bodyY = Math.min(open, close);
    const bodyHeight = Math.abs(close - open);
    
    return (
      <g>
        {/* Wick (high-low line) */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body (open-close rectangle) */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={bodyHeight || 1}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{symbol}/USD Candlestick Chart</CardTitle>
            <CardDescription>Real-time price action and trends</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant={timeframe === '1D' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('1D')}
          >
            1D
          </Button>
          <Button
            variant={timeframe === '1W' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('1W')}
          >
            1W
          </Button>
          <Button
            variant={timeframe === '1M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('1M')}
          >
            1M
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={['dataMin - 1000', 'dataMax + 1000']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="high" 
                shape={<CandlestickBar />}
                isAnimationActive={!loading}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CandlestickChart;
