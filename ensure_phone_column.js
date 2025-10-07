// Migration script to ensure phone column exists in contact_form_submissions table
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function ensurePhoneColumn() {
  console.log('Ensuring phone column exists in contact_form_submissions table...');
  
  try {
    // First, check if the column exists by trying to select it
    console.log('Checking if phone column exists...');
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .select('phone')
      .limit(1);
    
    if (error && error.message.includes('column') && error.message.includes('phone')) {
      console.log('Phone column does not exist. Adding it now...');
      
      // Add the phone column
      // Note: This is a simplified approach. In production, you might need to use Supabase SQL editor
      console.log('To add the phone column, please run this SQL in your Supabase SQL editor:');
      console.log(`
        ALTER TABLE contact_form_submissions 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_phone 
        ON contact_form_submissions(phone);
      `);
      
      console.log('\nAfter running the SQL, please restart your server.');
    } else {
      console.log('✓ Phone column already exists in the table');
      
      // Test inserting a record with phone
      console.log('\nTesting insert with phone field...');
      const { data: testData, error: testError } = await supabase
        .from('contact_form_submissions')
        .insert([{
          name: 'Column Test',
          phone: '+1234567890',
          email: 'column-test@example.com',
          subject: 'Column Test',
          message: 'Testing phone column',
          status: 'pending'
        }])
        .select();
      
      if (testError) {
        console.error('Error inserting test record:', testError.message);
      } else {
        console.log('✓ Successfully inserted record with phone:', testData[0].phone);
        
        // Clean up
        await supabase
          .from('contact_form_submissions')
          .delete()
          .eq('id', testData[0].id);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    
    console.log('\nTo manually add the phone column, run this SQL in your Supabase SQL editor:');
    console.log(`
      ALTER TABLE contact_form_submissions 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '';
      
      CREATE INDEX IF NOT EXISTS idx_contact_form_submissions_phone 
      ON contact_form_submissions(phone);
    `);
  }
}

// Run the script
ensurePhoneColumn();