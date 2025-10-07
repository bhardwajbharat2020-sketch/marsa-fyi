// Test script to check if contact_form_submissions table exists and is working
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: __dirname + '/.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactFormTable() {
  console.log('Testing contact_form_submissions table...');
  
  try {
    // Try to insert a test record
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .insert([
        {
          name: 'Test User',
          phone: '+1234567890',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message',
          status: 'pending'
        }
      ])
      .select();
      
    if (error) {
      console.error('Error inserting test record:', error);
      return;
    }
    
    console.log('Successfully inserted test record:', data);
    
    // Try to fetch the record
    const { data: fetchedData, error: fetchError } = await supabase
      .from('contact_form_submissions')
      .select('*')
      .eq('email', 'test@example.com');
      
    if (fetchError) {
      console.error('Error fetching test record:', fetchError);
      return;
    }
    
    console.log('Successfully fetched test record:', fetchedData);
    
    // Clean up - delete the test record
    if (fetchedData && fetchedData.length > 0) {
      const { error: deleteError } = await supabase
        .from('contact_form_submissions')
        .delete()
        .eq('id', fetchedData[0].id);
        
      if (deleteError) {
        console.error('Error deleting test record:', deleteError);
      } else {
        console.log('Successfully cleaned up test record');
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testContactFormTable();