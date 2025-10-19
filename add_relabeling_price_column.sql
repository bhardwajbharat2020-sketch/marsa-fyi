-- SQL script to add relabeling_price column to products table in Supabase
-- This should be run directly in the Supabase SQL editor

ALTER TABLE products 
ADD COLUMN relabeling_price DECIMAL(10, 2);

-- Add a comment to describe the purpose of this column
COMMENT ON COLUMN products.relabeling_price IS 'Price for relabeling services when is_relabeling_allowed is true';