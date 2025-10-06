const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://yuphowxgoxienbnwcgra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cGhvd3hnb3hpZW5ibndjZ3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3NzU4MTUsImV4cCI6MjA0NTM1MTgxNX0.H3fKReR4x5Rf6F2pWbJ3v4Q8b1t9x8n8n8n8n8n8n8n8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRFQs() {
  try {
    // Fetch all RFQs
    const { data, error } = await supabase
      .from('rfqs')
      .select('*');
    
    if (error) {
      console.error('Error fetching RFQs:', error);
      return;
    }
    
    console.log('RFQs found:', data.length);
    console.log('RFQ data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkRFQs();