# E-Commerce Platform

A complete e-commerce platform with separate user and admin applications built with React and Supabase.

## Project Structure

```
e-com/
├── user-app/          # Customer-facing storefront
├── admin-app/         # Admin dashboard
└── supabase-schema.sql # Database schema
```

## Applications

### 1. User App (Customer Storefront)
Port: `http://localhost:5173`

**Features:**
- Browse products
- View product details
- User authentication (sign up/login)
- Shopping cart management
- Responsive design

**Pages:**
- Home - Product listing
- Product Detail - Individual product view
- Login/Sign Up - Authentication
- Cart - Shopping cart

### 2. Admin App (Admin Dashboard)
Port: `http://localhost:5174` (when running alongside user app)

**Features:**
- Admin authentication
- Product management (CRUD)
- Order management
- User management
- Analytics dashboard

**Pages:**
- Login - Admin authentication
- Dashboard - Overview
- Products - Manage inventory
- Orders - View and update order status
- Users - User management
- Analytics - Sales statistics

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to Project Settings > API
4. Copy your project URL and anon/public key

### 2. Set Up Database

1. In your Supabase project, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables and policies

### 3. Configure User App

```powershell
cd user-app
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Install dependencies and run:
```powershell
npm install
npm run dev
```

### 4. Configure Admin App

```powershell
cd admin-app
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Install dependencies and run:
```powershell
npm install
npm run dev
```

### 5. Create Admin User

To access the admin dashboard, you need to create an admin user:

1. Sign up a user through the user app or directly in Supabase
2. Get the user's UUID from Supabase Authentication > Users
3. In Supabase SQL Editor, run:
```sql
INSERT INTO admins (user_id) VALUES ('user-uuid-here');
```

## Database Schema

### Tables

- **products** - Product catalog
- **users** - User profiles (extends auth.users)
- **admins** - Admin privileges
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Items in each order

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Products: Public read, admin write
- Users: Self-read, admin view all
- Cart: User-specific access
- Orders: User can see own, admin sees all

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Supabase JS Client** - Backend integration

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

## Development

### User App
```powershell
cd user-app
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

### Admin App
```powershell
cd admin-app
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## Features to Add

### User App
- [ ] Checkout process
- [ ] Order history
- [ ] User profile management
- [ ] Product search and filters
- [ ] Product categories
- [ ] Reviews and ratings
- [ ] Wishlist

### Admin App
- [ ] Sales charts and graphs
- [ ] Export data functionality
- [ ] Bulk product import
- [ ] Email notifications
- [ ] Discount/coupon management
- [ ] Inventory alerts

## Environment Variables

Both apps require the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important:** Never commit `.env` files to version control. They are included in `.gitignore`.

## Security Notes

1. The anon key is safe to use in client-side code
2. Row Level Security (RLS) protects your data
3. Admin privileges are managed through the `admins` table
4. All sensitive operations require authentication
5. Use service role key only in secure server environments

## Deployment

### Vercel/Netlify (Recommended)

1. Connect your repository
2. Set environment variables in the platform
3. Deploy each app separately:
   - User app: `/user-app`
   - Admin app: `/admin-app`

### Build Commands
```powershell
npm run build
```

### Output Directory
```
dist/
```

## Support

For issues or questions:
1. Check Supabase documentation
2. Review the database schema
3. Verify environment variables
4. Check browser console for errors

## License

This project is provided as-is for educational purposes.
