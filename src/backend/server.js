const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path'); // Import the 'path' module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3307,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('DB connection failed: ', err);
        process.exit(1); // Exit if database connection fails
    } else {
        console.log('Connected to MySQL database:', process.env.DB_NAME);
    }
});

// Basic API route
app.get('/', (req, res) => {
    res.send('Backend API running');
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    console.log('Received data:', req.body); // Debugging

    const {
        lastname, firstname, middleinitial, suffix,
        houseno, street, barangay, municipality, province,
        email, phone_number, dob, age, password,
    } = req.body;

    // Input validation
    if (!lastname || !firstname || !barangay || !municipality || !province || !email || !phone_number || !dob || age === undefined || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if email already exists
        const [results] = await db.promise().query('SELECT email FROM users WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the database
        const insertSQL = `
            INSERT INTO users (
                lastname, firstname, middleinitial, suffix,
                houseno, street, barangay, municipality, province,
                email, phone_number, dob, age, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            lastname, firstname, middleinitial || null, suffix || null,
            houseno || null, street || null, barangay, municipality, province,
            email, phone_number, dob, age, hashedPassword,
        ];

        const [insertResult] = await db.promise().query(insertSQL, values);

        console.log('User registered successfully:', insertResult.insertId);
        return res.status(201).json({ message: 'User registered successfully.', userId: insertResult.insertId });

    } catch (error) {
        console.error('Error during registration process:', error);
        return res.status(500).json({ message: 'Failed to register user due to internal error.' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        const [results] = await db.promise().query('SELECT id, email, password FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            console.log('Login successful for user ID:', user.id);
            return res.status(200).json({ message: 'Login successful', userId: user.id });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

    } catch (error) {
        console.error('Error during login process:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // All other routes should be handled by React Router
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
