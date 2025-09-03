import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import CryptoDashboard from '@/components/CryptoDashboard';
import { Bitcoin, TrendingUp, Wallet, Shield, Zap, ArrowRight } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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

  if (user) {
    return <CryptoDashboard user={user} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="crypto-gradient p-4 rounded-full animate-float">
                <Bitcoin className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              CryptoInvest Pro
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Professional cryptocurrency investment platform with secure wallets, 
              real-time trading, and institutional-grade security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose CryptoInvest Pro?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for serious investors who demand the best in security, performance, and features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="crypto-card p-8 text-center">
            <div className="crypto-gradient p-4 rounded-full w-fit mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4">Bank-Level Security</h3>
            <p className="text-muted-foreground">
              Multi-signature wallets, cold storage, and 24/7 monitoring keep your assets safe.
            </p>
          </div>

          <div className="crypto-card p-8 text-center">
            <div className="crypto-gradient p-4 rounded-full w-fit mx-auto mb-6">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Instant deposits, rapid withdrawals, and real-time trading execution.
            </p>
          </div>

          <div className="crypto-card p-8 text-center">
            <div className="crypto-gradient p-4 rounded-full w-fit mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4">Professional Tools</h3>
            <p className="text-muted-foreground">
              Advanced charting, portfolio analytics, and automated trading strategies.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Cryptos */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Major Cryptocurrencies Supported
          </h2>
          <p className="text-xl text-muted-foreground">
            Trade the top digital assets with professional-grade tools
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { name: 'Bitcoin', symbol: 'BTC', color: 'text-orange-500' },
            { name: 'Ethereum', symbol: 'ETH', color: 'text-blue-500' },
            { name: 'Tether', symbol: 'USDT', color: 'text-green-500' },
            { name: 'Binance Coin', symbol: 'BNB', color: 'text-yellow-500' },
            { name: 'Cardano', symbol: 'ADA', color: 'text-blue-600' },
          ].map((crypto, index) => (
            <div key={crypto.symbol} className="crypto-card p-6 text-center animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className={`text-3xl font-bold ${crypto.color} mb-2`}>
                {crypto.symbol}
              </div>
              <div className="text-sm text-muted-foreground">
                {crypto.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="crypto-card p-12 text-center">
          <Wallet className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Crypto Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust CryptoInvest Pro for their digital asset management.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-12 py-6"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
