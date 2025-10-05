// Script to update the products table schema with new columns
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not provided in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProductSchema() {
  try {
    console.log('Updating products table schema...');
    
    // Add new columns to products table
    const { error } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS moq INTEGER,
        ADD COLUMN IF NOT EXISTS moq_uom VARCHAR(10),
        ADD COLUMN IF NOT EXISTS available_quantity INTEGER,
        ADD COLUMN IF NOT EXISTS quantity_uom VARCHAR(10),
        ADD COLUMN IF NOT EXISTS price_type VARCHAR(10) DEFAULT 'EXW',
        ADD COLUMN IF NOT EXISTS is_relabeling_allowed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS offer_validity_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      `
    });
    
    if (error) {
      console.error('Error updating schema:', error.message);
      process.exit(1);
    }
    
    console.log('Products table schema updated successfully!');
    
    // Add some sample data for testing with seller_id
    console.log('Adding sample product data...');
    
    // First, let's check if we have any users to associate with
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (userError) {
      console.error('Error fetching users:', userError.message);
      process.exit(1);
    }
    
    let sellerId = '00000000-0000-0000-0000-000000000000'; // Default UUID
    if (users && users.length > 0) {
      sellerId = users[0].id;
    }
    
    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        seller_id: sellerId, // Associate with a seller
        name: 'Sample Product',
        description: 'This is a sample product for testing',
        price: 99.99,
        moq: 10,
        moq_uom: 'pcs',
        available_quantity: 100,
        quantity_uom: 'pcs',
        price_type: 'EXW',
        is_relabeling_allowed: true,
        status: 'approved',
        is_active: true,
        is_verified: true
      })
      .select();
      
    if (insertError) {
      console.error('Error inserting sample data:', insertError.message);
    } else {
      console.log('Sample product added successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

updateProductSchema();