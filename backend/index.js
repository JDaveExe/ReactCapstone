const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Add basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// MySQL connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'project1',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Enhanced connection handling
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    console.error('Please check:');
    console.error('1. Is MySQL running? Run XAMPP/MySQL service');
    console.error('2. Are credentials correct?');
    console.error('3. Does database exist?');
    return;
  }
  console.log('✓ MySQL Connected');
});

// Add error handler
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Helper function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Test API endpoint
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'MySQL connection successful!', result: results[0].solution });
  });
});

// Add diagnostic routes
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: db.state === 'authenticated' ? 'connected' : 'disconnected'
  });
});

app.get('/api/database-test', async (req, res) => {
  try {
    const [results] = await db.promise().query('SHOW TABLES');
    res.json({
      status: 'success',
      tables: results.map(r => Object.values(r)[0]),
      message: 'Database connection working'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
  }
});

// Enhanced registration endpoint with validation
app.post('/api/register', (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    password,
    houseNo,
    street,
    barangay,
    city,
    region,
    contactNumber,
    philHealthNumber,
    membershipStatus,
    dateOfBirth,
    age,
    gender,
    civilStatus
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'First name, last name, email and password are required'
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format'
    });
  }

  // Check for existing email
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const query = `INSERT INTO users (
      firstName, middleName, lastName, suffix, email, password, 
      houseNo, street, barangay, city, region, contactNumber, 
      philHealthNumber, membershipStatus, dateOfBirth, age, gender, civilStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      firstName,
      middleName || '',
      lastName,
      suffix || '',
      email.toLowerCase(),
      password,
      houseNo || '',
      street || '',
      barangay || '',
      city || '',
      region || '',
      contactNumber || '',
      philHealthNumber || '',
      membershipStatus || 'member',
      dateOfBirth || null,
      age || null,
      gender || '',
      civilStatus || ''
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ 
          error: 'Failed to register user',
          details: err.message 
        });
      }
      
      console.log('User registered successfully:', email);
      res.status(201).json({ 
        message: 'User registered successfully!',
        userId: result.insertId
      });
    });
  });
});

// Enhanced login endpoint with better error handling
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  console.log('Login attempt:', { email });

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const user = results[0];

    if (user.password !== password) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', email);

    const role = user.membershipStatus?.toLowerCase() === 'member' ? 'patient' : 
                user.membershipStatus?.toLowerCase() === 'nonmember' ? 'patient' : 'admin';

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        firstName: user.firstName,
        role: role
      }
    });
  });
});

// Enhanced endpoint to fetch patient name
app.post('/api/get-patient-name', (req, res) => {
  const { email } = req.body;
  console.log('Getting patient name for email:', email);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = 'SELECT firstName FROM users WHERE LOWER(email) = LOWER(?)';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('Get patient name results:', results);

    if (results.length === 0) {
      console.log('No user found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName } = results[0];
    console.log('Found firstName:', firstName);
    res.status(200).json({ firstName });
  });
});

// Start server with detailed logging
app.listen(port, () => {
  console.log('=================================');
  console.log(`Server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('1. GET  http://localhost:5000/api/test');
  console.log('2. GET  http://localhost:5000/api/status');
  console.log('3. GET  http://localhost:5000/api/database-test');
  console.log('4. POST http://localhost:5000/api/register');
  console.log('5. POST http://localhost:5000/api/login');
  console.log('6. POST http://localhost:5000/api/get-patient-name');
  console.log('=================================');
});