require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (supabaseUrl && supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
    
    // Test connection by fetching a small amount of data
    supabase
      .from('products')
      .select('id, name')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error testing connection:', error.message);
          console.error('Error details:', error);
        } else {
          console.log('Connection test successful');
          console.log('Sample data:', data);
        }
      });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('Supabase credentials not provided');
}