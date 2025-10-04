require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

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

// Helper function to generate vendor codes
const generateVendorCode = (role, userId) => {
  const rolePrefixes = {
    'seller': 'VEND',
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

// Registration endpoint
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
    
    console.log('Creating user in Supabase Auth');
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) {
      console.error('Error creating user in Supabase Auth:', authError.message);
      return res.status(400).json({ 
        success: false, 
        error: authError.message 
      });
    }
    
    // Get the user ID from auth
    const userId = authData.user.id;
    console.log('User created with ID:', userId);
    
    // Generate vendor code
    const vendorCode = generateVendorCode(workClass, userId);
    console.log('Generated vendor code:', vendorCode);
    
    console.log('Creating user profile in users table');
    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: email.split('@')[0],
        email,
        password_hash: '', // Supabase Auth handles password hashing
        first_name: firstName,
        last_name: lastName,
        phone,
        is_verified: false
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
    
    console.log('Getting role ID for workClass:', workClass);
    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', workClass)
      .single();
    
    if (roleError) {
      console.error('Error getting role ID:', roleError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified' 
      });
    }
    
    console.log('Assigning role to user');
    // Assign role to user
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id,
        is_primary: true
      });
    
    if (userRoleError) {
      console.error('Error assigning role to user:', userRoleError.message);
      return res.status(400).json({ 
        success: false, 
        error: userRoleError.message 
      });
    }
    
    console.log('Updating user with vendor code');
    // Update user with vendor code
    const { error: updateError } = await supabase
      .from('users')
      .update({ vendor_code: vendorCode })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user with vendor code:', updateError.message);
      return res.status(400).json({ 
        success: false, 
        error: updateError.message 
      });
    }
    
    console.log('Registration successful for user:', email);
    res.json({ 
      success: true, 
      message: 'Registration successful',
      vendorCode,
      requiresEmailConfirmation: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
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
        error: 'Vendor code and password are required' 
      });
    }
    
    // If Supabase is not available, return mock success for demo vendor codes
    if (!supabase) {
      // Mock user data for demonstration
      const mockUsers = {
        'VEND-23-ABC123': { role: 'seller', name: 'John Seller' },
        'BUY-23-DEF456': { role: 'buyer', name: 'Sarah Buyer' },
        'CAPT-23-GHI789': { role: 'captain', name: 'Captain User' },
        'ADM-23-JKL012': { role: 'admin', name: 'Admin User' },
        'HR-23-MNO345': { role: 'hr', name: 'HR Manager' },
        'ACC-23-PQR678': { role: 'accountant', name: 'Account Manager' },
        'ARB-23-STU901': { role: 'arbitrator', name: 'Arbit Rator' },
        'SUR-23-VWX234': { role: 'surveyor', name: 'Survey Or' },
        'INS-23-YZA567': { role: 'insurance', name: 'Insure Agent' },
        'TRN-23-BCD890': { role: 'transporter', name: 'Trans Porter' },
        'LOG-23-EFG123': { role: 'logistics', name: 'Logi Stics' },
        'CHA-23-HIJ456': { role: 'cha', name: 'Customs Agent' }
      };
      
      const user = mockUsers[vendorCode];
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }
      
      return res.json({ 
        success: true, 
        user: {
          id: 'mock-user-id',
          email: `${vendorCode.toLowerCase()}@marsafyi.com`,
          name: user.name,
          role: user.role,
          vendorCode: vendorCode
        },
        token: 'mock-jwt-token'
      });
    }
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: vendorCode, // For now, we're using vendor code as email
      password
    });
    
    if (authError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role_id,
          roles (
            name
          )
        )
      `)
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      return res.status(400).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Get primary role
    const primaryRole = userData.user_roles[0]?.roles?.name || 'buyer';
    
    res.json({ 
      success: true, 
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        role: primaryRole,
        vendorCode: userData.username
      },
      token: authData.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// API ENDPOINT TO APPROVE PAYMENT
app.post('/api/payments/approve', async (req, res) => {
  try {
    const { paymentId, approvedBy } = req.body;
    
    // Update payment status to 'approved'
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date()
      })
      .eq('id', paymentId)
      .select('*')
      .single();
    
    if (paymentError) {
      return res.status(400).json({ 
        success: false, 
        error: paymentError.message 
      });
    }
    
    // Add entry to seller's payout history
    const { data: payoutData, error: payoutError } = await supabase
      .from('payouts')
      .insert({
        seller_id: paymentData.seller_id,
        payment_id: paymentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'completed',
        processed_at: new Date()
      })
      .select('*')
      .single();
    
    if (payoutError) {
      return res.status(400).json({ 
        success: false, 
        error: payoutError.message 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Payment approved successfully',
      payment: paymentData,
      payout: payoutData
    });
  } catch (error) {
    console.error('Error approving payment:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Server error approving payment' 
    });
  }
});

// API ENDPOINT TO GET SELLER CATALOGS
app.get('/api/seller/catalogs', async (req, res) => {
  try {
    // In a real implementation, you would get the seller ID from the authenticated user
    // For now, we'll fetch all catalogs (in a real app, filter by seller ID)
    const { data: catalogs, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        is_verified,
        status,
        categories (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller catalogs:', error.message);
      return res.status(500).json({ error: 'Server error fetching catalogs' });
    }

    // Format the data for the frontend
    const formattedCatalogs = catalogs.map(catalog => ({
      id: catalog.id,
      title: catalog.name || 'Unknown Product',
      category: catalog.categories?.name || 'Unknown',
      price: catalog.price,
      status: catalog.is_verified ? 'approved' : (catalog.status || 'pending')
    }));

    res.json(formattedCatalogs);
  } catch (error) {
    console.error('Error fetching seller catalogs:', error.message);
    res.status(500).json({ error: 'Server error fetching catalogs' });
  }
});

// API ENDPOINT TO GET SELLER DPOS
app.get('/api/seller/dpos', async (req, res) => {
  try {
    // In a real implementation, you would get the seller ID from the authenticated user
    // For now, we'll fetch all DPOs (in a real app, filter by seller ID)
    const { data: dpos, error } = await supabase
      .from('dpos')
      .select(`
        id,
        quantity,
        total_price,
        status,
        products (
          name
        ),
        users_buyer (username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller DPOs:', error.message);
      return res.status(500).json({ error: 'Server error fetching DPOs' });
    }

    // Format the data for the frontend
    const formattedDpos = dpos.map(dpo => ({
      id: dpo.id,
      productName: dpo.products?.name || 'Unknown Product',
      buyerName: dpo.users_buyer?.username || 'Unknown',
      quantity: dpo.quantity,
      totalPrice: dpo.total_price,
      status: dpo.status || 'pending'
    }));

    res.json(formattedDpos);
  } catch (error) {
    console.error('Error fetching seller DPOs:', error.message);
    res.status(500).json({ error: 'Server error fetching DPOs' });
  }
});

// API ENDPOINT TO GET SELLER PAYMENTS
app.get('/api/seller/payments', async (req, res) => {
  try {
    // In a real implementation, you would get the seller ID from the authenticated user
    // For now, we'll fetch all payments (in a real app, filter by seller ID)
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency_id,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller payments:', error.message);
      return res.status(500).json({ error: 'Server error fetching payments' });
    }

    // Format the data for the frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency_id === 1 ? 'USD' : 'Unknown',
      status: payment.status || 'pending',
      created_at: payment.created_at
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching seller payments:', error.message);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

// API ENDPOINT TO GET SELLER PAYOUTS
app.get('/api/seller/payouts', async (req, res) => {
  try {
    // In a real implementation, you would get the seller ID from the authenticated user
    // For now, we'll fetch all payouts (in a real app, filter by seller ID)
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select(`
        id,
        payment_id,
        amount,
        currency,
        status,
        processed_at
      `)
      .order('processed_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller payouts:', error.message);
      return res.status(500).json({ error: 'Server error fetching payouts' });
    }

    // Format the data for the frontend
    const formattedPayouts = payouts.map(payout => ({
      id: payout.id,
      payment_id: payout.payment_id,
      amount: payout.amount,
      currency: payout.currency || 'USD',
      status: payout.status || 'pending',
      processed_at: payout.processed_at
    }));

    res.json(formattedPayouts);
  } catch (error) {
    console.error('Error fetching seller payouts:', error.message);
    res.status(500).json({ error: 'Server error fetching payouts' });
  }
});

// API ENDPOINT TO GET BUYER RFQS
app.get('/api/buyer/rfqs', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll return mock data
    const rfqs = [
      {
        id: 1,
        productName: 'Premium Electronics Components',
        sellerName: 'VEND-23-ABC123',
        status: 'priced',
        price: '$5200',
        validity: '2025-12-31'
      },
      {
        id: 2,
        productName: 'Industrial Machinery Parts',
        sellerName: 'VEND-23-DEF456',
        status: 'pending',
        price: '-',
        validity: '-'
      }
    ];
    
    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching buyer RFQs:', error.message);
    res.status(500).json({ error: 'Server error fetching RFQs' });
  }
});

// API ENDPOINT TO GET BUYER SURVEYS
app.get('/api/buyer/surveys', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll return mock data
    const surveys = [
      {
        id: 1,
        productName: 'Premium Electronics Components',
        sellerName: 'VEND-23-ABC123',
        status: 'fee_paid',
        fee: '$150'
      },
      {
        id: 2,
        productName: 'Industrial Machinery Parts',
        sellerName: 'VEND-23-DEF456',
        status: 'report_received',
        fee: '$200'
      }
    ];
    
    res.json(surveys);
  } catch (error) {
    console.error('Error fetching buyer surveys:', error.message);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// API ENDPOINT TO GET BUYER ORDERS
app.get('/api/buyer/orders', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll return mock data
    const orders = [
      {
        id: 1,
        productName: 'Organic Textiles',
        sellerName: 'VEND-23-XYZ789',
        status: 'in_transit',
        tracking: 'TRK-2025-789456'
      }
    ];
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching buyer orders:', error.message);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// API ENDPOINT TO GET BUYER INVOICES
app.get('/api/buyer/invoices', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll return mock data
    const invoices = [
      {
        id: 1,
        orderId: 'O-2025-001',
        amount: 5200,
        status: 'pending',
        dueDate: '2025-10-15'
      },
      {
        id: 2,
        orderId: 'O-2025-002',
        amount: 3500,
        status: 'paid',
        dueDate: '2025-09-30'
      }
    ];
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching buyer invoices:', error.message);
    res.status(500).json({ error: 'Server error fetching invoices' });
  }
});

// API ENDPOINT TO GET CAPTAIN ROLES
app.get('/api/captain/roles', async (req, res) => {
  try {
    // Fetch roles from Supabase
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        id,
        name,
        description
      `)
      .order('name');

    if (error) {
      console.error('Error fetching captain roles:', error.message);
      return res.status(500).json({ error: 'Server error fetching roles' });
    }

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', role.id);
      
      if (countError) {
        console.error('Error fetching user count for role:', countError.message);
        return { ...role, userCount: 0 };
      }
      
      return { ...role, userCount: count || 0 };
    }));

    res.json(rolesWithCounts);
  } catch (error) {
    console.error('Error fetching captain roles:', error.message);
    res.status(500).json({ error: 'Server error fetching roles' });
  }
});

// API ENDPOINT TO GET CAPTAIN CATALOGS
app.get('/api/captain/catalogs', async (req, res) => {
  try {
    // Fetch catalogs from Supabase
    const { data: catalogs, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        status,
        is_verified,
        users (
          username
        ),
        categories (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching captain catalogs:', error.message);
      return res.status(500).json({ error: 'Server error fetching catalogs' });
    }

    // Format the data for the frontend
    const formattedCatalogs = catalogs.map(catalog => ({
      id: catalog.id,
      title: catalog.name || 'Unknown Product',
      seller: catalog.users?.username || 'Unknown',
      category: catalog.categories?.name || 'Unknown',
      status: catalog.is_verified ? 'approved' : (catalog.status || 'pending')
    }));

    res.json(formattedCatalogs);
  } catch (error) {
    console.error('Error fetching captain catalogs:', error.message);
    res.status(500).json({ error: 'Server error fetching catalogs' });
  }
});

// API ENDPOINT TO GET CAPTAIN DPQS
app.get('/api/captain/dpqs', async (req, res) => {
  try {
    // Fetch DPQs from Supabase
    const { data: dpqs, error } = await supabase
      .from('dpqs')
      .select(`
        id,
        quantity,
        status,
        created_at,
        products (
          name
        ),
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching captain DPQs:', error.message);
      return res.status(500).json({ error: 'Server error fetching DPQs' });
    }

    // Format the data for the frontend
    const formattedDpqs = dpqs.map(dpq => ({
      id: dpq.id,
      productName: dpq.products?.name || 'Unknown Product',
      buyerName: dpq.users?.username || 'Unknown',
      quantity: dpq.quantity,
      status: dpq.status || 'pending',
      createdAt: dpq.created_at
    }));

    res.json(formattedDpqs);
  } catch (error) {
    console.error('Error fetching captain DPQs:', error.message);
    res.status(500).json({ error: 'Server error fetching DPQs' });
  }
});

// API ENDPOINT TO GET CAPTAIN DPOS
app.get('/api/captain/dpos', async (req, res) => {
  try {
    // Fetch DPOs from Supabase
    const { data: dpos, error } = await supabase
      .from('dpos')
      .select(`
        id,
        quantity,
        total_price,
        status,
        products (
          name
        ),
        users_buyer (
          username
        ),
        users_seller (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching captain DPOs:', error.message);
      return res.status(500).json({ error: 'Server error fetching DPOs' });
    }

    // Format the data for the frontend
    const formattedDpos = dpos.map(dpo => ({
      id: dpo.id,
      productName: dpo.products?.name || 'Unknown Product',
      buyerName: dpo.users_buyer?.username || 'Unknown',
      sellerName: dpo.users_seller?.username || 'Unknown',
      totalPrice: dpo.total_price,
      status: dpo.status || 'pending'
    }));

    res.json(formattedDpos);
  } catch (error) {
    console.error('Error fetching captain DPOs:', error.message);
    res.status(500).json({ error: 'Server error fetching DPOs' });
  }
});

// API ENDPOINT TO GET CAPTAIN DISPUTES
app.get('/api/captain/disputes', async (req, res) => {
  try {
    // Fetch disputes from Supabase
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        id,
        subject,
        status,
        priority,
        created_at,
        orders (
          order_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching captain disputes:', error.message);
      return res.status(500).json({ error: 'Server error fetching disputes' });
    }

    // Format the data for the frontend
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      orderId: dispute.orders?.order_number || 'Unknown',
      type: dispute.subject || 'Unknown',
      status: dispute.status || 'open',
      priority: dispute.priority || 'medium',
      createdAt: dispute.created_at
    }));

    res.json(formattedDisputes);
  } catch (error) {
    console.error('Error fetching captain disputes:', error.message);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
});

// API ENDPOINT TO GET ADMIN CATALOGS
app.get('/api/admin/catalogs', async (req, res) => {
  try {
    // Fetch pending catalogs from Supabase
    const { data: catalogs, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        created_at,
        users (
          username
        ),
        categories (
          name
        )
      `)
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin catalogs:', error.message);
      return res.status(500).json({ error: 'Server error fetching catalogs' });
    }

    // Format the data for the frontend
    const formattedCatalogs = catalogs.map(catalog => ({
      id: catalog.id,
      title: catalog.name || 'Unknown Product',
      seller: catalog.users?.username || 'Unknown',
      category: catalog.categories?.name || 'Unknown',
      submittedAt: catalog.created_at
    }));

    res.json(formattedCatalogs);
  } catch (error) {
    console.error('Error fetching admin catalogs:', error.message);
    res.status(500).json({ error: 'Server error fetching catalogs' });
  }
});

// API ENDPOINT TO GET ADMIN SURVEYS
app.get('/api/admin/surveys', async (req, res) => {
  try {
    // Fetch survey offers from Supabase
    const { data: surveys, error } = await supabase
      .from('survey_requests')
      .select(`
        id,
        status,
        created_at,
        products (
          name
        ),
        users_buyer (
          username
        ),
        surveyors:users_surveyor (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin surveys:', error.message);
      return res.status(500).json({ error: 'Server error fetching surveys' });
    }

    // Format the data for the frontend
    const formattedSurveys = surveys.map(survey => ({
      id: survey.id,
      productName: survey.products?.name || 'Unknown Product',
      buyerName: survey.users_buyer?.username || 'Unknown',
      surveyorName: survey.surveyors?.username || 'Unknown',
      fee: 150, // This should come from the actual survey request
      status: survey.status || 'pending'
    }));

    res.json(formattedSurveys);
  } catch (error) {
    console.error('Error fetching admin surveys:', error.message);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// API ENDPOINT TO GET ADMIN DISPUTES
app.get('/api/admin/disputes', async (req, res) => {
  try {
    // Fetch disputes from Supabase
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        id,
        subject,
        status,
        created_at,
        orders (
          order_number
        ),
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin disputes:', error.message);
      return res.status(500).json({ error: 'Server error fetching disputes' });
    }

    // Format the data for the frontend
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      subject: dispute.subject,
      status: dispute.status,
      submittedAt: dispute.created_at,
      orderNumber: dispute.orders?.order_number || 'Unknown',
      user: dispute.users?.username || 'Unknown'
    }));

    res.json(formattedDisputes);
  } catch (error) {
    console.error('Error fetching admin disputes:', error.message);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
});

// API ENDPOINT TO GET BUYER SURVEYS
app.get('/api/buyer/surveys', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll fetch all surveys (in a real app, filter by buyer ID)
    const { data: surveys, error } = await supabase
      .from('survey_requests')
      .select(`
        id,
        status,
        created_at,
        products (
          name
        ),
        users_seller (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer surveys:', error.message);
      return res.status(500).json({ error: 'Server error fetching surveys' });
    }

    // Format the data for the frontend
    const formattedSurveys = surveys.map(survey => ({
      id: survey.id,
      productName: survey.products && survey.products.name ? survey.products.name : 'Unknown Product',
      sellerName: survey.users_seller && survey.users_seller.username ? survey.users_seller.username : 'Unknown',
      status: survey.status || 'pending',
      fee: '$150' // This should come from the actual survey request
    }));

    res.json(formattedSurveys);
  } catch (error) {
    console.error('Error fetching buyer surveys:', error.message);
    res.status(500).json({ error: 'Server error fetching surveys' });
  }
});

// API ENDPOINT TO GET ACCOUNTANT PAYMENTS
app.get('/api/accountant/payments', async (req, res) => {
  try {
    // Fetch payments from Supabase
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency_id,
        status,
        created_at,
        orders (
          order_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accountant payments:', error.message);
      return res.status(500).json({ error: 'Server error fetching payments' });
    }

    // Format the data for the frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      orderId: payment.orders?.order_number || 'Unknown',
      amount: payment.amount,
      currency: payment.currency_id === 1 ? 'USD' : 'Unknown',
      status: payment.status || 'pending'
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching accountant payments:', error.message);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

// API ENDPOINT TO GET ACCOUNTANT INVOICES
app.get('/api/accountant/invoices', async (req, res) => {
  try {
    // Fetch invoices from Supabase
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        amount,
        status,
        created_at,
        orders (
          order_number,
          users (
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accountant invoices:', error.message);
      return res.status(500).json({ error: 'Server error fetching invoices' });
    }

    // Format the data for the frontend
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      orderId: invoice.orders?.order_number || 'Unknown',
      buyerName: invoice.orders?.users?.username || 'Unknown',
      amount: invoice.amount,
      status: invoice.status || 'pending'
    }));

    res.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching accountant invoices:', error.message);
    res.status(500).json({ error: 'Server error fetching invoices' });
  }
});

// API ENDPOINT TO GET ADMIN DISPUTES
app.get('/api/admin/disputes', async (req, res) => {
  try {
    // Fetch disputes from Supabase
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        id,
        subject,
        status,
        created_at,
        orders (
          order_number
        ),
        users (username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin disputes:', error.message);
      return res.status(500).json({ error: 'Server error fetching disputes' });
    }

    // Format the data for the frontend
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      subject: dispute.subject,
      status: dispute.status || 'pending',
      orderId: dispute.orders?.order_number || 'Unknown',
      buyerName: dispute.users?.username || 'Unknown'
    }));

    res.json(formattedDisputes);
  } catch (error) {
    console.error('Error fetching admin disputes:', error.message);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
});

// API ENDPOINT TO GET BUYER INVOICES
app.get('/api/buyer/invoices', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll fetch all invoices (in a real app, filter by buyer ID)
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id,
        amount,
        status,
        due_date,
        orders (
          order_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer invoices:', error.message);
      return res.status(500).json({ error: 'Server error fetching invoices' });
    }

    // Format the data for the frontend
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      orderId: invoice.orders?.order_number || 'Unknown',
      amount: invoice.amount,
      status: invoice.status || 'pending',
      dueDate: invoice.due_date
    }));

    res.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching buyer invoices:', error.message);
    res.status(500).json({ error: 'Server error fetching invoices' });
  }
});

// API ENDPOINT TO GET ACCOUNTANT DISPUTES
app.get('/api/accountant/disputes', async (req, res) => {
  try {
    // Fetch disputes from Supabase
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select(`
        id,
        subject,
        status,
        created_at,
        orders (
          order_number
        ),
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accountant disputes:', error.message);
      return res.status(500).json({ error: 'Server error fetching disputes' });
    }

    // Format the data for the frontend
    const formattedDisputes = disputes.map(dispute => ({
      id: dispute.id,
      orderId: dispute.orders?.order_number || 'Unknown',
      type: dispute.subject || 'Unknown',
      submittedBy: dispute.users?.username || 'Unknown',
      status: dispute.status || 'open'
    }));

    res.json(formattedDisputes);
  } catch (error) {
    console.error('Error fetching accountant disputes:', error.message);
    res.status(500).json({ error: 'Server error fetching disputes' });
  }
});

// API ENDPOINT TO GET HR DOCUMENTS
app.get('/api/hr/documents', async (req, res) => {
  try {
    // Fetch pending document verifications from Supabase
    const { data: documents, error } = await supabase
      .from('company_documents')
      .select(`
        id,
        document_type,
        document_name,
        submitted_date:created_at,
        status,
        is_verified,
        users (
          first_name,
          last_name,
          username
        )
      `)
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HR documents:', error.message);
      return res.status(500).json({ error: 'Server error fetching documents' });
    }

    // Format the data for the frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_type: doc.document_type,
      document_name: doc.document_name,
      submitted_date: doc.submitted_date,
      status: doc.is_verified ? 'approved' : (doc.status || 'pending'),
      user_name: `${doc.users.first_name} ${doc.users.last_name}`,
      vendor_code: doc.users.username
    }));

    res.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching HR documents:', error.message);
    res.status(500).json({ error: 'Server error fetching documents' });
  }
});

// API ENDPOINT TO APPROVE HR DOCUMENT
app.post('/api/hr/documents/approve', async (req, res) => {
  try {
    const { documentId } = req.body;
    
    // Update document status in Supabase
    const { data, error } = await supabase
      .from('company_documents')
      .update({ 
        is_verified: true,
        verification_date: new Date()
      })
      .eq('id', documentId)
      .select();

    if (error) {
      console.error('Error approving HR document:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      message: 'Document approved successfully',
      document: data[0]
    });
  } catch (error) {
    console.error('Error approving HR document:', error.message);
    res.status(500).json({ error: 'Server error approving document' });
  }
});

// API ENDPOINT TO GET HR CONTACT REQUESTS
app.get('/api/hr/contacts', async (req, res) => {
  try {
    // Fetch contact requests from Supabase
    const { data: contacts, error } = await supabase
      .from('contact_requests')
      .select(`
        id,
        requester_id,
        reason,
        status,
        created_at,
        users (
          first_name,
          last_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HR contacts:', error.message);
      return res.status(500).json({ error: 'Server error fetching contacts' });
    }

    // Format the data for the frontend
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      requester_name: `${contact.users.first_name} ${contact.users.last_name}`,
      vendor_code: contact.users.username,
      reason: contact.reason,
      request_date: contact.created_at,
      status: contact.status || 'pending'
    }));

    res.json(formattedContacts);
  } catch (error) {
    console.error('Error fetching HR contacts:', error.message);
    res.status(500).json({ error: 'Server error fetching contacts' });
  }
});

// API ENDPOINT TO APPROVE HR CONTACT REQUEST
app.post('/api/hr/contacts/approve', async (req, res) => {
  try {
    const { requestId } = req.body;
    
    // Update contact request status in Supabase
    const { data, error } = await supabase
      .from('contact_requests')
      .update({ 
        status: 'approved',
        approved_at: new Date()
      })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error('Error approving HR contact request:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      message: 'Contact request approved successfully',
      request: data[0]
    });
  } catch (error) {
    console.error('Error approving HR contact request:', error.message);
    res.status(500).json({ error: 'Server error approving contact request' });
  }
});

// API ENDPOINT TO GET BUYER RFQS
app.get('/api/buyer/rfqs', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll fetch all RFQs (in a real app, filter by buyer ID)
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        title,
        status,
        created_at,
        products (
          name
        ),
        users (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer RFQs:', error.message);
      return res.status(500).json({ error: 'Server error fetching RFQs' });
    }

    // Format the data for the frontend
    const formattedRfqs = rfqs.map(rfq => ({
      id: rfq.id,
      productName: rfq.products?.name || rfq.title || 'Unknown Product',
      sellerName: rfq.users?.username || 'Unknown',
      status: rfq.status || 'open',
      price: '-', // This would need to be calculated based on bids
      validity: '-' // This would need to be calculated
    }));

    res.json(formattedRfqs);
  } catch (error) {
    console.error('Error fetching buyer RFQs:', error.message);
    res.status(500).json({ error: 'Server error fetching RFQs' });
  }
});

// API ENDPOINT TO GET CAPTAIN RFQS
app.get('/api/captain/rfqs', async (req, res) => {
  try {
    // If Supabase is not available, return mock data
    if (!supabase) {
      const mockRfqs = [
        {
          id: 1,
          productName: 'Premium Electronics Components',
          buyerName: 'Sarah Buyer',
          buyerCode: 'BUY-23-DEF456',
          category: 'Electronics',
          status: 'open',
          budget: 'USD 4000 - USD 6000',
          deadline: '2025-10-30',
          createdAt: '2025-10-03'
        },
        {
          id: 2,
          productName: 'Organic Cotton Fabric',
          buyerName: 'Sarah Buyer',
          buyerCode: 'BUY-23-DEF456',
          category: 'Textiles',
          status: 'open',
          budget: 'USD 3000 - USD 4000',
          deadline: '2025-11-15',
          createdAt: '2025-10-03'
        }
      ];
      return res.json(mockRfqs);
    }
    
    // Fetch all RFQs for captain to monitor
    const { data: rfqs, error } = await supabase
      .from('rfqs')
      .select(`
        id,
        title,
        status,
        created_at,
        response_deadline,
        budget_range_min,
        budget_range_max,
        currencies (code),
        products (
          name
        ),
        users (
          vendor_code,
          first_name,
          last_name
        ),
        categories (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching captain RFQs:', error.message);
      return res.status(500).json({ error: 'Server error fetching RFQs' });
    }

    // Format the data for the frontend
    const formattedRfqs = rfqs.map(rfq => ({
      id: rfq.id,
      productName: rfq.products?.name || rfq.title || 'Unknown Product',
      buyerName: `${rfq.users?.first_name} ${rfq.users?.last_name}` || rfq.users?.username || 'Unknown',
      buyerCode: rfq.users?.username || 'Unknown',
      category: rfq.categories?.name || 'Unknown',
      status: rfq.status || 'open',
      budget: rfq.budget_range_min && rfq.budget_range_max ? 
        `${rfq.currencies?.code || 'USD'} ${rfq.budget_range_min} - ${rfq.currencies?.code || 'USD'} ${rfq.budget_range_max}` : 
        'Not specified',
      deadline: rfq.response_deadline ? new Date(rfq.response_deadline).toLocaleDateString() : 'Not specified',
      createdAt: rfq.created_at ? new Date(rfq.created_at).toLocaleDateString() : 'Unknown'
    }));

    res.json(formattedRfqs);
  } catch (error) {
    console.error('Error fetching captain RFQs:', error.message);
    res.status(500).json({ error: 'Server error fetching RFQs' });
  }
});

// API ENDPOINT TO GET ORDER WORKFLOW STATUS
app.get('/api/captain/orders/:orderId/workflow', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // If Supabase is not available, return mock data
    if (!supabase) {
      const mockWorkflowStatus = {
        order: {
          id: orderId,
          status: 'processing',
          paymentStatus: 'pending'
        },
        quotation: {
          status: 'accepted',
          completed: true
        },
        survey: {
          status: 'completed',
          completed: true
        },
        orderConfirmation: {
          status: 'confirmed',
          completed: true
        },
        transport: {
          status: 'in_transit',
          completed: false
        },
        logistics: {
          status: 'not_required',
          completed: true
        },
        payment: {
          status: 'pending',
          completed: false
        }
      };
      return res.json(mockWorkflowStatus);
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_status,
        dpos (
          id,
          status,
          dpqs (
            id,
            status,
            survey_requests (
              id,
              status,
              survey_reports (
                id,
                status
              )
            )
          )
        ),
        transport_orders (
          id,
          status
        ),
        logistics_orders (
          id,
          status
        ),
        invoices (
          id,
          status,
          payments (
            id,
            status
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order workflow:', orderError.message);
      return res.status(500).json({ error: 'Server error fetching order workflow' });
    }

    // Build workflow status
    const workflowStatus = {
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.payment_status
      },
      quotation: {
        status: order.dpos?.dpqs?.status || 'pending',
        completed: order.dpos?.dpqs?.status === 'accepted'
      },
      survey: {
        status: order.dpos?.dpqs?.survey_requests?.status || 'not_required',
        completed: order.dpos?.dpqs?.survey_requests?.survey_reports?.status === 'accepted'
      },
      orderConfirmation: {
        status: order.dpos?.status || 'pending',
        completed: order.dpos?.status === 'confirmed'
      },
      transport: {
        status: order.transport_orders?.status || 'not_assigned',
        completed: order.transport_orders?.status === 'delivered'
      },
      logistics: {
        status: order.logistics_orders?.status || 'not_required',
        completed: order.logistics_orders?.status === 'completed'
      },
      payment: {
        status: order.invoices?.payments?.status || 'pending',
        completed: order.invoices?.payments?.status === 'completed'
      }
    };

    res.json(workflowStatus);
  } catch (error) {
    console.error('Error fetching order workflow:', error.message);
    res.status(500).json({ error: 'Server error fetching order workflow' });
  }
});
// API ENDPOINT TO GET HR USER ISSUES
app.get('/api/hr/issues', async (req, res) => {
  try {
    // Fetch user issues from Supabase
    const { data: issues, error } = await supabase
      .from('user_issues')
      .select(`
        id,
        user_id,
        issue,
        status,
        created_at,
        users (
          first_name,
          last_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching HR issues:', error.message);
      return res.status(500).json({ error: 'Server error fetching issues' });
    }

    // Format the data for the frontend
    const formattedIssues = issues.map(issue => ({
      id: issue.id,
      user_name: `${issue.users.first_name} ${issue.users.last_name}`,
      vendor_code: issue.users.username,
      issue: issue.issue,
      reported_date: issue.created_at,
      status: issue.status || 'open'
    }));

    res.json(formattedIssues);
  } catch (error) {
    console.error('Error fetching HR issues:', error.message);
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

// API ENDPOINT TO RESOLVE HR USER ISSUE
app.post('/api/hr/issues/resolve', async (req, res) => {
  try {
    const { issueId } = req.body;
    
    // Update user issue status in Supabase
    const { data, error } = await supabase
      .from('user_issues')
      .update({ 
        status: 'resolved',
        resolved_at: new Date()
      })
      .eq('id', issueId)
      .select();

    if (error) {
      console.error('Error resolving HR user issue:', error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      message: 'User issue resolved successfully',
      issue: data[0]
    });
  } catch (error) {
    console.error('Error resolving HR user issue:', error.message);
    res.status(500).json({ error: 'Server error resolving user issue' });
  }
});

// API ENDPOINT TO CREATE DPQ (Buyer creates DPQ for a product)
app.post('/api/buyer/dpqs', async (req, res) => {
  try {
    const { productId, quantity, specifications, deliveryPortId, deliveryDate, paymentTerms } = req.body;
    
    // Get the current user (in a real app, this would come from authentication)
    const userId = req.user?.id || 1; // Placeholder for now
    
    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price, currency_id, seller_id')
      .eq('id', productId)
      .single();
    
    if (productError) {
      return res.status(400).json({ error: 'Product not found' });
    }
    
    // Calculate total price
    const totalPrice = product.price * quantity;
    
    // Create DPQ in Supabase
    const { data: dpq, error: dpqError } = await supabase
      .from('dpqs')
      .insert({
        buyer_id: userId,
        product_id: productId,
        quantity: quantity,
        unit_price: product.price,
        total_price: totalPrice,
        currency_id: product.currency_id,
        specifications: specifications,
        delivery_port_id: deliveryPortId,
        delivery_date: deliveryDate,
        payment_terms: paymentTerms,
        status: 'pending'
      })
      .select();
    
    if (dpqError) {
      console.error('Error creating DPQ:', dpqError.message);
      return res.status(400).json({ error: dpqError.message });
    }
    
    res.json({ 
      success: true,
      message: 'DPQ created successfully',
      dpq: dpq[0]
    });
  } catch (error) {
    console.error('Error creating DPQ:', error.message);
    res.status(500).json({ error: 'Server error creating DPQ' });
  }
});

// API ENDPOINT TO CONVERT DPQ TO DPO (Seller accepts DPQ)
app.post('/api/seller/dpos', async (req, res) => {
  try {
    const { dpqId } = req.body;
    
    // Get the current user (in a real app, this would come from authentication)
    const userId = req.user?.id || 1; // Placeholder for now
    
    // Get DPQ details
    const { data: dpq, error: dpqError } = await supabase
      .from('dpqs')
      .select('*')
      .eq('id', dpqId)
      .single();
    
    if (dpqError) {
      return res.status(400).json({ error: 'DPQ not found' });
    }
    
    // Create DPO in Supabase
    const { data: dpo, error: dpoError } = await supabase
      .from('dpos')
      .insert({
        dpq_id: dpqId,
        seller_id: userId,
        buyer_id: dpq.buyer_id,
        product_id: dpq.product_id,
        quantity: dpq.quantity,
        unit_price: dpq.unit_price,
        total_price: dpq.total_price,
        currency_id: dpq.currency_id,
        specifications: dpq.specifications,
        delivery_port_id: dpq.delivery_port_id,
        delivery_date: dpq.delivery_date,
        payment_terms: dpq.payment_terms,
        status: 'pending'
      })
      .select();
    
    if (dpoError) {
      console.error('Error creating DPO:', dpoError.message);
      return res.status(400).json({ error: dpoError.message });
    }
    
    // Update DPQ status
    await supabase
      .from('dpqs')
      .update({ status: 'accepted' })
      .eq('id', dpqId);
    
    res.json({ 
      success: true,
      message: 'DPO created successfully',
      dpo: dpo[0]
    });
  } catch (error) {
    console.error('Error creating DPO:', error.message);
    res.status(500).json({ error: 'Server error creating DPO' });
  }
});

// API ENDPOINT TO CREATE ORDER (Based on DPO)
app.post('/api/buyer/orders', async (req, res) => {
  try {
    const { dpoId } = req.body;
    
    // Get the current user (in a real app, this would come from authentication)
    const userId = req.user?.id || 1; // Placeholder for now
    
    // Get DPO details
    const { data: dpo, error: dpoError } = await supabase
      .from('dpos')
      .select('*')
      .eq('id', dpoId)
      .single();
    
    if (dpoError) {
      return res.status(400).json({ error: 'DPO not found' });
    }
    
    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create Order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        dpo_id: dpoId,
        buyer_id: userId,
        seller_id: dpo.seller_id,
        order_number: orderNumber,
        total_amount: dpo.total_price,
        currency_id: dpo.currency_id,
        status: 'pending',
        payment_status: 'pending'
      })
      .select();
    
    if (orderError) {
      console.error('Error creating order:', orderError.message);
      return res.status(400).json({ error: orderError.message });
    }
    
    // Update DPO status
    await supabase
      .from('dpos')
      .update({ status: 'confirmed' })
      .eq('id', dpoId);
    
    res.json({ 
      success: true,
      message: 'Order created successfully',
      order: order[0]
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// API ENDPOINT TO CREATE INVOICE (Accountant creates invoice for order)
app.post('/api/accountant/invoices', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      return res.status(400).json({ error: 'Order not found' });
    }
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Calculate due date (30 days from issue date)
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    // Create Invoice in Supabase
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        amount: order.total_amount,
        currency_id: order.currency_id,
        status: 'pending'
      })
      .select();
    
    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError.message);
      return res.status(400).json({ error: invoiceError.message });
    }
    
    // Update order payment status
    await supabase
      .from('orders')
      .update({ payment_status: 'invoiced' })
      .eq('id', orderId);
    
    res.json({ 
      success: true,
      message: 'Invoice created successfully',
      invoice: invoice[0]
    });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ error: 'Server error creating invoice' });
  }
});

// API ENDPOINT TO CREATE PAYMENT (Buyer makes payment for invoice)
app.post('/api/buyer/payments', async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    
    // Get the current user (in a real app, this would come from authentication)
    const userId = req.user?.id || 1; // Placeholder for now
    
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('order_id, amount, currency_id')
      .eq('id', invoiceId)
      .single();
    
    if (invoiceError) {
      return res.status(400).json({ error: 'Invoice not found' });
    }
    
    // Create Payment in Supabase
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        order_id: invoice.order_id,
        amount: invoice.amount,
        currency_id: invoice.currency_id,
        payment_method: paymentMethod,
        status: 'pending'
      })
      .select();
    
    if (paymentError) {
      console.error('Error creating payment:', paymentError.message);
      return res.status(400).json({ error: paymentError.message });
    }
    
    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId);
    
    // Update order payment status
    await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', invoice.order_id);
    
    res.json({ 
      success: true,
      message: 'Payment created successfully',
      payment: payment[0]
    });
  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ error: 'Server error creating payment' });
  }
});

// API ENDPOINT TO RAISE DISPUTE (Buyer or Seller raises dispute)
app.post('/api/disputes', async (req, res) => {
  try {
    const { orderId, subject, description, againstUserId } = req.body;
    
    // Get the current user (in a real app, this would come from authentication)
    const userId = req.user?.id || 1; // Placeholder for now
    
    // Create Dispute in Supabase
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        raised_by: userId,
        against_user_id: againstUserId,
        subject: subject,
        description: description,
        status: 'open',
        priority: 'medium'
      })
      .select();
    
    if (disputeError) {
      console.error('Error creating dispute:', disputeError.message);
      return res.status(400).json({ error: disputeError.message });
    }
    
    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'disputed' })
      .eq('id', orderId);
    
    res.json({ 
      success: true,
      message: 'Dispute raised successfully',
      dispute: dispute[0]
    });
  } catch (error) {
    console.error('Error creating dispute:', error.message);
    res.status(500).json({ error: 'Server error creating dispute' });
  }
});

// API ENDPOINT TO GET PRODUCTS
app.get('/api/products', async (req, res) => {
    // Add console.log here for debugging
    console.log('GET /api/products endpoint hit on Vercel');
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Server error fetching products: ' + error.message });
    }
});

// API ENDPOINT TO GET CATALOGS (for home page)
app.get('/api/catalogs', async (req, res) => {
    // Add console.log here for debugging
    console.log('GET /api/catalogs endpoint hit on Vercel');
    try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        console.error('Error fetching catalogs:', error.message);
        res.status(500).json({ error: 'Server error fetching catalogs: ' + error.message });
    }
});

// API ENDPOINT TO GET ARBITRATOR CASES
app.get('/api/arbitrator/cases', async (req, res) => {
  try {
    // Fetch arbitration cases from Supabase
    const { data: cases, error } = await supabase
      .from('disputes')
      .select(`
        id,
        subject,
        status,
        priority,
        created_at,
        orders (
          id,
          buyer_id,
          seller_id,
          users_buyer (username),
          users_seller (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching arbitrator cases:', error.message);
      return res.status(500).json({ error: 'Server error fetching cases' });
    }

    // Format the data for the frontend
    const formattedCases = cases.map(caseItem => ({
      id: caseItem.id,
      case: caseItem.subject,
      buyer: caseItem.orders?.users_buyer?.username || 'Unknown',
      seller: caseItem.orders?.users_seller?.username || 'Unknown',
      status: caseItem.status || 'open',
      priority: caseItem.priority || 'medium',
      created_at: caseItem.created_at
    }));

    res.json(formattedCases);
  } catch (error) {
    console.error('Error fetching arbitrator cases:', error.message);
    res.status(500).json({ error: 'Server error fetching cases' });
  }
});

// API ENDPOINT TO GET ARBITRATOR EVIDENCE REQUESTS
app.get('/api/arbitrator/evidence', async (req, res) => {
  try {
    // Fetch evidence requests from Supabase
    const { data: evidence, error } = await supabase
      .from('evidence_requests')
      .select(`
        id,
        dispute_id,
        party_type,
        document_name,
        status,
        created_at,
        disputes (
          subject
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching arbitrator evidence:', error.message);
      return res.status(500).json({ error: 'Server error fetching evidence' });
    }

    // Format the data for the frontend
    const formattedEvidence = evidence.map(evidenceItem => ({
      id: evidenceItem.id,
      case: evidenceItem.disputes?.subject || 'Unknown Case',
      party: evidenceItem.party_type || 'Unknown',
      document: evidenceItem.document_name || 'Unknown Document',
      status: evidenceItem.status || 'pending',
      created_at: evidenceItem.created_at
    }));

    res.json(formattedEvidence);
  } catch (error) {
    console.error('Error fetching arbitrator evidence:', error.message);
    res.status(500).json({ error: 'Server error fetching evidence' });
  }
});

// API ENDPOINT TO GET SURVEYOR REQUESTS
app.get('/api/surveyor/requests', async (req, res) => {
  try {
    // Fetch survey requests from Supabase
    const { data: requests, error } = await supabase
      .from('survey_requests')
      .select(`
        id,
        product_id,
        buyer_id,
        seller_id,
        status,
        created_at,
        products (
          name
        ),
        users_buyer (
          username
        ),
        users_seller (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surveyor requests:', error.message);
      return res.status(500).json({ error: 'Server error fetching requests' });
    }

    // Format the data for the frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      catalog: request.products?.name || 'Unknown Product',
      buyer: request.users_buyer?.username || 'Unknown',
      seller: request.users_seller?.username || 'Unknown',
      status: request.status || 'pending',
      created_at: request.created_at
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching surveyor requests:', error.message);
    res.status(500).json({ error: 'Server error fetching requests' });
  }
});

// API ENDPOINT TO GET SURVEYOR REPORTS
app.get('/api/surveyor/reports', async (req, res) => {
  try {
    // Fetch survey reports from Supabase
    const { data: reports, error } = await supabase
      .from('survey_reports')
      .select(`
        id,
        survey_request_id,
        status,
        created_at,
        survey_requests (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (
            username
          ),
          users_seller (
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surveyor reports:', error.message);
      return res.status(500).json({ error: 'Server error fetching reports' });
    }

    // Format the data for the frontend
    const formattedReports = reports.map(report => ({
      id: report.id,
      catalog: report.survey_requests?.products?.name || 'Unknown Product',
      buyer: report.survey_requests?.users_buyer?.username || 'Unknown',
      seller: report.survey_requests?.users_seller?.username || 'Unknown',
      status: report.status || 'draft',
      created_at: report.created_at
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error('Error fetching surveyor reports:', error.message);
    res.status(500).json({ error: 'Server error fetching reports' });
  }
});

// API ENDPOINT TO GET INSURANCE POLICY REQUESTS
app.get('/api/insurance/policies', async (req, res) => {
  try {
    // Fetch insurance policy requests from Supabase
    const { data: policies, error } = await supabase
      .from('insurance_requests')
      .select(`
        id,
        product_id,
        buyer_id,
        seller_id,
        status,
        created_at,
        products (
          name
        ),
        users_buyer (
          username
        ),
        users_seller (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insurance policies:', error.message);
      return res.status(500).json({ error: 'Server error fetching policies' });
    }

    // Format the data for the frontend
    const formattedPolicies = policies.map(policy => ({
      id: policy.id,
      catalog: policy.products?.name || 'Unknown Product',
      buyer: policy.users_buyer?.username || 'Unknown',
      seller: policy.users_seller?.username || 'Unknown',
      status: policy.status || 'pending',
      created_at: policy.created_at
    }));

    res.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching insurance policies:', error.message);
    res.status(500).json({ error: 'Server error fetching policies' });
  }
});

// API ENDPOINT TO GET INSURANCE POLICY DOCUMENTS
app.get('/api/insurance/documents', async (req, res) => {
  try {
    // Fetch insurance policy documents from Supabase
    const { data: documents, error } = await supabase
      .from('insurance_documents')
      .select(`
        id,
        insurance_request_id,
        status,
        created_at,
        insurance_requests (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (
            username
          ),
          users_seller (
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insurance policies:', error.message);
      return res.status(500).json({ error: 'Server error fetching policies' });
    }

    // Format the data for the frontend
    const formattedPolicies = policies.map(policy => ({
      id: policy.id,
      catalog: policy.products?.name || 'Unknown Product',
      buyer: policy.users_buyer?.username || 'Unknown',
      seller: policy.users_seller?.username || 'Unknown',
      status: policy.status || 'pending',
      created_at: policy.created_at
    }));

    res.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching insurance policies:', error.message);
    res.status(500).json({ error: 'Server error fetching policies' });
  }
});

// API ENDPOINT TO GET INSURANCE DOCUMENTS
app.get('/api/insurance/documents', async (req, res) => {
  try {
    // Fetch insurance documents from Supabase
    const { data: documents, error } = await supabase
      .from('insurance_documents')
      .select(`
        id,
        status,
        created_at,
        insurance_requests (
          products (
            name
          ),
          users_buyer (
            username
          ),
          users_seller (
            username
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching insurance documents:', error.message);
      return res.status(500).json({ error: 'Server error fetching documents' });
    }

    // Format the data for the frontend
    const formattedDocuments = documents.map(document => ({
      id: document.id,
      catalog: document.insurance_requests?.products?.name || 'Unknown Product',
      buyer: document.insurance_requests?.users_buyer?.username || 'Unknown',
      seller: document.insurance_requests?.users_seller?.username || 'Unknown',
      status: document.status || 'draft',
      created_at: document.created_at
    }));

    res.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching insurance documents:', error.message);
    res.status(500).json({ error: 'Server error fetching documents' });
  }
});

// API ENDPOINT TO GET BUYER ORDERS
app.get('/api/buyer/orders', async (req, res) => {
  try {
    // In a real implementation, you would get the buyer ID from the authenticated user
    // For now, we'll fetch all orders (in a real app, filter by buyer ID)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        products (
          name
        ),
        users_seller (
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer orders:', error.message);
      return res.status(500).json({ error: 'Server error fetching orders' });
    }

    // Format the data for the frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      productName: order.products && order.products.name ? order.products.name : 'Unknown Product',
      sellerName: order.users_seller && order.users_seller.username ? order.users_seller.username : 'Unknown',
      status: order.status || 'pending',
      tracking: 'TRK-2025-789456' // This should come from tracking info
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching buyer orders:', error.message);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// API ENDPOINT TO GET TRANSPORTER WORK ORDERS
app.get('/api/transporter/orders', async (req, res) => {
  try {
    // Fetch transporter work orders from Supabase
    const { data: orders, error } = await supabase
      .from('transport_orders')
      .select(`
        id,
        order_id,
        status,
        created_at,
        orders (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (username),
          users_seller (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transporter orders:', error.message);
      return res.status(500).json({ error: 'Server error fetching orders' });
    }

    // Format the data for the frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      catalog: order.orders?.products?.name || 'Unknown Product',
      buyer: order.orders?.users_buyer?.username || 'Unknown',
      seller: order.orders?.users_seller?.username || 'Unknown',
      status: order.status || 'pending',
      created_at: order.created_at
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching transporter orders:', error.message);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// API ENDPOINT TO GET TRANSPORTER TRACKING INFO
app.get('/api/transporter/tracking', async (req, res) => {
  try {
    // Fetch transporter tracking information from Supabase
    const { data: tracking, error } = await supabase
      .from('tracking_info')
      .select(`
        id,
        transport_order_id,
        tracking_id,
        status,
        updated_at,
        transport_orders (
          order_id,
          orders (
            products (
              name
            )
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching transporter tracking:', error.message);
      return res.status(500).json({ error: 'Server error fetching tracking' });
    }

    // Format the data for the frontend
    const formattedTracking = tracking.map(track => ({
      id: track.id,
      order: track.transport_orders?.orders?.products?.name || 'Unknown Order',
      trackingId: track.tracking_id || 'Unknown',
      status: track.status || 'pending',
      updated_at: track.updated_at
    }));

    res.json(formattedTracking);
  } catch (error) {
    console.error('Error fetching transporter tracking:', error.message);
    res.status(500).json({ error: 'Server error fetching tracking' });
  }
});

// API ENDPOINT TO GET LOGISTICS WORK ORDERS
app.get('/api/logistics/orders', async (req, res) => {
  try {
    // Fetch logistics work orders from Supabase
    const { data: orders, error } = await supabase
      .from('logistics_orders')
      .select(`
        id,
        order_id,
        status,
        created_at,
        orders (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (username),
          users_seller (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logistics orders:', error.message);
      return res.status(500).json({ error: 'Server error fetching orders' });
    }

    // Format the data for the frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      catalog: order.orders?.products?.name || 'Unknown Product',
      buyer: order.orders?.users_buyer?.username || 'Unknown',
      seller: order.orders?.users_seller?.username || 'Unknown',
      status: order.status || 'pending',
      created_at: order.created_at
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching logistics orders:', error.message);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// API ENDPOINT TO GET LOGISTICS TRACKING INFO
app.get('/api/logistics/tracking', async (req, res) => {
  try {
    // Fetch logistics tracking information from Supabase
    const { data: tracking, error } = await supabase
      .from('tracking_info')
      .select(`
        id,
        logistics_order_id,
        tracking_id,
        status,
        updated_at,
        logistics_orders (
          order_id,
          orders (
            products (
              name
            )
          )
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching logistics tracking:', error.message);
      return res.status(500).json({ error: 'Server error fetching tracking' });
    }

    // Format the data for the frontend
    const formattedTracking = tracking.map(track => ({
      id: track.id,
      order: track.logistics_orders?.orders?.products?.name || 'Unknown Order',
      trackingId: track.tracking_id || 'Unknown',
      status: track.status || 'pending',
      updated_at: track.updated_at
    }));

    res.json(formattedTracking);
  } catch (error) {
    console.error('Error fetching logistics tracking:', error.message);
    res.status(500).json({ error: 'Server error fetching tracking' });
  }
});

// API ENDPOINT TO GET CHA SERVICE REQUESTS
app.get('/api/cha/requests', async (req, res) => {
  try {
    // Fetch CHA service requests from Supabase
    const { data: requests, error } = await supabase
      .from('cha_service_requests')
      .select(`
        id,
        product_id,
        buyer_id,
        seller_id,
        status,
        created_at,
        products (
          name
        ),
        users_buyer (username),
        users_seller (username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CHA requests:', error.message);
      return res.status(500).json({ error: 'Server error fetching requests' });
    }

    // Format the data for the frontend
    const formattedRequests = requests.map(request => ({
      id: request.id,
      catalog: request.products?.name || 'Unknown Product',
      buyer: request.users_buyer?.username || 'Unknown',
      seller: request.users_seller?.username || 'Unknown',
      status: request.status || 'pending',
      created_at: request.created_at
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching CHA requests:', error.message);
    res.status(500).json({ error: 'Server error fetching requests' });
  }
});

// API ENDPOINT TO GET CHA FEE OFFERS
app.get('/api/cha/fees', async (req, res) => {
  try {
    // Fetch CHA fee offers from Supabase
    const { data: fees, error } = await supabase
      .from('cha_fee_offers')
      .select(`
        id,
        service_request_id,
        fee_amount,
        currency,
        status,
        created_at,
        cha_service_requests (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (username),
          users_seller (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CHA fees:', error.message);
      return res.status(500).json({ error: 'Server error fetching fees' });
    }

    // Format the data for the frontend
    const formattedFees = fees.map(fee => ({
      id: fee.id,
      catalog: fee.cha_service_requests?.products?.name || 'Unknown Product',
      buyer: fee.cha_service_requests?.users_buyer?.username || 'Unknown',
      seller: fee.cha_service_requests?.users_seller?.username || 'Unknown',
      fee: `${fee.currency} ${fee.fee_amount}` || 'Unknown',
      status: fee.status || 'pending',
      created_at: fee.created_at
    }));

    res.json(formattedFees);
  } catch (error) {
    console.error('Error fetching CHA fees:', error.message);
    res.status(500).json({ error: 'Server error fetching fees' });
  }
});

// API ENDPOINT TO GET CHA WORK ORDERS
app.get('/api/cha/orders', async (req, res) => {
  try {
    // Fetch CHA work orders from Supabase
    const { data: orders, error } = await supabase
      .from('cha_work_orders')
      .select(`
        id,
        service_request_id,
        status,
        created_at,
        cha_service_requests (
          product_id,
          buyer_id,
          seller_id,
          products (
            name
          ),
          users_buyer (username),
          users_seller (username)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching CHA orders:', error.message);
      return res.status(500).json({ error: 'Server error fetching orders' });
    }

    // Format the data for the frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      catalog: order.cha_service_requests?.products?.name || 'Unknown Product',
      buyer: order.cha_service_requests?.users_buyer?.username || 'Unknown',
      seller: order.cha_service_requests?.users_seller?.username || 'Unknown',
      status: order.status || 'pending',
      created_at: order.created_at
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching CHA orders:', error.message);
    res.status(500).json({ error: 'Server error fetching orders' });
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