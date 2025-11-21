# M-Pesa Integration Guide

This guide explains how to integrate M-Pesa STK Push (Lipa Na M-Pesa Online) with your e-commerce platform.

## Overview

The application is configured to use Kenyan Shillings (KSH) and includes M-Pesa payment integration for checkout.

## Current Implementation

### Frontend (Demo Mode)
- ✅ M-Pesa checkout UI with modal
- ✅ Phone number validation (Kenyan format)
- ✅ Order creation in database
- ✅ Payment status tracking
- ⚠️ Simulated STK Push (for demo purposes)

### Database Changes
The `orders` table now includes:
- `payment_method` - Payment method used (default: 'mpesa')
- `mpesa_phone` - Customer's M-Pesa phone number
- `mpesa_receipt_number` - M-Pesa transaction receipt

## M-Pesa Sandbox Setup (Testing)

### Step 1: Register on Daraja Portal

1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Click **"Sign Up"** and create an account
3. Verify your email address
4. Log in to the portal

### Step 2: Create a Sandbox App

1. Click **"My Apps"** in the navigation
2. Click **"Add a new app"**
3. Fill in the details:
   - **App Name**: YourStoreName (e.g., "E-Commerce Store")
   - **Description**: E-commerce payment integration
4. Select **"Lipa Na M-Pesa Sandbox"** from the APIs list
5. Click **"Create App"**
6. You'll receive your credentials:
   - **Consumer Key** (like: `xYzAbC123...`)
   - **Consumer Secret** (like: `aBcXyZ789...`)
   - **Passkey** (for STK Push - like: `bfb279f9aa9bdbcf158e97dd71a467cd...`)

### Step 3: Test Credentials

**Sandbox Test Numbers** (provided by Safaricom):
```
254708374149  (Primary test number)
254708374150
254708374151
```

**Test M-Pesa PIN**: `1234` (same for all sandbox numbers)

**Sandbox Shortcode**: `174379` (default test business number)

### Step 4: Configure Your Application

Copy `.env.mpesa.example` to `.env` in your backend:

```bash
MPESA_CONSUMER_KEY=xYzAbC123...  # From Step 2
MPESA_CONSUMER_SECRET=aBcXyZ789...  # From Step 2
MPESA_PASSKEY=bfb279f9aa9bdbcf...  # From Step 2
MPESA_ENVIRONMENT=sandbox
MPESA_SHORTCODE=174379
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

## Production M-Pesa Integration

### 1. Get Production Credentials

1. Complete the Daraja production onboarding process
2. Provide your business documents
3. Get approval from Safaricom
4. Receive your production credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - **Passkey**
   - **Your Business Short Code** (Till or Paybill number)

### 2. Create Backend API

M-Pesa requires a backend server to:
- Generate OAuth tokens
- Initiate STK Push
- Handle M-Pesa callbacks
- Update order status

**Why Backend is Required:**
- Secure storage of API credentials
- Handle M-Pesa callbacks
- Prevent client-side credential exposure

### 3. Recommended Backend Setup

#### Option A: Node.js/Express Backend

```bash
# Install dependencies
npm install express axios dotenv cors
```

**Example Backend Structure:**
```
backend/
├── server.js
├── routes/
│   └── mpesa.js
├── controllers/
│   └── mpesaController.js
└── .env
```

**Environment Variables (.env):**
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

#### Option B: Supabase Edge Functions

You can use Supabase Edge Functions to handle M-Pesa:

```bash
supabase functions new mpesa-stk-push
supabase functions new mpesa-callback
```

### 4. Backend API Endpoints Needed

#### POST `/api/mpesa/stk-push`
Initiates M-Pesa STK Push

**Request:**
```json
{
  "phone": "254712345678",
  "amount": 1000,
  "orderId": "uuid",
  "accountReference": "Order #123"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_123456789",
  "message": "STK Push sent successfully"
}
```

#### POST `/api/mpesa/callback`
Receives M-Pesa payment confirmation

**M-Pesa sends:**
```json
{
  "Body": {
    "stkCallback": {
      "ResultCode": 0,
      "ResultDesc": "Success",
      "CheckoutRequestID": "ws_CO_123456789",
      "MerchantRequestID": "29115-34620561-1"
    }
  }
}
```

**Your backend should:**
1. Parse callback data
2. Update order status in Supabase
3. Clear user's cart
4. Send confirmation email (optional)

### 5. Update Frontend

In `MpesaCheckout.jsx`, replace the simulated payment with real API call:

```javascript
// Replace this section
const response = await fetch('YOUR_BACKEND_URL/api/mpesa/stk-push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: formattedPhone,
    amount: total,
    orderId: order.id,
    accountReference: `Order ${order.id.slice(0, 8)}`
  })
})

const data = await response.json()

if (data.success) {
  setMessage(`STK Push sent to ${formattedPhone}. Please enter your PIN.`)
  // Poll for payment status or wait for webhook
} else {
  throw new Error(data.message || 'Payment initiation failed')
}
```

### 6. M-Pesa STK Push Code Example

```javascript
// backend/controllers/mpesaController.js
const axios = require('axios')

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  )
  
  return response.data.access_token
}

async function initiateSTKPush(phone, amount, orderId, accountRef) {
  const token = await getAccessToken()
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64')

  const response = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: `Payment for ${accountRef}`
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  return response.data
}

module.exports = { initiateSTKPush }
```

## Testing

### Sandbox Testing
1. Use Safaricom sandbox environment
2. Test credentials provided by Daraja
3. Use test phone numbers

### Test Phone Numbers (Sandbox)
- **Success:** 254708374149
- **Insufficient Funds:** 254708374149 (with low balance)
- **Timeout:** Wait 30+ seconds without entering PIN

### Production Testing
1. Start with small amounts
2. Test with real M-Pesa accounts
3. Monitor callback logs
4. Verify order updates

## Security Best Practices

1. **Never expose credentials in frontend**
2. **Use HTTPS for all API calls**
3. **Validate callback authenticity**
4. **Implement rate limiting**
5. **Log all transactions**
6. **Store sensitive data encrypted**
7. **Use environment variables**

## Troubleshooting

### Common Issues

**STK Push not received:**
- Verify phone number format (254XXXXXXXXX)
- Check if phone is M-Pesa registered
- Ensure SIM card is active
- Verify callback URL is accessible

**Payment successful but order not updated:**
- Check callback endpoint logs
- Verify Supabase permissions
- Check internet connectivity
- Review order status update logic

**Timeout errors:**
- Customer didn't enter PIN in time (30 sec timeout)
- Network issues
- M-Pesa service downtime

## Support

- **Safaricom Daraja Support:** developer@safaricom.co.ke
- **Documentation:** https://developer.safaricom.co.ke/docs

## Deployment Checklist

- [ ] Get production M-Pesa credentials
- [ ] Set up backend server/edge functions
- [ ] Configure environment variables
- [ ] Set up callback URL (must be HTTPS)
- [ ] Test with sandbox environment
- [ ] Test with small real transactions
- [ ] Monitor callback logs
- [ ] Set up error notifications
- [ ] Document payment flow
- [ ] Train support team

## Additional Resources

- [Safaricom Daraja Documentation](https://developer.safaricom.co.ke/Documentation)
- [M-Pesa API Postman Collection](https://developer.safaricom.co.ke/APIs)
- [Integration Guide](https://developer.safaricom.co.ke/docs)

---

**Note:** The current implementation uses a simulated payment flow for demonstration. For production use, you must implement proper backend integration with M-Pesa API.
