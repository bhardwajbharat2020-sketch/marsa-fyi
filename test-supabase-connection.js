require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('Testing Supabase connection...');

// Check environment variables
console.log('Environment Variables:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

console.log('\nSupabase client initialized.');

// Test connection by fetching a small amount of data
async function testConnection() {
  try {
    console.log('\nTesting database connection...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(3);
    
    if (error) {
      console.error('ERROR: Failed to fetch data from Supabase');
      console.error('Error details:', error);
      process.exit(1);
    }
    
    console.log('✓ Successfully connected to Supabase database');
    console.log('Sample data:', data);
    
    console.log('\n✓ All tests passed! Supabase connection is working properly.');
  } catch (error) {
    console.error('ERROR: Failed to test Supabase connection');
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();