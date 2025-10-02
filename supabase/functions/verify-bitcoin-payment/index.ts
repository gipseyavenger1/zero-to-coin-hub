import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  payment_tx_hash: string;
  investment_amount: number;
  projected_profit: number;
  plan_type: string;
  status: string;
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

    console.log('Starting Bitcoin payment verification process...');

    // Fetch all pending subscriptions
    const { data: pendingSubscriptions, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching pending subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingSubscriptions?.length || 0} pending subscriptions`);

    const results = [];

    for (const subscription of (pendingSubscriptions || [])) {
      const sub = subscription as SubscriptionRecord;
      console.log(`Verifying transaction: ${sub.payment_tx_hash}`);

      try {
        // Use BlockCypher API to verify the Bitcoin transaction
        const txResponse = await fetch(
          `https://api.blockcypher.com/v1/btc/main/txs/${sub.payment_tx_hash}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!txResponse.ok) {
          console.log(`Transaction ${sub.payment_tx_hash} not found or invalid`);
          results.push({
            subscription_id: sub.id,
            status: 'error',
            message: 'Transaction not found',
          });
          continue;
        }

        const txData = await txResponse.json();
        console.log(`Transaction data:`, JSON.stringify(txData, null, 2));

        // Check if transaction has at least 1 confirmation
        const confirmations = txData.confirmations || 0;
        const isConfirmed = confirmations >= 1;

        // Verify the transaction is to our Bitcoin address
        const BITCOIN_ADDRESS = '1D5eHx9YTgqSNkdCWfqN3s7Ei7nQA8Wc39';
        const hasCorrectAddress = txData.outputs?.some(
          (output: { addresses?: string[] }) =>
            output.addresses?.includes(BITCOIN_ADDRESS)
        );

        if (!hasCorrectAddress) {
          console.log(`Transaction ${sub.payment_tx_hash} does not send to correct address`);
          results.push({
            subscription_id: sub.id,
            status: 'error',
            message: 'Incorrect recipient address',
          });
          continue;
        }

        if (isConfirmed) {
          // Update subscription to active
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'active',
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

          if (updateError) {
            console.error(`Error updating subscription ${sub.id}:`, updateError);
            throw updateError;
          }

          console.log(`✓ Subscription ${sub.id} activated successfully`);
          results.push({
            subscription_id: sub.id,
            status: 'activated',
            confirmations,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          });
        } else {
          console.log(`Transaction ${sub.payment_tx_hash} has ${confirmations} confirmations (need 1+)`);
          results.push({
            subscription_id: sub.id,
            status: 'pending',
            confirmations,
            message: 'Waiting for confirmations',
          });
        }
      } catch (txError) {
        console.error(`Error processing transaction ${sub.payment_tx_hash}:`, txError);
        results.push({
          subscription_id: sub.id,
          status: 'error',
          message: txError instanceof Error ? txError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Fatal error in payment verification:', error);
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
