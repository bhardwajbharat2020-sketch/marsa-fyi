// Comprehensive test to diagnose phone field issues
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensivePhoneTest() {
  console.log('=== Comprehensive Phone Field Test ===\n');
  
  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('contact_form_submissions')
      .select('count(*)');
    
    if (connectionError) {
      console.error('✗ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✓ Database connection successful\n');
    
    // Test 2: Check table structure
    console.log('2. Checking table structure...');
    // Try to get column information
    const { data: columns, error: columnsError } = await supabase
      .from('contact_form_submissions')
      .select('id, name, email, subject, message, status, created_at, updated_at')
      .limit(1);
    
    if (columnsError) {
      console.error('✗ Error accessing table:', columnsError.message);
      return;
    }
    
    // Now try with phone column
    const { data: phoneColumns, error: phoneColumnsError } = await supabase
      .from('contact_form_submissions')
      .select('id, name, phone, email, subject, message, status, created_at, updated_at')
      .limit(1);
    
    if (phoneColumnsError) {
      console.log('✗ Phone column does not exist or is inaccessible');
      console.log('Error:', phoneColumnsError.message);
    } else {
      console.log('✓ Phone column exists and is accessible');
    }
    console.log('');
    
    // Test 3: Insert test with various phone values
    console.log('3. Testing inserts with different phone values...\n');
    
    const testCases = [
      {
        name: 'Test with Phone Number',
        phone: '+1234567890',
        email: 'with-phone@example.com',
        description: 'Standard phone number'
      },
      {
        name: 'Test with Empty Phone',
        phone: '',
        email: 'empty-phone@example.com',
        description: 'Empty string for phone'
      },
      {
        name: 'Test with Null Phone',
        phone: null,
        email: 'null-phone@example.com',
        description: 'Null value for phone'
      },
      {
        name: 'Test without Phone Field',
        email: 'no-phone-field@example.com',
        description: 'No phone field in request'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.description}`);
      const record = {
        name: testCase.name,
        email: testCase.email,
        subject: 'Phone Test',
        message: `Test case: ${testCase.description}`,
        status: 'pending'
      };
      
      // Add phone field if present
      if ('phone' in testCase) {
        record.phone = testCase.phone;
      }
      
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .insert([record])
        .select();
      
      if (error) {
        console.log(`  ✗ Failed: ${error.message}`);
      } else {
        console.log(`  ✓ Success: Phone stored as "${data[0].phone}"`);
        
        // Clean up
        await supabase
          .from('contact_form_submissions')
          .delete()
          .eq('id', data[0].id);
      }
    }
    
    console.log('\n4. Testing actual retrieval...');
    // Insert a test record and retrieve it
    const testRecord = {
      name: 'Retrieval Test',
      phone: '+1234567890',
      email: 'retrieval-test@example.com',
      subject: 'Retrieval Test',
      message: 'Testing if phone field is properly retrieved',
      status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_form_submissions')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('✗ Insert failed:', insertError.message);
    } else {
      const insertedId = insertData[0].id;
      console.log('✓ Insert successful');
      
      // Retrieve the record
      const { data: retrieveData, error: retrieveError } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .eq('id', insertedId)
        .single();
      
      if (retrieveError) {
        console.error('✗ Retrieve failed:', retrieveError.message);
      } else {
        console.log('✓ Retrieve successful');
        console.log('  Retrieved phone value:', `"${retrieveData.phone}"`);
        console.log('  Phone value type:', typeof retrieveData.phone);
        
        // Check if it matches what we inserted
        if (retrieveData.phone === testRecord.phone) {
          console.log('✓ Phone value matches what was inserted');
        } else {
          console.log('✗ Phone value does not match what was inserted');
          console.log('  Expected:', testRecord.phone);
          console.log('  Got:', retrieveData.phone);
        }
      }
      
      // Clean up
      await supabase
        .from('contact_form_submissions')
        .delete()
        .eq('id', insertedId);
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Run the test
comprehensivePhoneTest();