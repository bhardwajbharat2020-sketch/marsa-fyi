const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegistration() {
  try {
    console.log('Testing registration for transporter...');
    
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'transporter@test.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'Transporter',
        phone: '1234567890',
        workClass: 'transporter'
      }),
    });
    
    const result = await response.json();
    console.log('Registration response:', result);
    
    if (result.vendorCode) {
      console.log('Vendor code generated:', result.vendorCode);
      if (result.vendorCode.startsWith('TRN-')) {
        console.log('✅ SUCCESS: Vendor code format is correct!');
      } else {
        console.log('❌ ERROR: Vendor code format is incorrect!');
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRegistration();