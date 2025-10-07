// Direct database test to check phone column
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function directDbTest() {
  console.log('Direct database test for contact_form_submissions table');
  console.log('Supabase URL:', supabaseUrl);
  
  try {
    // Test 1: Simple select to check table exists
    console.log('\n1. Checking if table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('contact_form_submissions')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Table does not exist or not accessible:', tableError.message);
      return;
    }
    console.log('✓ Table exists and is accessible');
    
    // Test 2: Check table structure by selecting all columns
    console.log('\n2. Checking table structure...');
    const { data: structureCheck, error: structureError } = await supabase
      .from('contact_form_submissions')
      .select('id, name, phone, email, subject, message, status, created_at, updated_at')
      .limit(1);
    
    if (structureError) {
      console.error('Error checking structure:', structureError.message);
      // Try without phone column
      const { data: noPhoneCheck, error: noPhoneError } = await supabase
        .from('contact_form_submissions')
        .select('id, name, email, subject, message, status, created_at, updated_at')
        .limit(1);
      
      if (noPhoneError) {
        console.error('Table structure seems incorrect:', noPhoneError.message);
      } else {
        console.log('✗ Phone column appears to be missing');
        console.log('Available columns work fine');
      }
    } else {
      console.log('✓ All expected columns including phone are present');
    }
    
    // Test 3: Insert test with phone field
    console.log('\n3. Testing insert with phone field...');
    const testRecord = {
      name: 'Direct DB Test',
      phone: '+1234567890',
      email: 'direct-db-test@example.com',
      subject: 'Direct Database Test',
      message: 'Testing if phone field works in database',
      status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_form_submissions')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('Insert with phone failed:', insertError.message);
      
      // Try insert without phone
      console.log('\nTrying insert without phone field...');
      const testRecordNoPhone = {
        name: 'Direct DB Test No Phone',
        email: 'direct-db-test-no-phone@example.com',
        subject: 'Direct Database Test No Phone',
        message: 'Testing without phone field',
        status: 'pending'
      };
      
      const { data: insertDataNoPhone, error: insertErrorNoPhone } = await supabase
        .from('contact_form_submissions')
        .insert([testRecordNoPhone])
        .select();
      
      if (insertErrorNoPhone) {
        console.error('Insert without phone also failed:', insertErrorNoPhone.message);
      } else {
        console.log('✓ Insert without phone succeeded');
        console.log('This confirms the phone column is missing or misconfigured');
        
        // Clean up
        await supabase
          .from('contact_form_submissions')
          .delete()
          .eq('id', insertDataNoPhone[0].id);
      }
    } else {
      console.log('✓ Insert with phone succeeded');
      console.log('Phone value stored:', insertData[0].phone);
      
      // Clean up
      await supabase
        .from('contact_form_submissions')
        .delete()
        .eq('id', insertData[0].id);
    }
    
    // Test 4: Check if we can query by phone
    console.log('\n4. Testing query by phone field...');
    const { data: phoneQuery, error: phoneQueryError } = await supabase
      .from('contact_form_submissions')
      .select('id, name, phone')
      .eq('phone', '+1234567890')
      .limit(1);
    
    if (phoneQueryError) {
      console.error('Query by phone failed:', phoneQueryError.message);
    } else {
      console.log('✓ Query by phone succeeded');
      if (phoneQuery.length > 0) {
        console.log('Found record with phone:', phoneQuery[0].phone);
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Run the test
directDbTest();