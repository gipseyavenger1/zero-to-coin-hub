import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Use service role client to bypass RLS policies for system operations
const supabase = createClient(supabaseUrl, serviceRoleKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortfolioData {
  user_id: string
  current_value: number
  low_24h: number
  increase_percentage: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting portfolio monitoring check...')

    // First, create current portfolio snapshots for all users
    await supabase.rpc('create_portfolio_snapshots')
    console.log('Created portfolio snapshots')

    // Get current crypto prices
    const { data: prices, error: pricesError } = await supabase
      .from('crypto_prices')
      .select('symbol, price_usd')

    if (pricesError) {
      throw pricesError
    }

    const priceMap = Object.fromEntries(
      prices?.map(p => [p.symbol, p.price_usd]) || []
    )

    // Get all users with balances
    const { data: users, error: usersError } = await supabase
      .from('user_balances')
      .select('user_id, btc_balance, eth_balance, usdt_balance, bnb_balance, ada_balance')
      .or('btc_balance.gt.0,eth_balance.gt.0,usdt_balance.gt.0,bnb_balance.gt.0,ada_balance.gt.0')

    if (usersError) {
      throw usersError
    }

    console.log(`Checking ${users?.length || 0} users with active portfolios`)

    const detectedIncreases: PortfolioData[] = []

    for (const user of users || []) {
      try {
        // Calculate current portfolio value
        const currentValue = 
          (user.btc_balance * (priceMap['BTC'] || 0)) +
          (user.eth_balance * (priceMap['ETH'] || 0)) +
          (user.usdt_balance * (priceMap['USDT'] || 0)) +
          (user.bnb_balance * (priceMap['BNB'] || 0)) +
          (user.ada_balance * (priceMap['ADA'] || 0))

        if (currentValue <= 0) continue

        // Get portfolio snapshots from last 24 hours to find the lowest value
        const { data: snapshots, error: snapshotsError } = await supabase
          .from('portfolio_snapshots')
          .select('total_value')
          .eq('user_id', user.user_id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('total_value', { ascending: true })
          .limit(1)

        if (snapshotsError) {
          console.error(`Error fetching snapshots for user ${user.user_id}:`, snapshotsError)
          continue
        }

        if (!snapshots || snapshots.length === 0) {
          // No snapshots in last 24h, skip this user
          continue
        }

        const lowest24h = snapshots[0].total_value
        const increasePercentage = ((currentValue - lowest24h) / lowest24h) * 100

        console.log(`User ${user.user_id}: Current: $${currentValue.toFixed(2)}, 24h Low: $${lowest24h.toFixed(2)}, Increase: ${increasePercentage.toFixed(2)}%`)

        // Check if increase is 20% or more
        if (increasePercentage >= 20) {
          detectedIncreases.push({
            user_id: user.user_id,
            current_value: currentValue,
            low_24h: lowest24h,
            increase_percentage: increasePercentage
          })

          // Check if we already logged this increase today to avoid duplicates
          const today = new Date().toISOString().split('T')[0]
          const { data: existingLog } = await supabase
            .from('daily_value_updates')
            .select('id')
            .eq('user_id', user.user_id)
            .gte('update_date', today)
            .single()

          if (!existingLog) {
            // Log the increase to daily_value_updates table
            const { error: logError } = await supabase
              .from('daily_value_updates')
              .insert({
                user_id: user.user_id,
                previous_value: lowest24h,
                new_value: currentValue,
                increase_percentage: increasePercentage,
                crypto_symbol: 'PORTFOLIO', // Indicate this is a portfolio-wide increase
                update_date: today
              })

            if (logError) {
              console.error(`Error logging increase for user ${user.user_id}:`, logError)
            } else {
              console.log(`✓ Logged 20%+ increase for user ${user.user_id}: ${increasePercentage.toFixed(2)}%`)
            }
          } else {
            console.log(`Already logged increase for user ${user.user_id} today`)
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError)
      }
    }

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      users_checked: users?.length || 0,
      increases_detected: detectedIncreases.length,
      details: detectedIncreases.map(d => ({
        user_id: d.user_id,
        increase_percentage: Math.round(d.increase_percentage * 100) / 100
      }))
    }

    console.log('Portfolio monitoring completed:', response)

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in portfolio monitoring:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})