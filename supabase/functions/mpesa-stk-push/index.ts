// Supabase Edge Function for M-Pesa STK Push
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MpesaSTKRequest {
  phone: string;
  amount: number;
  orderId: string;
  accountReference: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId, accountReference }: MpesaSTKRequest = await req.json();

    // Validate input
    if (!phone || !amount || !orderId) {
      throw new Error('Missing required fields: phone, amount, orderId');
    }

    // Get M-Pesa credentials from environment variables
    const MPESA_CONSUMER_KEY = Deno.env.get('MPESA_CONSUMER_KEY');
    const MPESA_CONSUMER_SECRET = Deno.env.get('MPESA_CONSUMER_SECRET');
    const MPESA_PASSKEY = Deno.env.get('MPESA_PASSKEY');
    const MPESA_SHORTCODE = Deno.env.get('MPESA_SHORTCODE') || '174379';
    const MPESA_ENVIRONMENT = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
    const MPESA_CALLBACK_URL = Deno.env.get('MPESA_CALLBACK_URL');

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_PASSKEY) {
      throw new Error('M-Pesa credentials not configured');
    }

    // Determine base URL based on environment
    const baseUrl = MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // Step 1: Get OAuth token
    const authString = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
    const authResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
        },
      }
    );

    if (!authResponse.ok) {
      throw new Error('Failed to get M-Pesa access token');
    }

    const { access_token } = await authResponse.json();

    // Step 2: Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

    // Step 3: Generate password
    const passwordString = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
    const password = btoa(passwordString);

    // Step 4: Prepare STK Push request
    const stkPushPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount), // M-Pesa requires integer
      PartyA: phone, // Customer phone number
      PartyB: MPESA_SHORTCODE, // Business shortcode
      PhoneNumber: phone, // Phone number to receive the STK push
      CallBackURL: MPESA_CALLBACK_URL || `${req.headers.get('origin')}/api/mpesa/callback`,
      AccountReference: accountReference || orderId,
      TransactionDesc: `Payment for order ${orderId}`,
    };

    // Step 5: Initiate STK Push
    const stkResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();

    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      throw new Error(stkData.ResponseDescription || 'STK Push failed');
    }

    // Step 6: Update order with checkout request ID
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient
      .from('orders')
      .update({
        mpesa_checkout_request_id: stkData.CheckoutRequestID,
        status: 'pending_payment',
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('M-Pesa STK Push Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
