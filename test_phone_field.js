// Test script to verify phone field is working correctly
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPhoneField() {
  console.log('Testing phone field functionality...');
  
  // Test 1: Insert a record with phone number
  console.log('\n1. Testing insert with phone number...');
  const { data: insertData1, error: insertError1 } = await supabase
    .from('contact_form_submissions')
    .insert([
      {
        name: 'Test User 1',
        phone: '+1234567890',
        email: 'test1@example.com',
        subject: 'Test Subject 1',
        message: 'Test message 1',
        status: 'pending'
      }
    ])
    .select();
  
  if (insertError1) {
    console.error('Error inserting record with phone:', insertError1);
  } else {
    console.log('Successfully inserted record with phone:', insertData1[0]);
  }
  
  // Test 2: Insert a record with empty phone
  console.log('\n2. Testing insert with empty phone...');
  const { data: insertData2, error: insertError2 } = await supabase
    .from('contact_form_submissions')
    .insert([
      {
        name: 'Test User 2',
        phone: '',
        email: 'test2@example.com',
        subject: 'Test Subject 2',
        message: 'Test message 2',
        status: 'pending'
      }
    ])
    .select();
  
  if (insertError2) {
    console.error('Error inserting record with empty phone:', insertError2);
  } else {
    console.log('Successfully inserted record with empty phone:', insertData2[0]);
  }
  
  // Test 3: Fetch all records to verify phone field is stored
  console.log('\n3. Fetching all contact form submissions...');
  const { data: fetchData, error: fetchError } = await supabase
    .from('contact_form_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (fetchError) {
    console.error('Error fetching records:', fetchError);
  } else {
    console.log('Recently submitted contact forms:');
    fetchData.forEach(record => {
      console.log(`  - ${record.name}: ${record.phone || 'No phone'} (${record.email})`);
    });
  }
  
  console.log('\nTest completed.');
}

// Run the test
testPhoneField().catch(console.error);