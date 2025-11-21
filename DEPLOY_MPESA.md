# Deploying M-Pesa to Supabase Edge Functions

## Quick Deploy Guide

### Step 1: Install Supabase CLI

**Windows (PowerShell)**:
```powershell
# Using Scoop
scoop install supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

### Step 3: Link Your Project

Get your project reference from Supabase Dashboard (Settings > API > Project URL)

```bash
supabase link --project-ref your-project-ref
```

Example: If your URL is `https://abcdefghijk.supabase.co`, then `abcdefghijk` is your project ref.

### Step 4: Update Database Schema

Run the updated schema in your Supabase SQL Editor (Dashboard > SQL Editor):
- Copy all contents from `supabase-schema.sql`
- Run it

This adds the new columns needed for M-Pesa callbacks.

### Step 5: Deploy Edge Functions

```bash
# Deploy STK Push function
supabase functions deploy mpesa-stk-push

# Deploy Callback function
supabase functions deploy mpesa-callback
```

### Step 6: Set Environment Secrets

Replace `your-project-ref` with your actual project reference:

```bash
# M-Pesa Sandbox Credentials
supabase secrets set MPESA_CONSUMER_KEY=OhHQQ9IVx2d25GL4FcGAtuRMjPDbna5tnlixpdVt80cH6rjj

supabase secrets set MPESA_CONSUMER_SECRET=ZSHmcoFWAIs8AmowGxBUBWBQaOV8afMf8dEQO83ZAyw6tAe7c11KdNibF7vHFGyA

supabase secrets set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

supabase secrets set MPESA_SHORTCODE=174379

supabase secrets set MPESA_ENVIRONMENT=sandbox

# Replace YOUR-PROJECT-REF with your actual project reference
supabase secrets set MPESA_CALLBACK_URL=https://YOUR-PROJECT-REF.supabase.co/functions/v1/mpesa-callback
```

### Step 7: Update Frontend

Update `user-app/src/components/MpesaCheckout.jsx` to call the Edge Function.

Find the `handlePayment` function and replace the simulated payment with:

```javascript
const handlePayment = async () => {
  try {
    setIsProcessing(true);
    setPaymentStatus('initiating');

    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Please login to continue');
    }

    // Call Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mpesa-stk-push`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: totalAmount,
          orderId: orderData.id,
          accountReference: 'E-Commerce Store',
        }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to initiate payment');
    }

    setPaymentStatus('processing');
    setError('');

    // Poll for payment confirmation
    checkPaymentStatus(orderData.id);

  } catch (err) {
    setError(err.message);
    setPaymentStatus('failed');
  } finally {
    setIsProcessing(false);
  }
};

// Add payment status checking
const checkPaymentStatus = async (orderId) => {
  const maxAttempts = 30; // 30 seconds
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;

    const { data: order } = await supabase
      .from('orders')
      .select('status, mpesa_receipt_number')
      .eq('id', orderId)
      .single();

    if (order?.status === 'paid') {
      setPaymentStatus('success');
      clearInterval(interval);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else if (order?.status === 'cancelled' || attempts >= maxAttempts) {
      setPaymentStatus('failed');
      setError('Payment timeout or cancelled');
      clearInterval(interval);
    }
  }, 1000);
};
```

### Step 8: Test It!

1. **Start your user app**:
   ```bash
   cd user-app
   npm run dev
   ```

2. **Add items to cart and checkout**

3. **Use sandbox test number**: `254708374149`

4. **Check Edge Function logs**:
   ```bash
   supabase functions logs mpesa-stk-push --follow
   ```

## Verify Deployment

### Check if functions are deployed:
```bash
supabase functions list
```

You should see:
- `mpesa-stk-push`
- `mpesa-callback`

### Check secrets are set:
```bash
supabase secrets list
```

You should see all M-Pesa variables.

### Test the function:
```bash
curl -i --location --request POST 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/mpesa-stk-push' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "phone": "254708374149",
    "amount": 1000,
    "orderId": "test-order-id",
    "accountReference": "TestOrder"
  }'
```

## Troubleshooting

### "supabase: command not found"
- Reinstall Supabase CLI
- Restart your terminal

### "Failed to link project"
- Make sure you're logged in: `supabase login`
- Verify your project ref is correct

### "Unauthorized" error when calling function
- Make sure you're passing the Authorization header
- Use the anon key from your Supabase Dashboard

### M-Pesa callback not working
- Verify the callback URL is correct and publicly accessible
- Check function logs: `supabase functions logs mpesa-callback`
- Test the callback function is deployed: `supabase functions list`

### Edge function errors
- View logs: `supabase functions logs mpesa-stk-push`
- Check all secrets are set: `supabase secrets list`

## Production Deployment

When moving to production:

1. **Get production M-Pesa credentials** from Safaricom
2. **Update secrets**:
   ```bash
   supabase secrets set MPESA_ENVIRONMENT=production
   supabase secrets set MPESA_CONSUMER_KEY=prod_key
   supabase secrets set MPESA_CONSUMER_SECRET=prod_secret
   supabase secrets set MPESA_PASSKEY=prod_passkey
   supabase secrets set MPESA_SHORTCODE=your_paybill
   ```
3. **Update callback URL** to production endpoint
4. **Test thoroughly** before going live

## Monitoring

- View realtime logs: `supabase functions logs mpesa-stk-push --follow`
- Check in Dashboard: Edge Functions > Select function > Logs
- Set up error alerting in your monitoring tool
