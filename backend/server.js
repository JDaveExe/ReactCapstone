const app = require('./index'); // Import the configured app
const port = process.env.PORT || 5000;

// Start server with detailed logging
app.listen(port, () => {
  console.log('=================================');
  console.log(`Server running on http://localhost:${port}`);
  console.log('Available endpoints listed in index.js or routes files.'); // Adjusted log message
  console.log('=================================');
});
