const express = require('express');
const path = require('path');
const app = express();

// Test static file serving
const staticPath = path.join(__dirname, '../client/build');
console.log('Static path:', staticPath);
console.log('Static path exists:', require('fs').existsSync(staticPath));

app.use('/static', express.static(path.join(staticPath, 'static')));
app.use(express.static(staticPath));

app.get('/test-static', (req, res) => {
  res.json({
    message: 'Static file serving test',
    staticPath,
    staticPathExists: require('fs').existsSync(staticPath),
    jsFileExists: require('fs').existsSync(path.join(staticPath, 'static/js/main.8b5b0229.js'))
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Static test server running on port ${PORT}`);
});