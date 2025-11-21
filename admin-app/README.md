# Admin App - E-Commerce Dashboard# React + Vite



Admin dashboard for managing products, orders, and users.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## FeaturesCurrently, two official plugins are available:



- 🔐 Admin authentication- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- 📦 Product management (Create, Read, Update, Delete)- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- 🛒 Order management and status updates

- 👥 User management## React Compiler

- 📊 Analytics and statistics

- 🎨 Modern, responsive UIThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).



## Getting Started## Expanding the ESLint configuration



### Install DependenciesIf you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


```powershell
npm install
```

### Configure Environment

Copy `.env.example` to `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Create Admin User

1. Create a user account (through user app or Supabase dashboard)
2. Get the user's UUID from Supabase Auth
3. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admins (user_id) VALUES ('user-uuid-here');
```

### Run Development Server

```powershell
npm run dev
```

Visit `http://localhost:5173` (or the port shown in terminal)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx      # Admin navigation
│   └── ProtectedRoute.jsx  # Route protection
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication + admin check
├── lib/               # Utilities
│   └── supabase.js    # Supabase client
├── pages/             # Page components
│   ├── Login.jsx      # Admin login
│   ├── Dashboard.jsx  # Dashboard overview
│   ├── Products.jsx   # Product management
│   ├── Orders.jsx     # Order management
│   ├── Users.jsx      # User management
│   └── Analytics.jsx  # Statistics
├── App.jsx            # Main app component
├── App.css            # Global styles
└── main.jsx           # App entry point
```

## Pages

### Dashboard (`/dashboard`)
- Overview of admin features
- Quick navigation cards

### Products (`/products`)
- View all products
- Add new products
- Edit existing products
- Delete products
- Toggle active status

### Orders (`/orders`)
- View all customer orders
- Update order status
- View order details and items
- Track order history

### Users (`/users`)
- View registered users
- See user details
- Monitor user activity

### Analytics (`/analytics`)
- Total revenue
- Order count
- Product count
- User count
- (Charts coming soon)

## Admin Authentication

The admin app has two-level authentication:

1. **User Authentication** - Valid Supabase user
2. **Admin Authorization** - User must be in `admins` table

Protected routes check both conditions before allowing access.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Security

### Row Level Security (RLS)
All admin operations are protected by RLS policies:
- Only admins can modify products
- Only admins can view all orders
- Only admins can access user data

### Protected Routes
All admin pages are wrapped with `ProtectedRoute` component that:
- Checks if user is authenticated
- Verifies admin status
- Redirects to login if unauthorized

## Product Management

### Adding Products
1. Click "+ Add Product"
2. Fill in product details:
   - Name (required)
   - Description
   - Price (required)
   - Stock (required)
   - Image URL
   - Active status
3. Click "Create Product"

### Editing Products
1. Click "Edit" on any product
2. Modify fields
3. Click "Update Product"

### Deleting Products
1. Click "Delete" on any product
2. Confirm deletion

## Order Management

### Order Statuses
- Pending - New order
- Processing - Being prepared
- Shipped - In transit
- Delivered - Completed
- Cancelled - Cancelled order

### Updating Orders
Select new status from dropdown in order card

## Customization

### Styling
Edit `src/App.css` to customize:
- Color scheme
- Typography
- Layout

### Add New Features
1. Create new page component
2. Add route in `App.jsx`
3. Add navigation link in `Navbar.jsx`
4. Implement Supabase queries

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

## Building for Production

```powershell
npm run build
```

Output in `dist/` directory.

## Deployment

Deploy to Vercel, Netlify, or static hosting:

1. Build: `npm run build`
2. Upload `dist/` folder
3. Set environment variables
4. Deploy

## Troubleshooting

### Access Denied
- Verify you're an admin (check `admins` table)
- Confirm user UUID is correct
- Check RLS policies

### Can't modify products
- Ensure admin record exists
- Verify Supabase connection
- Check browser console

### Orders not loading
- Check `orders` table exists
- Verify RLS policies
- Ensure relations are set up correctly

## Adding More Admins

To add another admin user:

```sql
INSERT INTO admins (user_id) VALUES ('new-user-uuid');
```

To remove admin privileges:

```sql
DELETE FROM admins WHERE user_id = 'user-uuid';
```

## Future Enhancements

- [ ] Advanced analytics with charts
- [ ] Export data to CSV
- [ ] Bulk product import
- [ ] Email notifications
- [ ] Inventory management
- [ ] Customer support chat
