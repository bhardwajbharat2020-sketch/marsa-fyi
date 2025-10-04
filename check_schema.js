// Script to check your existing Supabase schema
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
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError.message);
      return;
    }
    
    console.log('Existing tables:');
    tables.forEach(table => {
      console.log('- ' + table.table_name);
    });
    
    // Check products table structure
    console.log('\n--- Products Table Structure ---');
    const { data: productsColumns, error: productsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'products')
      .eq('table_schema', 'public');
    
    if (productsError) {
      console.error('Error fetching products columns:', productsError.message);
    } else {
      console.log('Products columns:');
      productsColumns.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable})`);
      });
    }
    
    // Check users table structure
    console.log('\n--- Users Table Structure ---');
    const { data: usersColumns, error: usersError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (usersError) {
      console.error('Error fetching users columns:', usersError.message);
    } else {
      console.log('Users columns:');
      usersColumns.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable})`);
      });
    }
    
    // Check a sample of products data
    console.log('\n--- Sample Products Data ---');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('Error fetching sample products:', sampleError.message);
    } else {
      console.log('Sample products:');
      sampleProducts.forEach(product => {
        console.log(JSON.stringify(product, null, 2));
      });
    }
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

checkSchema();