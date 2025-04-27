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

// MySQL connection setup with better error handling
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'project1',
  port: 3307,  // Note: This should match your MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Enhanced connection handling
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    console.error('Error code:', err.code);
    console.error('Please check:');
    console.error('1. Is MySQL running on port 3307? Run XAMPP/MySQL service');
    console.error('2. Are credentials correct?');
    console.error('3. Does database "project1" exist?');
    return;
  }
  console.log('✓ MySQL Connected');
  
  // Once connected, verify that the users table exists
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) NOT NULL,
      middleName VARCHAR(100),
      lastName VARCHAR(100) NOT NULL,
      suffix VARCHAR(10),
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      houseNo VARCHAR(50),
      street VARCHAR(100),
      barangay VARCHAR(100),
      city VARCHAR(50),
      region VARCHAR(50),
      contactNumber VARCHAR(20),
      philHealthNumber VARCHAR(50),
      membershipStatus VARCHAR(20),
      dateOfBirth DATE,
      age INT,
      gender VARCHAR(10),
      civilStatus VARCHAR(20),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err, result) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    console.log('✓ Users table ready');
    
    // Create default admin user if it doesn't exist
    createDefaultAdmin();
  });
});

// Function to create default admin user
const createDefaultAdmin = () => {
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'adminpassword', // In production, use a hashed password
    membershipStatus: 'admin'
  };

  db.query('SELECT id FROM users WHERE email = ?', [adminUser.email], (err, results) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }

    if (results.length === 0) {
      // Admin doesn't exist, create it
      db.query(
        'INSERT INTO users (firstName, lastName, email, password, membershipStatus) VALUES (?, ?, ?, ?, ?)',
        [adminUser.firstName, adminUser.lastName, adminUser.email, adminUser.password, adminUser.membershipStatus],
        (err, result) => {
          if (err) {
            console.error('Error creating admin user:', err);
            return;
          }
          console.log('✓ Default admin user created');
          console.log('   Email: admin@example.com');
          console.log('   Password: adminpassword');
        }
      );
    } else {
      console.log('✓ Admin user already exists');
    }
  });
};

// Add error handler
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
    // Try to reconnect
    setTimeout(() => {
      db.connect();
    }, 2000);
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
    db.query('SHOW TABLES', (err, results) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: err.message,
          code: err.code
        });
      }
      
      res.json({
        status: 'success',
        tables: results.map(r => Object.values(r)[0]),
        message: 'Database connection working'
      });
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
  }
});

// Admin creation endpoint (you may want to secure this in production)
app.post('/api/create-admin', (req, res) => {
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'adminpassword', // In production, use a hashed password
    membershipStatus: 'admin'
  };

  db.query('SELECT id FROM users WHERE email = ?', [adminUser.email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(200).json({ message: 'Admin account already exists' });
    }

    db.query(
      'INSERT INTO users (firstName, lastName, email, password, membershipStatus) VALUES (?, ?, ?, ?, ?)',
      [adminUser.firstName, adminUser.lastName, adminUser.email, adminUser.password, adminUser.membershipStatus],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Admin account created successfully' });
      }
    );
  });
});

// Enhanced registration endpoint with validation and logging
app.post('/api/register', (req, res) => {
  console.log('==== Registration Process Started ====');
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

  console.log('Incoming registration payload:', JSON.stringify({
    ...req.body,
    password: '********' // Mask password in logs
  }));

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'First name, last name, email and password are required'
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    console.log('Invalid email format:', email);
    return res.status(400).json({ 
      error: 'Invalid email format'
    });
  }

  // Check for existing email with improved error handling
  db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ 
        error: 'Database error during email check', 
        details: err.message 
      });
    }

    console.log('Duplicate email check results:', results);

    if (results.length > 0) {
      console.log('Email already registered:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Parse date properly
    let formattedDate = null;
    if (dateOfBirth) {
      try {
        // Try to handle both ISO string and date object formats
        formattedDate = new Date(dateOfBirth);
        if (isNaN(formattedDate.getTime())) {
          console.log('Invalid date format received:', dateOfBirth);
          formattedDate = null;
        } else {
          formattedDate = formattedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          console.log('Formatted date:', formattedDate);
        }
      } catch (e) {
        console.error('Error parsing date:', e);
        formattedDate = null;
      }
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
      password, // In a production environment, this should be hashed
      houseNo || '',
      street || '',
      barangay || '',
      city || '',
      region || '',
      contactNumber || '',
      philHealthNumber || '',
      membershipStatus || '',
      formattedDate, // Use properly formatted date
      age || null,
      gender || '',
      civilStatus || ''
    ];

    console.log('Executing user insertion with values:', values.map((val, i) => 
      i === 5 ? '********' : val)); // Mask password in logs

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        console.error('SQL Error Code:', err.code);
        console.error('SQL Error Number:', err.errno);
        console.error('SQL State:', err.sqlState);
        
        // Handle specific SQL errors
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            error: 'Email already registered',
            details: 'This email address is already in use'
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to register user',
          details: err.message 
        });
      }
      
      console.log('User registered successfully:', email);
      console.log('User ID:', result.insertId);
      console.log('==== Registration Process Completed ====');
      
      res.status(201).json({ 
        message: 'User registered successfully!',
        userId: result.insertId
      });
    });
  });
});

// Enhanced login endpoint with better admin handling
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

    // Improved role determination logic
    let role;
    if (user.membershipStatus?.toLowerCase() === 'admin') {
      role = 'admin';
    } else if (user.membershipStatus?.toLowerCase() === 'member' || 
               user.membershipStatus?.toLowerCase() === 'nonmember') {
      role = 'patient';
    } else {
      role = 'patient'; // Default role
    }

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
  console.log('7. POST http://localhost:5000/api/create-admin');
  console.log('=================================');
});