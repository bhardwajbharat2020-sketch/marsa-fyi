# COMPREHENSIVE SCHEMA IMPLEMENTATION GUIDE

This guide explains how to implement the completely complete database schema for the Marsa FYI application.

## Overview

The completely complete schema includes all tables from previous schemas with enhanced security features and role code storage. It provides a comprehensive foundation for the entire B2B trading platform workflow.

## Key Features

1. **Enhanced Security**
   - Password hashing with bcrypt
   - Account lockout mechanism
   - Password reset functionality
   - Session management
   - Failed login attempt tracking

2. **Role Code Storage**
   - Each role has a unique code (e.g., 'SELL' for seller, 'BUY' for buyer)
   - Vendor codes are generated based on role codes
   - Role-based access control

3. **Complete Workflow Support**
   - Product management
   - RFQ (Request for Quotation) system
   - DPQ (Detailed Product Quotation) system
   - DPO (Detailed Product Order) system
   - Order management
   - Invoice and payment processing
   - Dispute resolution
   - Survey management
   - Insurance services
   - Transportation and logistics
   - Customs House Agent (CHA) services

## Implementation Steps

### 1. Database Setup

1. Create a new Supabase project
2. Execute the `completely_complete_schema.sql` file in your Supabase SQL editor
3. Verify all tables and relationships are created correctly

### 2. Environment Configuration

Update your `.env` file with your Supabase credentials:

```
SUPABASE_URL=https://yuphowxgoxienbnwcgra.supabase.co
SUPABASE_KEY=your_supabase_key
```

### 3. Server Configuration

Ensure your server.js file includes the password validation and bcrypt functionality:

```javascript
const bcrypt = require('bcrypt');
const { validatePassword } = require('./password_validation');

// Registration endpoint with enhanced security
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, workClass } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !workClass) {
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
    
    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }
    
    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, code')
      .eq('name', workClass)
      .single();
    
    if (roleError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified' 
      });
    }
    
    // Generate vendor code based on role code
    const vendorCode = generateVendorCode(roleData.code, 'user-id');
    
    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        username: email.split('@')[0],
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        is_verified: false,
        vendor_code: vendorCode
      })
      .select()
      .single();
    
    if (userError) {
      return res.status(400).json({ 
        success: false, 
        error: userError.message 
      });
    }
    
    // Assign role to user
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.id,
        role_id: roleData.id,
        is_primary: true
      });
    
    if (userRoleError) {
      return res.status(400).json({ 
        success: false, 
        error: userRoleError.message 
      });
    }
    
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

// Login endpoint with enhanced security
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
    
    // Get user data by vendor code
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
      .eq('vendor_code', vendorCode)
      .single();
    
    if (userError || !userData) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Check if account is locked
    if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is locked. Please try again later.' 
      });
    }
    
    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = (userData.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      
      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      
      await supabase
        .from('users')
        .update({ 
          failed_login_attempts: failedAttempts,
          locked_until: lockedUntil
        })
        .eq('id', userData.id);
      
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Reset failed login attempts on successful login
    await supabase
      .from('users')
      .update({ 
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date()
      })
      .eq('id', userData.id);
    
    // Get primary role
    const primaryRole = userData.user_roles[0]?.roles?.name || 'buyer';
    
    res.json({ 
      success: true, 
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        role: primaryRole,
        vendorCode: userData.vendor_code
      },
      token: 'jwt-token-placeholder'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});
```

### 4. Password Validation

The password validation function ensures strong passwords:

```javascript
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
```

## Vendor Code Generation

Vendor codes are automatically generated based on role codes:
- Seller: SELL-23-ABC123
- Buyer: BUY-23-DEF456
- Captain: CAPT-23-GHI789
- Admin: ADM-23-JKL012
- And so on...

## Security Features

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one special character
   - At least one digit

2. **Account Protection**
   - Failed login attempt tracking
   - Automatic account lockout after 5 failed attempts
   - Account unlock after 30 minutes

3. **Password Management**
   - Secure hashing with bcrypt
   - Password reset functionality
   - Session management

## Workflow Tables

The schema includes all necessary tables for the complete B2B trading workflow:
- Products and categories
- RFQs, DPQs, and DPOs
- Orders, invoices, and payments
- Disputes and evidence requests
- Surveys and reports
- Insurance policies and requests
- Transportation and logistics
- Customs services
- User management and roles
- Notifications and issues

## Testing

After implementing the schema:

1. Run the server and verify database connection
2. Test user registration with various password combinations
3. Test login with valid and invalid credentials
4. Verify account lockout functionality
5. Test all workflow endpoints
6. Verify vendor code generation

## Maintenance

Regular maintenance tasks:
1. Monitor failed login attempts
2. Review account lockouts
3. Update user roles as needed
4. Monitor database performance
5. Backup database regularly

This completely complete schema provides a robust foundation for your B2B trading platform with enhanced security and comprehensive workflow support.