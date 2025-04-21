const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost', // change if your DB is hosted elsewhere
  user: 'root',      // change to your MySQL username
  password: '',      // change to your MySQL password
  database: 'project1', // change to your database name
  port: 3307         // change to your MySQL port
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'MySQL connection successful!', result: results[0].solution });
  });
});

// Add a new endpoint for user registration
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

  const query = `INSERT INTO users (
    firstName, middleName, lastName, suffix, email, password, houseNo, street, barangay, city, region, contactNumber, philHealthNumber, membershipStatus, dateOfBirth, age, gender, civilStatus
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
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
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Failed to register user' });
    }
    res.status(201).json({ message: 'User registered successfully!' });
  });
});

// Updated login endpoint with better role mapping
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('Query results:', results); // Log query results

    if (results.length === 0) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const user = results[0];

    // Check if the password matches (in production, use hashed passwords)
    if (user.password !== password) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', email);

    // Map membershipStatus to role: 'member' becomes 'patient', otherwise 'admin'
    const role = user.membershipStatus === 'member' ? 'patient' : 
                (user.membershipStatus === 'nonmember' ? 'patient' : 'admin');

    // Return user data with mapped role
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName, // Also send firstName directly
        role: role
      }
    });
  });
});

// Enhanced endpoint to fetch the patient's first name
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});