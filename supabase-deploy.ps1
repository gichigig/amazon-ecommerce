# Supabase M-Pesa Edge Functions Deployment Script
# Run this script to deploy M-Pesa integration to Supabase

Write-Host "=== Supabase M-Pesa Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking Supabase login status..." -ForegroundColor Yellow
$loginCheck = npx supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Not logged in. Opening Chrome for login..." -ForegroundColor Yellow
    Write-Host "If Chrome doesn't open automatically, copy and paste the URL manually." -ForegroundColor Yellow
    Write-Host ""
    
    # Try to open in Chrome specifically
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chromePath) {
        Write-Host "Opening Chrome for Supabase login..." -ForegroundColor Green
        Start-Process $chromePath "https://supabase.com/dashboard/cli/login"
    }
    
    npx supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Login failed. Please try manually:" -ForegroundColor Red
        Write-Host "1. Open Chrome" -ForegroundColor Yellow
        Write-Host "2. Go to: https://supabase.com/dashboard/cli/login" -ForegroundColor Yellow
        Write-Host "3. Complete the login" -ForegroundColor Yellow
        Write-Host "4. Run this script again" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Logged in successfully!" -ForegroundColor Green
Write-Host ""

# Link project
Write-Host "Linking to your Supabase project..." -ForegroundColor Yellow
Write-Host "IMPORTANT: Make sure your project is UNPAUSED in the dashboard" -ForegroundColor Red
Write-Host "Visit: https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter when your project is unpaused and ready"

npx supabase link

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Failed to link project. Make sure:" -ForegroundColor Red
    Write-Host "1. Your project is unpaused" -ForegroundColor Yellow
    Write-Host "2. You have the correct permissions" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Project linked successfully!" -ForegroundColor Green
Write-Host ""

# Deploy functions
Write-Host "Deploying M-Pesa STK Push function..." -ForegroundColor Yellow
npx supabase functions deploy mpesa-stk-push --no-verify-jwt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to deploy mpesa-stk-push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deploying M-Pesa Callback function..." -ForegroundColor Yellow
npx supabase functions deploy mpesa-callback --no-verify-jwt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to deploy mpesa-callback" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Functions Deployed Successfully! ===" -ForegroundColor Green
Write-Host ""

# Set secrets
Write-Host "Setting up M-Pesa environment variables..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Setting MPESA_CONSUMER_KEY..." -ForegroundColor Cyan
npx supabase secrets set MPESA_CONSUMER_KEY=OhHQQ9IVx2d25GL4FcGAtuRMjPDbna5tnlixpdVt80cH6rjj

Write-Host "Setting MPESA_CONSUMER_SECRET..." -ForegroundColor Cyan
npx supabase secrets set MPESA_CONSUMER_SECRET=ZSHmcoFWAIs8AmowGxBUBWBQaOV8afMf8dEQO83ZAyw6tAe7c11KdNibF7vHFGyA

Write-Host "Setting MPESA_PASSKEY..." -ForegroundColor Cyan
npx supabase secrets set MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

Write-Host "Setting MPESA_SHORTCODE..." -ForegroundColor Cyan
npx supabase secrets set MPESA_SHORTCODE=174379

Write-Host "Setting MPESA_ENVIRONMENT..." -ForegroundColor Cyan
npx supabase secrets set MPESA_ENVIRONMENT=sandbox

# Get project ref for callback URL
Write-Host ""
Write-Host "Getting project reference for callback URL..." -ForegroundColor Yellow
$projectInfo = npx supabase projects list --output json | ConvertFrom-Json
$projectRef = $projectInfo[0].id

if ($projectRef) {
    Write-Host "Setting MPESA_CALLBACK_URL..." -ForegroundColor Cyan
    npx supabase secrets set MPESA_CALLBACK_URL="https://$projectRef.supabase.co/functions/v1/mpesa-callback"
}

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the updated supabase-schema.sql in your Supabase SQL Editor" -ForegroundColor White
Write-Host "2. Update your frontend to call the Edge Functions" -ForegroundColor White
Write-Host "3. Test with phone number: 254708374149 and PIN: 1234" -ForegroundColor White
Write-Host ""
Write-Host "Your Edge Functions are now live at:" -ForegroundColor Cyan
Write-Host "https://$projectRef.supabase.co/functions/v1/mpesa-stk-push" -ForegroundColor White
Write-Host "https://$projectRef.supabase.co/functions/v1/mpesa-callback" -ForegroundColor White
Write-Host ""
