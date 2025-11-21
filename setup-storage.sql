-- Create Storage Bucket for Product Images
-- Run this in your Supabase SQL Editor

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow authenticated users to upload
CREATE POLICY "Admins can upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images');
