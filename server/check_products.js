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

async function checkProducts() {
  try {
    console.log('Checking products in database...');
    
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        status,
        is_verified,
        is_active,
        seller_id,
        users (vendor_code)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error.message);
      return;
    }

    console.log(`Found ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ID: ${product.id}, Name: ${product.name}, Status: ${product.status}, Verified: ${product.is_verified}, Active: ${product.is_active}, Seller: ${product.users?.vendor_code || product.seller_id}`);
    });

    // Count products by status
    const statusCounts = {};
    products.forEach(product => {
      const status = product.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\nProducts by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });

    // Check if there are any approved products
    const approvedProducts = products.filter(p => p.status === 'approved' && p.is_active);
    console.log(`\nApproved products available for shop: ${approvedProducts.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkProducts();