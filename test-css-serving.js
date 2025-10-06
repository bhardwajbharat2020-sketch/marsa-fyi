const http = require('http');

// Test if CSS files are being served correctly
const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/static/css/main.cf4721eb.css',
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
    // Check if the response starts with CSS code or HTML
    if (data.startsWith('<')) {
      console.log('ERROR: Server returned HTML instead of CSS!');
      console.log('First 100 characters:', data.substring(0, 100));
    } else if (data.startsWith('/*') || data.includes('{') || data.includes('}') || data.includes(':')) {
      console.log('SUCCESS: Server returned CSS code');
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