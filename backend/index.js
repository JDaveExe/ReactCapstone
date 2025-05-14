const express = require('express');
const cors = require('cors');
const db = require('./config/db.config'); // Import db from config
const apiRoutes = require('./routes/api.routes'); // Import API routes
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

// Add basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api', apiRoutes); // Use API routes

module.exports = app; // Export the app for server.js