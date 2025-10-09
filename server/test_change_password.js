// Test script to verify the change password endpoint
async function testChangePassword() {
  console.log('Testing Change Password Endpoint\n');
  
  try {
    // This would normally require authentication, so we'll just test the endpoint exists
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
    
    // Since we don't have a valid auth token, we expect a 401 or 400 error
    if (response.status === 401) {
      console.log('✅ Change password endpoint exists and requires authentication');
    } else if (response.status === 400) {
      console.log('✅ Change password endpoint exists and validates input');
    } else {
      console.log('ℹ️  Change password endpoint response:', response.status);
    }
  } catch (error) {
    console.error('Error testing change password endpoint:', error.message);
  }
}

// Run the test
testChangePassword();