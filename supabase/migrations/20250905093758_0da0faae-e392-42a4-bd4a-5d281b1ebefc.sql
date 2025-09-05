-- Enhance crypto_transactions table for portfolio tracking
ALTER TABLE crypto_transactions 
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fees NUMERIC(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_value NUMERIC(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS exchange TEXT DEFAULT 'manual';

-- Create index for better performance on user transactions
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_symbol ON crypto_transactions(user_id, crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_date ON crypto_transactions(created_at);

-- Create a table for storing real-time price data cache
CREATE TABLE IF NOT EXISTS crypto_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price_usd NUMERIC(20,8) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  market_cap NUMERIC(20,2),
  volume_24h NUMERIC(20,2),
  change_24h NUMERIC(8,4)
);

-- Enable RLS on crypto_prices
ALTER TABLE crypto_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for crypto_prices (read-only for everyone)
CREATE POLICY "Anyone can view crypto prices" 
ON crypto_prices 
FOR SELECT 
USING (true);

-- Create unique index on symbol for crypto_prices
CREATE UNIQUE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON crypto_prices(symbol);

-- Create a table for portfolio snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_value NUMERIC(20,8) NOT NULL,
  total_cost NUMERIC(20,8) NOT NULL,
  unrealized_pnl NUMERIC(20,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on portfolio_snapshots
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_snapshots
CREATE POLICY "Users can view their own snapshots" 
ON portfolio_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snapshots" 
ON portfolio_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for portfolio snapshots
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, created_at);