-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user_balances table
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  btc_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  eth_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  usdt_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  bnb_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  ada_balance DECIMAL(20,8) NOT NULL DEFAULT 0.00000000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_balances
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Create policies for user_balances
CREATE POLICY "Users can view their own balance" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own balance" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
ON public.user_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create crypto_wallets table for deposit addresses
CREATE TABLE public.crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_symbol TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  network TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on crypto_wallets (public read access)
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to active wallets
CREATE POLICY "Anyone can view active crypto wallets" 
ON public.crypto_wallets 
FOR SELECT 
USING (is_active = true);

-- Insert the 5 major crypto wallet addresses
INSERT INTO public.crypto_wallets (crypto_symbol, crypto_name, wallet_address, network) VALUES
('BTC', 'Bitcoin', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'Bitcoin'),
('ETH', 'Ethereum', '0x742d35Cc6635C0532925a3b8D69AB9d8e6e31F7a', 'Ethereum'),
('USDT', 'Tether', '0x742d35Cc6635C0532925a3b8D69AB9d8e6e31F7a', 'Ethereum (ERC-20)'),
('BNB', 'Binance Coin', '0x742d35Cc6635C0532925a3b8D69AB9d8e6e31F7a', 'BNB Smart Chain'),
('ADA', 'Cardano', 'addr1qx2kd28nq8ac5prwrzyrdjpey82u4w7cqce3n00q4j5ux4lv7p8jsv9x3pk2a6a4p8zrgw5r0qvn90t3xbz89n6v3zxsy8gr0u', 'Cardano');

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  INSERT INTO public.user_balances (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_balances_updated_at
  BEFORE UPDATE ON public.user_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();