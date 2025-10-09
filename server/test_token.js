// Test script to check if the auth token is valid
const jwt = require('jsonwebtoken');

// JWT secret (same as in server.js)
const JWT_SECRET = process.env.JWT_SECRET || 'marsafyi_jwt_secret';

function testToken() {
  console.log('Testing Auth Token\n');
  
  // Get token from localStorage file or environment
  const token = process.env.TEST_AUTH_TOKEN;
  
  if (!token) {
    console.log('No token provided. Please set TEST_AUTH_TOKEN environment variable.');
    console.log('Example usage:');
    console.log('  TEST_AUTH_TOKEN="your-jwt-token-here" node test_token.js');
    return;
  }
  
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 20) + '...');
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token is valid');
    console.log('User ID:', decoded.id);
    console.log('Email:', decoded.email);
    console.log('Role:', decoded.role);
    console.log('Vendor Code:', decoded.vendor_code);
    console.log('Issued at:', new Date(decoded.iat * 1000));
    console.log('Expires at:', new Date(decoded.exp * 1000));
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    console.log('Expires in:', Math.floor(expiresIn / 3600), 'hours', Math.floor((expiresIn % 3600) / 60), 'minutes');
    
    if (expiresIn < 0) {
      console.log('❌ Token has expired');
    } else if (expiresIn < 3600) {
      console.log('⚠️  Token expires soon (less than 1 hour)');
    } else {
      console.log('✅ Token is valid and not expiring soon');
    }
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log('Reason: Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Reason: Token is invalid');
    }
  }
}

testToken();