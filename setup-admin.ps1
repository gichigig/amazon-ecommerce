# Admin Setup Helper
# This script helps you create an admin user

Write-Host "=== E-Commerce Admin Setup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Create Your Admin Account" -ForegroundColor Yellow
Write-Host "1. Open your admin app: http://localhost:5174" -ForegroundColor White
Write-Host "2. Click 'Sign Up' and create an account" -ForegroundColor White
Write-Host "3. Remember your email address" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter when you've created your account"

Write-Host ""
Write-Host "Step 2: Get Your User ID" -ForegroundColor Yellow
Write-Host "Opening Supabase Auth Dashboard in Chrome..." -ForegroundColor Green

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Start-Process $chromePath "https://supabase.com/dashboard/project/pdcfdrjfibsmhdqkqonu/auth/users"
} else {
    Write-Host "Chrome not found. Please open manually:" -ForegroundColor Red
    Write-Host "https://supabase.com/dashboard/project/pdcfdrjfibsmhdqkqonu/auth/users" -ForegroundColor White
}

Write-Host ""
Write-Host "Find your email in the users list and copy the User ID (UUID)" -ForegroundColor White
Write-Host ""

$userId = Read-Host "Paste your User ID here"

if ($userId -eq "") {
    Write-Host "No User ID provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Adding You as Admin..." -ForegroundColor Yellow

# Create SQL query
$sqlQuery = "INSERT INTO admins (user_id) VALUES ('$userId');"

Write-Host ""
Write-Host "SQL Query to run:" -ForegroundColor Cyan
Write-Host $sqlQuery -ForegroundColor White
Write-Host ""

Write-Host "Opening SQL Editor..." -ForegroundColor Green
if (Test-Path $chromePath) {
    Start-Process $chromePath "https://supabase.com/dashboard/project/pdcfdrjfibsmhdqkqonu/sql/new"
}

Write-Host ""
Write-Host "Copy the SQL query above and paste it in the SQL Editor" -ForegroundColor Yellow
Write-Host "Then click 'RUN' to execute it" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter when you've run the query"

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "You can now login to the admin panel at:" -ForegroundColor Cyan
Write-Host "http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Use the email and password you created in Step 1" -ForegroundColor Yellow
Write-Host ""
