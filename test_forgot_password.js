// Test script for forgot password functionality
const fetch = require('node-fetch');

async function testForgotPassword() {
  console.log('Testing Forgot Password Functionality\n');
  
  // Test 1: Forgot password with valid email format
  console.log('Test 1: Forgot password with valid email');
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Forgot password with invalid email format
  console.log('Test 2: Forgot password with invalid email');
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Forgot password with missing email
  console.log('Test 3: Forgot password with missing email');
  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Reset password with valid token format (but invalid token)
  console.log('Test 4: Reset password with invalid token');
  try {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid-token',
        newPassword: 'TestPassword123!'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Reset password with missing fields
  console.log('Test 5: Reset password with missing fields');
  try {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'some-token'
        // Missing newPassword
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 6: Reset password with weak password
  console.log('Test 6: Reset password with weak password');
  try {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'some-token',
        newPassword: 'weak'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the tests
testForgotPassword();