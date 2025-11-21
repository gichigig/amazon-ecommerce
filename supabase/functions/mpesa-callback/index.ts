// Supabase Edge Function for M-Pesa Callback
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Extract callback data
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the order with this checkout request ID
    const { data: orders, error: fetchError } = await supabaseClient
      .from('orders')
      .select('id')
      .eq('mpesa_checkout_request_id', CheckoutRequestID)
      .limit(1);

    if (fetchError || !orders || orders.length === 0) {
      console.error('Order not found for CheckoutRequestID:', CheckoutRequestID);
      // Still return success to M-Pesa to avoid retries
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderId = orders[0].id;

    // ResultCode 0 means success
    if (ResultCode === 0) {
      // Extract callback metadata
      const metadata = CallbackMetadata?.Item || [];
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find((item: any) => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      // Update order as paid
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          status: 'paid',
          mpesa_receipt_number: mpesaReceiptNumber,
          mpesa_phone: phoneNumber?.toString(),
          payment_completed_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order:', updateError);
      } else {
        console.log(`Order ${orderId} marked as paid. Receipt: ${mpesaReceiptNumber}`);
      }

    } else {
      // Payment failed or was cancelled
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          status: 'cancelled',
          payment_error: ResultDesc,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order:', updateError);
      } else {
        console.log(`Order ${orderId} cancelled. Reason: ${ResultDesc}`);
      }
    }

    // Respond to M-Pesa
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    
    // Still return success to M-Pesa to avoid infinite retries
    return new Response(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
