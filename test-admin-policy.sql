-- Test Admin Policy
-- Run this to verify the policy is working correctly

-- 1. Check current policies on admins table
SELECT * FROM pg_policies WHERE tablename = 'admins';

-- 2. Try to select from admins table (should work for checking your own status)
SELECT * FROM admins WHERE user_id = auth.uid();
