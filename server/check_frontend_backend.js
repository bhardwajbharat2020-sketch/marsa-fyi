// Test script to check frontend-backend communication for forgot password
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// API endpoint to test forgot password
app.post('/api/auth/forgot-password', express.json(), (req, res) => {
  console.log('Received forgot password request:', req.body);
  
  // Simulate successful response
  res.json({ 
    success: true, 
    message: 'If your email is registered with us, you will receive a password reset link shortly.'
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try accessing: http://localhost:${PORT}/login`);
  console.log('Then click "Forgot Password?" and test the functionality');
});