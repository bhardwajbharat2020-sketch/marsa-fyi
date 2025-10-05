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

// Function to automatically approve submitted products
async function autoApproveProducts() {
  try {
    console.log('Checking for submitted products to auto-approve...');
    
    // Check for any products with status 'submitted'
    const { data: submittedProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name')
      .eq('status', 'submitted');

    if (fetchError) {
      console.error('Error fetching submitted products:', fetchError.message);
      return;
    }

    if (submittedProducts.length === 0) {
      console.log('No submitted products found to approve.');
      return;
    }

    console.log(`Found ${submittedProducts.length} submitted products to approve.`);
    
    // Approve all submitted products
    const { data: updatedProducts, error: updateError } = await supabase
      .from('products')
      .update({ 
        status: 'approved',
        is_verified: true,
        is_active: true
      })
      .eq('status', 'submitted')
      .select();

    if (updateError) {
      console.error('Error updating products:', updateError.message);
      return;
    }

    console.log(`Successfully approved ${updatedProducts.length} products:`);
    updatedProducts.forEach(product => {
      console.log(`- Approved product ID: ${product.id}, Name: ${product.name}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the auto-approve function
autoApproveProducts();

// Optional: Set up a periodic check (every 5 minutes)
// setInterval(autoApproveProducts, 5 * 60 * 1000);