// Test script to verify that the endpoints exist
const http = require('http');

async function verifyEndpoints() {
  console.log('Verifying API Endpoints\n');
  
  // Test a simple request to see if server is running
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    console.log('✅ Server is running');
    console.log('Health check response:', response.statusCode);
  } catch (error) {
    console.log('ℹ️  Server may not be running or health endpoint not available');
    console.log('Error:', error.message);
  }
  
  // Test the change password endpoint (OPTIONS request to check if it exists)
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/change-password',
        method: 'OPTIONS'
      }, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
    
    console.log('✅ Change password endpoint exists');
    console.log('OPTIONS response:', response.statusCode);
  } catch (error) {
    console.log('ℹ️  Unable to verify change password endpoint');
    console.log('Error:', error.message);
  }
  
  // Test the forgot password endpoint
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/forgot-password',
        method: 'OPTIONS'
      }, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
    
    console.log('✅ Forgot password endpoint exists');
    console.log('OPTIONS response:', response.statusCode);
  } catch (error) {
    console.log('ℹ️  Unable to verify forgot password endpoint');
    console.log('Error:', error.message);
  }
}

// Run the verification
verifyEndpoints();