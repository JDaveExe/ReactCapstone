const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt'); // For password hashing
const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// MySQL connection setup
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'reactcapstone_db',
    port: 3306
});

// Test the MySQL connection
db.connect((err) => {
    if (err) {
        console.error('DB connection failed: ', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Test route
app.get('/', (req, res) => {
    res.send('Backend API running');
});

// Route to handle patient registration with image
app.post('/register', upload.single('image'), (req, res) => {
    const { name, age, contact } = req.body;
    const image = req.file ? req.file.filename : null;

    // SQL query to insert patient data
    const sql = 'INSERT INTO patients (name, age, contact, image) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, age, contact, image], (err, result) => {
        if (err) {
            console.error('Error inserting patient data:', err);
            res.status(500).json({ error: 'Failed to save patient' });
        } else {
            res.status(200).json({ message: 'Patient registered successfully' });
        }
    });
});

// User Registration API endpoint
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // Check if email already exists in the database
    const checkEmailSQL = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailSQL, [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        try {
            // Hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

            const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(sql, [email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error registering user:', err);
                    return res.status(500).json({ message: 'Failed to register user.' });
                }
                return res.status(201).json({ message: 'User registered successfully.' });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            return res.status(500).json({ message: 'Failed to register user.' });
        }
    });
});

// Login API endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Error during login:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        console.log('Query results:', results); // Log query results for debugging

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' }); // User not found
        }

        const user = results[0];

        try {
            // Compare the entered password with the hashed password from the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                console.log('Login successful for user:', user.email); // Log successful login
                // Authentication successful
                return res.status(200).json({ message: 'Login successful', userId: user.id });
            } else {
                console.log('Invalid password attempt for email:', email); // Log failed password attempt
                return res.status(401).json({ message: 'Invalid email or password.' }); // Password doesn't match
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
