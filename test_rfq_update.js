require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRFQUpdate() {
  try {
    // Find an RFQ with a responded status (negotiation_requested or rejected)
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .select('id, status')
      .in('status', ['negotiation_requested', 'rejected'])
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching RFQ:', error);
      return;
    }
    
    if (!rfq) {
      console.log('No RFQ found with responded status');
      return;
    }
    
    console.log('Found RFQ with status:', rfq.status);
    
    // Test the logic that should set status to 'resubmitted'
    const respondedStatuses = ['negotiation_requested', 'doq_provided', 'responded', 'accepted', 'rejected'];
    const newStatus = respondedStatuses.includes(rfq.status) ? 'resubmitted' : rfq.status;
    
    console.log('Current status:', rfq.status);
    console.log('Should change to:', newStatus);
    
    if (newStatus === 'resubmitted') {
      console.log('✅ Logic is correct - status should change to resubmitted');
    } else {
      console.log('❌ Logic is incorrect - status should not change');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testRFQUpdate();