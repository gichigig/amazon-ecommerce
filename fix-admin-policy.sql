-- Fix Admin Check Policy
-- This allows users to check if THEY are an admin (not view all admins)

-- Drop the old policies
DROP POLICY IF EXISTS "Admins can view admin list" ON admins;
DROP POLICY IF EXISTS "Users can check their own admin status" ON admins;
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

-- Simple policy: anyone can check their own admin status
CREATE POLICY "Users can view their own admin record" ON admins
    FOR SELECT USING (auth.uid() = user_id);
