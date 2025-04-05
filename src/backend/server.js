const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // If you set a password, add it here
    database: "healthcare_system",
});

db.connect((err) => {
    if (err) {
        console.log("MySQL Connection Error: ", err);
    } else {
        console.log("Connected to MySQL");
    }
});

// Login API Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

        const user = results[0];

        // Compare password with hashed password
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ error: "Error comparing passwords" });
            if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

            // Generate JWT Token
            const token = jwt.sign(
                { id: user.id, role: user.role, name: user.name },
                "your_secret_key", // Change this in production
                { expiresIn: "1h" }
            );

            res.json({ token, role: user.role, name: user.name });
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
