-- Enable pg_cron extension for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests from cron jobs  
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to take portfolio snapshots for all users
CREATE OR REPLACE FUNCTION public.create_portfolio_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_record RECORD;
    total_value NUMERIC := 0;
    total_cost NUMERIC := 0;
BEGIN
    -- Loop through all users who have balances
    FOR user_record IN 
        SELECT DISTINCT user_id FROM user_balances 
        WHERE btc_balance > 0 OR eth_balance > 0 OR usdt_balance > 0 OR bnb_balance > 0 OR ada_balance > 0
    LOOP
        -- Calculate total portfolio value and cost for this user
        SELECT 
            COALESCE(
                (ub.btc_balance * COALESCE(cp_btc.price_usd, 0)) +
                (ub.eth_balance * COALESCE(cp_eth.price_usd, 0)) +
                (ub.usdt_balance * COALESCE(cp_usdt.price_usd, 0)) +
                (ub.bnb_balance * COALESCE(cp_bnb.price_usd, 0)) +
                (ub.ada_balance * COALESCE(cp_ada.price_usd, 0)), 
                0
            ) as portfolio_value,
            COALESCE(
                (SELECT SUM(
                    CASE 
                        WHEN transaction_type IN ('buy', 'deposit') THEN transaction_value
                        WHEN transaction_type IN ('sell', 'withdrawal') THEN -transaction_value
                        ELSE 0
                    END
                ) FROM crypto_transactions ct WHERE ct.user_id = user_record.user_id),
                0
            ) as portfolio_cost
        INTO total_value, total_cost
        FROM user_balances ub
        LEFT JOIN crypto_prices cp_btc ON cp_btc.symbol = 'BTC'
        LEFT JOIN crypto_prices cp_eth ON cp_eth.symbol = 'ETH' 
        LEFT JOIN crypto_prices cp_usdt ON cp_usdt.symbol = 'USDT'
        LEFT JOIN crypto_prices cp_bnb ON cp_bnb.symbol = 'BNB'
        LEFT JOIN crypto_prices cp_ada ON cp_ada.symbol = 'ADA'
        WHERE ub.user_id = user_record.user_id;

        -- Only create snapshot if portfolio has value
        IF total_value > 0 THEN
            INSERT INTO portfolio_snapshots (user_id, total_value, total_cost, unrealized_pnl)
            VALUES (
                user_record.user_id,
                total_value,
                total_cost,
                total_value - total_cost
            );
        END IF;
    END LOOP;
END;
$$;