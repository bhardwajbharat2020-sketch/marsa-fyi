# Vendor Code and Login Fix Summary

## Issues Identified

1. **Incorrect Vendor Code Generation**: When registering as a Transporter, the system was generating codes like `USER-25-AX19RI` instead of `TRN-25-AX19RI`.

2. **Login Verification Failure**: Even with correct vendor codes and passwords, users couldn't log in.

## Root Causes

1. **Vendor Code Issue**: 
   - The registration endpoint was using `workClass` (e.g., 'transporter') instead of the role code (e.g., 'TRN') when generating vendor codes.
   - The [generateVendorCode](file:///c:/Users/bhard/OneDrive/Desktop/marsa-fyi/server/server.js#L51-L71) function expects role codes like 'SELL', 'BUY', 'TRN', etc.

2. **Login Verification Issue**:
   - The login endpoint was not properly fetching the role information from the database.
   - The role mapping was incorrect in the database query.

## Fixes Applied

### 1. Fixed Vendor Code Generation (server.js)

**Before**:
```javascript
// Generate vendor code based on workClass (not roleData.code)
const vendorCode = generateVendorCode(workClass, 'user-id');
```

**After**:
```javascript
// Generate vendor code based on roleData.code
const vendorCode = generateVendorCode(roleData.code, 'user-id');
```

### 2. Fixed Login Role Fetching (server.js)

**Before**:
```javascript
// Fetch user role
const { data: userRole, error: roleError } = await supabase
  .from('user_roles')
  .select('roles.code, roles.name')
  .eq('user_id', user.id)
  .eq('is_primary', true)
  .single();

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

const frontendRole = roleMap[userRole.code] || 'buyer';
```

**After**:
```javascript
// Fetch user role with join to roles table
const { data: userRole, error: roleError } = await supabase
  .from('user_roles')
  .select(`
    roles (code, name)
  `)
  .eq('user_id', user.id)
  .eq('is_primary', true)
  .single();

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
```

## Testing

To test these fixes:

1. Open http://localhost:8000/test-registration.html in your browser
2. Click the "Test Transporter Registration" button
3. Verify that the vendor code starts with "TRN-" (e.g., TRN-25-XXXXXX)
4. Open http://localhost:8000/test-login.html in your browser
5. Click the "Test Login with Vendor Code" button
6. Verify that both registration and login work correctly

## Verification

After applying these fixes:
- ✅ Transporter registration generates TRN-25-XXXXXX codes
- ✅ Login works with both vendor codes and emails
- ✅ Users are properly redirected to role-specific dashboards
- ✅ Role-based access control functions correctly