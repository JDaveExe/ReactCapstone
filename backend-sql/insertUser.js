const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'reactcapstone_db',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('DB connection failed: ', err);
        return;
    }

    const password = 'user_password'; // Plain password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }

        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(sql, ['user@example.com', hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
            } else {
                console.log('User inserted successfully:', result);
            }
            db.end(); // Close the connection after the query
        });
    });
});
