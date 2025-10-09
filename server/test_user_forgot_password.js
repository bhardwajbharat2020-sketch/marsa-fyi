// Test script to simulate a real user forgot password flow
async function testUserForgotPassword() {
  console.log('Testing User Forgot Password Flow\n');
  
  try {
    console.log('1. Testing forgot password request...');
    
    // Test the forgot password endpoint with a real email
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bhardwaj.pankaj9999@gmail.com' // Your test email
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    console.log('Status:', response.status);
    
    if (response.ok && data.success) {
      console.log('\n✅ Forgot password request was successful!');
      console.log('Check your email (bhardwaj.pankaj9999@gmail.com) for the reset link.');
    } else {
      console.log('\n❌ Forgot password request failed.');
      console.log('Error:', data.error);
    }
    
    // Also test with the support email
    console.log('\n2. Testing forgot password request with support email...');
    const response2 = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'support@expoimporting.com'
      })
    });
    
    const data2 = await response2.json();
    console.log('Response:', data2);
    console.log('Status:', response2.status);
    
  } catch (error) {
    console.error('Error testing forgot password flow:', error.message);
  }
}

// Run the test
testUserForgotPassword();