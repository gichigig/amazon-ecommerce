-- E-Commerce Database Schema for Supabase
-- Run this script to update existing tables with M-Pesa fields

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add M-Pesa fields to orders table (if not exists)
DO $$ 
BEGIN
    -- Add payment_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'mpesa';
    END IF;
    
    -- Add mpesa_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='mpesa_phone') THEN
        ALTER TABLE orders ADD COLUMN mpesa_phone VARCHAR(20);
    END IF;
    
    -- Add mpesa_receipt_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='mpesa_receipt_number') THEN
        ALTER TABLE orders ADD COLUMN mpesa_receipt_number VARCHAR(100);
    END IF;
    
    -- Add mpesa_checkout_request_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='mpesa_checkout_request_id') THEN
        ALTER TABLE orders ADD COLUMN mpesa_checkout_request_id VARCHAR(100);
    END IF;
    
    -- Add payment_completed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='payment_completed_at') THEN
        ALTER TABLE orders ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add payment_error column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='payment_error') THEN
        ALTER TABLE orders ADD COLUMN payment_error TEXT;
    END IF;
END $$;

-- ============================================
-- FRESH INSTALLATION SCRIPT (If tables don't exist)
-- ============================================
-- Uncomment the section below if you're setting up for the first time

/*
-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50) DEFAULT 'mpesa',
    mpesa_phone VARCHAR(20),
    mpesa_receipt_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/

-- Row Level Security (RLS) Policies
-- Note: Policies already exist, so this section is for reference only
-- Run these manually if you need to recreate policies

/*
-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Users: Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins: Only readable by admins themselves
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
CREATE POLICY "Admins can view admin list" ON admins
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Cart items: Users can only access their own cart
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
CREATE POLICY "Users can view their own cart" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert to their cart" ON cart_items;
CREATE POLICY "Users can insert to their cart" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their cart" ON cart_items;
CREATE POLICY "Users can update their cart" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their cart" ON cart_items;
CREATE POLICY "Users can delete from their cart" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders: Users can view their own orders, admins can view all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Order items: Follow order permissions
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
CREATE POLICY "Users can insert order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );
*/

-- Functions and Triggers
-- These use CREATE OR REPLACE so they're safe to run multiple times

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at (drop and recreate to ensure they're up to date)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync auth.users with users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile (drop and recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data (optional)
-- Only insert if products table is empty
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        INSERT INTO products (name, description, price, stock, image_url, active) VALUES
            ('Laptop Pro', 'High-performance laptop with 16GB RAM', 129999.00, 50, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', true),
            ('Wireless Mouse', 'Ergonomic wireless mouse', 2999.00, 200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', true),
            ('Mechanical Keyboard', 'RGB mechanical gaming keyboard', 8999.00, 100, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', true),
            ('USB-C Hub', '7-in-1 USB-C hub adapter', 4599.00, 150, 'https://images.unsplash.com/photo-1625948515291-69613efd103f', true),
            ('Webcam HD', '1080p HD webcam with microphone', 7999.00, 75, 'https://images.unsplash.com/photo-1635514569146-9a9607ecf303', true);
    END IF;
END $$;
