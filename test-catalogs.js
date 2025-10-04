const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCatalogsEndpoint() {
  try {
    console.log('Testing catalogs endpoint...');
    const response = await fetch('http://localhost:5000/api/catalogs');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing catalogs endpoint:', error.message);
  }
}

testCatalogsEndpoint();