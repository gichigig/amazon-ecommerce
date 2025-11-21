# M-Pesa Sandbox Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Register (2 minutes)
👉 https://developer.safaricom.co.ke/
- Click "Sign Up"
- Fill in your details
- Verify your email

### 2. Create App (2 minutes)
- Log in → "My Apps" → "Add a new app"
- Name: Your Store Name
- Select: **"Lipa Na M-Pesa Sandbox"**
- Submit

### 3. Get Your Credentials (1 minute)
After creating the app, you'll see:

```
Consumer Key: xYzAbC123... 
Consumer Secret: aBcXyZ789...
Passkey: bfb279f9aa9bdbcf...
```

**Copy these!** You'll need them for your backend.

---

## 📱 Testing

### Test Phone Numbers (Use these in your checkout)
```
254708374149  ← Use this one
254708374150
254708374151
```

### Test M-Pesa PIN
```
1234  (for all sandbox numbers)
```

### Sandbox Shortcode
```
174379  (default test business number)
```

---

## 🔧 Configuration

### For Your Backend (.env file)

```bash
# Copy these from your Daraja app
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
MPESA_PASSKEY=paste_your_passkey_here

# Sandbox defaults
MPESA_ENVIRONMENT=sandbox
MPESA_SHORTCODE=174379
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
```

---

## 🧪 Testing Flow

1. **In your app**: Enter test number `254708374149`
2. **Click "Pay with M-Pesa"**
3. **Backend sends STK Push**
4. **On your phone** (simulated): Enter PIN `1234`
5. **Done!** Payment processed

---

## 📚 Need More Help?

- **Full Documentation**: See `MPESA_INTEGRATION.md`
- **Daraja Docs**: https://developer.safaricom.co.ke/Documentation
- **Support**: support@safaricom.co.ke

---

## ⚠️ Important Notes

- **Sandbox is for testing only** - No real money
- **Test numbers don't require actual phones** - Simulated
- **PIN is always 1234** in sandbox
- **For production**: You need business verification from Safaricom

---

## 🎯 Quick Test Checklist

- [ ] Registered on Daraja Portal
- [ ] Created Sandbox App
- [ ] Got Consumer Key & Secret
- [ ] Got Passkey
- [ ] Added credentials to `.env`
- [ ] Used test number `254708374149`
- [ ] Ready to test!
