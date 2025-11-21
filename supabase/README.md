# Supabase Edge Functions

This directory contains Supabase Edge Functions for M-Pesa payment integration.

## Functions

### 1. `mpesa-stk-push`
Initiates M-Pesa STK Push to customer's phone.

**Endpoint**: `https://your-project-ref.supabase.co/functions/v1/mpesa-stk-push`

**Request**:
```json
{
  "phone": "254708374149",
  "amount": 1000,
  "orderId": "uuid-here",
  "accountReference": "Order123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "checkoutRequestId": "ws_CO_...",
  "merchantRequestId": "..."
}
```

### 2. `mpesa-callback`
Receives M-Pesa payment confirmation callbacks.

**Endpoint**: `https://your-project-ref.supabase.co/functions/v1/mpesa-callback`

This function is called automatically by M-Pesa when payment is completed.

## Setup

### Prerequisites
1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Deploy Functions

1. **Deploy STK Push function**:
   ```bash
   supabase functions deploy mpesa-stk-push
   ```

2. **Deploy Callback function**:
   ```bash
   supabase functions deploy mpesa-callback
   ```

### Set Environment Variables

Set your M-Pesa credentials as secrets:

```bash
# Consumer Key from Daraja Portal
supabase secrets set MPESA_CONSUMER_KEY=your_consumer_key_here

# Consumer Secret from Daraja Portal
supabase secrets set MPESA_CONSUMER_SECRET=your_consumer_secret_here

# Passkey (sandbox default)
supabase secrets set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Shortcode (sandbox default)
supabase secrets set MPESA_SHORTCODE=174379

# Environment (sandbox or production)
supabase secrets set MPESA_ENVIRONMENT=sandbox

# Callback URL (replace with your project ref)
supabase secrets set MPESA_CALLBACK_URL=https://your-project-ref.supabase.co/functions/v1/mpesa-callback
```

**Get your project ref**:
- Go to your Supabase Dashboard
- Settings > API
- Look for "Project URL" - the ref is between `https://` and `.supabase.co`

### Update Database Schema

Add the checkout request ID column to orders table:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error TEXT;
```

## Testing

### 1. Test Locally

Start local Supabase:
```bash
supabase start
```

Serve functions locally:
```bash
supabase functions serve
```

Test the function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/mpesa-stk-push' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone": "254708374149",
    "amount": 1000,
    "orderId": "test-order-id",
    "accountReference": "TestOrder"
  }'
```

### 2. Test in Production

After deploying, test with:
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/mpesa-stk-push' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone": "254708374149",
    "amount": 1000,
    "orderId": "your-order-uuid",
    "accountReference": "Order123"
  }'
```

### Sandbox Test Numbers
- Phone: `254708374149`
- PIN: `1234`

## Update Frontend

Update your `MpesaCheckout.jsx` to call the Edge Function:

```javascript
// In handlePayment function
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mpesa-stk-push`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: phoneNumber,
      amount: totalAmount,
      orderId: orderData.id,
      accountReference: 'Bluvberry Sales',
    }),
  }
);

const result = await response.json();
if (result.success) {
  setPaymentStatus('processing');
  // Poll for payment confirmation or use realtime subscriptions
}
```

## Monitoring

View function logs:
```bash
supabase functions logs mpesa-stk-push
supabase functions logs mpesa-callback
```

Or in Supabase Dashboard:
- Edge Functions > Select function > Logs

## Troubleshooting

### Function not receiving requests
- Check CORS is properly configured
- Verify Authorization header is included
- Check function logs for errors

### M-Pesa callback not working
- Verify callback URL is publicly accessible
- Check M-Pesa credentials are correct
- Ensure callback function doesn't require JWT verification

### Payment not updating order status
- Check callback function logs
- Verify order has mpesa_checkout_request_id set
- Ensure database permissions allow updates

## Production Checklist

- [ ] Deploy both functions to production
- [ ] Set all environment variables/secrets
- [ ] Update callback URL to production endpoint
- [ ] Test with sandbox credentials
- [ ] Get production M-Pesa credentials from Safaricom
- [ ] Switch to production environment
- [ ] Update frontend to use production function URLs
- [ ] Set up error monitoring
- [ ] Configure webhook retry handling
