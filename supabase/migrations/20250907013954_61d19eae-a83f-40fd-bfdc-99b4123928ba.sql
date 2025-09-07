-- Fix RLS policies for crypto_prices table to allow edge functions to cache data
-- Edge functions need to be able to INSERT and UPDATE price data

-- Allow edge functions to insert/update crypto prices (using service role)
CREATE POLICY "Service role can manage crypto prices"
ON public.crypto_prices
FOR ALL
USING (true)
WITH CHECK (true);

-- Add indexes for better performance on price lookups
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_last_updated ON public.crypto_prices(last_updated);