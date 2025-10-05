require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for handling multipart form data
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With']
}));

// Middleware to handle preflight requests
app.options('*', cors());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`=== REQUEST: ${req.method} ${req.url} ===`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'marsafyi_jwt_secret';

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

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

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
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        vendor_code: user.vendor_code,
        role: userRole
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
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
      token: token
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

// Admin users endpoint - fetch all users
app.get('/api/admin/users', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching users from Supabase');
    
    // Fetch users from Supabase with related data
    // Only fetch approved and active users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'approved')
      .eq('active', true);

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        error: 'Server error fetching users: ' + error.message 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      error: 'Server error fetching users: ' + error.message 
    });
  }
});

// RFQ endpoint - create a new RFQ
app.post('/api/rfq', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Creating RFQ in Supabase');
    
    // Create RFQ in Supabase with related data
    const { data, error } = await supabase
      .from('rfq')
      .insert([req.body]);

    if (error) {
      console.error('Error creating RFQ:', error);
      return res.status(500).json({
        error: 'Server error creating RFQ: ' + error.message 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return res.status(500).json({
      error: 'Server error creating RFQ: ' + error.message 
    });
  }
});

// Products endpoint - fetch all products
app.get('/api/products', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching products from Supabase');
    
    // Fetch products from Supabase with related data
    // Only fetch approved and active products
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
      .eq('status', 'approved'); // Only approved products

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
  try {
    const productId = req.params.id;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching product ${productId} from Supabase`);
    
    // Fetch product from Supabase with related data
    // Only fetch approved and active products
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
      .eq('is_active', true)
      .eq('status', 'approved') // Only approved products
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
        error: 'Product not found or not approved' 
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
app.get('/api/seller/products', authenticateToken, async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller products from Supabase');
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    
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

// Get products by category (for related products)
app.get('/api/products/category/:categoryName', async (req, res) => {
  try {
    const categoryName = req.params.categoryName;
    
    // Always fetch from Supabase - no mock data fallback
    console.log(`Fetching products for category ${categoryName} from Supabase`);
    
    // Fetch products from Supabase with related data
    // Only fetch approved and active products
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
      .eq('status', 'approved') // Only approved products
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
app.post('/api/seller/products', authenticateToken, upload.any(), async (req, res) => {
  try {
    console.log('=== PRODUCT SUBMISSION DEBUG INFO ===');
    console.log('Raw request body:', req.body);
    console.log('Files received:', req.files);
    console.log('Request headers:', req.headers);
    console.log('Authenticated user:', req.user);
    
    // If using upload.any(), files are in req.files array
    if (req.files && req.files.length > 0) {
      console.log('File fields:', req.files.map(f => f.fieldname));
    }
    
    // For multipart form data, we need to handle both req.body and req.files
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
    
    console.log('=== EXTRACTED FIELDS ===');
    console.log('name:', name, '| type:', typeof name, '| length:', name ? name.length : 'null');
    console.log('category:', category, '| type:', typeof category, '| length:', category ? category.length : 'null');
    console.log('price:', price, '| type:', typeof price);
    console.log('description:', description, '| type:', typeof description, '| length:', description ? description.length : 'null');
    
    // Check if fields exist at all
    console.log('=== FIELD EXISTENCE CHECK ===');
    console.log('name exists:', 'name' in req.body);
    console.log('category exists:', 'category' in req.body);
    console.log('price exists:', 'price' in req.body);
    console.log('description exists:', 'description' in req.body);
    
    // Validate required fields - improved validation with detailed debugging
    console.log('=== VALIDATION START ===');
    
    if (!('name' in req.body)) {
      console.log('NAME FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product name field is missing from request' 
      });
    }
    
    if (!name) {
      console.log('NAME IS FALSY:', name);
      return res.status(400).json({ 
        success: false, 
        error: 'Product name is required (received: ' + name + ')' 
      });
    }
    
    if (typeof name !== 'string') {
      console.log('NAME IS NOT STRING:', typeof name);
      return res.status(400).json({ 
        success: false, 
        error: 'Product name must be a string (received: ' + typeof name + ')' 
      });
    }
    
    if (name.trim() === '') {
      console.log('NAME IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product name cannot be empty or whitespace only' 
      });
    }
    
    if (!('category' in req.body)) {
      console.log('CATEGORY FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product category field is missing from request' 
      });
    }
    
    if (!category) {
      console.log('CATEGORY IS FALSY:', category);
      return res.status(400).json({ 
        success: false, 
        error: 'Product category is required (received: ' + category + ')' 
      });
    }
    
    if (typeof category !== 'string') {
      console.log('CATEGORY IS NOT STRING:', typeof category);
      return res.status(400).json({ 
        success: false, 
        error: 'Product category must be a string (received: ' + typeof category + ')' 
      });
    }
    
    if (category.trim() === '') {
      console.log('CATEGORY IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product category cannot be empty or whitespace only' 
      });
    }
    
    if (!('price' in req.body)) {
      console.log('PRICE FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product price field is missing from request' 
      });
    }
    
    if (!price) {
      console.log('PRICE IS FALSY:', price);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price is required (received: ' + price + ')' 
      });
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      console.log('PRICE IS NOT A NUMBER:', price);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be a valid number (received: ' + price + ')' 
      });
    }
    
    if (priceNum <= 0) {
      console.log('PRICE IS NOT POSITIVE:', priceNum);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be a positive number (received: ' + priceNum + ')' 
      });
    }
    
    if (!('description' in req.body)) {
      console.log('DESCRIPTION FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product description field is missing from request' 
      });
    }
    
    if (!description) {
      console.log('DESCRIPTION IS FALSY:', description);
      return res.status(400).json({ 
        success: false, 
        error: 'Product description is required (received: ' + description + ')' 
      });
    }
    
    if (typeof description !== 'string') {
      console.log('DESCRIPTION IS NOT STRING:', typeof description);
      return res.status(400).json({ 
        success: false, 
        error: 'Product description must be a string (received: ' + typeof description + ')' 
      });
    }
    
    if (description.trim() === '') {
      console.log('DESCRIPTION IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product description cannot be empty or whitespace only' 
      });
    }
    
    // Trim whitespace from required fields
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const priceValue = priceNum;
    
    console.log('=== VALIDATION PASSED ===');
    console.log('Trimmed values:', { trimmedName, trimmedCategory, priceValue, trimmedDescription });
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    
    // Validate seller ID
    if (!sellerId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Seller ID is required. Please log in to submit products.' 
      });
    }
    
    // Get category ID from name (should exist in our predefined list)
    let categoryId = null;
    if (trimmedCategory) {
      const { data: existingCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', trimmedCategory)
        .single();
      
      if (categoryError) {
        console.error('Error fetching category:', categoryError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching category: ' + categoryError.message 
        });
      }
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // If category doesn't exist, log an error (should not happen with predefined categories)
        console.error('Category not found in database:', trimmedCategory);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid category selected' 
        });
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
      
      if (currencyError) {
        console.error('Error fetching currency:', currencyError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching currency: ' + currencyError.message 
        });
      }
      
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
        name: trimmedName,
        category_id: categoryId,
        description: trimmedDescription,
        price: priceValue,
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
        status: 'submitted', // Status for tracking - submitted for approval
        created_at: new Date(),
        updated_at: new Date()  // Added updated_at field
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Product data:', {
        seller_id: sellerId,
        name: name,
        category_id: categoryId,
        description: description || '',
        price: priceValue,
        currency_id: currencyId,
        moq: moq ? parseInt(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? parseInt(quantity) : null,
        quantity_uom: quantityUom || null,
        price_type: priceType || 'EXW',
        is_relabeling_allowed: reLabeling === 'yes',
        offer_validity_date: offerValidityDate,
        is_active: true,
        is_verified: false,
        status: 'submitted'
      });
      
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
    
    // Log product history
    await logProductHistory(product.id, sellerId, 'created', {
      name: product.name,
      category: category || 'Uncategorized',
      price: product.price,
      currency: currency || 'USD'
    });
    
    console.log('Successfully created product in Supabase:', productWithDetails);
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
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ 
        success: false,
        error: 'Server error fetching users: ' + error.message 
      });
    } else {
      res.status(200).json({ 
        success: true,
        users: data
      });
    }
  } catch (error) {
    console.error('Error in fetch users endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching users: ' + error.message 
    });
  }
});

// Function to log product history
const logProductHistory = async (productId, userId, action, details = null, reason = null) => {
  try {
    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }
    
    const { error } = await supabase
      .from('product_history')
      .insert({
        id: uuidv4(), // Generate UUID for the history record
        product_id: productId,
        user_id: userId,
        action: action,
        details: details,
        reason: reason,
        created_at: new Date()
      });
    
    if (error) {
      console.error('Error logging product history:', error.message);
    } else {
      console.log(`Product history logged: ${action} for product ${productId}`);
    }
  } catch (err) {
    console.error('Error in logProductHistory function:', err.message);
  }
};

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

// Simple test endpoint for connectivity
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
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

    // Fetch users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, is_verified');

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



// Captain products endpoint - fetch products pending approval
app.get('/api/captain/products', async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching products pending approval from Supabase');
    
    // Fetch products from Supabase with all details
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
        currencies (code),
        users (first_name, last_name, vendor_code)
      `)
      .eq('status', 'submitted');

    if (error) {
      console.error('Error fetching products from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching products: ' + error.message 
      });
    }

    // Transform products to match frontend expectations
    const formattedProducts = products.map(product => ({
      id: product.id,
      sellerId: product.seller_id,
      sellerName: product.users?.vendor_code || 'Unknown Seller',
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

    console.log(`Successfully fetched ${formattedProducts.length} products pending approval from Supabase`);
    res.json(formattedProducts || []);
  } catch (error) {
    console.error('Error in captain products endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching products: ' + error.message 
    });
  }
});

// Captain approve product endpoint
app.post('/api/captain/products/approve', async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
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
    
    // Update product status to approved
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        status: 'approved',
        is_verified: true,
        is_active: true,
        updated_at: new Date()
      })
      .eq('id', productId)
      .select('id, name, seller_id')
      .single();

    if (error) {
      console.error('Error approving product in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error approving product: ' + error.message 
      });
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    // Send notification to seller
    if (product && product.seller_id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: product.seller_id,
            title: 'Product Approved',
            message: `Your product "${product.name}" has been approved by the captain and is now live.`,
            is_read: false,
            created_at: new Date()
          });
        
        if (notificationError) {
          console.error('Error sending approval notification to seller:', notificationError.message);
        } else {
          console.log('Approval notification sent to seller');
        }
      } catch (notificationErr) {
        console.error('Error sending approval notification to seller:', notificationErr.message);
      }
    }
    
    console.log('Successfully approved product in Supabase');
    res.json({ 
      success: true, 
      message: 'Product approved successfully',
      product
    });
  } catch (error) {
    console.error('Error in approve product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error approving product: ' + error.message 
    });
  }
});

// Captain reject product endpoint
app.post('/api/captain/products/reject', async (req, res) => {
  try {
    const { productId, reason } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
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
    
    // Update product status to rejected
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        status: 'rejected',
        is_verified: false,
        is_active: false,
        updated_at: new Date()
      })
      .eq('id', productId)
      .select('id, name, seller_id')
      .single();

    if (error) {
      console.error('Error rejecting product in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error rejecting product: ' + error.message 
      });
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    // Send notification to seller with rejection reason
    if (product && product.seller_id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: product.seller_id,
            title: 'Product Rejected',
            message: `Your product "${product.name}" has been rejected by the captain. Reason: ${reason || 'No reason provided'}`,
            is_read: false,
            created_at: new Date()
          });
        
        if (notificationError) {
          console.error('Error sending rejection notification to seller:', notificationError.message);
        } else {
          console.log('Rejection notification sent to seller');
        }
      } catch (notificationErr) {
        console.error('Error sending rejection notification to seller:', notificationErr.message);
      }
    }
    
    console.log('Successfully rejected product in Supabase');
    res.json({ 
      success: true, 
      message: 'Product rejected successfully',
      product
    });
  } catch (error) {
    console.error('Error in reject product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error rejecting product: ' + error.message 
    });
  }
});

// Captain update product endpoint
app.put('/api/captain/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      category,
      description,
      price,
      currency,
      moq,
      moqUom,
      quantity,
      quantityUom,
      priceType,
      reLabeling,
      validityDate,
      validityTime
    } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
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
    
    // Get category ID from name
    let categoryId = null;
    if (category) {
      const { data: existingCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();
      
      if (categoryError) {
        console.error('Error fetching category:', categoryError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching category: ' + categoryError.message 
        });
      }
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      }
    }
    
    // Get currency ID from code
    let currencyId = 1; // Default to USD
    if (currency) {
      const { data: currencyData, error: currencyError } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', currency)
        .single();
      
      if (currencyError) {
        console.error('Error fetching currency:', currencyError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching currency: ' + currencyError.message 
        });
      }
      
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
    
    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({ 
        name: name,
        category_id: categoryId,
        description: description,
        price: price,
        currency_id: currencyId,
        moq: moq ? parseInt(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? parseInt(quantity) : null,
        quantity_uom: quantityUom || null,
        price_type: priceType || 'EXW',
        is_relabeling_allowed: reLabeling === 'yes',
        offer_validity_date: offerValidityDate,
        updated_at: new Date()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error updating product: ' + error.message 
      });
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    console.log('Successfully updated product in Supabase');
    
    // Send notification to seller
    if (product && product.seller_id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: product.seller_id,
            title: 'Product Updated',
            message: `Captain has updated your product "${product.name}". Please check the changes.`,
            is_read: false,
            created_at: new Date()
          });
        
        if (notificationError) {
          console.error('Error sending notification to seller:', notificationError.message);
        } else {
          console.log('Notification sent to seller for product update');
        }
      } catch (notificationErr) {
        console.error('Error sending notification to seller:', notificationErr.message);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error in captain update product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error updating product: ' + error.message 
    });
  }
});

// Seller update product endpoint
app.put('/api/seller/products/:id', authenticateToken, upload.any(), async (req, res) => {
  try {
    const productId = req.params.id;
    const sellerId = req.user.id;
    
    console.log('=== PRODUCT UPDATE DEBUG INFO ===');
    console.log('Product ID:', productId);
    console.log('Seller ID:', sellerId);
    console.log('Raw request body:', req.body);
    console.log('Files received:', req.files);
    console.log('Request headers:', req.headers);
    
    // If using upload.any(), files are in req.files array
    if (req.files && req.files.length > 0) {
      console.log('File fields:', req.files.map(f => f.fieldname));
    }
    
    // For multipart form data, we need to handle both req.body and req.files
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
    
    console.log('=== EXTRACTED FIELDS ===');
    console.log('name:', name, '| type:', typeof name, '| length:', name ? name.length : 'null');
    console.log('category:', category, '| type:', typeof category, '| length:', category ? category.length : 'null');
    console.log('price:', price, '| type:', typeof price);
    console.log('description:', description, '| type:', typeof description, '| length:', description ? description.length : 'null');
    
    // Check if fields exist at all
    console.log('=== FIELD EXISTENCE CHECK ===');
    console.log('name exists:', 'name' in req.body);
    console.log('category exists:', 'category' in req.body);
    console.log('price exists:', 'price' in req.body);
    console.log('description exists:', 'description' in req.body);
    
    // Validate required fields - improved validation with detailed debugging
    console.log('=== VALIDATION START ===');
    
    if (!('name' in req.body)) {
      console.log('NAME FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product name field is missing from request' 
      });
    }
    
    if (!name) {
      console.log('NAME IS FALSY:', name);
      return res.status(400).json({ 
        success: false, 
        error: 'Product name is required (received: ' + name + ')' 
      });
    }
    
    if (typeof name !== 'string') {
      console.log('NAME IS NOT STRING:', typeof name);
      return res.status(400).json({ 
        success: false, 
        error: 'Product name must be a string (received: ' + typeof name + ')' 
      });
    }
    
    if (name.trim() === '') {
      console.log('NAME IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product name cannot be empty or whitespace only' 
      });
    }
    
    if (!('category' in req.body)) {
      console.log('CATEGORY FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product category field is missing from request' 
      });
    }
    
    if (!category) {
      console.log('CATEGORY IS FALSY:', category);
      return res.status(400).json({ 
        success: false, 
        error: 'Product category is required (received: ' + category + ')' 
      });
    }
    
    if (typeof category !== 'string') {
      console.log('CATEGORY IS NOT STRING:', typeof category);
      return res.status(400).json({ 
        success: false, 
        error: 'Product category must be a string (received: ' + typeof category + ')' 
      });
    }
    
    if (category.trim() === '') {
      console.log('CATEGORY IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product category cannot be empty or whitespace only' 
      });
    }
    
    if (!('price' in req.body)) {
      console.log('PRICE FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product price field is missing from request' 
      });
    }
    
    if (!price) {
      console.log('PRICE IS FALSY:', price);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price is required (received: ' + price + ')' 
      });
    }
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      console.log('PRICE IS NOT A NUMBER:', price);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be a valid number (received: ' + price + ')' 
      });
    }
    
    if (priceNum <= 0) {
      console.log('PRICE IS NOT POSITIVE:', priceNum);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be a positive number (received: ' + priceNum + ')' 
      });
    }
    
    if (!('description' in req.body)) {
      console.log('DESCRIPTION FIELD MISSING FROM REQUEST');
      return res.status(400).json({ 
        success: false, 
        error: 'Product description field is missing from request' 
      });
    }
    
    if (!description) {
      console.log('DESCRIPTION IS FALSY:', description);
      return res.status(400).json({ 
        success: false, 
        error: 'Product description is required (received: ' + description + ')' 
      });
    }
    
    if (typeof description !== 'string') {
      console.log('DESCRIPTION IS NOT STRING:', typeof description);
      return res.status(400).json({ 
        success: false, 
        error: 'Product description must be a string (received: ' + typeof description + ')' 
      });
    }
    
    if (description.trim() === '') {
      console.log('DESCRIPTION IS EMPTY AFTER TRIM');
      return res.status(400).json({ 
        success: false, 
        error: 'Product description cannot be empty or whitespace only' 
      });
    }
    
    // Trim whitespace from required fields
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const priceValue = priceNum;
    
    console.log('=== VALIDATION PASSED ===');
    console.log('Trimmed values:', { trimmedName, trimmedCategory, priceValue, trimmedDescription });
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Verify that the product belongs to the seller
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', productId)
      .eq('seller_id', sellerId)
      .single();
    
    if (productError) {
      console.error('Error fetching product:', productError.message);
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found or you do not have permission to edit it' 
      });
    }
    
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found or you do not have permission to edit it' 
      });
    }
    
    // Get category ID from name (should exist in our predefined list)
    let categoryId = null;
    if (trimmedCategory) {
      const { data: existingCategory, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', trimmedCategory)
        .single();
      
      if (categoryError) {
        console.error('Error fetching category:', categoryError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching category: ' + categoryError.message 
        });
      }
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // If category doesn't exist, log an error (should not happen with predefined categories)
        console.error('Category not found in database:', trimmedCategory);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid category selected' 
        });
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
      
      if (currencyError) {
        console.error('Error fetching currency:', currencyError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Error fetching currency: ' + currencyError.message 
        });
      }
      
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
    
    // Update the product in the database with all new fields
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: trimmedName,
        category_id: categoryId,
        description: trimmedDescription,
        price: priceValue,
        currency_id: currencyId,
        moq: moq ? parseInt(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? parseInt(quantity) : null,
        quantity_uom: quantityUom || null,
        price_type: priceType || 'EXW',
        is_relabeling_allowed: reLabeling === 'yes',
        offer_validity_date: offerValidityDate,
        // Reset status to submitted when seller updates their product
        status: 'submitted',
        is_verified: false,
        updated_at: new Date()
      })
      .eq('id', productId)
      .eq('seller_id', sellerId) // Ensure seller can only update their own products
      .select()
      .single();

    if (error) {
      console.error('Error updating product in Supabase:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Product data:', {
        name: trimmedName,
        category_id: categoryId,
        description: trimmedDescription,
        price: priceValue,
        currency_id: currencyId,
        moq: moq ? parseInt(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? parseInt(quantity) : null,
        quantity_uom: quantityUom || null,
        price_type: priceType || 'EXW',
        is_relabeling_allowed: reLabeling === 'yes',
        offer_validity_date: offerValidityDate,
        status: 'submitted',
        is_verified: false
      });
      
      return res.status(500).json({ 
        success: false, 
        error: 'Server error updating product: ' + error.message 
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
    
    console.log('Successfully created product in Supabase:', productWithDetails);
    res.json({ 
      success: true, 
      message: 'Product submitted successfully for approval',
      product: productWithDetails
    });
  } catch (error) {
    console.error('Error in create product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error creating product: ' + error.message 
    });
  }
});

// Update product endpoint
app.put('/api/seller/products/:productId', authenticateToken, async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Updating product in Supabase');
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    const productId = req.params.productId;
    const { name, description, category, price, currency, moq, moqUom, available_quantity, quantity_uom, price_type, is_relabeling_allowed, offer_validity_date, image_url, thumbnail_url } = req.body;

    // Update product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        category,
        price,
        currency,
        moq,
        moq_uom,
        available_quantity,
        quantity_uom,
        price_type,
        is_relabeling_allowed,
        offer_validity_date,
        image_url,
        thumbnail_url,
        status: 'submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
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
    
    console.log('Successfully updated product in Supabase:', productWithDetails);
    res.json({ 
      success: true, 
      message: 'Product updated successfully and submitted for approval',
      product: productWithDetails
    });
  } catch (error) {
    console.error('Error in update product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error updating product: ' + error.message 
    });
  }
});

// Seller notifications endpoint - fetch seller's notifications
app.get('/api/seller/notifications', authenticateToken, async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller notifications from Supabase');
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    
    // Fetch notifications from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .eq('user_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(10); // Limit to last 10 notifications

    if (error) {
      console.error('Error fetching seller notifications from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching notifications: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${notifications.length} notifications from Supabase`);
    res.json(notifications || []);
  } catch (error) {
    console.error('Error in seller notifications endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching notifications: ' + error.message 
    });
  }
});

// Mark notification as read endpoint
app.put('/api/seller/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    console.log('Mark notification as read endpoint called');
    console.log('Notification ID from params:', req.params.id);
    console.log('User ID from token:', req.user.id);
    
    const notificationId = parseInt(req.params.id); // Ensure it's an integer
    const userId = req.user.id;
    
    // Validate notification ID
    if (isNaN(notificationId)) {
      console.log('Invalid notification ID provided:', req.params.id);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid notification ID' 
      });
    }
    
    console.log('Attempting to update notification with ID:', notificationId, 'for user:', userId);
    
    // Update notification as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true
      })
      .eq('id', notificationId)
      .eq('user_id', userId) // Ensure user can only mark their own notifications as read
      .select(); // Add select to return the updated data

    if (error) {
      console.error('Error marking notification as read:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error updating notification: ' + error.message 
      });
    }

    console.log('Successfully marked notification as read');
    res.json({ 
      success: true,
      message: 'Notification marked as read',
      data: data
    });
  } catch (error) {
    console.error('Error in mark notification read endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error updating notification: ' + error.message 
    });
  }
});

// Mark all notifications as read endpoint
app.put('/api/seller/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    console.log('Mark all notifications as read endpoint called');
    console.log('User ID from token:', req.user.id);
    
    const userId = req.user.id;
    
    // Update all notifications for this user as read
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true
      })
      .eq('user_id', userId)
      .eq('is_read', false) // Only update unread notifications
      .select(); // Add select to return the updated data

    if (error) {
      console.error('Error marking all notifications as read:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error updating notifications: ' + error.message 
      });
    }

    console.log('Successfully marked all notifications as read');
    res.json({ 
      success: true,
      message: 'All notifications marked as read',
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error in mark all notifications read endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error updating notifications: ' + error.message 
    });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for any non-API routes
// But exclude requests for static assets (files with extensions)
app.get(/^\/(?!api).*\.(?!js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Alternative catch-all that excludes common static file extensions
app.get(/^((?!api|js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Even simpler approach - just handle the root route and let static middleware handle assets
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint (should come before catch-all)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API routes should be defined here (they already are in your code above)

// Catch all handler: send back React's index.html file for any non-API routes
// But exclude API routes and static assets
app.get('*', (req, res) => {
  // If it's an API request, don't serve index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('API route not found');
  }
  
  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});