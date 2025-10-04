require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

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
    
    // If Supabase is not available, return mock success
    if (!supabase) {
      console.log('Supabase not available, returning mock success');
      const vendorCode = generateVendorCode(workClass, 'mock-user-id');
      return res.json({ 
        success: true, 
        message: 'Registration successful (mock mode)',
        vendorCode,
        requiresEmailConfirmation: false
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
    
    // Assign role to user
    console.log('Assigning role to user');
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        is_primary: true
      });
    
    if (userRoleError) {
      console.error('Error assigning role to user:', userRoleError.message);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error assigning role' 
      });
    }
    
    console.log('User registration completed successfully');
    res.json({ 
      success: true, 
      message: 'Registration successful',
      vendorCode: userData.vendor_code,
      requiresEmailConfirmation: true
    });
  } catch (error) {
    console.error('Unexpected error during registration:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { vendorCode, password } = req.body;
    
    // Validate required fields
    if (!vendorCode || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vendor Code/Email and Password are required' 
      });
    }
    
    // If Supabase is not available, return mock success for testing
    if (!supabase) {
      console.log('Supabase not available, returning mock login success');
      return res.json({ 
        success: true,
        message: 'Login successful (mock mode)',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          vendor_code: 'TEST-23-ABC123',
          role: 'buyer'
        },
        token: 'mock-jwt-token'
      });
    }
    
    // Determine if the input is an email or vendor code
    let userQuery;
    if (vendorCode.includes('@')) {
      // It's an email
      userQuery = supabase
        .from('users')
        .select('id, username, email, first_name, last_name, vendor_code, password_hash')
        .eq('email', vendorCode)
        .single();
    } else {
      // It's a vendor code
      userQuery = supabase
        .from('users')
        .select('id, username, email, first_name, last_name, vendor_code, password_hash')
        .eq('vendor_code', vendorCode)
        .single();
    }
    
    // Fetch user from database
    const { data: user, error: userError } = await userQuery;
    
    if (userError || !user) {
      console.log('User not found with input:', vendorCode);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Vendor Code/Email or Password' 
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', vendorCode);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Vendor Code/Email or Password' 
      });
    }
    
    // Fetch user role with join to roles table
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles (code, name)
      `)
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();
    
    if (roleError) {
      console.error('Error fetching user role:', roleError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error fetching user role' 
      });
    }
    
    // Map role code to the expected format for the frontend
    const roleMap = {
      'SELL': 'seller',
      'BUY': 'buyer',
      'CAPT': 'captain',
      'ADM': 'admin',
      'HR': 'hr',
      'ACC': 'accountant',
      'ARB': 'arbitrator',
      'SUR': 'surveyor',
      'INS': 'insurance',
      'TRN': 'transporter',
      'LOG': 'logistics',
      'CHA': 'cha'
    };
    
    const frontendRole = roleMap[userRole.roles.code] || 'buyer';
    
    console.log('User login successful for:', vendorCode);
    
    // Return successful login response
    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        vendor_code: user.vendor_code,
        role: frontendRole
      },
      token: 'jwt-token-placeholder' // In a real app, this would be a real JWT token
    });
  } catch (error) {
    console.error('Unexpected error during login:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Catalogs endpoint - fetch featured products
app.get('/api/catalogs', async (req, res) => {
  try {
    // If Supabase is not available, return mock data
    if (!supabase) {
      console.log('Supabase not available, returning mock catalogs');
      return res.json([
        {
          id: 1,
          title: 'Premium Electronics Components',
          description: 'High-quality electronic components for industrial use',
          image: '/placeholder.jpg',
          status: 'approved',
          likes: 24
        },
        {
          id: 2,
          title: 'Advanced Manufacturing Equipment',
          description: 'Precision machinery for modern manufacturing processes',
          image: '/placeholder2.jpg',
          status: 'approved',
          likes: 18
        },
        {
          id: 3,
          title: 'Organic Textile Materials',
          description: 'Sustainable and eco-friendly textile products',
          image: '/placeholder3.jpg',
          status: 'approved',
          likes: 32
        }
      ]);
    }

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
        users (first_name, last_name)
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .limit(6);

    if (error) {
      console.error('Error fetching products:', error.message);
      // Return mock data if there's an error
      return res.json([
        {
          id: 1,
          title: 'Premium Electronics Components',
          description: 'High-quality electronic components for industrial use',
          image: '/placeholder.jpg',
          status: 'approved',
          likes: 24
        },
        {
          id: 2,
          title: 'Advanced Manufacturing Equipment',
          description: 'Precision machinery for modern manufacturing processes',
          image: '/placeholder2.jpg',
          status: 'approved',
          likes: 18
        },
        {
          id: 3,
          title: 'Organic Textile Materials',
          description: 'Sustainable and eco-friendly textile products',
          image: '/placeholder3.jpg',
          status: 'approved',
          likes: 32
        }
      ]);
    }

    // Transform the data to match the expected format
    const catalogs = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      image: product.image_url || '/placeholder.jpg',
      status: product.is_verified ? 'approved' : 'pending',
      likes: Math.floor(Math.random() * 50) + 1, // Random likes for demo
      seller: product.users ? `${product.users.first_name} ${product.users.last_name}` : 'Unknown Seller'
    }));

    res.json(catalogs);
  } catch (error) {
    console.error('Error in catalogs endpoint:', error.message);
    // Return mock data if there's an error
    res.json([
      {
        id: 1,
        title: 'Premium Electronics Components',
        description: 'High-quality electronic components for industrial use',
        image: '/placeholder.jpg',
        status: 'approved',
        likes: 24
      },
      {
        id: 2,
        title: 'Advanced Manufacturing Equipment',
        description: 'Precision machinery for modern manufacturing processes',
        image: '/placeholder2.jpg',
        status: 'approved',
        likes: 18
      },
      {
        id: 3,
        title: 'Organic Textile Materials',
        description: 'Sustainable and eco-friendly textile products',
        image: '/placeholder3.jpg',
        status: 'approved',
        likes: 32
      }
    ]);
  }
});

// Products endpoint - fetch all products
app.get('/api/products', async (req, res) => {
  try {
    // If Supabase is not available, return mock data
    if (!supabase) {
      console.log('Supabase not available, returning mock products');
      const mockProducts = [
        {
          id: 1,
          name: 'Premium Electronics Components',
          description: 'High-quality electronic components for industrial applications with extended durability.',
          short_description: 'Industrial-grade electronic components',
          company_name: 'TechCorp Ltd.',
          origin_port_name: 'Port of Shanghai',
          category_name: 'Electronics',
          is_verified: true,
          price: 5000,
          currency: 'USD'
        },
        {
          id: 2,
          name: 'Advanced Manufacturing Equipment',
          description: 'Precision machinery for modern manufacturing processes with computerized controls.',
          short_description: 'Precision manufacturing machinery',
          company_name: 'MegaMachines Inc.',
          origin_port_name: 'Port of Rotterdam',
          category_name: 'Machinery',
          is_verified: true,
          price: 75000,
          currency: 'USD'
        },
        {
          id: 3,
          name: 'Organic Textile Materials',
          description: 'Sustainable and eco-friendly textile products made from organic materials.',
          short_description: 'Eco-friendly textile materials',
          company_name: 'GreenTextiles Co.',
          origin_port_name: 'Port of Los Angeles',
          category_name: 'Textiles',
          is_verified: false,
          price: 1200,
          currency: 'USD'
        },
        {
          id: 4,
          name: 'Industrial Chemical Solvents',
          description: 'High-grade solvents for industrial processes with purity guarantees.',
          short_description: 'High-purity industrial solvents',
          company_name: 'ChemSolutions Ltd.',
          origin_port_name: 'Port of Singapore',
          category_name: 'Chemicals',
          is_verified: true,
          price: 3500,
          currency: 'USD'
        },
        {
          id: 5,
          name: 'Automotive Engine Parts',
          description: 'High-performance engine components for automotive applications.',
          short_description: 'Performance engine parts',
          company_name: 'AutoTech Motors',
          origin_port_name: 'Port of Hamburg',
          category_name: 'Automotive',
          is_verified: true,
          price: 8500,
          currency: 'USD'
        },
        {
          id: 6,
          name: 'Construction Steel Beams',
          description: 'High-tensile steel beams for construction and infrastructure projects.',
          short_description: 'High-tensile steel beams',
          company_name: 'SteelWorks Inc.',
          origin_port_name: 'Port of Shanghai',
          category_name: 'Construction',
          is_verified: false,
          price: 4200,
          currency: 'USD'
        },
        {
          id: 7,
          name: 'Medical Diagnostic Equipment',
          description: 'Advanced diagnostic equipment for healthcare facilities and hospitals.',
          short_description: 'Medical diagnostic tools',
          company_name: 'MediTech Solutions',
          origin_port_name: 'Port of Los Angeles',
          category_name: 'Healthcare',
          is_verified: true,
          price: 125000,
          currency: 'USD'
        },
        {
          id: 8,
          name: 'Food Processing Machinery',
          description: 'Automated machinery for food processing and packaging applications.',
          short_description: 'Automated food processing equipment',
          company_name: 'FoodMach Industries',
          origin_port_name: 'Port of Rotterdam',
          category_name: 'Machinery',
          is_verified: true,
          price: 45000,
          currency: 'USD'
        }
      ];
      return res.json(mockProducts);
    }

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
        users (first_name, last_name, company_name),
        ports (name)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error.message);
      // Return mock data if there's an error
      return res.json([
        {
          id: 1,
          name: 'Premium Electronics Components',
          description: 'High-quality electronic components for industrial applications with extended durability.',
          short_description: 'Industrial-grade electronic components',
          company_name: 'TechCorp Ltd.',
          origin_port_name: 'Port of Shanghai',
          category_name: 'Electronics',
          is_verified: true,
          price: 5000,
          currency: 'USD'
        },
        {
          id: 2,
          name: 'Advanced Manufacturing Equipment',
          description: 'Precision machinery for modern manufacturing processes with computerized controls.',
          short_description: 'Precision manufacturing machinery',
          company_name: 'MegaMachines Inc.',
          origin_port_name: 'Port of Rotterdam',
          category_name: 'Machinery',
          is_verified: true,
          price: 75000,
          currency: 'USD'
        }
      ]);
    }

    // Transform the data to match the expected format
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.description.substring(0, 100) + (product.description.length > 100 ? '...' : ''),
      company_name: product.users?.company_name || `${product.users?.first_name} ${product.users?.last_name}` || 'Unknown Seller',
      origin_port_name: product.ports?.name || 'Unknown Port',
      category_name: product.categories?.name || 'Uncategorized',
      is_verified: product.is_verified,
      price: product.price,
      currency: 'USD' // In a real app, this would come from the currencies table
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error in products endpoint:', error.message);
    // Return mock data if there's an error
    res.json([
      {
        id: 1,
        name: 'Premium Electronics Components',
        description: 'High-quality electronic components for industrial applications with extended durability.',
        short_description: 'Industrial-grade electronic components',
        company_name: 'TechCorp Ltd.',
        origin_port_name: 'Port of Shanghai',
        category_name: 'Electronics',
        is_verified: true,
        price: 5000,
        currency: 'USD'
      },
      {
        id: 2,
        name: 'Advanced Manufacturing Equipment',
        description: 'Precision machinery for modern manufacturing processes with computerized controls.',
        short_description: 'Precision manufacturing machinery',
        company_name: 'MegaMachines Inc.',
        origin_port_name: 'Port of Rotterdam',
        category_name: 'Machinery',
        is_verified: true,
        price: 75000,
        currency: 'USD'
      }
    ]);
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});