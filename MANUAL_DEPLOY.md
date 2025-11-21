# Manual Deployment Steps (If Script Fails)

## Prerequisites
1. **Unpause your Supabase project**:
   - Open Chrome
   - Go to: https://supabase.com/dashboard
   - Find your project (vrtilixbydqrithrchdc)
   - Click "Restore" or "Unpause" if needed

## Step 1: Login to Supabase

```powershell
npx supabase login
```

**If it opens Edge instead of Chrome:**
- Copy the login URL from the terminal
- Open Chrome manually
- Paste the URL in Chrome
- Complete the login
- Copy the verification code back to the terminal

## Step 2: Link Your Project

```powershell
npx supabase link
```

It will show a list of projects. Select your active one.

**Alternative (if you know your project ref):**
```powershell
npx supabase link --project-ref vrtilixbydqrithrchdc
```

## Step 3: Deploy Edge Functions

### Deploy STK Push Function
```powershell
npx supabase functions deploy mpesa-stk-push --no-verify-jwt
```

### Deploy Callback Function
```powershell
npx supabase functions deploy mpesa-callback --no-verify-jwt
```

## Step 4: Set Environment Secrets

**Important**: Replace `YOUR-PROJECT-REF` with your actual project reference (like `vrtilixbydqrithrchdc`)

```powershell
# Set Consumer Key
npx supabase secrets set MPESA_CONSUMER_KEY=OhHQQ9IVx2d25GL4FcGAtuRMjPDbna5tnlixpdVt80cH6rjj

# Set Consumer Secret
npx supabase secrets set MPESA_CONSUMER_SECRET=ZSHmcoFWAIs8AmowGxBUBWBQaOV8afMf8dEQO83ZAyw6tAe7c11KdNibF7vHFGyA

# Set Passkey
npx supabase secrets set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Set Shortcode
npx supabase secrets set MPESA_SHORTCODE=174379

# Set Environment
npx supabase secrets set MPESA_ENVIRONMENT=sandbox

# Set Callback URL (replace YOUR-PROJECT-REF)
npx supabase secrets set MPESA_CALLBACK_URL=https://YOUR-PROJECT-REF.supabase.co/functions/v1/mpesa-callback
```

## Step 5: Update Database

1. Open Chrome
2. Go to: https://supabase.com/dashboard/project/YOUR-PROJECT-REF/sql
3. Copy all contents from `supabase-schema.sql`
4. Paste and run in SQL Editor

## Step 6: Verify Deployment

### List deployed functions:
```powershell
npx supabase functions list
```

You should see:
- mpesa-stk-push
- mpesa-callback

### List secrets:
```powershell
npx supabase secrets list
```

You should see all 6 M-Pesa variables.

## Troubleshooting

### "project is paused"
- Go to your dashboard in Chrome
- Unpause/restore the project
- Try again

### "does not have necessary privileges"
- Make sure you're logged in with the correct account
- Try: `npx supabase logout` then `npx supabase login`

### Browser opens in Edge instead of Chrome
1. Copy the login URL from terminal
2. Open Chrome manually
3. Paste URL in Chrome
4. Complete login
5. Copy verification code
6. Paste in terminal

### Function deployment fails
- Make sure you're in the e-com directory
- Check that `supabase/functions/` folders exist
- Verify files: `supabase/functions/mpesa-stk-push/index.ts` and `supabase/functions/mpesa-callback/index.ts`

## After Deployment

Your functions will be available at:
- `https://YOUR-PROJECT-REF.supabase.co/functions/v1/mpesa-stk-push`
- `https://YOUR-PROJECT-REF.supabase.co/functions/v1/mpesa-callback`

Update your frontend to use these URLs!
