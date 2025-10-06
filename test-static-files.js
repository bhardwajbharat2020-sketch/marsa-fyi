const http = require('http');
const fs = require('fs');
const path = require('path');

// Test static file serving
const testFiles = [
  { path: '/manifest.json', name: 'Manifest File' },
  { path: '/favicon.ico', name: 'Favicon' }
];

function testStaticFile(file) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: file.path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`\n=== ${file.name} (${file.path}) ===`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length'] || 'Unknown'}`);
      
      // For manifest.json, try to parse it
      if (file.path === '/manifest.json' && res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            console.log('Manifest parsed successfully');
            console.log('Short name:', jsonData.short_name);
            console.log('Icons count:', jsonData.icons ? jsonData.icons.length : 0);
            resolve({ file: file.path, status: res.statusCode, success: true });
          } catch (e) {
            console.log('Error parsing manifest:', e.message);
            resolve({ file: file.path, status: res.statusCode, success: false, error: 'Invalid JSON' });
          }
        });
      } else {
        // Just check that we get a response
        res.on('data', () => {}); // Consume the data
        res.on('end', () => {
          resolve({ file: file.path, status: res.statusCode, success: res.statusCode === 200 });
        });
      }
    });

    req.on('error', (error) => {
      console.error(`\n=== ${file.name} (${file.path}) ===`);
      console.error('Error:', error.message);
      resolve({ file: file.path, status: 'ERROR', success: false, error: error.message });
    });

    req.end();
  });
}

async function testAllStaticFiles() {
  console.log('Testing static file serving...\n');
  
  // First check if build files exist
  const buildDir = path.join(__dirname, 'client', 'build');
  if (!fs.existsSync(buildDir)) {
    console.error('ERROR: Build directory not found. Please run "npm run build" in the client directory first.');
    return;
  }
  
  const manifestPath = path.join(buildDir, 'manifest.json');
  const faviconPath = path.join(buildDir, 'favicon.ico');
  
  console.log('Checking build directory files:');
  console.log('- manifest.json:', fs.existsSync(manifestPath) ? 'FOUND' : 'MISSING');
  console.log('- favicon.ico:', fs.existsSync(faviconPath) ? 'FOUND' : 'MISSING');
  
  const results = [];
  for (const file of testFiles) {
    const result = await testStaticFile(file);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  results.forEach(result => {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.file}: ${result.status}`);
  });
  
  const allSuccess = results.every(r => r.success);
  console.log(`\nOverall result: ${allSuccess ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
}

testAllStaticFiles();