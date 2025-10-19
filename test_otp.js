const http = require('http');

// Test send-otp endpoint
const data = JSON.stringify({email: 'test@example.com'});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();