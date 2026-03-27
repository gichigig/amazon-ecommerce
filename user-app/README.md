# Bluvberry Sales - Unified E-Commerce App

A unified React application for both **customers** and **sellers**. Customers can browse and purchase products, while sellers can manage their stores, products, and orders.

## Features

### Customer Features
- 🏠 Product browsing with grid layout
- 🔍 Product detail pages with reviews
- 🔐 User authentication (Sign up/Login)
- 🛒 Shopping cart management
- ❤️ Favourites/Wishlist
- 💳 M-Pesa payment integration
- 📱 Responsive design

### Seller Features
- 🏪 Seller Dashboard with stats
- 📦 Product Management (Add/Edit/Delete)
- 🛒 Order Management with status updates
- 📊 Revenue tracking
- 🔄 Easy switch between customer and seller views

## Getting Started

### Install Dependencies

```powershell
npm install
```

### Configure Environment

Create a `.env` file with your API URL:

```
VITE_API_URL=http://localhost:8080/api
```

### Run Development Server

```powershell
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable components
│   └── Navbar.jsx   # Navigation bar
├── contexts/        # React contexts
│   └── AuthContext.jsx  # Authentication state
├── lib/            # Utilities
│   └── supabase.js # Supabase client
├── pages/          # Page components
│   ├── Home.jsx    # Product listing
│   ├── ProductDetail.jsx  # Product details
│   ├── Login.jsx   # Authentication
│   └── Cart.jsx    # Shopping cart
├── App.jsx         # Main app component
├── App.css         # Global styles
└── main.jsx        # App entry point
```

## Pages

### Home (`/`)
- Displays all active products
- Grid layout
- Click product to view details

### Product Detail (`/products/:id`)
- Shows product information
- Add to cart functionality
- Quantity selector

### Login (`/login`)
- Sign in with email/password
- Sign up for new account
- Toggle between login and signup

### Cart (`/cart`)
- View cart items
- Update quantities
- Remove items
- See total price

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication

The app uses Supabase Auth for user management:
- Email/password authentication
- Session management
- Protected routes

## API Integration

All data is fetched from Supabase:
- Products from `products` table
- Cart items from `cart_items` table
- User data from `auth.users`

## Customization

### Styling
Edit `src/App.css` to customize the look and feel.

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

## Environment Variables

Required variables in `.env`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Building for Production

```powershell
npm run build
```

Output will be in the `dist/` directory.

## Deployment

Deploy to Vercel, Netlify, or any static hosting:

1. Build the app: `npm run build`
2. Upload the `dist/` folder
3. Set environment variables in hosting platform
4. Deploy

## Troubleshooting

### Can't see products
- Check Supabase connection
- Verify products exist in database
- Check browser console for errors

### Login not working
- Verify Supabase URL and key
- Check email confirmation settings in Supabase
- Ensure user exists in database

### Cart not updating
- Make sure user is logged in
- Check Row Level Security policies
- Verify `cart_items` table exists
