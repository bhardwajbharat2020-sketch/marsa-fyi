// Script to fix all remaining vendor_code references in server.js
const fs = require('fs');

// Read the server.js file
const filePath = './server/server.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all the query parts (replace vendor_code with username in select queries)
content = content.replace(/users\s*\(\s*vendor_code\s*\)/g, 'users (username)');
content = content.replace(/users_buyer\s*\(\s*vendor_code\s*\)/g, 'users_buyer (username)');
content = content.replace(/users_seller\s*\(\s*vendor_code\s*\)/g, 'users_seller (username)');

// Fix all the formatted data parts (replace vendor_code with username in formatted data)
content = content.replace(/\.vendor_code/g, '.username');

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('All vendor_code references have been updated to username in server.js');