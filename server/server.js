// A robust and complete server.js for the Marsa-Fyi application
// Corrected on: Monday, October 6, 2025

// --- 1. INITIALIZATION ---

// CRITICAL FIX: 'path' must be required BEFORE it is used.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
// ... rest of your require statements
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 5001;

// --- 2. MIDDLEWARE CONFIGURATION ---

// Configure multer for handling file uploads (e.g., product images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB limit
  }
});

// Enhanced CORS configuration to allow requests from any origin
// This is suitable for development but might be restricted in production.
app.use(cors({
  origin: true,
  credentials: true,
}));

// Middleware for parsing JSON and URL-encoded data from frontend forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. SUPABASE & JWT SETUP ---

// JWT Secret from environment variables, with a fallback for local dev
const JWT_SECRET = process.env.JWT_SECRET || 'default_super_secret_key_for_development';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use the SERVICE_ROLE key for backend operations

let supabase;
console.log('--- Supabase Initialization ---');
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully.');
  } catch (error) {
    console.error('❌ FATAL: Failed to initialize Supabase client:', error.message);
    // In a real production app, you might want the server to exit if the DB is unavailable.
    // process.exit(1); 
  }
} else {
  console.error('❌ FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in environment variables.');
  console.log('Server cannot connect to the database and will not function correctly.');
}
console.log('-----------------------------');

// --- 4. HELPER FUNCTIONS & AUTHENTICATION MIDDLEWARE ---

// Authentication middleware to protect secure routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token is required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ success: false, error: 'Token is invalid or has expired.' });
    }
    req.user = user; // Add the decoded user payload to the request object
    next();
  });
};

// Function to generate a unique vendor code
const generateVendorCode = (role) => {
    const rolePrefix = (role || 'USER').substring(0, 4).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${rolePrefix}-${year}-${randomPart}`;
};

// --- 5. PUBLIC API ROUTES (No login required) ---

// Health check endpoint to confirm the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ status: 'ERROR', message: 'Supabase client not initialized.' });
    }
    try {
        const { error } = await supabase.from('products').select('id').limit(1);
        if (error) throw error;
        res.status(200).json({ status: 'OK', message: 'Supabase connection successful.' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', message: 'Supabase connection failed.', error: error.message });
    }
});

// Environment variables test endpoint for debugging deployment
app.get('/api/test-env', (req, res) => {
    res.json({
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
        SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
        SUPABASE_KEY_SET: !!process.env.SUPABASE_SERVICE_KEY,
    });
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  console.log('POST /api/register hit with body:', req.body);
  const { email, password, firstName, lastName, phone, workClass } = req.body;

  if (!email || !password || !firstName || !lastName || !phone || !workClass) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  
  try {
    // Use Supabase Auth for user creation and email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: workClass,
        }
      }
    });

    if (authError) {
      // Provide a more user-friendly error for existing users
      if (authError.message.includes('User already registered')) {
        return res.status(409).json({ success: false, error: 'A user with this email already exists.' });
      }
      throw authError;
    }

    if (!authData.user) {
        throw new Error("User registration did not return a user object.");
    }

    // Now, insert into your public 'users' table using the ID from Supabase Auth
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id, // This links your public profile to the secure auth user
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            vendor_code: generateVendorCode(workClass),
        });

    if (profileError) throw profileError;
    
    // You might also want to link the role in a user_roles table here

    res.status(201).json({ success: true, message: 'Registration successful! Please check your email to confirm your account.' });

  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    console.log('POST /api/login hit with body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    try {
        // Authenticate user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        if (!authData.user) {
            throw new Error("Login did not return a user object.");
        }

        // Fetch the user's public profile and role
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select(`
                *,
                user_roles ( roles ( name ) )
            `)
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;
        
        const userRole = userProfile.user_roles[0]?.roles?.name || 'buyer';

        // Generate a JWT token containing user info
        const token = jwt.sign(
            {
                id: userProfile.id,
                email: userProfile.email,
                role: userRole,
                // Add any other claims you need
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Omit sensitive data from the response
        const { password_hash, ...safeUserProfile } = userProfile;
        
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: { ...safeUserProfile, role: userRole },
        });

    } catch (error) {
        console.error('Error during login:', error.message);
        // Provide a generic error message for security
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
});

// Fetch all approved and active products for the shop page
app.get('/api/products', async (req, res) => {
    console.log('GET /api/products called.');
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                description,
                price,
                image_url,
                is_verified,
                categories ( name ),
                users ( vendor_code )
            `)
            .eq('is_active', true)
            .eq('status', 'approved');
        
        if (error) throw error;
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch products.' });
    }
});

// Fetch a single product by ID
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/products/${id} called.`);
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                categories ( name ),
                users ( vendor_code, first_name, last_name )
            `)
            .eq('id', id)
            .eq('is_active', true)
            .eq('status', 'approved')
            .single();

        if (error) throw error;
        
        if (!data) {
            return res.status(404).json({ success: false, error: 'Product not found.' });
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch product details.' });
    }
});

// Fetch all categories
app.get('/api/categories', async (req, res) => {
    console.log('GET /api/categories called.');
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch categories.' });
    }
});


// --- 6. SECURE API ROUTES (Login required) ---

// Example of a protected route
app.get('/api/profile', authenticateToken, async (req, res) => {
    // req.user is available here from the authenticateToken middleware
    const userId = req.user.id;
    console.log(`GET /api/profile called for user ID: ${userId}`);

    try {
        const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        res.status(200).json({ success: true, user: userProfile });
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
    }
});

// Add a new product (for sellers)
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
    const userId = req.user.id;
    console.log(`POST /api/products called by user ID: ${userId}`);
    const { name, description, price, category_id } = req.body;
    
    // Basic validation
    if (!name || !price || !category_id) {
        return res.status(400).json({ success: false, error: 'Name, price, and category are required.' });
    }
    
    try {
        let imageUrl = null;
        if (req.file) {
            const fileName = `${userId}/${uuidv4()}-${req.file.originalname}`;
            const { error: uploadError } = await supabase.storage
                .from('product-images') // Ensure this bucket exists and is public
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                });
            
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
            
            imageUrl = urlData.publicUrl;
        }

        const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert({
                name,
                description,
                price: parseFloat(price),
                category_id: parseInt(category_id),
                seller_id: userId,
                image_url: imageUrl,
                status: 'pending', // New products start as pending approval
            })
            .select()
            .single();
            
        if (insertError) throw insertError;

        res.status(201).json({ success: true, message: 'Product submitted for approval.', product: newProduct });

    } catch (error) {
        console.error('Error adding new product:', error.message);
        res.status(500).json({ success: false, error: 'Failed to add product.' });
    }
});


// --- 7. STATIC FILE SERVING & CATCH-ALL ---

// This section serves the static files from your React app's 'build' folder.
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// The "catch-all" handler: for any request that doesn't match one of the API routes above,
// send back the React app's main index.html file.
// This MUST be the last route in your file.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});


// --- 8. SERVER STARTUP ---

app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});