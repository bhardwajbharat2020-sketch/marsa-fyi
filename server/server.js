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
const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 5002 : 5000);


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
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     'unknown';
    
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
        vendor_code: vendorCode,
        ip_address: clientIP // Store the client IP address
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
    
    // Send welcome email with vendor code
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to MarsaFyi - Your Vendor Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f77f00;">Welcome to MarsaFyi!</h2>
            <p>Hello ${firstName} ${lastName},</p>
            <p>Thank you for registering with MarsaFyi. We're excited to have you join our port-centric B2B marketplace.</p>
            <p>Your Vendor Code is: <strong>${vendorCode}</strong></p>
            <p>Please keep this code safe as you'll need it to log in to your account.</p>
            <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Registration Details:</p>
              <p style="margin: 5px 0 0 0;">Name: ${firstName} ${lastName}</p>
              <p style="margin: 5px 0 0 0;">Email: ${email}</p>
              <p style="margin: 5px 0 0 0;">Vendor Code: ${vendorCode}</p>
              <p style="margin: 5px 0 0 0;">Work Class: ${workClass}</p>
            </div>
            <p>You can now log in to your account using your email and password.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent by MarsaFyi. If you didn't register for an account, please ignore this email.
            </p>
          </div>
        `,
      });
      
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError.message);
      // Don't fail the registration if email sending fails
    }
    
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
    
    // First, try to get products from the "Land, house flat plot category"
    let landCategoryProducts = [];
    let otherProducts = [];
    
    // Get the land category ID
    const { data: landCategory, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Land, house flat plot category')
      .single();

    if (!categoryError && landCategory) {
      // Fetch products from the land category
      const { data: landProducts, error: landError } = await supabase
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
        .eq('category_id', landCategory.id)
        .eq('is_active', true)
        .eq('is_verified', true)
        .limit(3); // Get up to 3 land products

      if (!landError && landProducts) {
        landCategoryProducts = landProducts;
      }
    }

    // Calculate how many more products we need
    const remainingSlots = 6 - landCategoryProducts.length;
    
    if (remainingSlots > 0) {
      // Get other products to fill remaining slots
      let otherProductsQuery = supabase
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
        .eq('is_verified', true);
      
      // Exclude land category products if we have any
      if (landCategory && landCategoryProducts.length > 0) {
        const landProductIds = landCategoryProducts.map(p => p.id);
        otherProductsQuery = otherProductsQuery.not('id', 'in', `(${landProductIds.join(',')})`);
      }
      
      const { data: additionalProducts, error: otherError } = await otherProductsQuery
        .limit(remainingSlots);

      if (!otherError && additionalProducts) {
        otherProducts = additionalProducts;
      }
    }

    // Combine land products with other products
    let products = [...landCategoryProducts, ...otherProducts];
    
    // If we still don't have enough products, fetch any products to fill
    if (products.length < 6) {
      const remaining = 6 - products.length;
      const existingIds = products.map(p => p.id);
      
      let fallbackQuery = supabase
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
        .eq('is_verified', true);
      
      if (existingIds.length > 0) {
        fallbackQuery = fallbackQuery.not('id', 'in', `(${existingIds.join(',')})`);
      }
      
      const { data: fallbackProducts, error: fallbackError } = await fallbackQuery
        .limit(remaining);

      if (!fallbackError && fallbackProducts) {
        products = [...products, ...fallbackProducts];
      }
    }

    // Limit to 6 products max
    products = products.slice(0, 6);

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
app.get('/api/buyer/rfqs', authenticateToken, async (req, res) => {
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
      .select('id, product_id, title, quantity, status, created_at')
      .eq('buyer_id', req.user.id);

    if (error) {
      console.error('Error fetching buyer RFQs from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer RFQs: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${rfqs.length} buyer RFQs from Supabase`);
    res.json(rfqs || []);
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

    // Fetch orders from Supabase with available columns
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, quantity, status')
      .eq('buyer_id', req.user?.id || 1);

    if (error) {
      console.error('Error fetching buyer orders from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer orders: ' + error.message 
      });
    }

    // Add missing fields manually since they don't exist in the schema
    const ordersWithDetails = orders.map(order => ({
      ...order,
      seller: 'Unknown Seller',
      product: 'Unknown Product'
    }));

    console.log(`Successfully fetched ${ordersWithDetails.length} buyer orders from Supabase`);
    res.json(ordersWithDetails || []);
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

    // Return empty array since suppliers table doesn't exist
    console.log('Suppliers table not implemented, returning empty array');
    res.json([]);
  } catch (error) {
    console.error('Error in buyer suppliers endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching buyer suppliers: ' + error.message 
    });
  }
});

// Create RFQ endpoint for buyers
app.post('/api/buyer/rfqs', authenticateToken, async (req, res) => {
  try {
    const { product_id, title, description, quantity, budget_range_min, budget_range_max, response_deadline, currency_id } = req.body;
    
    // Validate required fields
    if (!product_id || !title || !quantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID, title, and quantity are required' 
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
        buyer_id: req.user.id,
        product_id: parseInt(product_id),
        title: title,
        description: description || '',
        quantity: parseInt(quantity),
        budget_range_min: budget_range_min ? parseFloat(budget_range_min) : null,
        budget_range_max: budget_range_max ? parseFloat(budget_range_max) : null,
        response_deadline: response_deadline || null,
        currency_id: currency_id || 1,
        status: 'open',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating RFQ in Supabase:', error.message);
      console.error('Error details:', error);
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

// Update RFQ endpoint for buyers
app.put('/api/buyer/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_id,
      title,
      description,
      quantity,
      budget_range_min,
      budget_range_max,
      response_deadline,
      currency_id
    } = req.body;
    
    // Validate required fields
    const hasValidProductId = product_id !== undefined && product_id !== null && product_id !== '' && !isNaN(parseInt(product_id)) && parseInt(product_id) > 0;
    const hasValidTitle = title !== undefined && title !== null && title.toString().trim() !== '';
    const hasValidQuantity = quantity !== undefined && quantity !== null && 
                            quantity.toString().trim() !== '' && !isNaN(parseInt(quantity)) && 
                            parseInt(quantity) > 0;
    
    if (!hasValidProductId || !hasValidTitle || !hasValidQuantity) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID, title, and quantity are required' 
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
    
    // Verify that the RFQ exists and belongs to the buyer
    const { data: existingRFQ, error: rfqError } = await supabase
      .from('rfqs')
      .select('id, buyer_id, status')
      .eq('id', id)
      .eq('buyer_id', req.user.id)
      .single();
    
    console.log('Looking for RFQ with ID:', id);
    console.log('Current user ID:', req.user.id);
    console.log('Existing RFQ query result:', existingRFQ);
    console.log('Existing RFQ query error:', rfqError);
    
    if (rfqError || !existingRFQ) {
      console.log('RFQ not found or permission denied');
      return res.status(404).json({ 
        success: false,
        error: 'RFQ not found or you do not have permission to update it' 
      });
    }
    
    console.log('Found existing RFQ with status:', existingRFQ.status);
    
    // Determine the new status - if the RFQ was in a responded state, set it to resubmitted
    const respondedStatuses = ['negotiation_requested', 'doq_provided', 'responded', 'accepted', 'rejected'];
    // More robust status checking with trimming and case normalization
    const currentStatus = existingRFQ.status ? existingRFQ.status.toString().trim().toLowerCase() : '';
    const newStatus = respondedStatuses.includes(currentStatus) ? 'resubmitted' : existingRFQ.status;
    
    console.log('Responded statuses:', respondedStatuses);
    console.log('Existing RFQ status (trimmed and lowercase):', currentStatus);
    console.log('Will set new status to:', newStatus);

    // Update the RFQ in the database
    const updateData = {
      product_id: parseInt(product_id),
      title: title,
      description: description || '',
      quantity: parseInt(quantity),
      budget_range_min: budget_range_min ? parseFloat(budget_range_min) : null,
      budget_range_max: budget_range_max ? parseFloat(budget_range_max) : null,
      response_deadline: response_deadline || null,
      currency_id: currency_id || 1,
      status: newStatus,
      updated_at: new Date()
    };
    
    console.log('Update data being sent to database:', updateData);
    
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RFQ in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error updating RFQ: ' + error.message 
      });
    }

    console.log('Successfully updated RFQ in Supabase');
    console.log('Returned RFQ data:', rfq);
    res.json({ 
      success: true, 
      message: 'RFQ updated successfully',
      rfq
    });
  } catch (error) {
    console.error('Error in update RFQ endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error updating RFQ: ' + error.message 
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
      .select('id, user_id, action, details, reason, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching audit logs: ' + error.message 
      });
    }

    // Format logs data
    const formattedLogs = logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      details: log.details,
      reason: log.reason,
      createdAt: log.created_at
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

// Captain roles endpoint - fetch all roles with user counts
app.get('/api/captain/roles', authenticateToken, async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch all roles with user counts
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        id,
        name,
        code,
        description,
        is_active,
        created_at,
        user_roles (
          id
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching roles from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching roles: ' + error.message 
      });
    }

    // Format roles data with user counts
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isActive: role.is_active,
      userCount: role.user_roles ? role.user_roles.length : 0,
      createdAt: role.created_at
    }));

    console.log(`Successfully fetched ${formattedRoles.length} roles from Supabase`);
    res.json(formattedRoles || []);
  } catch (error) {
    console.error('Error in captain roles endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching roles: ' + error.message 
    });
  }
});

// Captain create role endpoint
app.post('/api/captain/roles', authenticateToken, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    
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
    
    // Create the role
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: name,
        code: code.toUpperCase(),
        description: description || '',
        is_active: true,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role in Supabase:', error.message);
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
        code: role.code,
        description: role.description,
        isActive: role.is_active,
        userCount: 0,
        createdAt: role.created_at
      }
    });
  } catch (error) {
    console.error('Error in captain create role endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error creating role: ' + error.message 
    });
  }
});

// Captain update role endpoint
app.put('/api/captain/roles/:id', authenticateToken, async (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, code, description, is_active } = req.body;
    
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
    
    // Update the role
    const { data: role, error } = await supabase
      .from('roles')
      .update({
        name: name,
        code: code.toUpperCase(),
        description: description || '',
        is_active: is_active !== undefined ? is_active : true
        // Removed updated_at since it's not in the schema
      })
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      console.error('Error updating role in Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error updating role: ' + error.message 
      });
    }
    
    if (!role) {
      return res.status(404).json({ 
        success: false,
        error: 'Role not found' 
      });
    }
    
    // Get user count for the role
    const { data: userRoles, userCountError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', roleId);
    
    const userCount = userCountError ? 0 : userRoles.length;
    
    console.log('Successfully updated role in Supabase');
    res.json({ 
      success: true, 
      message: 'Role updated successfully',
      role: {
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
        isActive: role.is_active,
        userCount: userCount,
        createdAt: role.created_at
      }
    });
  } catch (error) {
    console.error('Error in captain update role endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error updating role: ' + error.message 
    });
  }
});

// Captain delete role endpoint
app.delete('/api/captain/roles/:id', authenticateToken, async (req, res) => {
  try {
    const roleId = req.params.id;
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }
    
    // Check if role has users assigned to it
    const { data: userRoles, error: userCountError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', roleId);
    
    if (userCountError) {
      console.error('Error checking role user count:', userCountError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error checking role user count: ' + userCountError.message 
      });
    }
    
    if (userRoles && userRoles.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete role with assigned users. Please reassign users first.' 
      });
    }
    
    // Delete the role
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Error deleting role in Supabase:', error.message);
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

// Admin products endpoint - fetch products pending approval
app.get('/api/admin/products', async (req, res) => {
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
    console.error('Error in admin products endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching products: ' + error.message 
    });
  }
});

// Admin approve product endpoint
app.post('/api/admin/products/approve', async (req, res) => {
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
    console.error('Error in admin approve product endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error approving product: ' + error.message 
    });
  }
});

// Admin reject product endpoint
app.post('/api/admin/products/reject', async (req, res) => {
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
            message: `Your product "${product.name}" has been rejected by the admin. Reason: ${reason || 'No reason provided'}`,
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
      product: {
        id: product.id,
        name: product.name,
        sellerId: product.seller_id
      }
    });
  } catch (error) {
    console.error('Error in admin reject product endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error rejecting product: ' + error.message 
    });
  }
});

// Admin update product endpoint
app.put('/api/admin/products/:id', async (req, res) => {
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
            message: `Admin has updated your product "${product.name}". Please check the changes.`,
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
      product: {
        id: product.id,
        name: product.name,
        sellerId: product.seller_id
      }
    });
  } catch (error) {
    console.error('Error in admin update product endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error updating product: ' + error.message 
    });
  }
});

// Mark all notifications as read endpoint
app.put('/api/buyer/notifications/read-all', authenticateToken, async (req, res) => {
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

// HR Dashboard endpoints

// HR documents endpoint - fetch pending documents for verification
app.get('/api/hr/documents', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch pending documents from Supabase
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        user_id,
        document_type,
        document_url,
        submitted_date,
        status,
        users (first_name, last_name, vendor_code, user_roles(role_id, roles(name)))
      `)
      .eq('status', 'pending')
      .order('submitted_date', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching documents: ' + error.message
      });
    }

    // Transform data to match frontend expectations
    const formattedDocuments = data.map(doc => ({
      id: doc.id,
      user_name: `${doc.users.first_name} ${doc.users.last_name}`,
      vendor_code: doc.users.vendor_code,
      role: doc.users.user_roles?.[0]?.roles?.name || 'Unknown',
      document_type: doc.document_type,
      submitted_date: doc.submitted_date,
      status: doc.status
    }));

    res.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching documents: ' + error.message
    });
  }
});

// HR contacts endpoint - fetch pending contact requests
app.get('/api/hr/contacts', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch pending contact requests from Supabase
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        id,
        requester_id,
        reason,
        request_date,
        status,
        users (first_name, last_name, vendor_code)
      `)
      .eq('status', 'pending')
      .order('request_date', { ascending: false });

    if (error) {
      console.error('Error fetching contact requests:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching contact requests: ' + error.message
      });
    }

    // Transform data to match frontend expectations
    const formattedRequests = data.map(request => ({
      id: request.id,
      requester_name: `${request.users.first_name} ${request.users.last_name}`,
      vendor_code: request.users.vendor_code,
      reason: request.reason,
      request_date: request.request_date,
      status: request.status
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching contact requests: ' + error.message
    });
  }
});

// HR issues endpoint - fetch user issues
app.get('/api/hr/issues', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch user issues from Supabase
    const { data, error } = await supabase
      .from('user_issues')
      .select(`
        id,
        user_id,
        issue,
        description,
        reported_date,
        status,
        users (first_name, last_name, vendor_code)
      `)
      .order('reported_date', { ascending: false });

    if (error) {
      console.error('Error fetching user issues:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching user issues: ' + error.message
      });
    }

    // Transform data to match frontend expectations
    const formattedIssues = data.map(issue => ({
      id: issue.id,
      user_name: `${issue.users.first_name} ${issue.users.last_name}`,
      vendor_code: issue.users.vendor_code,
      issue: issue.issue,
      description: issue.description,
      reported_date: issue.reported_date,
      status: issue.status
    }));

    res.json(formattedIssues);
  } catch (error) {
    console.error('Error fetching user issues:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching user issues: ' + error.message
    });
  }
});

// HR approve document endpoint
app.post('/api/hr/documents/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { documentId } = req.body;

    // Update document status to approved
    const { data, error } = await supabase
      .from('documents')
      .update({ status: 'approved' })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Error approving document:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error approving document: ' + error.message
      });
    }

    res.json({ success: true, message: 'Document approved successfully' });
  } catch (error) {
    console.error('Error approving document:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error approving document: ' + error.message
    });
  }
});

// HR approve contact request endpoint
app.post('/api/hr/contacts/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { requestId } = req.body;

    // Update contact request status to approved
    const { data, error } = await supabase
      .from('contact_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error('Error approving contact request:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error approving contact request: ' + error.message
      });
    }

    res.json({ success: true, message: 'Contact request approved successfully' });
  } catch (error) {
    console.error('Error approving contact request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error approving contact request: ' + error.message
    });
  }
});

// HR resolve user issue endpoint
app.post('/api/hr/issues/resolve', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { issueId } = req.body;

    // Update user issue status to resolved
    const { data, error } = await supabase
      .from('user_issues')
      .update({ status: 'resolved' })
      .eq('id', issueId)
      .select();

    if (error) {
      console.error('Error resolving user issue:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error resolving user issue: ' + error.message
      });
    }

    res.json({ success: true, message: 'User issue resolved successfully' });
  } catch (error) {
    console.error('Error resolving user issue:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error resolving user issue: ' + error.message
    });
  }
});

// Public contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

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

    // Store contact form submission in database
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .insert([
        {
          name,
          phone: phone || '', // Store empty string instead of null if phone is not provided
          email,
          subject: subject || 'Contact Form Submission',
          message,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Error storing contact form submission:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error storing contact form submission: ' + error.message
      });
    }

    res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error processing contact form submission: ' + error.message
    });
  }
});

// HR endpoint to fetch contact form submissions
app.get('/api/hr/contact-form-submissions', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch contact form submissions from Supabase
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact form submissions:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching contact form submissions: ' + error.message
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching contact form submissions:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching contact form submissions: ' + error.message
    });
  }
});

// HR endpoint to update contact form submission status
app.put('/api/hr/contact-form-submissions/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'reviewed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "pending" or "reviewed"'
      });
    }

    // Update contact form submission status
    const { data, error } = await supabase
      .from('contact_form_submissions')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating contact form submission:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error updating contact form submission: ' + error.message
      });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact form submission not found'
      });
    }

    res.json({ success: true, message: 'Contact form submission updated successfully', data: data[0] });
  } catch (error) {
    console.error('Error updating contact form submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error updating contact form submission: ' + error.message
    });
  }
});

// HR update user details endpoint
app.put('/api/hr/users/update', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { userId, first_name, last_name, email, phone, vendor_code, is_active, is_verified, role } = req.body;

    // Start a Supabase transaction
    const updates = {
      first_name,
      last_name,
      email,
      phone,
      vendor_code,
      is_active,
      is_verified
    };

    // Update user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (userError) {
      console.error('Error updating user:', userError);
      return res.status(500).json({
        success: false,
        error: 'Server error updating user: ' + userError.message
      });
    }

    // If role is provided and different from current role, update user role
    if (role) {
      // First, get the user's current role
      const { data: currentUserRoleData, error: currentUserRoleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(code)')
        .eq('user_id', userId)
        .single();

      if (currentUserRoleError) {
        console.error('Error fetching current user role:', currentUserRoleError);
        // Continue without role update if we can't fetch current role
      } else {
        // Get the new role ID
        const { data: newRoleData, error: newRoleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', role)
          .single();

        if (newRoleError) {
          console.error('Error fetching new role:', newRoleError);
        } else {
          // Check if the new role is allowed (not restricted)
          const restrictedRoles = ['ADM', 'HR', 'CAPT', 'ACC', 'ARB'];
          if (!restrictedRoles.includes(newRoleData.code)) {
            // Update user role
            const { error: updateRoleError } = await supabase
              .from('user_roles')
              .update({ role_id: newRoleData.id })
              .eq('user_id', userId)
              .eq('role_id', currentUserRoleData.role_id);

            if (updateRoleError) {
              console.error('Error updating user role:', updateRoleError);
            }
          } else {
            console.warn('Attempt to assign restricted role:', role);
          }
        }
      }
    }

    res.json({ success: true, message: 'User details updated successfully', user: userData[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error updating user: ' + error.message
    });
  }
});

// HR get all users endpoint (for user management)
app.get('/api/hr/users', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch all users except admin, hr, captain, accountant, and arbitrator
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        vendor_code,
        is_active,
        is_blocked_temp,
        is_blocked_perm,
        blocked_until,
        created_at,
        ip_address,
        user_roles(role_id, is_primary, roles(name, code))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching users: ' + error.message
      });
    }

    // Filter out admin, hr, captain, accountant, and arbitrator users
    const filteredUsers = data.filter(user => {
      const userRole = user.user_roles?.[0]?.roles?.code?.toUpperCase();
      return !['ADM', 'HR', 'CAPT', 'ACC', 'ARB'].includes(userRole);
    });

    // Transform data to match frontend expectations
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      vendor_code: user.vendor_code,
      role: user.user_roles?.[0]?.roles?.name || 'Unknown',
      status: user.is_blocked_perm ? 'Permanently Blocked' : 
              user.is_blocked_temp ? 'Temporarily Blocked' : 
              user.is_active ? 'Active' : 'Inactive',
      created_at: user.created_at,
      ip_address: user.ip_address || 'Unknown',
      is_blocked_temp: user.is_blocked_temp,
      is_blocked_perm: user.is_blocked_perm
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching users: ' + error.message
    });
  }
});

// HR get new user registrations endpoint
app.get('/api/hr/new-users', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch new users (users registered in the last 24 hours) except admin, hr, captain, accountant, and arbitrator
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        vendor_code,
        is_active,
        is_blocked_temp,
        is_blocked_perm,
        blocked_until,
        created_at,
        user_roles(role_id, is_primary, roles(name, code))
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching new users:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching new users: ' + error.message
      });
    }

    // Filter out admin, hr, captain, accountant, and arbitrator users
    const filteredUsers = data.filter(user => {
      const userRole = user.user_roles?.[0]?.roles?.code?.toUpperCase();
      return !['ADM', 'HR', 'CAPT', 'ACC', 'ARB'].includes(userRole);
    });

    // Transform data to match frontend expectations
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      vendor_code: user.vendor_code,
      role: user.user_roles?.[0]?.roles?.name || 'Unknown',
      status: user.is_blocked_perm ? 'Permanently Blocked' : 
              user.is_blocked_temp ? 'Temporarily Blocked' : 
              user.is_active ? 'Active' : 'Pending',
      created_at: user.created_at,
      is_blocked_temp: user.is_blocked_temp,
      is_blocked_perm: user.is_blocked_perm
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching new users:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching new users: ' + error.message
    });
  }
});

// HR approve new user endpoint
app.post('/api/hr/new-users/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

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

// HR block user temporarily
app.post('/api/hr/users/block-temp', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { userId, reason, duration } = req.body;

    // Update user to be temporarily blocked
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_blocked_temp: true,
        blocked_until: new Date(Date.now() + duration * 24 * 60 * 60 * 1000) // duration in days
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error blocking user temporarily:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error blocking user: ' + error.message
      });
    }

    // Log the action
    await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_by: req.user.id,
        action: 'TEMP_BLOCK',
        reason: reason,
        details: `Blocked for ${duration} days`
      });

    res.json({ success: true, message: 'User blocked temporarily successfully' });
  } catch (error) {
    console.error('Error blocking user temporarily:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error blocking user: ' + error.message
    });
  }
});

// HR block user permanently
app.post('/api/hr/users/block-perm', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { userId, reason } = req.body;

    // Update user to be permanently blocked
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_blocked_perm: true,
        is_active: false
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error blocking user permanently:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error blocking user: ' + error.message
      });
    }

    // Log the action
    await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_by: req.user.id,
        action: 'PERM_BLOCK',
        reason: reason,
        details: 'Blocked permanently'
      });

    // Log the action
    await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_by: req.user.id,
        action: 'PERM_BLOCK',
        reason: reason,
        details: 'Blocked permanently'
      });

    res.json({ success: true, message: 'User blocked permanently successfully' });
  } catch (error) {
    console.error('Error blocking user permanently:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error blocking user: ' + error.message
    });
  }
});

// HR unblock user
app.post('/api/hr/users/unblock', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    const { userId, reason } = req.body;

    // Update user to be unblocked
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_blocked_temp: false,
        is_blocked_perm: false,
        is_active: true,
        blocked_until: null
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error unblocking user:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error unblocking user: ' + error.message
      });
    }

    // Log the action
    await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_by: req.user.id,
        action: 'UNBLOCK',
        reason: reason
      });

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error unblocking user: ' + error.message
    });
  }
});

// HR get all roles endpoint (for user management)
app.get('/api/hr/roles', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch all roles except admin, hr, captain, accountant, and arbitrator
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching roles: ' + error.message
      });
    }

    // Filter out restricted roles
    const filteredRoles = data.filter(role => 
      !['ADM', 'HR', 'CAPT', 'ACC', 'ARB'].includes(role.code)
    );

    res.json(filteredRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching roles: ' + error.message
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
app.post('/api/captain/products/reject', async (req, res) => {
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
app.post('/api/captain/roles', authenticateToken, async (req, res) => {
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
app.delete('/api/captain/roles/:id', authenticateToken, async (req, res) => {
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
app.get('/api/captain/users', authenticateToken, async (req, res) => {
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
app.get('/api/captain/users/:id', authenticateToken, async (req, res) => {
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
app.get('/api/captain/roles/:id/users', authenticateToken, async (req, res) => {
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
app.post('/api/captain/users/assign-role', authenticateToken, async (req, res) => {
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

// Captain fetch users by role endpoint
app.get('/api/captain/roles/:id/users', authenticateToken, async (req, res) => {
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

// Create RFQ endpoint for buyers
app.post('/api/buyer/rfqs', authenticateToken, async (req, res) => {
  try {
    console.log('Received RFQ request body:', req.body);
    console.log('Request body types:', {
      product_id: typeof req.body.product_id,
      product_id_value: req.body.product_id,
      title: typeof req.body.title,
      quantity: typeof req.body.quantity
    });
    const {
      product_id,
      title,
      description,
      quantity,
      budget_range_min,
      budget_range_max,
      response_deadline,
      currency_id
    } = req.body;
    
    // Validate required fields
    console.log('Validating required fields:', { product_id, title, quantity });
    console.log('Field types:', { 
      product_id_type: typeof product_id, 
      title_type: typeof title, 
      quantity_type: typeof quantity 
    });
    
    // More robust validation
    const hasValidProductId = product_id !== undefined && product_id !== null && product_id !== '' && !isNaN(parseInt(product_id)) && parseInt(product_id) > 0;
    const hasValidTitle = title !== undefined && title !== null && title.toString().trim() !== '';
    const hasValidQuantity = quantity !== undefined && quantity !== null && 
                            quantity.toString().trim() !== '' && !isNaN(parseInt(quantity)) && 
                            parseInt(quantity) > 0;
    
    console.log('Validation results:', { hasValidProductId, hasValidTitle, hasValidQuantity });
    
    if (!hasValidProductId || !hasValidTitle || !hasValidQuantity) {
      console.log('Validation failed:', { 
        product_id_valid: hasValidProductId, 
        title_valid: hasValidTitle, 
        quantity_valid: hasValidQuantity,
        product_id_value: product_id,
        title_value: title,
        quantity_value: quantity
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID, title, and quantity are required' 
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
    
    // Verify that the product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', parseInt(product_id))
      .single();
    
    if (productError || !product) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }
    
    // Save the RFQ to the database with correct column names
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .insert({
        buyer_id: req.user.id,
        product_id: parseInt(product_id),
        title: title,
        description: description || '',
        quantity: parseInt(quantity),
        budget_range_min: budget_range_min ? parseFloat(budget_range_min) : null,
        budget_range_max: budget_range_max ? parseFloat(budget_range_max) : null,
        response_deadline: response_deadline || null,
        currency_id: currency_id || 1,
        status: 'open',
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating RFQ in Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error creating RFQ: ' + error.message 
      });
    }
    // Send notification to the seller
    if (product.seller_id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: product.seller_id,
            title: 'New RFQ Received',
            message: `You have received a new Request for Quotation for "${title}".`,
            is_read: false,
            created_at: new Date()
          });
        
        if (notificationError) {
          console.error('Error sending notification to seller:', notificationError.message);
        } else {
          console.log('Notification sent to seller for new RFQ');
        }
      } catch (notificationErr) {
        console.error('Error sending notification to seller:', notificationErr.message);
      }
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

// Duplicate endpoint - commented out to avoid conflicts
// app.put('/api/buyer/rfqs/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       product_id,
//       title,
//       description,
//       quantity,
//       budget_range_min,
//       budget_range_max,
//       response_deadline,
//       currency_id
//     } = req.body;
//     
//     // Validate required fields
//     const hasValidProductId = product_id !== undefined && product_id !== null && product_id !== '' && !isNaN(parseInt(product_id)) && parseInt(product_id) > 0;
//     const hasValidTitle = title !== undefined && title !== null && title.toString().trim() !== '';
//     const hasValidQuantity = quantity !== undefined && quantity !== null && 
//                             quantity.toString().trim() !== '' && !isNaN(parseInt(quantity)) && 
//                             parseInt(quantity) > 0;
//     
//     if (!hasValidProductId || !hasValidTitle || !hasValidQuantity) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Product ID, title, and quantity are required' 
//       });
//     }
//     
//     // Always use Supabase - no mock data fallback
//     if (!supabase) {
//       console.error('Supabase not initialized');
//       return res.status(500).json({ 
//         success: false,
//         error: 'Database not available' 
//       });
//     }
//     
//     // Verify that the RFQ exists and belongs to the buyer
//     const { data: existingRFQ, error: rfqError } = await supabase
//       .from('rfqs')
//       .select('id, buyer_id, status')
//       .eq('id', id)
//       .eq('buyer_id', req.user.id)
//       .single();
//     
//     console.log('Looking for RFQ with ID:', id);
//     console.log('Current user ID:', req.user.id);
//     console.log('Existing RFQ query result:', existingRFQ);
//     console.log('Existing RFQ query error:', rfqError);
//     
//     if (rfqError || !existingRFQ) {
//       console.log('RFQ not found or permission denied');
//       return res.status(404).json({ 
//         success: false,
//         error: 'RFQ not found or you do not have permission to update it' 
//       });
//     }
//     
//     console.log('Found existing RFQ with status:', existingRFQ.status);
//     
//     // Determine the new status - if the RFQ was in a responded state, set it to resubmitted
//     const respondedStatuses = ['negotiation_requested', 'doq_provided', 'responded', 'accepted', 'rejected'];
//     const newStatus = respondedStatuses.includes(existingRFQ.status?.toLowerCase()) ? 'resubmitted' : existingRFQ.status;
//     
//     console.log('Responded statuses:', respondedStatuses);
//     console.log('Existing RFQ status (lowercase):', existingRFQ.status?.toLowerCase());
//     console.log('Will set new status to:', newStatus);
// 
//     // Update the RFQ in the database
//     const updateData = {
//       product_id: parseInt(product_id),
//       title: title,
//       description: description || '',
//       quantity: parseInt(quantity),
//       budget_range_min: budget_range_min ? parseFloat(budget_range_min) : null,
//       budget_range_max: budget_range_max ? parseFloat(budget_range_max) : null,
//       response_deadline: response_deadline || null,
//       currency_id: currency_id || 1,
//       status: newStatus,
//       updated_at: new Date()
//     };
//     
//     console.log('Update data being sent to database:', updateData);
//     
//     const { data: rfq, error } = await supabase
//       .from('rfqs')
//       .update(updateData)
//       .eq('id', id)
//       .select()
//       .single();
// 
//     if (error) {
//       console.error('Error updating RFQ in Supabase:', error.message);
//       console.error('Error details:', error);
//       return res.status(500).json({ 
//         success: false,
//         error: 'Server error updating RFQ: ' + error.message 
//       });
//     }
// 
//     console.log('Successfully updated RFQ in Supabase');
//     console.log('Returned RFQ data:', rfq);
//     res.json({ 
//       success: true, 
//       message: 'RFQ updated successfully',
//       rfq
//     });
//   } catch (error) {
//     console.error('Error in update RFQ endpoint:', error.message);
//     res.status(500).json({ 
//       success: false,
//       error: 'Server error updating RFQ: ' + error.message 
//     });
//   }
// });

// Buyer RFQs endpoint - fetch buyer's RFQs
app.get('/api/buyer/rfqs', authenticateToken, async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch RFQs from Supabase with related data
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        buyer_id,
        product_id,
        title,
        description,
        quantity,
        budget_range_min,
        budget_range_max,
        response_deadline,
        status,
        created_at,
        updated_at,
        products (name),
        dpqs (id, status, unit_price, currency_id, currencies (code))
      `)
      .eq('buyer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer RFQs from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching buyer RFQs: ' + error.message 
      });
    }

    // Format RFQs data
    const formattedRFQs = rfqs.map(rfq => {
      // Find the latest quotation if any
      let latestQuotation = null;
      if (rfq.dpqs && rfq.dpqs.length > 0) {
        // Sort by created_at to get the latest
        const sorted = rfq.dpqs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        latestQuotation = sorted[0];
      }
      
      return {
        id: rfq.id,
        productId: rfq.product_id,
        product: rfq.products?.name || 'Unknown Product',
        title: rfq.title,
        description: rfq.description,
        quantity: rfq.quantity,
        budgetRangeMin: rfq.budget_range_min,
        budgetRangeMax: rfq.budget_range_max,
        responseDeadline: rfq.response_deadline,
        status: rfq.status,
        createdAt: rfq.created_at,
        updatedAt: rfq.updated_at,
        latestQuotation: latestQuotation ? {
          id: latestQuotation.id,
          status: latestQuotation.status,
          unitPrice: latestQuotation.unit_price,
          currency: latestQuotation.currencies?.code || 'USD'
        } : null
      };
    });

    console.log(`Successfully fetched ${formattedRFQs.length} buyer RFQs from Supabase`);
    res.json(formattedRFQs || []);
  } catch (error) {
    console.error('Error in buyer RFQs endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching buyer RFQs: ' + error.message 
    });
  }
});

// Buyer RFQ details endpoint - fetch detailed RFQ information including all notifications
app.get('/api/buyer/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch RFQ details from Supabase with related data
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        buyer_id,
        product_id,
        title,
        description,
        quantity,
        budget_range_min,
        budget_range_max,
        response_deadline,
        status,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('buyer_id', buyerId) // Ensure buyer can only access their own RFQs
      .single();

    if (error) {
      console.error('Error fetching RFQ details from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching RFQ details: ' + error.message 
      });
    }

    if (!rfq) {
      return res.status(404).json({ 
        success: false, 
        error: 'RFQ not found or you do not have permission to access it' 
      });
    }

    // Fetch ALL notifications related to this RFQ (both to buyer and from captain)
    const { data: notifications, notificationError } = await supabase
      .from('notifications')
      .select('id, title, message, created_at, user_id')
      .eq('related_entity_type', 'rfq')
      .eq('related_entity_id', id)
      .order('created_at', { ascending: false });

    if (notificationError) {
      console.error('Error fetching notifications:', notificationError.message);
      // Don't fail the request if notifications can't be fetched, just log it
    }

    // Format RFQ details data
    const formattedRFQ = {
      id: rfq.id,
      buyerId: rfq.buyer_id,
      productId: rfq.product_id,
      product: rfq.title, // Use title instead of product name
      title: rfq.title,
      description: rfq.description,
      quantity: rfq.quantity,
      budgetRangeMin: rfq.budget_range_min,
      budgetRangeMax: rfq.budget_range_max,
      responseDeadline: rfq.response_deadline,
      status: rfq.status,
      createdAt: rfq.created_at,
      updatedAt: rfq.updated_at,
      notifications: notifications || []
    };

    console.log('Successfully fetched details for RFQ ' + rfq.id + ' from Supabase');
    res.json(formattedRFQ);
  } catch (error) {
    console.error('Error in buyer RFQ details endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching RFQ details: ' + error.message 
    });
  }
});

// Captain RFQ details endpoint - fetch detailed RFQ information including notifications
app.get('/api/captain/rfqs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch RFQ details from Supabase with related data
    const { data: rfq, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        buyer_id,
        product_id,
        title,
        description,
        quantity,
        budget_range_min,
        budget_range_max,
        response_deadline,
        status,
        created_at,
        updated_at,
        products (
          id,
          name,
          seller_id,
          description,
          price,
          currency_id,
          moq,
          moq_uom,
          available_quantity,
          quantity_uom,
          price_type,
          is_relabeling_allowed,
          offer_validity_date,
          status,
          category_id,
          categories (name),
          currencies (code),
          users (
            id,
            first_name,
            last_name,
            vendor_code,
            email,
            phone
          )
        ),
        users (
          id,
          first_name,
          last_name,
          vendor_code,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching RFQ details from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching RFQ details: ' + error.message 
      });
    }

    if (!rfq) {
      return res.status(404).json({ 
        success: false, 
        error: 'RFQ not found' 
      });
    }

    // Fetch ALL notifications related to this RFQ
    const { data: notifications, notificationError } = await supabase
      .from('notifications')
      .select('id, title, message, created_at, user_id')
      .eq('related_entity_type', 'rfq')
      .eq('related_entity_id', id)
      .order('created_at', { ascending: false });

    if (notificationError) {
      console.error('Error fetching notifications:', notificationError.message);
      // Don't fail the request if notifications can't be fetched, just log it
    }

    // Format RFQ details data
    const formattedRFQ = {
      id: rfq.id,
      buyerId: rfq.buyer_id,
      productId: rfq.product_id,
      product: rfq.products?.name || 'Unknown Product',
      buyer: {
        vendorCode: rfq.users?.vendor_code || 'Unknown Buyer',
        firstName: rfq.users?.first_name || '',
        lastName: rfq.users?.last_name || '',
        email: rfq.users?.email || '',
        phone: rfq.users?.phone || ''
      },
      title: rfq.title,
      description: rfq.description,
      quantity: rfq.quantity,
      budgetRangeMin: rfq.budget_range_min,
      budgetRangeMax: rfq.budget_range_max,
      responseDeadline: rfq.response_deadline,
      status: rfq.status,
      createdAt: rfq.created_at,
      updatedAt: rfq.updated_at,
      notifications: notifications || [],
      productDetails: rfq.products ? {
        id: rfq.products.id,
        name: rfq.products.name,
        description: rfq.products.description,
        price: rfq.products.price,
        currency: rfq.products.currencies?.code || 'USD',
        moq: rfq.products.moq,
        moqUom: rfq.products.moq_uom,
        availableQuantity: rfq.products.available_quantity,
        quantityUom: rfq.products.quantity_uom,
        priceType: rfq.products.price_type,
        isRelabelingAllowed: rfq.products.is_relabeling_allowed,
        offerValidityDate: rfq.products.offer_validity_date,
        status: rfq.products.status,
        category: rfq.products.categories?.name || 'Unknown Category',
        seller: rfq.products.users ? {
          vendorCode: rfq.products.users.vendor_code || 'Unknown Seller',
          firstName: rfq.products.users.first_name || '',
          lastName: rfq.products.users.last_name || '',
          email: rfq.products.users.email || '',
          phone: rfq.products.users.phone || ''
        } : null
      } : null
    };

    console.log('Successfully fetched details for RFQ ' + rfq.id + ' from Supabase');
    res.json(formattedRFQ);
  } catch (error) {
    console.error('Error in captain RFQ details endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching RFQ details: ' + error.message 
    });
  }
});

// Captain RFQs endpoint - fetch RFQs for products owned by sellers
app.get('/api/captain/rfqs', authenticateToken, async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch RFQs from Supabase with related data
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        buyer_id,
        product_id,
        title,
        description,
        quantity,
        budget_range_min,
        budget_range_max,
        response_deadline,
        status,
        created_at,
        updated_at,
        products (name, seller_id),
        users (first_name, last_name, vendor_code),
        dpqs (id, status, unit_price, currency_id, currencies (code))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFQs from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching RFQs: ' + error.message 
      });
    }

    // Filter RFQs to only show those for products owned by sellers
    // In a real implementation, we would have a more sophisticated way to determine this
    const filteredRFQs = rfqs.filter(rfq => {
      // For now, we'll show all RFQs to the captain
      return true;
    });

    // Format RFQs data
    const formattedRFQs = filteredRFQs.map(rfq => {
      // Find the latest quotation if any
      let latestQuotation = null;
      if (rfq.dpqs && rfq.dpqs.length > 0) {
        // Sort by created_at to get the latest
        const sorted = rfq.dpqs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        latestQuotation = sorted[0];
      }
      
      return {
        id: rfq.id,
        buyerId: rfq.buyer_id,
        productId: rfq.product_id,
        product: rfq.products?.name || 'Unknown Product',
        buyer: rfq.users?.vendor_code || 'Unknown Buyer',
        title: rfq.title,
        description: rfq.description,
        quantity: rfq.quantity,
        budgetRangeMin: rfq.budget_range_min,
        budgetRangeMax: rfq.budget_range_max,
        responseDeadline: rfq.response_deadline,
        status: rfq.status,
        createdAt: rfq.created_at,
        updatedAt: rfq.updated_at,
        latestQuotation: latestQuotation ? {
          id: latestQuotation.id,
          status: latestQuotation.status,
          unitPrice: latestQuotation.unit_price,
          currency: latestQuotation.currencies?.code || 'USD'
        } : null
      };
    });

    // Sort RFQs: open RFQs first (open, pending, active), then closed RFQs (closed, fulfilled, completed)
    const sortedRFQs = formattedRFQs.sort((a, b) => {
      const openStatuses = ['open', 'pending', 'active'];
      const isAOpen = openStatuses.includes(a.status?.toLowerCase());
      const isBOpen = openStatuses.includes(b.status?.toLowerCase());
      
      // If one is open and the other is closed, open comes first
      if (isAOpen && !isBOpen) return -1;
      if (!isAOpen && isBOpen) return 1;
      
      // If both are open or both are closed, sort by created date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    console.log(`Successfully fetched ${sortedRFQs.length} RFQs from Supabase`);
    res.json(sortedRFQs || []);
  } catch (error) {
    console.error('Error in captain RFQs endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching RFQs: ' + error.message 
    });
  }
});

// Captain RFQ response endpoint - respond to buyer RFQs
app.post('/api/captain/rfqs/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { response, action } = req.body; // action can be 'negotiate', 'doq', 'accept', 'reject'
    const captainId = req.user.id;
    
    // Validate required fields
    if (!id || !response || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'RFQ ID, response, and action are required' 
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
    
    // Fetch the RFQ to get buyer information
    const { data: rfq, error: rfqError } = await supabase
      .from('rfqs')
      .select('buyer_id, title, status')
      .eq('id', id)
      .single();
    
    if (rfqError) {
      console.error('Error fetching RFQ:', rfqError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching RFQ: ' + rfqError.message 
      });
    }
    
    if (!rfq) {
      return res.status(404).json({ 
        success: false, 
        error: 'RFQ not found' 
      });
    }
    
    // Update RFQ status based on captain's action
    let newStatus = rfq.status;
    switch (action) {
      case 'negotiate':
        newStatus = 'negotiation_requested';
        break;
      case 'doq':
        newStatus = 'doq_provided';
        break;
      case 'accept':
        newStatus = 'accepted';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      default:
        newStatus = 'responded';
    }
    
    // Update RFQ status in the database
    const { error: updateError } = await supabase
      .from('rfqs')
      .update({ 
        status: newStatus,
        updated_at: new Date()
      })
      .eq('id', id);
    
    if (updateError) {
      console.error('Error updating RFQ status:', updateError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error updating RFQ status: ' + updateError.message 
      });
    }
    
    // Create notification for the buyer
    let notificationTitle = '';
    let notificationMessage = '';
    
    switch (action) {
      case 'negotiate':
        notificationTitle = 'RFQ Negotiation Requested';
        notificationMessage = `Captain has requested negotiation for your RFQ "${rfq.title}": ${response}`;
        break;
      case 'doq':
        notificationTitle = 'Document of Quotation Provided';
        notificationMessage = `Captain has provided a Document of Quotation for your RFQ "${rfq.title}": ${response}`;
        break;
      case 'accept':
        notificationTitle = 'RFQ Accepted';
        notificationMessage = `Captain has accepted your RFQ "${rfq.title}": ${response}`;
        break;
      case 'reject':
        notificationTitle = 'RFQ Rejected';
        notificationMessage = `Captain has rejected your RFQ "${rfq.title}": ${response}`;
        break;
      default:
        notificationTitle = 'RFQ Response';
        notificationMessage = `Captain has responded to your RFQ "${rfq.title}": ${response}`;
    }
    
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: rfq.buyer_id,
        title: notificationTitle,
        message: notificationMessage,
        related_entity_type: 'rfq',
        related_entity_id: id
      })
      .select()
      .single();
    
    if (notificationError) {
      console.error('Error creating notification:', notificationError.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error creating notification: ' + notificationError.message 
      });
    }
    
    console.log('Successfully created notification for RFQ response');
    res.json({ 
      success: true, 
      message: 'RFQ response submitted successfully',
      notification,
      rfq: {
        id: id,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error in captain RFQ response endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error responding to RFQ: ' + error.message 
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

// Buyer notifications endpoint - fetch buyer's notifications
app.get('/api/buyer/notifications', authenticateToken, async (req, res) => {
  try {
    // Always fetch from Supabase - no mock data fallback
    console.log('Fetching buyer notifications from Supabase');
    
    // Get the buyer ID from the authenticated user
    const buyerId = req.user.id;
    
    // Fetch notifications from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .eq('user_id', buyerId)
      .order('created_at', { ascending: false })
      .limit(10); // Limit to last 10 notifications

    if (error) {
      console.error('Error fetching buyer notifications from Supabase:', error.message);
      console.error('Error details:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching notifications: ' + error.message 
      });
    }

    console.log(`Successfully fetched ${notifications.length} notifications from Supabase`);
    res.json(notifications || []);
  } catch (error) {
    console.error('Error in buyer notifications endpoint:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching notifications: ' + error.message 
    });
  }
});

// Mark notification as read endpoint
app.put('/api/buyer/notifications/:id/read', authenticateToken, async (req, res) => {
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

// Captain roles endpoint - fetch all roles with user counts
app.get('/api/captain/roles', authenticateToken, async (req, res) => {
  try {
    // Always use Supabase - no mock data fallback
    if (!supabase) {
      console.error('Supabase not initialized');
      return res.status(500).json({ 
        success: false,
        error: 'Database not available' 
      });
    }

    // Fetch all roles with user counts
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        id,
        name,
        code,
        description,
        is_active,
        created_at,
        user_roles (
          id
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching roles from Supabase:', error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Server error fetching roles: ' + error.message 
      });
    }

    // Format roles data with user counts
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isActive: role.is_active,
      userCount: role.user_roles ? role.user_roles.length : 0,
      createdAt: role.created_at
    }));

    console.log(`Successfully fetched ${formattedRoles.length} roles from Supabase`);
    res.json(formattedRoles || []);
  } catch (error) {
    console.error('Error in captain roles endpoint:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching roles: ' + error.message 
    });
  }
});

// Mark all notifications as read endpoint
app.put('/api/buyer/notifications/read-all', authenticateToken, async (req, res) => {
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

// Mark notification as read endpoint for seller
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

// Mark all notifications as read endpoint for seller
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

// HR get new user registrations endpoint
app.get('/api/hr/new-users', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

    // Fetch new users (users registered in the last 24 hours) except admin, hr, captain, accountant, and arbitrator
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        vendor_code,
        is_active,
        is_blocked_temp,
        is_blocked_perm,
        blocked_until,
        created_at,
        ip_address,
        user_roles(role_id, is_primary, roles(name, code))
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching new users:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error fetching new users: ' + error.message
      });
    }

    // Filter out admin, hr, captain, accountant, and arbitrator users
    const filteredUsers = data.filter(user => {
      const userRole = user.user_roles?.[0]?.roles?.code?.toUpperCase();
      return !['ADM', 'HR', 'CAPT', 'ACC', 'ARB'].includes(userRole);
    });

    // Transform data to match frontend expectations
    const formattedUsers = filteredUsers.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone,
      vendor_code: user.vendor_code,
      role: user.user_roles?.[0]?.roles?.name || 'Unknown',
      status: user.is_blocked_perm ? 'Permanently Blocked' : 
              user.is_blocked_temp ? 'Temporarily Blocked' : 
              user.is_active ? 'Active' : 'Pending',
      created_at: user.created_at,
      ip_address: user.ip_address || 'Unknown',
      is_blocked_temp: user.is_blocked_temp,
      is_blocked_perm: user.is_blocked_perm
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching new users:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching new users: ' + error.message
    });
  }
});

// HR approve new user endpoint
app.post('/api/hr/new-users/approve', authenticateToken, async (req, res) => {
  try {
    // Check if user has HR role
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. HR role required.'
      });
    }

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

// Chatbot endpoint
const chatbotRouter = require('./chatbot');
app.use('/api/chatbot', chatbotRouter);

// Serve static files from the React app build directory
// This must come before the catch-all route
const staticPath = path.join(__dirname, '../client/build');
console.log('Serving static files from:', staticPath);

// Enhanced static file serving with better error handling and cache control
app.use('/static', express.static(path.join(staticPath, 'static'), {
  maxAge: '1h', // Shorter cache time to avoid caching issues
  etag: true,
  setHeaders: (res, path) => {
    console.log('Serving static file:', path);
    // Ensure proper content types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Add cache control headers to prevent aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
}));

// Serve other static assets (root level files like favicon.ico, manifest.json, etc.)
app.use(express.static(staticPath, {
  maxAge: '1h', // Shorter cache time to avoid caching issues
  etag: true,
  setHeaders: (res, path) => {
    // Add cache control headers to prevent aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    
    // For index.html, we want to prevent caching so users always get the latest version
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Add a specific route to handle static file requests with better logging
app.get('/static/*', (req, res) => {
  console.log('Static file request:', req.path);
  // Let express.static handle the request
  express.static(path.join(staticPath, 'static'))(req, res, () => {
    console.log('Static file not found:', req.path);
    res.status(404).send('File not found');
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
// This MUST be the last route to avoid interfering with API routes or static files
app.get('*', (req, res) => {
  console.log('Catch-all route hit for:', req.path);
  
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    console.log('API route not found:', req.path);
    return res.status(404).send('API route not found');
  }
  
  // Don't serve index.html for static assets - they should be handled above
  if (req.path.startsWith('/static/')) {
    console.log('Static asset request (should be handled by middleware):', req.path);
    // Let the static middleware handle it
    return express.static(staticPath)(req, res, () => {
      console.log('Static asset not found:', req.path);
      res.status(404).send('Static asset not found');
    });
  }
  
  // For all other routes, serve the React app
  // This allows client-side routing to work properly
  console.log('Serving index.html for route:', req.path);
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
