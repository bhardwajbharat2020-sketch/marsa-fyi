const http = require('http');

// Test multiple API endpoints
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/health/db', name: 'Database Health Check' },
  { path: '/api/catalogs', name: 'Catalogs' },
  { path: '/api/products', name: 'Products' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: endpoint.path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`\n=== ${endpoint.name} (${endpoint.path}) ===`);
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
          resolve({ endpoint: endpoint.path, status: res.statusCode, success: true });
        } catch (e) {
          console.log('Response (non-JSON):', data);
          resolve({ endpoint: endpoint.path, status: res.statusCode, success: true });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`\n=== ${endpoint.name} (${endpoint.path}) ===`);
      console.error('Error:', error.message);
      resolve({ endpoint: endpoint.path, status: 'ERROR', success: false, error: error.message });
    });

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('Testing API endpoints...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.endpoint}: ${result.status}`);
  });
}

testAllEndpoints();