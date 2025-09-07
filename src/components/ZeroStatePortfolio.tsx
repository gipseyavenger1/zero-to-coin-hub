import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Wallet, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Shield
} from 'lucide-react';

interface ZeroStatePortfolioProps {
  onAddFirstAsset: () => void;
}

const ZeroStatePortfolio: React.FC<ZeroStatePortfolioProps> = ({ onAddFirstAsset }) => {
  return (
    <div className="space-y-6">
      {/* Zero Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">$0.00</p>
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">+0.00%</p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Assets</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">0</p>
          </CardContent>
        </Card>
        
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Allocation</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">N/A</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Your Crypto Portfolio</CardTitle>
          <CardDescription className="text-lg">
            Start building your cryptocurrency portfolio with real-time tracking and professional analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Button 
            onClick={onAddFirstAsset}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Your First Crypto Asset
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Live price tracking with CoinMarketCap integration
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Profit/loss tracking, allocation charts, and performance metrics
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-200">Pro Tip</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Track a <strong>20% portfolio increase</strong> milestone! Our system will automatically highlight 
              significant performance achievements in your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZeroStatePortfolio;