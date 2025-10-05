// Simple test to check form data handling
const express = require('express');
const multer = require('multer');
const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/test-form', upload.none(), (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  res.json({ received: req.body });
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
});