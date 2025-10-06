const http = require('http');

// Test if JavaScript files are being served correctly
const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/static/js/main.8b5b0229.js',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Check if the response starts with JavaScript code or HTML
    if (data.startsWith('<')) {
      console.log('ERROR: Server returned HTML instead of JavaScript!');
      console.log('First 100 characters:', data.substring(0, 100));
    } else if (data.startsWith('/*!') || data.includes('function') || data.includes('var') || data.includes('const')) {
      console.log('SUCCESS: Server returned JavaScript code');
      console.log('Content length:', data.length);
    } else {
      console.log('UNKNOWN: Response content type unclear');
      console.log('First 100 characters:', data.substring(0, 100));
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();