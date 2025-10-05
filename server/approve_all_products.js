require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function approveAllProducts() {
  try {
    console.log('Approving all pending products...');
    
    // Update all pending products to approved
    const { data, error } = await supabase
      .from('products')
      .update({ 
        status: 'approved',
        is_verified: true,
        is_active: true
      })
      .eq('status', 'pending')
      .select();

    if (error) {
      console.error('Error approving products:', error.message);
      return;
    }

    console.log(`Successfully approved ${data.length} products:`);
    data.forEach(product => {
      console.log(`- Approved product ID: ${product.id}, Name: ${product.name}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

approveAllProducts();