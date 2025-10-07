// Script to check the actual table structure in Supabase
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Checking contact_form_submissions table structure...');
  
  try {
    // Use raw SQL to get table information
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'contact_form_submissions'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('Could not use RPC, trying alternative method...');
      
      // Alternative method - try to describe the table
      const { data: tableData, error: tableError } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .limit(0);
      
      if (tableError) {
        console.error('Error accessing table:', tableError);
      } else {
        console.log('Table exists and is accessible');
        console.log('Column names:');
        if (tableData.length === 0) {
          // Try to get column info from a dummy query
          const { data: columns, error: columnsError } = await supabase
            .from('contact_form_submissions')
            .select('id, name, phone, email, subject, message, status, created_at, updated_at')
            .limit(1);
          
          if (columnsError) {
            console.error('Columns error:', columnsError);
          } else {
            console.log('Available columns confirmed');
          }
        }
      }
    } else {
      console.log('Table structure:');
      data.forEach(column => {
        console.log(`  ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
    // Try a simple insert to test the phone field
    console.log('\nTesting phone field insertion...');
    const testRecord = {
      name: 'Structure Test',
      phone: '+1234567890',
      email: 'structure@test.com',
      subject: 'Table Structure Test',
      message: 'Testing if phone field works',
      status: 'pending'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_form_submissions')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('Insert failed:', insertError);
      
      // Try without phone field
      console.log('\nTesting without phone field...');
      const testRecordNoPhone = {
        name: 'Structure Test No Phone',
        email: 'structure-no-phone@test.com',
        subject: 'Table Structure Test No Phone',
        message: 'Testing without phone field',
        status: 'pending'
      };
      
      const { data: insertDataNoPhone, error: insertErrorNoPhone } = await supabase
        .from('contact_form_submissions')
        .insert([testRecordNoPhone])
        .select();
      
      if (insertErrorNoPhone) {
        console.error('Insert without phone also failed:', insertErrorNoPhone);
      } else {
        console.log('Insert without phone succeeded:', insertDataNoPhone[0]);
        
        // Clean up
        await supabase
          .from('contact_form_submissions')
          .delete()
          .eq('id', insertDataNoPhone[0].id);
      }
    } else {
      console.log('Insert with phone succeeded:', insertData[0]);
      
      // Verify the phone field was stored
      console.log('Stored phone value:', insertData[0].phone);
      
      // Clean up
      await supabase
        .from('contact_form_submissions')
        .delete()
        .eq('id', insertData[0].id);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the check
checkTableStructure().catch(console.error);