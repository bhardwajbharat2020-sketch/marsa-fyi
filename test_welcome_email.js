// Test script to verify welcome email functionality

async function testRegistration() {
  try {
    console.log('Testing registration with welcome email...');
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        workClass: 'buyer'
      }),
    });
    
    const result = await response.json();
    console.log('Registration response:', result);
    
    if (result.success) {
      console.log('Registration successful!');
      console.log('Vendor Code:', result.vendorCode);
    } else {
      console.log('Registration failed:', result.error);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRegistration();