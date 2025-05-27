const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'project1',
  port: 3306,
  multipleStatements: true
});

async function setupAnalyticsTables() {
  try {
    console.log('Connecting to database...');
    
    // Test connection first
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          console.error('Database connection failed:', err);
          reject(err);
        } else {
          console.log('✓ Connected to database');
          resolve();
        }
      });
    });
      // Define SQL statements directly
    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS medical_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        activity_type ENUM('consultation', 'diagnostic_test', 'medication', 'immunization', 'referral') NOT NULL,
        activity_subtype VARCHAR(255),
        activity_date DATE NOT NULL,
        activity_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_activity_date (activity_date),
        INDEX idx_created_at (created_at)
      )`,
      
      `CREATE TABLE IF NOT EXISTS consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        consultation_type ENUM('General', 'Follow-up', 'Emergency', 'Specialist') DEFAULT 'General',
        chief_complaint TEXT,
        diagnosis TEXT,
        treatment_plan TEXT,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
        consultation_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_consultation_type (consultation_type),
        INDEX idx_status (status),
        INDEX idx_consultation_date (consultation_date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS diagnostic_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        test_type VARCHAR(255) NOT NULL,
        test_name VARCHAR(255) NOT NULL,
        result TEXT,
        status ENUM('ordered', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
        ordered_date DATE NOT NULL,
        completed_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_test_type (test_type),
        INDEX idx_status (status),
        INDEX idx_ordered_date (ordered_date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS medications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        quantity INT,
        prescribed_date DATE NOT NULL,
        duration_days INT,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_medication_name (medication_name),
        INDEX idx_status (status),
        INDEX idx_prescribed_date (prescribed_date)
      )`
    ];
    
    console.log('Creating analytics tables...');
      console.log('Creating analytics tables...');
    
    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      console.log(`Creating table ${i + 1}/${sqlStatements.length}...`);
      await new Promise((resolve, reject) => {
        db.query(sqlStatements[i], (err, result) => {
          if (err) {
            console.error(`Error creating table ${i + 1}:`, err);
            reject(err);
          } else {
            console.log(`✓ Table ${i + 1} created successfully`);
            resolve(result);
          }
        });
      });
    }
    
    // Insert sample data
    console.log('Inserting sample data...');
    const sampleDataQueries = [
      `INSERT IGNORE INTO medical_activities (patient_id, activity_type, activity_subtype, activity_date, description) VALUES
        (1, 'consultation', 'General', CURDATE(), 'Routine checkup'),
        (2, 'diagnostic_test', 'Blood Test', CURDATE(), 'CBC test'),
        (3, 'medication', 'Prescription', CURDATE(), 'Antibiotics prescribed'),
        (1, 'consultation', 'Follow-up', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Follow-up visit'),
        (4, 'diagnostic_test', 'X-Ray', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Chest X-Ray')`,
      
      `INSERT IGNORE INTO consultations (patient_id, consultation_type, chief_complaint, diagnosis, consultation_date) VALUES
        (1, 'General', 'Headache', 'Tension headache', CURDATE()),
        (2, 'Follow-up', 'Diabetes management', 'Type 2 Diabetes', CURDATE()),
        (3, 'Emergency', 'Chest pain', 'Anxiety attack', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
        (4, 'Specialist', 'Back pain', 'Lower back strain', DATE_SUB(CURDATE(), INTERVAL 2 DAY))`,
      
      `INSERT IGNORE INTO diagnostic_tests (patient_id, test_type, test_name, ordered_date, status) VALUES
        (1, 'Blood Test', 'Complete Blood Count', CURDATE(), 'completed'),
        (2, 'Imaging', 'Chest X-Ray', CURDATE(), 'in_progress'),
        (3, 'Blood Test', 'Glucose Test', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'completed'),
        (4, 'Urine Test', 'Urinalysis', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'completed')`,
      
      `INSERT IGNORE INTO medications (patient_id, medication_name, dosage, frequency, quantity, prescribed_date) VALUES
        (1, 'Ibuprofen', '200mg', '3 times daily', 30, CURDATE()),
        (2, 'Metformin', '500mg', '2 times daily', 60, CURDATE()),
        (3, 'Amoxicillin', '250mg', '3 times daily', 21, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
        (4, 'Acetaminophen', '500mg', 'As needed', 20, DATE_SUB(CURDATE(), INTERVAL 2 DAY))`
    ];
    
    for (let i = 0; i < sampleDataQueries.length; i++) {
      await new Promise((resolve, reject) => {
        db.query(sampleDataQueries[i], (err, result) => {
          if (err) {
            console.error(`Error inserting sample data ${i + 1}:`, err);
            reject(err);
          } else {
            console.log(`✓ Sample data ${i + 1} inserted successfully`);
            resolve(result);
          }
        });
      });
    }
    
    // Verify tables were created
    console.log('Verifying tables...');
    const tables = await new Promise((resolve, reject) => {
      db.query('SHOW TABLES', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('Available tables:');
    tables.forEach(table => {
      console.log('- ', Object.values(table)[0]);
    });
    
    console.log('✓ Analytics database setup completed successfully!');
    
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    db.end();
  }
}

// Run the setup
setupAnalyticsTables();
