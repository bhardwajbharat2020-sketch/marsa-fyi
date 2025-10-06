const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://yuphowxgoxienbnwcgra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1cGhvd3hnb3hpZW5ibndjZ3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTYwMDcwMiwiZXhwIjoyMDc1MTc2NzAyfQ.uwarr-SWMaGJ1HjkAs02es4-7dYdzfvB33mjVf6OaFU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProducts() {
  console.log('Testing Supabase connection and product fetching...');
  
  try {
    // Test connection by fetching a small amount of data
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('Error fetching products:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('Successfully fetched products:', data);
    console.log('Number of products fetched:', data.length);
    
    // Test fetching all approved products
    const { data: allProducts, error: allProductsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        currency_id,
        is_verified,
        is_active,
        categories (name),
        users (first_name, last_name, vendor_code)
      `)
      .eq('is_active', true)
      .eq('status', 'approved');
    
    if (allProductsError) {
      console.error('Error fetching all products:', allProductsError.message);
      console.error('Error details:', allProductsError);
      return;
    }
    
    console.log('Successfully fetched all products:', allProducts.length);
    console.log('Sample product:', allProducts[0]);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testProducts();