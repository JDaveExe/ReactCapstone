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
  port: 3306,  // Note: This should match your MySQL port
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
    console.error('1. Is MySQL running on port 3306? Run XAMPP/MySQL service');
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
      phoneNumber VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      houseNo VARCHAR(50),
      street VARCHAR(100),
      barangay VARCHAR(100),
      city VARCHAR(50),
      region VARCHAR(50),
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

  // Table for checkup records
  const createCheckupTable = `
  CREATE TABLE IF NOT EXISTS checkup_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    name VARCHAR(255),
    checkupDate DATE,
    checkupTime TIME,
    purpose VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    doctorId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  db.query(createCheckupTable, (err) => {
    if (err) {
      console.error('Error creating checkup_records table:', err);
    } else {
      console.log('✓ checkup_records table ready');
    }
  });

  // Table for unsorted members
  const createUnsortedTable = `
  CREATE TABLE IF NOT EXISTS unsorted_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    name VARCHAR(255),
    registrationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assignedFamily VARCHAR(255),
    status VARCHAR(50) DEFAULT 'unsorted'
  )`;
  db.query(createUnsortedTable, (err) => {
    if (err) {
      console.error('Error creating unsorted_members table:', err);
    } else {
      console.log('✓ unsorted_members table ready');
    }
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
  console.log('==== /api/register endpoint hit ====' );
  console.log('Registration payload received:', {
    ...req.body,
    password: '******' // Mask password in logs
  });
  console.log('==== Registration Process Started ====');
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    phoneNumber,
    password,
    houseNo,
    street,
    barangay,
    city,
    region,
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
  if (!firstName || !lastName || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'First name, last name, and password are required'
    });
  }

  // Require at least one of email or phoneNumber
  if (!email && !phoneNumber) {
    console.log('Missing email and phone number');
    return res.status(400).json({
      error: 'Either email or phone number is required'
    });
  }

  // Validate email format if provided
  if (email && !validateEmail(email)) {
    console.log('Invalid email format:', email);
    return res.status(400).json({ 
      error: 'Invalid email format'
    });
  }

  // Validate Philippine phone number if provided
  if (phoneNumber) {
    // Accepts +639XXXXXXXXX or 09XXXXXXXXX
    const phPhoneRegex = /^(\+639|09)\d{9}$/;
    if (!phPhoneRegex.test(phoneNumber)) {
      console.log('Invalid Philippine phone number:', phoneNumber);
      return res.status(400).json({
        error: 'Invalid Philippine phone number format. Use +639XXXXXXXXX or 09XXXXXXXXX.'
      });
    }
  }

  // Check for existing email or phone number
  let checkQuery;
  let checkValues;
  if (email && phoneNumber) {
    checkQuery = 'SELECT id, email, phoneNumber FROM users WHERE email = ? OR phoneNumber = ?';
    checkValues = [email.toLowerCase(), phoneNumber];
  } else if (email) {
    checkQuery = 'SELECT id, email FROM users WHERE email = ?';
    checkValues = [email.toLowerCase()];
  } else {
    checkQuery = 'SELECT id, phoneNumber FROM users WHERE phoneNumber = ?';
    checkValues = [phoneNumber];
  }

  db.query(checkQuery, checkValues, (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ 
        error: 'Database error during user check', 
        details: err.message 
      });
    }

    console.log('Duplicate email/phone check results:', results);

    // Enhanced duplicate check: distinguish between email and phone number
    let duplicateEmail = false;
    let duplicatePhone = false;
    if (results.length > 0) {
      results.forEach(row => {
        if (email && row.email && row.email.toLowerCase() === email.toLowerCase()) duplicateEmail = true;
        if (phoneNumber && row.phoneNumber === phoneNumber) duplicatePhone = true;
      });
    }

    if (duplicateEmail) {
      console.log('Email already registered:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (duplicatePhone) {
      console.log('Phone number already registered:', phoneNumber);
      return res.status(409).json({ error: 'Phone number already registered' });
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
      firstName, middleName, lastName, suffix, email, phoneNumber, password, 
      houseNo, street, barangay, city, region, 
      philHealthNumber, membershipStatus, dateOfBirth, age, gender, civilStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      firstName,
      middleName || '',
      lastName,
      suffix || '',
      email ? email.toLowerCase() : null,
      phoneNumber || '',
      password, // In a production environment, this should be hashed
      houseNo || '',
      street || '',
      barangay || '',
      city || '',
      region || '',
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

      // After successful registration, add to unsorted_members
      db.query('INSERT INTO unsorted_members (userId, name) VALUES (?, ?)', [result.insertId, `${firstName} ${lastName}`], (err2) => {
        if (err2) {
          console.error('Error adding to unsorted_members:', err2);
        } else {
          console.log('User added to unsorted_members');
        }
      });

      console.log('==== Registration Process Completed ====');
      
      res.status(201).json({ 
        message: 'User registered successfully!',
        userId: result.insertId
      });
    });
  });
});

// Enhanced login endpoint to accept email or phone number for authentication
app.post('/api/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required' });
  }

  console.log('Login attempt:', { emailOrPhone });

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phoneNumber = ?';

  db.query(query, [emailOrPhone, emailOrPhone], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('User not found for email/phone:', emailOrPhone);
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const user = results[0];

    if (user.password !== password) {
      console.log('Invalid password for user:', emailOrPhone);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', emailOrPhone);

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

    // After successful login, create a checkup record for today
    if (role === 'patient') {
      const now = new Date();
      const checkupDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const checkupTime = now.toTimeString().slice(0, 8); // HH:MM:SS
      db.query(
        'INSERT INTO checkup_records (userId, name, checkupDate, checkupTime, purpose, status) VALUES (?, ?, ?, ?, \'\', \'pending\')',
        [user.id, `${user.firstName} ${user.lastName}`, checkupDate, checkupTime],
        (err) => {
          if (err) {
            console.error('Error creating checkup record on login:', err);
          } else {
            console.log('Checkup record created for user login:', user.id);
          }
        }
      );
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
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

// Add this endpoint to your index.js file, place it after your other API endpoints
// and before the app.listen() section

// Endpoint to get user details for patient profile
app.post('/api/get-user-details', (req, res) => {
  const { email } = req.body;
  console.log('Fetching user details for email:', email);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('No user found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user data
    const user = results[0];
    
    // Remove sensitive information (like password) before sending
    delete user.password;
    
    console.log('Found user details for profile:', {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim()
    });

    res.status(200).json({ 
      message: 'User details retrieved successfully',
      user: user
    });
  });
});

// Add checkup record on login
app.post('/api/checkup-login', (req, res) => {
  const { userId, name } = req.body;
  const now = new Date();
  const checkupDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const checkupTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  const query = `INSERT INTO checkup_records (userId, name, checkupDate, checkupTime, purpose, status) VALUES (?, ?, ?, ?, '', 'pending')`;
  db.query(query, [userId, name, checkupDate, checkupTime], (err, result) => {
    if (err) {
      console.error('Error inserting checkup record:', err);
      return res.status(500).json({ error: 'Failed to create checkup record' });
    }
    res.status(201).json({ message: 'Checkup record created' });
  });
});

// Get today's checkup records (for admin)
app.get('/api/checkup-today', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  db.query('SELECT * FROM checkup_records WHERE checkupDate = ?', [today], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch checkup records' });
    res.json(results);
  });
});

// Get all checkup records (for doctor)
app.get('/api/checkup-records', (req, res) => {
  db.query('SELECT * FROM checkup_records', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch checkup records' });
    res.json(results);
  });
});

// Doctor updates purpose and marks as done
app.patch('/api/checkup/:id/purpose', (req, res) => {
  const { id } = req.params;
  const { purpose, status, doctorId } = req.body;
  db.query('UPDATE checkup_records SET purpose = ?, status = ?, doctorId = ? WHERE id = ?', [purpose, status, doctorId, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update checkup record' });
    res.json({ message: 'Checkup record updated' });
  });
});

// Add to unsorted members on registration
app.post('/api/unsorted', (req, res) => {
  const { userId, name } = req.body;
  db.query('INSERT INTO unsorted_members (userId, name) VALUES (?, ?)', [userId, name], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to add to unsorted members' });
    res.status(201).json({ message: 'Added to unsorted members' });
  });
});

// Get unsorted members
app.get('/api/unsorted', (req, res) => {
  db.query('SELECT * FROM unsorted_members WHERE status = "unsorted"', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch unsorted members' });
    res.json(results);
  });
});

// Assign family and mark as sorted
app.patch('/api/unsorted/:id/assign-family', (req, res) => {
  const { id } = req.params;
  const { assignedFamily } = req.body;
  db.query('UPDATE unsorted_members SET assignedFamily = ?, status = "sorted" WHERE id = ?', [assignedFamily, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to assign family' });
    res.json({ message: 'Family assigned and member sorted' });
  });
});

// Get all sorted families and their members
app.get('/api/sorted-families', (req, res) => {
  db.query('SELECT * FROM unsorted_members WHERE status = "sorted"', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sorted members' });
    // Group by assignedFamily
    const families = {};
    results.forEach(row => {
      if (!families[row.assignedFamily]) {
        families[row.assignedFamily] = [];
      }
      families[row.assignedFamily].push({ id: row.userId, name: row.name });
    });
    // Convert to array
    const familyArr = Object.keys(families).map(famName => ({
      familyName: famName,
      members: families[famName]
    }));
    res.json(familyArr);
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
  console.log('8. POST http://localhost:5000/api/checkup-login');
  console.log('9. GET  http://localhost:5000/api/checkup-today');
  console.log('10. GET  http://localhost:5000/api/checkup-records');
  console.log('11. PATCH http://localhost:5000/api/checkup/:id/purpose');
  console.log('12. POST http://localhost:5000/api/unsorted');
  console.log('13. GET  http://localhost:5000/api/unsorted');
  console.log('14. PATCH http://localhost:5000/api/unsorted/:id/assign-family');
  console.log('15. GET  http://localhost:5000/api/sorted-families');
  console.log('=================================');
});