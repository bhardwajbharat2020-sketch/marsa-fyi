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

async function simulateRFQResubmit() {
  try {
    // Find an RFQ with a responded status (negotiation_requested or rejected)
    const { data: rfq, error: fetchError } = await supabase
      .from('rfqs')
      .select('id, status, buyer_id')
      .in('status', ['negotiation_requested', 'rejected'])
      .limit(1)
      .single();
    
    if (fetchError) {
      console.error('Error fetching RFQ:', fetchError);
      return;
    }
    
    if (!rfq) {
      console.log('No RFQ found with responded status');
      return;
    }
    
    console.log('Found RFQ:');
    console.log('- ID:', rfq.id);
    console.log('- Current status:', rfq.status);
    console.log('- Buyer ID:', rfq.buyer_id);
    
    // Simulate the update logic from the server
    const respondedStatuses = ['negotiation_requested', 'doq_provided', 'responded', 'accepted', 'rejected'];
    const newStatus = respondedStatuses.includes(rfq.status) ? 'resubmitted' : rfq.status;
    
    console.log('New status should be:', newStatus);
    
    // Try to update the RFQ with new data (simulating what the frontend sends)
    const updateData = {
      product_id: 1, // Just use a dummy product ID
      title: 'Test RFQ Update',
      description: 'This is a test update',
      quantity: 10,
      status: newStatus, // This is what should be set
      updated_at: new Date()
    };
    
    console.log('Update data:', updateData);
    
    // Actually update the RFQ
    const { data: updatedRFQ, error: updateError } = await supabase
      .from('rfqs')
      .update(updateData)
      .eq('id', rfq.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating RFQ:', updateError);
      return;
    }
    
    console.log('Successfully updated RFQ:');
    console.log('- New status:', updatedRFQ.status);
    
    if (updatedRFQ.status === 'resubmitted') {
      console.log('✅ RFQ status successfully changed to resubmitted!');
    } else {
      console.log('❌ RFQ status was not changed to resubmitted');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

simulateRFQResubmit();