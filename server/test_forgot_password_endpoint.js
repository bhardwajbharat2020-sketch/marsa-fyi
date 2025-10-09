// Test script to verify the forgot password endpoint
async function testForgotPasswordEndpoint() {
  console.log('Testing Forgot Password Endpoint\n');
  
  try {
    // Test the forgot password endpoint
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'support@expoimporting.com'
      })
    });
    
    const data = await response.json();
    console.log('Forgot Password Response:', data);
    console.log('Status:', response.status);
    
    if (response.ok && data.success) {
      console.log('\n✅ Forgot password request was successful!');
      console.log('Check your email for the reset link.');
    } else {
      console.log('\n❌ Forgot password request failed.');
    }
  } catch (error) {
    console.error('Error testing forgot password endpoint:', error.message);
  }
}

// Run the test
testForgotPasswordEndpoint();