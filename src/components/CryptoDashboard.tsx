import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bitcoin, 
  Wallet, 
  TrendingUp, 
  Copy, 
  DollarSign,
  Shield,
  Zap,
  Coins,
  Send,
  Plus
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import SendCryptoModal from './SendCryptoModal';
import AddCryptoModal from './AddCryptoModal';
import CryptoChart from './CryptoChart';
import RealTimePriceChart from './RealTimePriceChart';

import RealTimePortfolioTracker from './RealTimePortfolioTracker';

interface CryptoWallet {
  id: string;
  crypto_symbol: string;
  crypto_name: string;
  wallet_address: string;
  network: string;
}

interface UserBalance {
  total_balance: number;
  btc_balance: number;
  eth_balance: number;
  usdt_balance: number;
  bnb_balance: number;
  ada_balance: number;
}

interface CryptoDashboardProps {
  user: User;
  onSignOut: () => void;
}

const cryptoIcons: Record<string, React.ReactNode> = {
  BTC: <Bitcoin className="h-6 w-6 text-orange-500" />,
  ETH: <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Ξ</div>,
  USDT: <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">₮</div>,
  BNB: <div className="h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">B</div>,
  ADA: <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">₳</div>,
};

const CryptoDashboard: React.FC<CryptoDashboardProps> = ({ user, onSignOut }) => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch crypto wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('is_active', true)
        .order('crypto_symbol');

      if (walletsError) throw walletsError;

      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      setWallets(walletsData || []);
      setBalance(balanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, cryptoName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${cryptoName} wallet address copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin crypto-gradient p-4 rounded-full">
          <Bitcoin className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="crypto-gradient p-2 rounded-lg animate-pulse-slow">
                <Bitcoin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CryptoInvest Pro</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.user_metadata?.full_name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="default"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Crypto
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowSendModal(true)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
              <Button variant="outline" onClick={onSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="crypto-card balance-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatBalance(balance?.total_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">USD Equivalent</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bitcoin</CardTitle>
              {cryptoIcons.BTC}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(balance?.btc_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">BTC</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ethereum</CardTitle>
              {cryptoIcons.ETH}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(balance?.eth_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">ETH</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">USDT</CardTitle>
              {cryptoIcons.USDT}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(balance?.usdt_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">USDT</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Portfolio Tracker */}
        <RealTimePortfolioTracker user={user} />


        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="crypto-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Secure Trading</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bank-level security with multi-signature wallets and cold storage protection.
              </p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Fast Transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lightning-fast deposits and withdrawals with real-time processing.
              </p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Professional Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced charting, portfolio analytics, and trading indicators.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Wallets */}
        <Card className="crypto-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <CardTitle>Deposit Addresses</CardTitle>
            </div>
            <CardDescription>
              Send your cryptocurrency to these addresses to fund your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {cryptoIcons[wallet.crypto_symbol]}
                      <div>
                        <h3 className="font-semibold">{wallet.crypto_name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {wallet.network}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.wallet_address, wallet.crypto_name)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-mono break-all text-muted-foreground">
                      {wallet.wallet_address}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Only send {wallet.crypto_symbol} to this address
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">BNB Balance</CardTitle>
              {cryptoIcons.BNB}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(balance?.bnb_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">BNB</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cardano Balance</CardTitle>
              {cryptoIcons.ADA}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(balance?.ada_balance || 0)}</div>
              <p className="text-xs text-muted-foreground">ADA</p>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <SendCryptoModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          user={user}
          userBalance={balance}
          onTransactionComplete={fetchData}
        />
        
        <AddCryptoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          user={user}
          onTransactionComplete={fetchData}
        />
      </div>
    </div>
  );
};

export default CryptoDashboard;