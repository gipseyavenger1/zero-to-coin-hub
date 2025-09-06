-- Enable required extensions for CRON jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create table for tracking daily value updates
CREATE TABLE IF NOT EXISTS daily_value_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crypto_symbol TEXT NOT NULL,
  previous_value NUMERIC(20,8) NOT NULL,
  new_value NUMERIC(20,8) NOT NULL,
  increase_percentage NUMERIC(8,4) NOT NULL DEFAULT 20.0,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on daily_value_updates
ALTER TABLE daily_value_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_value_updates
CREATE POLICY "Users can view their own value updates" 
ON daily_value_updates 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_updates_user_date ON daily_value_updates(user_id, update_date);
CREATE INDEX IF NOT EXISTS idx_daily_updates_symbol_date ON daily_value_updates(crypto_symbol, update_date);

-- Create table for encrypted user settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notification_preferences JSONB DEFAULT '{"daily_updates": true, "portfolio_alerts": true, "security_notifications": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"data_sharing": false, "analytics": false}'::jsonb,
  encrypted_data TEXT, -- For GDPR-compliant encrypted storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON user_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for user_settings updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE daily_value_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE crypto_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_balances;