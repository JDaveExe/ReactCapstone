const mysql = require('mysql2');

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
      db.connect(); // This might need adjustment if db is not in scope or re-initialized elsewhere
    }, 2000);
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

module.exports = db;