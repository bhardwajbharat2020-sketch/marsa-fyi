require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter for Hostinger with TLS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // false for TLS (port 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test the email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const app = express();
const PORT = process.env.PORT || 5000;


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
const SALT_ROUNDS = 10;

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
  
  console.log('Auth middleware called. Token:', token ? 'present' : 'missing');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified. User:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    
    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        error: 'Token has expired. Please log in again.' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token. Please log in again.' 
      });
    } else {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token. Please log in again.' 
      });
    }
  }
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role(s): ${roles.join(', ')}` 
      });
    }
    
    next();
  };
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
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
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
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
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
    
    // Validate email format if vendorCode looks like an email
    if (vendorCode.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(vendorCode)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid email format' 
        });
      }
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
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
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
app.post('/api/rfq', authenticateToken, async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Creating RFQ in Supabase');
    
    // Add user ID to the RFQ data
    const rfqData = {
      ...req.body,
      user_id: req.user.id
    };
    
    // Create RFQ in Supabase with related data
    const { data, error } = await supabase
      .from('rfq')
      .insert([rfqData]);

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
    console.log('GET /api/products endpoint hit');
    console.log('Request headers:', req.headers);
    console.log('Request URL:', req.url);
    
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

    console.log(`Successfully fetched ${products.length} products from Supabase`);
    
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

    console.log(`Successfully transformed ${formattedProducts.length} products`);
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
    console.log(`GET /api/products/${productId} endpoint hit`);
    console.log('Request headers:', req.headers);
    console.log('Request URL:', req.url);
    
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
      console.log(`Product ${productId} not found or not approved`);
      return res.status(404).json({ 
        success: false,
        error: 'Product not found or not approved' 
      });
    }

    console.log(`Successfully fetched product ${productId} from Supabase`);
    
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

    console.log(`Successfully transformed product ${productId}`);
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
app.get('/api/seller/products', authenticateToken, authorizeRole(['seller']), async (req, res) => {
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
app.get('/api/seller/orders', authenticateToken, authorizeRole(['seller']), async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller orders from Supabase');
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    
    // Fetch orders from Supabase with correct column names
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, quantity, status')
      .eq('seller_id', sellerId);

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
app.get('/api/seller/rfqs', authenticateToken, authorizeRole(['seller']), async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching seller RFQs from Supabase');
    
    // Get the seller ID from the authenticated user
    const sellerId = req.user.id;
    
    // Fetch RFQs from Supabase with correct column names
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select('id, quantity, status')
      .eq('seller_id', sellerId);

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
app.post('/api/seller/products', authenticateToken, authorizeRole(['seller']), upload.any(), async (req, res) => {
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
    
    if (name.trim().length === 0) {
      console.log('NAME IS EMPTY STRING');
      return res.status(400).json({ 
        success: false, 
        error: 'Product name cannot be empty' 
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
    
    if (category.trim().length === 0) {
      console.log('CATEGORY IS EMPTY STRING');
      return res.status(400).json({ 
        success: false, 
        error: 'Product category cannot be empty' 
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
    
    // Convert price to number if it's a string
    let priceNumber = price;
    if (typeof price === 'string') {
      priceNumber = parseFloat(price);
    }
    
    if (isNaN(priceNumber)) {
      console.log('PRICE IS NOT A VALID NUMBER:', price);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be a valid number (received: ' + price + ')' 
      });
    }
    
    if (priceNumber <= 0) {
      console.log('PRICE IS NOT POSITIVE:', priceNumber);
      return res.status(400).json({ 
        success: false, 
        error: 'Product price must be greater than zero (received: ' + priceNumber + ')' 
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
    
    if (description.trim().length === 0) {
      console.log('DESCRIPTION IS EMPTY STRING');
      return res.status(400).json({ 
        success: false, 
        error: 'Product description cannot be empty' 
      });
    }
    
    // Validate optional fields if provided
    if (moq && isNaN(Number(moq))) {
      return res.status(400).json({ 
        success: false, 
        error: 'MOQ must be a valid number' 
      });
    }
    
    if (quantity && isNaN(Number(quantity))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be a valid number' 
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
    
    // Get category ID from category name
    console.log('Fetching category ID for:', category);
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();
    
    if (categoryError) {
      console.error('Error fetching category ID:', categoryError.message);
      // If category doesn't exist, create it
      const { data: newCategory, error: newCategoryError } = await supabase
        .from('categories')
        .insert({ name: category })
        .select()
        .single();
      
      if (newCategoryError) {
        console.error('Error creating new category:', newCategoryError.message);
        return res.status(500).json({ 
          success: false, 
          error: 'Server error creating category: ' + newCategoryError.message 
        });
      }
      
      console.log('Created new category:', newCategory);
    }
    
    const categoryId = categoryData ? categoryData.id : (newCategory ? newCategory.id : null);
    
    // Get currency ID from currency code
    console.log('Fetching currency ID for:', currency || 'USD');
    const { data: currencyData, error: currencyError } = await supabase
      .from('currencies')
      .select('id')
      .eq('code', currency || 'USD')
      .single();
    
    if (currencyError) {
      console.error('Error fetching currency ID:', currencyError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error fetching currency: ' + currencyError.message 
      });
    }
    
    // Create product in database
    console.log('Creating product in database');
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        seller_id: req.user.id,
        name: name.trim(),
        category_id: categoryId,
        is_branded: branded === 'yes' || branded === true,
        description: description.trim(),
        moq: moq ? Number(moq) : null,
        moq_uom: moqUom || null,
        available_quantity: quantity ? Number(quantity) : null,
        quantity_uom: quantityUom || null,
        price: priceNumber,
        currency_id: currencyData.id,
        price_type: priceType || 'fixed',
        is_relabeling_allowed: reLabeling === 'yes' || reLabeling === true,
        offer_validity_date: validityDate && validityTime ? new Date(`${validityDate}T${validityTime}`) : null,
        status: 'pending',
        is_verified: false,
        is_active: true
      })
      .select(`
        id,
        seller_id,
        name,
        category_id,
        is_branded,
        description,
        moq,
        moq_uom,
        available_quantity,
        quantity_uom,
        price,
        currency_id,
        price_type,
        is_relabeling_allowed,
        offer_validity_date,
        status,
        is_verified,
        is_active,
        created_at,
        updated_at
      `)
      .single();
    
    if (productError) {
      console.error('Error creating product:', productError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error creating product: ' + productError.message 
      });
    }
    
    console.log('Successfully created product:', product);
    res.json({ 
      success: true, 
      message: 'Product created successfully',
      product
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

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
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
    
    // Save contact form submission to database
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .insert([
        {
          name,
          email,
          phone: phone || '', // Store empty string if phone is not provided
          message,
          submitted_at: new Date()
        }
      ])
      .select();

    if (error) {
      console.error('Error saving contact form submission:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error saving contact form submission: ' + error.message 
      });
    }

    console.log('Contact form submission saved to database');
    res.json({ 
      success: true, 
      message: 'Thank you for your message. We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Error in contact form submission endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error processing contact form submission: ' + error.message 
    });
  }
});

// HR dashboard - fetch contact form submissions
app.get('/api/hr/contact-submissions', authenticateToken, authorizeRole(['hr']), async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Fetch contact form submissions from database
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact form submissions:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching contact form submissions: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${data.length} contact form submissions from database`);
    res.json({ 
      success: true,
      submissions: data
    });
  } catch (error) {
    console.error('Error in HR contact submissions endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching contact form submissions: ' + error.message 
    });
  }
});

// Captain approve product endpoint
app.post('/api/captain/products/approve', authenticateToken, authorizeRole(['captain']), async (req, res) => {
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
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: product.seller_id,
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved.`,
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
    
    console.log('Successfully approved product in Supabase');
    res.json({ 
      success: true,
      message: 'Product approved successfully',
      product: {
        id: product.id,
        name: product.name,
        sellerId: product.seller_id
      }
    });
  } catch (error) {
    console.error('Error in captain approve product endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error approving product: ' + error.message 
    });
  }
});

// Captain reject product endpoint
app.post('/api/captain/products/reject', authenticateToken, authorizeRole(['captain']), async (req, res) => {
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
    
    // Send notification to seller with reason
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: product.seller_id,
          title: 'Product Rejected',
          message: `Your product "${product.name}" has been rejected. Reason: ${reason || 'Not specified'}`,
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
    
    console.log('Successfully rejected product in Supabase');
    res.json({ 
      success: true,
      message: 'Product rejected successfully',
      product: {
        id: product.id,
        name: product.name,
        sellerId: product.seller_id
      }
    });
  } catch (error) {
    console.error('Error in captain reject product endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error rejecting product: ' + error.message 
    });
  }
});

// Captain add role endpoint
app.post('/api/captain/roles', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    const { name, code } = req.body;
    
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role name and code are required' 
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
    
    // Save the role to the database
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        code
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error creating role: ' + error.message 
      });
    }
    
    console.log('Successfully created role in Supabase');
    res.json({ 
      success: true, 
      message: 'Role created successfully',
      role: {
        id: role.id,
        name: role.name,
        code: role.code
      }
    });
  } catch (error) {
    console.error('Error in captain add role endpoint:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error creating role: ' + error.message 
    });
  }
});

// Captain delete role endpoint
app.delete('/api/captain/roles/:id', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    const roleId = req.params.id;
    
    // Validate required fields
    if (!roleId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role ID is required' 
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
    
    // Delete the role from the database
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Error deleting role in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error deleting role: ' + error.message 
      });
    }
    
    console.log('Successfully deleted role in Supabase');
    res.json({ 
      success: true, 
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error in captain delete role endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error deleting role: ' + error.message 
    });
  }
});

// Captain fetch all users endpoint
app.get('/api/captain/users', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    console.log('Captain users endpoint called');
    console.log('User from token:', req.user);
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // First, try a simple query to test if Supabase is working
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .limit(5);

    if (testError) {
      console.error('Test query failed:', testError.message);
      console.error('Test error details:', testError);
      return res.status(500).json({ 
        success: false,
        error: 'Test query failed: ' + testError.message 
      });
    }

    console.log('Test query successful. Users count:', testUsers ? testUsers.length : 0);
    console.log('Test users data:', testUsers);

    // Now fetch all users with their roles
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        vendor_code,
        phone,
        is_verified,
        user_roles (
          role_id,
          roles (
            name,
            code
          )
        )
      `)
      .order('first_name');

    if (error) {
      console.error('Error fetching users from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching users: ' + error.message 
      });
    }

    console.log('Users fetched from Supabase:', users ? users.length : 0);

    // Format users data
    const formattedUsers = users.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      vendor_code: user.vendor_code,
      phone: user.phone,
      is_verified: user.is_verified,
      current_role: user.user_roles && user.user_roles.length > 0 
        ? user.user_roles[0].roles?.name 
        : null
    }));

    console.log(`Successfully fetched ${formattedUsers.length} users from Supabase`);
    res.json({ 
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error in captain users endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching users: ' + error.message 
    });
  }
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      // For security reasons, we don't reveal if the email exists
      // We still return a success message to prevent email enumeration
      return res.json({ 
        success: true, 
        message: 'If your email is registered with us, you will receive a password reset link shortly.' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: resetTokenExpires,
          used: false
        }
      ]);
    
    if (tokenError) {
      console.error('Error storing reset token:', tokenError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error. Please try again.' 
      });
    }
    
    // Create reset link
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    
    // Send email with reset link
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request - MarsaFyi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f77f00;">Password Reset Request</h2>
            <p>Hello ${user.first_name || user.email},</p>
            <p>We received a request to reset your password for your MarsaFyi account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #f77f00; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent by MarsaFyi. If you have any questions, please contact our support team.
            </p>
          </div>
        `,
      });
      
      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
      // Don't return an error to the user, as the token was created successfully
      // The user will just need to request another reset if email fails
    }
    
    res.json({ 
      success: true, 
      message: 'If your email is registered with us, you will receive a password reset link shortly.'
    });
  } catch (error) {
    console.error('Error in forgot password endpoint:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again.' 
    });
  }
});

// Change password endpoint
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }
    
    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password does not meet requirements: ' + passwordValidation.errors.join(', ')
      });
    }
    
    // Check if current password and new password are the same
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be different from current password' 
      });
    }
    
    // Fetch user's current password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user for password change:', userError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error. Please try again.' 
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error. Please try again.' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Password has been changed successfully.' 
    });
  } catch (error) {
    console.error('Error in change password endpoint:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again.' 
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate required fields
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and new password are required' 
      });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password does not meet requirements: ' + passwordValidation.errors.join(', ')
      });
    }
    
    // Check if token exists and is valid
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', token)
      .single();
    
    if (tokenError || !resetToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }
    
    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reset token has expired' 
      });
    }
    
    // Check if token has already been used
    if (resetToken.used) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reset token has already been used' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetToken.user_id);
    
    if (updateError) {
      console.error('Error updating password:', updateError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error. Please try again.' 
      });
    }
    
    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);
    
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    console.error('Error in reset password endpoint:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error. Please try again.' 
    });
  }
});

// Captain fetch user details endpoint
app.get('/api/captain/users/:id', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch user details
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        vendor_code,
        phone,
        is_verified,
        user_roles (
          role_id,
          roles (
            name,
            code
          )
        )
      `)
      .eq('id', userId);

    if (error) {
      console.error('Error fetching user details from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching user details: ' + error.message 
      });
    }

    if (!user || user.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    console.log('User details fetched from Supabase:', user);

    // Format user data
    const formattedUser = {
      id: user[0].id,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      email: user[0].email,
      vendor_code: user[0].vendor_code,
      phone: user[0].phone,
      is_verified: user[0].is_verified,
      current_role: user[0].user_roles && user[0].user_roles.length > 0 
        ? user[0].user_roles[0].roles?.name 
        : null
    };

    console.log('Successfully fetched user details from Supabase');
    res.json({ 
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Error in captain user details endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching user details: ' + error.message 
    });
  }
});

// Captain fetch users by role endpoint
app.get('/api/captain/roles/:id/users', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    const roleId = req.params.id;
    console.log('Captain users by role endpoint called. Role ID:', roleId);
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // First, fetch user_role mappings for this role
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', roleId);
      
    console.log('User roles mapping for role ID:', roleId, 'Count:', userRoles ? userRoles.length : 0, 'Error:', userRolesError);
    
    if (userRolesError) {
      console.error('Error fetching user roles mapping:', userRolesError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching user roles mapping: ' + userRolesError.message 
      });
    }
    
    // If no users have this role, return empty array
    if (!userRoles || userRoles.length === 0) {
      console.log('No users found with role ID:', roleId);
      return res.json({ 
        success: true,
        users: []
      });
    }
    
    // Extract user IDs
    const userIds = userRoles.map(ur => ur.user_id);
    console.log('User IDs with role:', userIds);
    
    // Fetch users with the specified IDs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        vendor_code,
        phone,
        is_verified
      `)
      .in('id', userIds);
      
    console.log('Users fetched by IDs. Count:', users ? users.length : 0, 'Error:', usersError);

    if (usersError) {
      console.error('Error fetching users by IDs from Supabase:', usersError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching users: ' + usersError.message 
      });
    }

    // Fetch user roles and their associated role names for current role info
    const { data: usersWithRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles (
          name,
          code
        )
      `)
      .in('user_id', userIds)
      .eq('role_id', roleId);
      
    console.log('User roles fetched. Count:', usersWithRoles ? usersWithRoles.length : 0, 'Error:', rolesError);

    if (rolesError) {
      console.error('Error fetching user roles from Supabase:', rolesError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching user roles: ' + rolesError.message 
      });
    }

    // Combine user data with role information
    const formattedUsers = users.map(user => {
      const userRole = usersWithRoles.find(ur => ur.user_id === user.id);
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        vendor_code: user.vendor_code,
        phone: user.phone,
        is_verified: user.is_verified,
        current_role: userRole && userRole.roles ? userRole.roles.name : null
      };
    });

    console.log(`Successfully fetched ${formattedUsers.length} users with role from Supabase`);
    res.json({ 
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error in captain users by role endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching users: ' + error.message 
    });
  }
});

// Captain assign role to user endpoint
app.post('/api/captain/users/assign-role', authenticateToken, authorizeRole(['captain']), async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // Validate required fields
    if (!userId || !roleId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and Role ID are required' 
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
    
    // First, remove any existing primary role for this user
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('is_primary', true);
    
    if (deleteError) {
      console.error('Error removing existing primary role:', deleteError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error assigning role: ' + deleteError.message 
      });
    }
    
    // Assign the new role as primary
    const { data: userRole, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        is_primary: true,
        assigned_at: new Date()
      })
      .select(`
        id,
        user_id,
        role_id,
        is_primary,
        roles (
          name,
          code
        )
      `)
      .single();

    if (insertError) {
      console.error('Error assigning role to user in Supabase:', insertError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Server error assigning role: ' + insertError.message 
      });
    }
    
    // Send notification to user
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Role Assigned',
          message: `You have been assigned the role of ${userRole.roles.name}.`,
          is_read: false,
          created_at: new Date()
        });
      
      if (notificationError) {
        console.error('Error sending role assignment notification to user:', notificationError.message);
      } else {
        console.log('Role assignment notification sent to user');
      }
    } catch (notificationErr) {
      console.error('Error sending role assignment notification to user:', notificationErr.message);
    }
    
    console.log('Successfully assigned role to user in Supabase');
    res.json({ 
      success: true, 
      message: 'Role assigned successfully',
      userRole
    });
  } catch (error) {
    console.error('Error in assign role to user endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Server error assigning role: ' + error.message 
    });
  }
});

// Captain approve new user endpoint
app.post('/api/captain/users/approve', authenticateToken, authorizeRole(['captain', 'hr']), async (req, res) => {
  try {
    const { userId } = req.body;

    // Update user to be active and verified
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_active: true,
        is_verified: true
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error approving new user:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error approving new user: ' + error.message
      });
    }

    res.json({ success: true, message: 'New user approved successfully' });
  } catch (error) {
    console.error('Error approving new user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error approving new user: ' + error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Enhanced Health check endpoint with Supabase test
app.get('/api/health/db', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ status: 'ERROR', message: 'Supabase client not initialized' });
    }

    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      return res.status(500).json({ status: 'ERROR', message: 'Supabase connection test failed', error: error.message });
    }

    res.json({ status: 'OK', message: 'Supabase connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Health check failed', error: error.message });
  }
});

// Serve static files from the React app build directory
// This must come before the catch-all route
const staticPath = path.join(__dirname, '../client/build');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Catch all handler: send back React's index.html file for any non-API routes
// This MUST be the last route to avoid interfering with API routes or static files
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('API route not found');
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});