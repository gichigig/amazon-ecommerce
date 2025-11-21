# GitHub Setup Guide

This guide will help you push your e-commerce projects to GitHub.

## Prerequisites
- Git installed on your system
- GitHub account (username: gichigig)

## Steps to Push to GitHub

### 1. Initialize Git Repository (Already Done)
```powershell
cd c:\Users\billy\e-com
git init
```

### 2. Configure Git (First Time Only)
```powershell
git config user.name "gichigig"
git config user.email "your-email@example.com"
```

### 3. Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `e-commerce-supabase` (or your preferred name)
3. Description: "E-commerce platform with React, Supabase, and M-Pesa integration"
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 4. Add All Files and Commit
```powershell
git add .
git commit -m "Initial commit: E-commerce platform with user and admin apps"
```

### 5. Add Remote and Push
Replace `REPO-NAME` with your actual repository name:
```powershell
git remote add origin https://github.com/gichigig/REPO-NAME.git
git branch -M main
git push -u origin main
```

## What's Included

### User App (`user-app/`)
- Product browsing with search and category filtering
- Shopping cart functionality
- M-Pesa checkout integration
- User authentication
- Responsive design for all devices

### Admin App (`admin-app/`)
- Product management with image uploads
- Order management
- User management
- Dashboard analytics
- Admin authentication

### Backend (`supabase/`)
- Database schema with RLS policies
- Edge Functions for M-Pesa integration
- Storage bucket setup for product images

## Environment Variables (Important!)

Your `.env` files are **NOT** pushed to GitHub (they're in .gitignore). 

When others clone your repository, they need to:
1. Copy `.env.example` to `.env` in both `user-app/` and `admin-app/`
2. Add their own Supabase credentials

## Security Notes

✅ **Protected** (NOT in repository):
- `.env` files with Supabase keys
- `node_modules/` folders
- Build outputs
- M-Pesa production credentials

✅ **Included** (Safe to share):
- `.env.example` files (templates)
- Source code
- Database schema
- Documentation

## Future Updates

To push changes after initial setup:
```powershell
git add .
git commit -m "Description of your changes"
git push
```

## Troubleshooting

**Error: "remote origin already exists"**
```powershell
git remote remove origin
git remote add origin https://github.com/gichigig/REPO-NAME.git
```

**Authentication Issues**
- Use GitHub Personal Access Token instead of password
- Generate token at: https://github.com/settings/tokens

## Next Steps After Pushing

1. ✅ Add repository description on GitHub
2. ✅ Add topics/tags: `react`, `supabase`, `ecommerce`, `mpesa`, `vite`
3. ✅ Consider adding a LICENSE file
4. ✅ Update README.md with live demo link (when deployed)
5. ✅ Add GitHub Actions for CI/CD (optional)

---

**Repository Structure:**
```
e-com/
├── user-app/          # Customer-facing React app
├── admin-app/         # Admin panel React app
├── supabase/          # Backend configuration
├── *.sql             # Database setup scripts
├── *.md              # Documentation
└── .gitignore        # Git ignore rules
```
