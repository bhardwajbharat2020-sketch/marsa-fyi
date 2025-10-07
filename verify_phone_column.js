// Script to verify phone column exists in contact_form_submissions table
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPhoneColumn() {
  console.log('Verifying phone column in contact_form_submissions table...');
  
  try {
    // Try to get the table structure
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error);
      return;
    }
    
    if (data.length > 0) {
      const record = data[0];
      console.log('Sample record structure:');
      Object.keys(record).forEach(key => {
        console.log(`  ${key}: ${typeof record[key]} = ${record[key]}`);
      });
      
      // Check if phone column exists
      if ('phone' in record) {
        console.log('\n✓ Phone column exists in the table');
      } else {
        console.log('\n✗ Phone column does NOT exist in the table');
      }
    } else {
      console.log('Table is empty, but structure is correct');
      
      // Try to insert a test record with phone field
      const { data: insertData, error: insertError } = await supabase
        .from('contact_form_submissions')
        .insert([
          {
            name: 'Test Verification',
            phone: '+1234567890',
            email: 'test@example.com',
            subject: 'Verification Test',
            message: 'Testing phone field',
            status: 'pending'
          }
        ])
        .select();
      
      if (insertError) {
        console.error('Error inserting test record:', insertError);
        if (insertError.message.includes('phone')) {
          console.log('This confirms the phone column might be missing or misconfigured');
        }
      } else {
        console.log('Successfully inserted test record with phone field:', insertData[0]);
        
        // Clean up - delete the test record
        await supabase
          .from('contact_form_submissions')
          .delete()
          .eq('id', insertData[0].id);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the verification
verifyPhoneColumn().catch(console.error);