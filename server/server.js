const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL database connection (keeping this for now, but we'll use Supabase)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'marsa_fyi',
  password: 'postgres',
  port: 5432,
});

// Supabase client initialization with your credentials
const supabaseUrl = 'https://ahlsvugsmawpesvftjdh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHN2dWdzbWF3cGVzdmZ0amRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NzA5OSwiZXhwIjoyMDc1MTQzMDk5fQ.RsyriLLCjdSEeDsxPhNLWThyKTntPJYTxS0pl1GmzU0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Marsa FYI server!' });
});

// Get app info
app.get('/api/info', (req, res) => {
  res.json({ 
    name: 'Marsa FYI Creative Web App',
    version: '1.0.0',
    description: 'A creative web application built with React and Node.js'
  });
});

// Get creative ideas
app.get('/api/ideas', (req, res) => {
  const ideas = [
    { id: 1, title: 'Interactive Art Gallery', description: 'Create an online gallery where users can interact with digital art pieces' },
    { id: 2, title: 'Music Visualizer', description: 'Build a tool that creates visualizations based on audio input' },
    { id: 3, title: 'Story Builder', description: 'An app that helps writers create interactive stories' },
    { id: 4, title: 'Virtual Museum Tour', description: 'Create immersive 3D tours of museums and historical sites' }
  ];
  res.json(ideas);
});

// Submit user feedback
app.post('/api/feedback', (req, res) => {
  const { name, email, message } = req.body;
  // In a real app, you would save this to a database
  console.log('Feedback received:', { name, email, message });
  res.json({ success: true, message: 'Thank you for your feedback!' });
});

// API ENDPOINT TO GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    console.log("Attempting to fetch products..."); // A log to see if the endpoint is being hit

    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(name),
                company:companies(name, legal_name),
                origin_port:ports(name),
                currency:currencies(code, symbol)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error.message);
            return res.status(500).json({ error: error.message });
        }
        
        console.log("Successfully fetched products!");
        res.json(data);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

// API ENDPOINT FOR USER REGISTRATION
app.post('/api/register', async (req, res) => {
    console.log("Attempting to register user...");
    console.log("Request body:", req.body);
    
    // 1. Get the user's details from the frontend request
    const { email, password, firstName, lastName, phone, workClass } = req.body;

    // 2. Validate required fields
    if (!email || !password || !firstName || !lastName || !workClass) {
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');
        if (!workClass) missingFields.push('workClass');
        
        return res.status(400).json({ 
            error: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    try {
        // 3. Use Supabase Auth to securely create the user
        console.log("Attempting Supabase signup with email:", email);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone || ''
                }
            }
        });

        if (authError) {
            console.error('Supabase Auth error:', authError.message);
            console.error('Supabase Auth error details:', authError);
            return res.status(400).json({ error: `Registration failed: ${authError.message}` });
        }

        console.log("Supabase signup successful:", authData);

        // 4. Create user in our users table with auto-generated integer ID
        // Only create user in our table if they don't already exist
        let userId;
        if (authData.user) {
            // Check if user already exists in our users table
            const { data: existingUser, error: existingUserError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUserError && existingUserError.code !== 'PGRST116') {
                console.error('Error checking existing user:', existingUserError.message);
                return res.status(400).json({ error: `Error checking existing user: ${existingUserError.message}` });
            }

            if (existingUser) {
                // User already exists in our table
                userId = existingUser.id;
                console.log("User already exists in users table with ID:", userId);
            } else {
                // Create new user in our users table with auto-generated integer ID
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .insert({ 
                        username: email.split('@')[0],
                        email: email,
                        password_hash: password, // In a real app, this should be hashed
                        first_name: firstName,
                        last_name: lastName,
                        phone: phone || '',
                        is_verified: false
                    })
                    .select('id')
                    .single();

                if (userError) {
                    console.error('User creation error:', userError.message);
                    console.error('User creation error details:', userError);
                    // If it's a duplicate email error, try to get the existing user
                    if (userError.code === '23505') { // Unique violation
                        const { data: existingUserData, error: existingUserError2 } = await supabase
                            .from('users')
                            .select('id')
                            .eq('email', email)
                            .single();
                        
                        if (existingUserError2) {
                            return res.status(400).json({ error: `User creation failed: ${userError.message}` });
                        }
                        
                        userId = existingUserData.id;
                        console.log("Found existing user with ID:", userId);
                    } else {
                        return res.status(400).json({ error: `User creation failed: ${userError.message}` });
                    }
                } else {
                    userId = userData.id;
                    console.log("Created new user in users table with ID:", userId);
                }
            }

            // 5. Get the role ID based on workClass
            console.log("Looking up role:", workClass.toLowerCase());
            const { data: roleData, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', workClass.toLowerCase())
                .single();

            if (roleError) {
                console.error('Role lookup error:', roleError.message);
                console.error('Role lookup error details:', roleError);
                return res.status(400).json({ error: `Role lookup failed: ${roleError.message}` });
            }

            console.log("Role found:", roleData);

            // 6. Check if user already has this role
            const { data: existingUserRole, error: existingUserRoleError } = await supabase
                .from('user_roles')
                .select('id')
                .eq('user_id', userId)
                .eq('role_id', roleData.id)
                .single();

            if (existingUserRoleError && existingUserRoleError.code !== 'PGRST116') {
                console.error('Error checking existing user role:', existingUserRoleError.message);
                return res.status(400).json({ error: `Error checking existing user role: ${existingUserRoleError.message}` });
            }

            if (!existingUserRole) {
                // Assign the role to the user
                const { error: userRoleError } = await supabase
                    .from('user_roles')
                    .insert({
                        user_id: userId,
                        role_id: roleData.id,
                        is_primary: true
                    });

                if (userRoleError) {
                    console.error('User role assignment error:', userRoleError.message);
                    console.error('User role assignment error details:', userRoleError);
                    return res.status(400).json({ error: `Role assignment failed: ${userRoleError.message}` });
                }
                console.log("Assigned role to user");
            } else {
                console.log("User already has this role");
            }

            // 7. Generate vendor code
            const vendorCode = generateVendorCode(workClass.toLowerCase());

            console.log("User registered successfully!");
            
            // 8. Send a success message back to the frontend
            res.status(201).json({ 
                message: 'Registration successful! Please check your email for confirmation instructions.',
                user: {
                    id: userId,
                    email: email,
                    first_name: firstName,
                    last_name: lastName
                },
                vendorCode: vendorCode,
                requiresEmailConfirmation: !!authData.user?.identities?.length // True if new user was created
            });
        } else {
            // User already exists but is not confirmed
            console.log("User already exists but needs confirmation");
            res.status(200).json({ 
                message: 'User already registered. Please check your email for confirmation instructions.',
                requiresEmailConfirmation: true
            });
        }
    } catch (error) {
        console.error('Error registering user:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ error: `Server error during registration: ${error.message}` });
    }
});

// MarsaFyi API Routes

// User Authentication
app.post('/api/auth/login', async (req, res) => {
  const { vendorCode, password } = req.body;
  
  try {
    // Using Supabase Auth for login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: vendorCode,
      password: password
    });
    
    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_roles(role:roles(name))
      `)
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      return res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
    
    const userRole = userData.user_roles[0]?.role?.name || 'buyer';
    
    res.json({
      success: true,
      user: {
        vendorCode: data.user.email,
        name: `${userData.first_name} ${userData.last_name}`,
        email: data.user.email,
        role: userRole
      },
      token: data.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Catalog Management - Now fetch from Supabase
app.get('/api/catalogs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        short_description,
        price,
        is_verified,
        company:companies(name),
        origin_port:ports(name),
        category:categories(name)
      `)
      .limit(10);
    
    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    
    const catalogs = data.map(product => ({
      id: product.id,
      title: product.name,
      seller: product.company?.name || '',
      port: product.origin_port?.name || '',
      category: product.category?.name || '',
      description: product.short_description || '',
      price: product.price || 0,
      likes: 0,
      image: '/placeholder.jpg',
      status: product.is_verified ? 'approved' : 'pending'
    }));
    
    res.json(catalogs);
  } catch (error) {
    console.error('Error fetching catalogs:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Role Management
app.get('/api/roles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description');
    
    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    
    const roles = data.map(role => ({
      id: role.name,
      name: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      icon: getRoleIcon(role.name)
    }));
    
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Data
app.get('/api/dashboard/:role', async (req, res) => {
  const { role } = req.params;
  
  try {
    let data = {};
    
    switch(role) {
      case 'seller':
        // Fetch seller's products
        const { data: sellerProducts, error: sellerProductsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            is_verified,
            created_at,
            category:categories(name)
          `)
          .limit(10);
        
        if (sellerProductsError) {
          console.error('Supabase error:', sellerProductsError.message);
          return res.status(500).json({ error: sellerProductsError.message });
        }
        
        // Fetch seller's DPOs (Document of Purchase Orders)
        const { data: sellerDPOs, error: sellerDPOsError } = await supabase
          .from('dpos')
          .select(`
            id,
            product_id,
            buyer_id,
            quantity,
            total_price,
            status,
            created_at
          `)
          .limit(10);
        
        if (sellerDPOsError) {
          console.error('Supabase error:', sellerDPOsError.message);
          return res.status(500).json({ error: sellerDPOsError.message });
        }
        
        data = {
          catalogs: sellerProducts.map(product => ({
            id: product.id,
            title: product.name,
            status: product.is_verified ? 'approved' : 'pending',
            category: product.category?.name || '',
            price: product.price || 0,
            validity: product.created_at,
            views: 0,
            rfqs: 0
          })),
          dpos: sellerDPOs.map(dpo => ({
            id: dpo.id,
            productId: dpo.product_id,
            buyerId: dpo.buyer_id,
            quantity: dpo.quantity,
            totalPrice: dpo.total_price,
            status: dpo.status,
            createdAt: dpo.created_at
          }))
        };
        break;
        
      case 'buyer':
        // Fetch buyer's RFQs (Request for Quotations)
        const { data: buyerRFQs, error: buyerRFQsError } = await supabase
          .from('rfqs')
          .select(`
            id,
            buyer_id,
            product_id,
            quantity,
            specifications,
            status,
            created_at
          `)
          .limit(10);
        
        if (buyerRFQsError) {
          console.error('Supabase error:', buyerRFQsError.message);
          return res.status(500).json({ error: buyerRFQsError.message });
        }
        
        // Fetch buyer's surveys
        const { data: buyerSurveys, error: buyerSurveysError } = await supabase
          .from('dpqs')
          .select(`
            id,
            buyer_id,
            product_id,
            status,
            created_at
          `)
          .limit(10);
        
        if (buyerSurveysError) {
          console.error('Supabase error:', buyerSurveysError.message);
          return res.status(500).json({ error: buyerSurveysError.message });
        }
        
        data = {
          rfqs: buyerRFQs.map(rfq => ({
            id: rfq.id,
            buyerId: rfq.buyer_id,
            productId: rfq.product_id,
            quantity: rfq.quantity,
            specifications: rfq.specifications,
            status: rfq.status,
            createdAt: rfq.created_at
          })),
          surveys: buyerSurveys.map(survey => ({
            id: survey.id,
            buyerId: survey.buyer_id,
            productId: survey.product_id,
            status: survey.status,
            createdAt: survey.created_at
          }))
        };
        break;
        
      default:
        data = {
          message: `Dashboard data for ${role} role`
        };
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Development server: http://localhost:${PORT}`);
});

// Helper functions
function getRoleFromVendorCode(code) {
  if (code.startsWith('S-')) return 'seller';
  if (code.startsWith('B-')) return 'buyer';
  if (code.startsWith('C-')) return 'captain';
  if (code.startsWith('A-')) return 'admin';
  if (code.startsWith('H-')) return 'hr';
  if (code.startsWith('ACC-')) return 'accountant';
  if (code.startsWith('ARB-')) return 'arbitrator';
  if (code.startsWith('SUR-')) return 'surveyor';
  if (code.startsWith('INS-')) return 'insurance';
  if (code.startsWith('TRN-')) return 'transporter';
  if (code.startsWith('LOG-')) return 'logistics';
  if (code.startsWith('CHA-')) return 'cha';
  return 'buyer';
}

function generateVendorCode(role) {
  const rolePrefix = {
    'seller': 'S',
    'buyer': 'B',
    'captain': 'C',
    'admin': 'A',
    'hr': 'H',
    'accountant': 'ACC',
    'arbitrator': 'ARB',
    'surveyor': 'SUR',
    'insurance': 'INS',
    'transporter': 'TRN',
    'logistics': 'LOG',
    'cha': 'CHA'
  };
  
  const prefix = rolePrefix[role] || 'USR';
  const year = new Date().getFullYear().toString().slice(-2);
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${year}-${randomCode}`;
}

function getRoleIcon(roleName) {
  const icons = {
    'seller': '🏪',
    'buyer': '🛒',
    'captain': '👑',
    'admin': '⚙️',
    'hr': '👥',
    'accountant': '💰',
    'arbitrator': '⚖️',
    'surveyor': '🔍',
    'insurance': '🛡️',
    'transporter': '🚚',
    'logistics': '📦',
    'cha': '🏛️'
  };
  
  return icons[roleName] || '👤';
}