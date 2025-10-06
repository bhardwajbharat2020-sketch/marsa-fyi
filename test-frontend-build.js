const fs = require('fs');
const path = require('path');

console.log('Testing frontend build...');

const buildDir = path.join(__dirname, 'client', 'build');
const staticDir = path.join(buildDir, 'static');
const indexPath = path.join(buildDir, 'index.html');

console.log('Build directory:', buildDir);

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('ERROR: Build directory does not exist');
  console.log('Please run "npm run build" in the client directory first');
  process.exit(1);
}

console.log('✓ Build directory exists');

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('ERROR: index.html not found in build directory');
  process.exit(1);
}

console.log('✓ index.html exists');

// Check if static directory exists
if (!fs.existsSync(staticDir)) {
  console.error('ERROR: static directory not found in build directory');
  process.exit(1);
}

console.log('✓ static directory exists');

// Check if CSS and JS directories exist
const cssDir = path.join(staticDir, 'css');
const jsDir = path.join(staticDir, 'js');

if (!fs.existsSync(cssDir)) {
  console.error('ERROR: CSS directory not found in static directory');
  process.exit(1);
}

if (!fs.existsSync(jsDir)) {
  console.error('ERROR: JS directory not found in static directory');
  process.exit(1);
}

console.log('✓ CSS and JS directories exist');

// List files in CSS directory
const cssFiles = fs.readdirSync(cssDir);
console.log('CSS files found:', cssFiles.length);

// List files in JS directory
const jsFiles = fs.readdirSync(jsDir);
console.log('JS files found:', jsFiles.length);

console.log('\n✓ Frontend build test passed! All required files are present.');