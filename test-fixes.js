// Test script to verify fixes
const http = require('http');

// Test data
const testData = {
  email: 'insurance2@test.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'Insurance',
  phone: '1234567890',
  workClass: 'insurance'
};

// Test registration endpoint
const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
    
    try {
      const result = JSON.parse(chunk);
      console.log('Registration Result:', result);
      
      if (result.vendorCode) {
        console.log('Vendor Code:', result.vendorCode);
        
        if (result.vendorCode.startsWith('INS-')) {
          console.log('✅ SUCCESS: Vendor code format is correct!');
        } else {
          console.log('❌ ERROR: Vendor code format is incorrect!');
          console.log('Expected: INS-XX-XXXXXX');
          console.log('Actual:', result.vendorCode);
        }
      }
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(postData);
req.end();