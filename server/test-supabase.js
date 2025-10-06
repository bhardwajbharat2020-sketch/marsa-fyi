require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY);
console.log('SUPABASE_KEY length:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
    
    // Test the connection by fetching a small amount of data
    supabase
      .from('products')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching data from Supabase:', error.message);
          console.error('Error details:', error);
        } else {
          console.log('Successfully connected to Supabase');
          console.log('Test data:', data);
        }
      });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('Supabase credentials not provided');
}