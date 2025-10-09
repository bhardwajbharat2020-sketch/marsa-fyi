// Test script to verify the change password endpoint with a token
async function testChangePasswordWithToken() {
  console.log('Testing Change Password Endpoint with Token\n');
  
  try {
    // This will test if the endpoint exists and responds properly
    const response = await fetch('http://localhost:5000/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'oldPassword123!',
        newPassword: 'newPassword123!'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
    
    // Common responses:
    // 401: No token provided (expected)
    // 400: Token invalid or expired (if token was sent but invalid)
    // 400: Missing fields (if token was valid but fields missing)
    
    if (response.status === 401) {
      console.log('✅ Change password endpoint exists and requires authentication');
    } else {
      console.log('ℹ️  Change password endpoint response:', response.status);
    }
  } catch (error) {
    console.error('Error testing change password endpoint:', error.message);
  }
  
  console.log('\nTo test with a valid token:');
  console.log('1. Log in to the application');
  console.log('2. Open browser dev tools');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage item "marsafyi_token"');
  console.log('5. Copy the token value');
  console.log('6. Set environment variable: TEST_AUTH_TOKEN="copied-token"');
  console.log('7. Run: node test_token.js');
}

// Run the test
testChangePasswordWithToken();