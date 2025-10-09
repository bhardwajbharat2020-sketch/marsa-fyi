-- SQL script to add the "Land, house flat plot category" to the existing categories table
-- This script should be run directly in your Supabase SQL editor

-- First, check if the category already exists
SELECT * FROM categories WHERE name = 'Land, house flat plot category';

-- If the category doesn't exist, insert it
INSERT INTO categories (name, description) 
VALUES (
  'Land, house flat plot category', 
  'Land, houses, flats, and plots for sale or rent - Featured Category'
)
ON CONFLICT (name) DO UPDATE 
SET 
  description = EXCLUDED.description;

-- Verify the insertion
SELECT * FROM categories WHERE name = 'Land, house flat plot category';