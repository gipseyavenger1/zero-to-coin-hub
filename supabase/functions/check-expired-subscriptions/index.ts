import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for expired subscriptions...');

    const now = new Date().toISOString();

    // Find all active subscriptions that have passed their end date
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active')
      .lt('end_date', now);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`);

    const results = [];

    for (const subscription of (expiredSubscriptions || [])) {
      console.log(`Expiring subscription ${subscription.id} for user ${subscription.user_id}`);

      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error(`Error expiring subscription ${subscription.id}:`, updateError);
        results.push({
          subscription_id: subscription.id,
          status: 'error',
          message: updateError.message,
        });
      } else {
        console.log(`✓ Successfully expired subscription ${subscription.id}`);
        results.push({
          subscription_id: subscription.id,
          status: 'expired',
          user_id: subscription.user_id,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: results.filter(r => r.status === 'expired').length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Fatal error checking expired subscriptions:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
