// Simple script to check your existing Supabase schema
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Check a simple query on products table
    console.log('--- Checking products table ---');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('Error accessing products table:', productsError.message);
    } else {
      console.log('Products table accessible');
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
    }
    
    // Check users table
    console.log('\n--- Checking users table ---');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Error accessing users table:', usersError.message);
    } else {
      console.log('Users table accessible');
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }
    
    // Check what columns are available in products
    console.log('\n--- Getting table structure ---');
    const { data: tableInfo, error: tableError } = await supabase
      .from('products')
      .select('*')
      .limit(0); // Just get structure, no data
    
    if (!tableError && tableInfo) {
      console.log('Products table columns:');
      // Get the column names from the first row (which will be empty due to limit 0)
      // but the structure will be there
      const columns = Object.keys(tableInfo[0] || {});
      columns.forEach(col => console.log('- ' + col));
    }
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

checkSchema();