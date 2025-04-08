// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword', // Replace with your MySQL password
  database: 'yourdatabase'  // Replace with your MySQL database name
});

// Make sure the connection is successful
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

module.exports = connection;
