-- Create function to update user balance for a specific crypto
CREATE OR REPLACE FUNCTION update_balance(
  user_id_param UUID,
  crypto_symbol_param TEXT,
  amount_change_param NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Map crypto symbol to balance column
  CASE LOWER(crypto_symbol_param)
    WHEN 'btc' THEN
      UPDATE user_balances 
      SET btc_balance = GREATEST(btc_balance + amount_change_param, 0),
          updated_at = now()
      WHERE user_id = user_id_param;
    WHEN 'eth' THEN
      UPDATE user_balances 
      SET eth_balance = GREATEST(eth_balance + amount_change_param, 0),
          updated_at = now()
      WHERE user_id = user_id_param;
    WHEN 'usdt' THEN
      UPDATE user_balances 
      SET usdt_balance = GREATEST(usdt_balance + amount_change_param, 0),
          updated_at = now()
      WHERE user_id = user_id_param;
    WHEN 'bnb' THEN
      UPDATE user_balances 
      SET bnb_balance = GREATEST(bnb_balance + amount_change_param, 0),
          updated_at = now()
      WHERE user_id = user_id_param;
    WHEN 'ada' THEN
      UPDATE user_balances 
      SET ada_balance = GREATEST(ada_balance + amount_change_param, 0),
          updated_at = now()
      WHERE user_id = user_id_param;
    ELSE
      RAISE EXCEPTION 'Unsupported crypto symbol: %', crypto_symbol_param;
  END CASE;
  
  -- If no rows were updated, create a new balance record
  IF NOT FOUND THEN
    INSERT INTO user_balances (user_id) VALUES (user_id_param);
    -- Recursively call to update the newly created record
    PERFORM update_balance(user_id_param, crypto_symbol_param, amount_change_param);
  END IF;
END;
$$;