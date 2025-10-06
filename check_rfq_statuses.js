require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRFQStatuses() {
  try {
    // Fetch all RFQs with their statuses
    const { data, error } = await supabase
      .from('rfqs')
      .select('id, status, title, buyer_id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching RFQs:', error);
      return;
    }
    
    console.log('RFQ Statuses:');
    console.log('=============');
    data.forEach(rfq => {
      console.log(`ID: ${rfq.id}, Status: "${rfq.status}", Title: "${rfq.title}", Buyer ID: ${rfq.buyer_id}`);
    });
    
    // Count statuses
    const statusCounts = {};
    data.forEach(rfq => {
      const status = rfq.status || 'null';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('\nStatus Counts:');
    console.log('=============');
    Object.keys(statusCounts).forEach(status => {
      console.log(`${status}: ${statusCounts[status]}`);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkRFQStatuses();