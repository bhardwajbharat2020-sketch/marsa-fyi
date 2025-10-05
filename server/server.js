require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
// Note: In a production environment, these should be stored in environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Supabase URL from env:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Only create Supabase client if we have valid credentials
let supabase;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error.message);
    console.log('Running in mock mode due to Supabase initialization failure.');
  }
} else {
  console.log('Supabase credentials not provided. Running in mock mode.');
}

// Password validation function
function validatePassword(password) {
    const errors = [];
    
    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one digit');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Helper function to generate vendor codes
const generateVendorCode = (role, userId) => {
  const rolePrefixes = {
    'seller': 'SELL',
    'buyer': 'BUY',
    'captain': 'CAPT',
    'admin': 'ADM',
    'hr': 'HR',
    'accountant': 'ACC',
    'arbitrator': 'ARB',
    'surveyor': 'SUR',
    'insurance': 'INS',
    'transporter': 'TRN',
    'logistics': 'LOG',
    'cha': 'CHA'
  };
  
  const prefix = rolePrefixes[role] || 'USER';
  const year = new Date().getFullYear().toString().substr(2);
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `${prefix}-${year}-${randomPart}`;
};

// Registration endpoint with enhanced security
app.post('/api/register', async (req, res) => {
  try {
    console.log('Registration endpoint called with data:', req.body);
    const { email, password, firstName, lastName, phone, workClass } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !workClass) {
      console.log('Registration validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password does not meet requirements: ' + passwordValidation.errors.join(', ')
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false, 
        error: 'Database not available' 
      });
    }
    
    console.log('Checking if user already exists');
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking existing user:', existingUserError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error checking user' 
      });
    }
    
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Get role ID and code
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, code')
      .eq('name', workClass)
      .single();
    
    if (roleError) {
      console.error('Error getting role ID:', roleError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified' 
      });
    }
    
    // Generate vendor code based on workClass
    const vendorCode = generateVendorCode(workClass, 'user-id');
    
    console.log('Creating user profile in users table');
    // Create user profile in users table (without using Supabase Auth for password)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: email.split('@')[0],
        email,
        password_hash: hashedPassword, // Store hashed password
        first_name: firstName,
        last_name: lastName,
        phone,
        is_verified: false,
        vendor_code: vendorCode
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user profile:', userError.message);
      return res.status(400).json({ 
        success: false, 
        error: userError.message 
      });
    }
    
    // Get the user ID
    const userId = userData.id;
    
    console.log('Creating user role mapping');
    // Create user role mapping
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id
      });
    
    if (userRoleError) {
      console.error('Error creating user role mapping:', userRoleError.message);
      // Try to clean up the user we just created
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      return res.status(400).json({ 
        success: false, 
        error: userRoleError.message 
      });
    }
    
    console.log('Registration successful for user:', email);
    res.json({ 
      success: true, 
      message: 'Registration successful',
      vendorCode,
      requiresEmailConfirmation: false
    });
  } catch (error) {
    console.error('Unexpected error during registration:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login endpoint called with data:', req.body);
    const { vendorCode, password } = req.body;
    
    // Validate required fields
    if (!vendorCode || !password) {
      console.log('Login validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor Code/Email and Password are required' 
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false, 
        error: 'Database not available' 
      });
    }
    
    console.log('Checking user credentials');
    // Check user credentials by email or vendor code
    let userQuery = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        first_name,
        last_name,
        phone,
        is_verified,
        vendor_code,
        password_hash,
        user_roles(role_id, is_primary, roles(name, code))
      `);
      
    // Check if vendorCode is an email or vendor code
    if (vendorCode.includes('@')) {
      userQuery = userQuery.eq('email', vendorCode);
    } else {
      userQuery = userQuery.eq('vendor_code', vendorCode);
    }
    
    const { data: user, error: userError } = await userQuery.single();
    
    if (userError) {
      console.error('Error fetching user:', userError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    if (!user) {
      console.log('User not found with provided credentials');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Get user's primary role
    let userRole = 'buyer'; // Default role
    if (user.user_roles && user.user_roles.length > 0) {
      const primaryRole = user.user_roles.find(role => role.is_primary);
      if (primaryRole) {
        userRole = primaryRole.roles.name;
      } else {
        // If no primary role, use the first role
        userRole = user.user_roles[0].roles.name;
      }
    }
    
    console.log('User login successful for:', user.email, 'with role:', userRole);
    
    // Return user data and role
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_verified: user.is_verified,
      vendor_code: user.vendor_code,
      role: userRole
    };
    
    res.json({ 
      success: true,
      user: userData,
      token: 'dummy-token' // In a real app, you would generate a proper JWT token
    });
  } catch (error) {
    console.error('Error in login endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
});

// Catalogs endpoint - fetch featured products
app.get('/api/catalogs', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching catalogs from Supabase');
    
    // Fetch featured products from Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        image_url,
        status,
        is_verified,
        seller_id,
        users (first_name, last_name, vendor_code)
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .limit(6);

    if (error) {
      console.error('Error fetching catalogs from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching catalogs: ' + error.message 
      });
    }

    // Debug: Log the product data to see what we're getting
    console.log('Catalog products data:', JSON.stringify(products, null, 2));
    
    // Transform the data to match the expected format
    const catalogs = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      image: product.image_url || '/placeholder.jpg',
      status: product.is_verified ? 'approved' : 'pending',
      likes: Math.floor(Math.random() * 50) + 1, // Random likes for demo
      seller: product.users?.vendor_code || 'Unknown Vendor'
    }));

    console.log(`Successfully fetched ${catalogs.length} catalogs from Supabase`);
    res.json(catalogs);
  } catch (error) {
    console.error('Error in catalogs endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching catalogs: ' + error.message 
    });
  }
});

// Products endpoint - fetch all products
app.get('/api/products', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching products from Supabase');
    
    // Fetch products from Supabase with related data
    const { data: products, error } = await supabase
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
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching products: ' + error.message 
      });
    }

    // Debug: Log the product data to see what we're getting
    console.log('Products data:', JSON.stringify(products, null, 2));
    
    // Transform the data to match the expected format
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      company_name: product.users?.vendor_code || 'Unknown Vendor',
      origin_port_name: 'Unknown Port', // Ports are not directly related to products in the schema
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    }));

    console.log(`Successfully fetched ${formattedProducts.length} products from Supabase`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in products endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching products: ' + error.message 
    });
  }
});

// Get specific product by ID
app.get('/api/products/:id', async (req, res) => {
  console.log('Product detail endpoint hit');
  console.log('Request URL:', req.url);
  console.log('Request params:', req.params);
  
  try {
    const productId = req.params.id;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching product ${productId} from Supabase`);
    console.log(`Request params:`, JSON.stringify(req.params, null, 2));
    console.log(`Product ID type:`, typeof productId);
    
    // Validate that productId is a number
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      console.error(`Invalid product ID: ${productId}`);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid product ID' 
      });
    }
    
    // Fetch product from Supabase with related data
    const { data: product, error } = await supabase
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
      .eq('id', productIdNum)
      .single();

    if (error) {
      console.error(`Error fetching product ${productId} from Supabase:`, error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching product: ' + error.message 
      });
    }

    if (!product) {
      console.log(`Product ${productId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Debug: Log the product data to see what we're getting
    console.log(`Product ${productId} data:`, JSON.stringify(product, null, 2));
    
    // Transform the data to match the expected format
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      company_name: product.users?.vendor_code || 'Unknown Vendor',
      origin_port_name: 'Unknown Port', // Ports are not directly related to products in the schema
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    };

    console.log(`Successfully fetched product ${productId} from Supabase`);
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error in product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching product: ' + error.message 
    });
  }
});

// Seller products endpoint - fetch seller's products
app.get('/api/seller/products', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller products from Supabase');
    
    // Get the seller ID from the authenticated user
    // Using a default value for testing, but in production this should come from authentication
    const sellerId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    // Fetch products from Supabase with all new columns
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        seller_id,
        name,
        description,
        price,
        currency_id,
        category_id,
        is_active,
        is_verified,
        status,
        moq,
        moq_uom,
        available_quantity,
        quantity_uom,
        price_type,
        is_relabeling_allowed,
        offer_validity_date,
        image_url,
        thumbnail_url,
        categories (name),
        currencies (code)
      `)
      .eq('seller_id', sellerId); // Filter by seller ID

    if (error) {
      console.error('Error fetching seller products from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching seller products: ' + error.message 
      });
    }

    // Transform products to match frontend expectations
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.categories?.name || 'Uncategorized',
      price: product.price,
      currency: product.currencies?.code || 'USD',
      status: product.status || 'pending',
      moq: product.moq,
      moqUom: product.moq_uom,
      quantity: product.available_quantity,
      quantityUom: product.quantity_uom,
      priceType: product.price_type,
      reLabeling: product.is_relabeling_allowed ? 'yes' : 'no',
      validityDate: product.offer_validity_date ? product.offer_validity_date.split('T')[0] : null,
      validityTime: product.offer_validity_date ? product.offer_validity_date.split('T')[1]?.split('.')[0] : null,
      imageUrl: product.image_url,
      thumbnailUrl: product.thumbnail_url
    }));

    console.log(`Successfully fetched ${formattedProducts.length} seller products from Supabase`);
    res.json(formattedProducts || []);
  } catch (error) {
    console.error('Error in seller products endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching seller products: ' + error.message 
    });
  }
});

// Seller orders endpoint - fetch seller's orders
app.get('/api/seller/orders', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller orders from Supabase');
    
    // Fetch orders from Supabase with correct column names
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, quantity, status')
      .eq('seller_id', req.user?.id || 1);

    if (error) {
      console.error('Error fetching seller orders from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching seller orders: ' + error.message 
      });
    }

    // Add missing fields manually since they don't exist in the schema
    const ordersWithDetails = orders.map(order => ({
      ...order,
      buyer: 'Unknown Buyer',
      product: 'Unknown Product'
    }));

    console.log(`Successfully fetched ${ordersWithDetails.length} seller orders from Supabase`);
    res.json(ordersWithDetails || []);
  } catch (error) {
    console.error('Error in seller orders endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching seller orders: ' + error.message 
    });
  }
});

// Seller RFQs endpoint - fetch seller's RFQs
app.get('/api/seller/rfqs', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller RFQs from Supabase');
    
    // Fetch RFQs from Supabase with correct column names
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select('id, quantity, status')
      .eq('seller_id', req.user?.id || 1);

    if (error) {
      console.error('Error fetching seller RFQs from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching seller RFQs: ' + error.message 
      });
    }

    // Add missing fields manually since they don't exist in the schema
    const rfqsWithDetails = rfqs.map(rfq => ({
      ...rfq,
      buyer: 'Unknown Buyer',
      product: 'Unknown Product'
    }));

    console.log(`Successfully fetched ${rfqsWithDetails.length} seller RFQs from Supabase`);
    res.json(rfqsWithDetails || []);
  } catch (error) {
    console.error('Error in seller RFQs endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching seller RFQs: ' + error.message 
    });
  }
});

// Get specific product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching product ${productId} from Supabase`);
    
    // Fetch product from Supabase with related data
    const { data: product, error } = await supabase
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
      .eq('id', productId)
      .single();

    if (error) {
      console.error(`Error fetching product ${productId} from Supabase:`, error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching product: ' + error.message 
      });
    }

    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Debug: Log the product data to see what we're getting
    console.log(`Product ${productId} data:`, JSON.stringify(product, null, 2));
    
    // Transform the data to match the expected format
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      company_name: product.users?.vendor_code || 'Unknown Vendor',
      origin_port_name: 'Unknown Port', // Ports are not directly related to products in the schema
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    };

    console.log(`Successfully fetched product ${productId} from Supabase`);
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error in product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching product: ' + error.message 
    });
  }
});

// Get products by category (for related products)
app.get('/api/products/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching products for category ${categoryName} from Supabase`);
    
    // Fetch products from Supabase with related data
    const { data: products, error } = await supabase
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
      .limit(4); // Limit to 4 related products

    if (error) {
      console.error(`Error fetching products for category ${categoryName} from Supabase:`, error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching products: ' + error.message 
      });
    }

    // Transform the data to match the expected format
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      company_name: product.users?.vendor_code || 'Unknown Vendor',
      origin_port_name: 'Unknown Port', // Ports are not directly related to products in the schema
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    }));

    console.log(`Successfully fetched ${formattedProducts.length} products for category ${categoryName} from Supabase`);
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in category products endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching products: ' + error.message 
    });
  }
});

// Add product endpoint for sellers
app.post('/api/seller/products', async (req, res) => {
  try {
    // For multipart form data, we need to handle both req.body and req.file
    const { 
      name, 
      category, 
      branded, 
      description, 
      moq, 
      moqUom, 
      quantity, 
      quantityUom, 
      price, 
      currency, 
      priceType, 
      reLabeling, 
      validityDate, 
      validityTime 
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product name, category, price, and description are required' 
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Get the seller ID from the authenticated user
    // Using a default value for testing, but in production this should come from authentication
    const sellerId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    // Get category ID from name (create if doesn't exist)
    let categoryId = null;
    if (category) {
      const { data: existingCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const { data: newCategory, error: newCategoryError } = await supabase
          .from('categories')
          .insert({
            name: category,
            description: `${category} category`,
            is_active: true,
            created_at: new Date()
          })
          .select()
          .single();
          
        if (newCategory) {
          categoryId = newCategory.id;
        }
      }
    }
    
    // Get currency ID from code (default to USD if not found)
    let currencyId = 1; // Default to USD
    if (currency) {
      const { data: currencyData, error: currencyError } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', currency)
        .single();
      
      if (currencyData) {
        currencyId = currencyData.id;
      }
    }
    
    // Parse validity date and time
    let offerValidityDate = null;
    if (validityDate) {
      const timePart = validityTime || '00:00';
      offerValidityDate = new Date(`${validityDate}T${timePart}`);
    }
    
    // Save the product to the database with all new fields
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        seller_id: sellerId, // Associate the product with the seller
        name,
        category_id: categoryId,
        description: description || '',
        price: parseFloat(price),
        currency_id: currencyId,
        moq: moq ? parseInt(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? parseInt(quantity) : null,
        quantity_uom: quantityUom || null,
        price_type: priceType || 'EXW',
        is_relabeling_allowed: reLabeling === 'yes',
        offer_validity_date: offerValidityDate,
        is_active: true,
        is_verified: false, // New products need approval
        status: 'submitted', // Status for tracking
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error creating product: ' + error.message 
      });
    }
    
    // Transform product for response
    const productWithDetails = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: category || 'Uncategorized',
      price: product.price,
      currency: currency || 'USD',
      status: 'submitted',
      moq: product.moq,
      moqUom: product.moq_uom,
      quantity: product.available_quantity,
      quantityUom: product.quantity_uom,
      priceType: product.price_type,
      reLabeling: product.is_relabeling_allowed ? 'yes' : 'no',
      validityDate: product.offer_validity_date ? product.offer_validity_date.split('T')[0] : null,
      validityTime: product.offer_validity_date ? product.offer_validity_date.split('T')[1]?.split('.')[0] : null,
      imageUrl: product.image_url,
      thumbnailUrl: product.thumbnail_url
    };
    
    console.log('Successfully created product in Supabase');
    res.json({ 
      success: true, 
      message: 'Product submitted successfully for approval',
      product: productWithDetails
    });
  } catch (error) {
    console.error('Error in add product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error creating product: ' + error.message 
    });
  }
});

// Buyer RFQs endpoint - fetch buyer's RFQs
app.get('/api/buyer/rfqs', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch RFQs from Supabase with correct column names
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select('id, quantity, status')
      .eq('buyer_id', req.user?.id || 1);

    if (error) {
      console.error('Error fetching buyer RFQs from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer RFQs: ' + error.message 
      });
    }

    // Add missing fields manually since they don't exist in the schema
    const rfqsWithProduct = rfqs.map(rfq => ({
      ...rfq,
      product: 'Unknown Product'
    }));

    console.log(`Successfully fetched ${rfqsWithProduct.length} buyer RFQs from Supabase`);
    res.json(rfqsWithProduct || []);
  } catch (error) {
    console.error('Error in buyer RFQs endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching buyer RFQs: ' + error.message 
    });
  }
});

// Buyer orders endpoint - fetch buyer's orders
app.get('/api/buyer/orders', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch orders from Supabase
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, seller_id, product_id, quantity, status')
      .eq('buyer_id', req.user?.id || 1);

    if (error) {
      console.error('Error fetching buyer orders from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer orders: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${orders.length} buyer orders from Supabase`);
    res.json(orders || []);
  } catch (error) {
    console.error('Error in buyer orders endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching buyer orders: ' + error.message 
    });
  }
});

// Buyer suppliers endpoint - fetch buyer's suppliers
app.get('/api/buyer/suppliers', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch suppliers from Supabase
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('id, name, vendor_code, products, rating')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching buyer suppliers from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer suppliers: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${suppliers.length} buyer suppliers from Supabase`);
    res.json(suppliers || []);
  } catch (error) {
    console.error('Error in buyer suppliers endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching buyer suppliers: ' + error.message 
    });
  }
});

// Create RFQ endpoint for buyers
app.post('/api/buyer/rfqs', async (req, res) => {
  try {
    const { product, quantity, description } = req.body;
    
    // Validate required fields
    if (!product || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product name and quantity are required' 
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Save the RFQ to the database with correct column names
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .insert({
        product_name: product, // This column might not exist, let's check
        quantity: parseInt(quantity),
        description: description || '',
        status: 'open',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating RFQ in Supabase:', error.message);
      console.error('Error details:', error);
      
      // Try again without the product_name column since it doesn't exist
      if (error.message.includes('product_name')) {
        const { data: rfq2, error: error2 } = await supabase
          .from('rfqs')
          .insert({
            quantity: parseInt(quantity),
            description: description || '',
            status: 'open',
            created_at: new Date()
          })
          .select()
          .single();
          
        if (error2) {
          console.error('Error creating RFQ (second attempt):', error2.message);
          return res.status(500).json({ 
            success: false,
            error: 'Server error creating RFQ: ' + error2.message 
          });
        }
        
        console.log('Successfully created RFQ in Supabase (second attempt)');
        return res.json({ 
          success: true, 
          message: 'RFQ created successfully',
          rfq: rfq2
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Server error creating RFQ: ' + error.message 
      });
    }

    console.log('Successfully created RFQ in Supabase');
    res.json({ 
      success: true, 
      message: 'RFQ created successfully',
      rfq
    });
  } catch (error) {
    console.error('Error in create RFQ endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error creating RFQ: ' + error.message 
    });
  }
});

// Admin users endpoint - fetch all users
app.get('/api/admin/users', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, is_verified');

    if (error) {
      console.error('Error fetching admin users from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching users: ' + error.message 
      });
    }

    // Format users data
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: 'User', // In a real implementation, we would fetch the actual role
      status: user.is_verified ? 'active' : 'pending'
    }));

    console.log(`Successfully fetched ${formattedUsers.length} admin users from Supabase`);
    res.json(formattedUsers || []);
  } catch (error) {
    console.error('Error in admin users endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching users: ' + error.message 
    });
  }
});

// Admin system configuration endpoint
app.get('/api/admin/config', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch system configuration from Supabase
    const { data: config, error } = await supabase
      .from('system_config')
      .select('id, setting_name, setting_value, description');

    if (error) {
      console.error('Error fetching admin config from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching system configuration: ' + error.message 
      });
    }

    // Format config data
    const formattedConfig = config.map(item => ({
      id: item.id,
      setting: item.setting_name,
      value: item.setting_value,
      description: item.description
    }));

    console.log(`Successfully fetched ${formattedConfig.length} config items from Supabase`);
    res.json(formattedConfig || []);
  } catch (error) {
    console.error('Error in admin config endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching system configuration: ' + error.message 
    });
  }
});

// Admin audit logs endpoint
app.get('/api/admin/logs', async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch audit logs from Supabase
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('id, timestamp, user_id, action, details')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching admin logs from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching audit logs: ' + error.message 
      });
    }

    // Format logs data
    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      user: 'User', // In a real implementation, we would fetch the actual user name
      action: log.action,
      details: log.details
    }));

    console.log(`Successfully fetched ${formattedLogs.length} audit logs from Supabase`);
    res.json(formattedLogs || []);
  } catch (error) {
    console.error('Error in admin logs endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching audit logs: ' + error.message 
    });
  }
});

// Add user endpoint for admins
app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ 
        success: false, 
        error: 'User name, email, and role are required' 
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Save the user to the database
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        email,
        is_verified: false,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error creating user: ' + error.message 
      });
    }
    
    console.log('Successfully created user in Supabase');
    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error in add user endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error creating user: ' + error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase,
    supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
    supabaseKeyExists: !!supabaseKey,
    supabaseKeyLength: supabaseKey ? supabaseKey.length : 0,
    environment: process.env.NODE_ENV || 'development',
    vercelEnv: process.env.VERCEL_ENV || 'NOT SET',
    port: process.env.PORT || 5000
  });
});

// Enhanced Health check endpoint with Supabase test
app.get('/api/health/db', async (req, res) => {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Supabase client not initialized',
        supabaseConnected: false,
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
        supabaseKeyExists: !!supabaseKey
      });
    }
    
    // Test Supabase connection by fetching a small amount of data
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (error) {
      return res.status(500).json({
        status: 'ERROR',
        message: 'Supabase connection test failed',
        error: error.message,
        supabaseConnected: true,
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
        supabaseKeyExists: !!supabaseKey
      });
    }
    
    res.json({
      status: 'OK',
      message: 'Supabase connection successful',
      supabaseConnected: true,
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
      supabaseKeyExists: !!supabaseKey,
      testData: data
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      supabaseConnected: !!supabase,
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
      supabaseKeyExists: !!supabaseKey
    });
  }
});

// Environment variables test endpoint
app.get('/api/test-env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET' : 'NOT SET',
    SUPABASE_KEY_LENGTH: process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0,
    PORT: process.env.PORT || 'NOT SET'
  });
});

// Test endpoint to verify API routes are working
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API routes are working' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login endpoint called with data:', req.body);
    const { vendorCode, password } = req.body;
    
    // Validate required fields
    if (!vendorCode || !password) {
      console.log('Login validation failed: missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Vendor Code/Email and Password are required' 
      });
    }
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false, 
        error: 'Database not available' 
      });
    }
    
    console.log('Checking user credentials');
    // Check user credentials by email or vendor code
    let userQuery = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        first_name,
        last_name,
        phone,
        is_verified,
        vendor_code,
        password_hash,
        user_roles(role_id, is_primary, roles(name, code))
      `);
      
    // Check if vendorCode is an email or vendor code
    if (vendorCode.includes('@')) {
      userQuery = userQuery.eq('email', vendorCode);
    } else {
      userQuery = userQuery.eq('vendor_code', vendorCode);
    }
    
    const { data: user, error: userError } = await userQuery.single();
    
    if (userError) {
      console.error('Error fetching user:', userError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    if (!user) {
      console.log('User not found with provided credentials');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', user.email);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Get user's primary role
    let userRole = 'buyer'; // Default role
    if (user.user_roles && user.user_roles.length > 0) {
      const primaryRole = user.user_roles.find(role => role.is_primary);
      if (primaryRole) {
        userRole = primaryRole.roles.name;
      } else {
        // If no primary role, use the first role
        userRole = user.user_roles[0].roles.name;
      }
    }
    
    console.log('User login successful for:', user.email, 'with role:', userRole);
    
    // Return user data and role
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_verified: user.is_verified,
      vendor_code: user.vendor_code,
      role: userRole
    };
    
    res.json({ 
      success: true,
      user: userData,
      token: 'dummy-token' // In a real app, you would generate a proper JWT token
    });
  } catch (error) {
    console.error('Error in login endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login' 
    });
  }
});

// Test endpoint to verify product ID route is working
app.get('/api/products/test/:id', (req, res) => {
  console.log('Test product ID endpoint hit');
  console.log('Request params:', req.params);
  res.json({ message: 'Product ID route is working', id: req.params.id });
});

// Get specific product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching product ${productId} from Supabase`);
    
    // Fetch product from Supabase with related data
    const { data: product, error } = await supabase
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
      .eq('id', productId)
      .single();

    if (error) {
      console.error(`Error fetching product ${productId} from Supabase:`, error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching product: ' + error.message 
      });
    }

    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Debug: Log the product data to see what we're getting
    console.log(`Product ${productId} data:`, JSON.stringify(product, null, 2));
    
    // Transform the data to match the expected format
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : '',
      company_name: product.users?.vendor_code || 'Unknown Vendor',
      origin_port_name: 'Unknown Port', // Ports are not directly related to products in the schema
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    };

    console.log(`Successfully fetched product ${productId} from Supabase`);
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error in product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching product: ' + error.message 
    });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});