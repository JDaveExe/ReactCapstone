-- Analytics Tables for Healthcare Dashboard
-- Run this SQL script to create analytics tracking tables

-- Table to track all medical activities
CREATE TABLE IF NOT EXISTS medical_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    activity_type ENUM('consultation', 'diagnostic_test', 'medication', 'immunization', 'referral') NOT NULL,
    activity_subtype VARCHAR(255), -- e.g., 'RAPID COVID/HEP/STI', 'COMPLETE BLOOD COUNT'
    activity_date DATE NOT NULL,
    activity_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    doctor_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_date (activity_date),
    INDEX idx_activity_type (activity_type),
    INDEX idx_patient_id (patient_id)
);

-- Table to track consultations specifically
CREATE TABLE IF NOT EXISTS consultations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    consultation_type VARCHAR(100), -- e.g., 'General', 'Follow-up', 'Emergency'
    diagnosis TEXT,
    treatment_plan TEXT,
    consultation_date DATE NOT NULL,
    consultation_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('completed', 'in_progress', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_consultation_date (consultation_date),
    INDEX idx_patient_id (patient_id)
);

-- Table to track diagnostic tests
CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    test_type VARCHAR(255) NOT NULL, -- e.g., 'RAPID COVID/HEP/STI', 'COMPLETE BLOOD COUNT'
    test_result TEXT,
    test_date DATE NOT NULL,
    test_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    ordered_by INT, -- doctor_id
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_test_date (test_date),
    INDEX idx_test_type (test_type),
    INDEX idx_patient_id (patient_id)
);

-- Table to track medications
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_date DATE NOT NULL,
    prescribed_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    prescribed_by INT, -- doctor_id
    duration_days INT,
    status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prescribed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prescribed_date (prescribed_date),
    INDEX idx_medication_name (medication_name),
    INDEX idx_patient_id (patient_id)
);

-- Insert some sample data for testing
INSERT INTO medical_activities (patient_id, activity_type, activity_subtype, activity_date, doctor_id) VALUES
-- Recent consultations
(1, 'consultation', 'General Checkup', CURDATE(), 2),
(3, 'consultation', 'Follow-up', CURDATE() - INTERVAL 1 DAY, 2),
(5, 'consultation', 'Emergency', CURDATE() - INTERVAL 2 DAY, 2),
(7, 'consultation', 'General Checkup', CURDATE() - INTERVAL 3 DAY, 2),

-- Diagnostic tests
(1, 'diagnostic_test', 'RAPID COVID/HEP/STI', CURDATE(), 2),
(3, 'diagnostic_test', 'COMPLETE BLOOD COUNT', CURDATE() - INTERVAL 1 DAY, 2),
(5, 'diagnostic_test', 'HEMOGLOBIN A1C', CURDATE() - INTERVAL 2 DAY, 2),
(7, 'diagnostic_test', 'URINALYSIS', CURDATE() - INTERVAL 3 DAY, 2),
(1, 'diagnostic_test', 'OBSTETRICS PA GENES', CURDATE() - INTERVAL 4 DAY, 2),

-- Medications
(1, 'medication', 'LANOXIN 200 MCG/MSAL', CURDATE(), 2),
(3, 'medication', 'METOPROLOL (BETALOC/LOPRESOR)', CURDATE() - INTERVAL 1 DAY, 2),
(5, 'medication', 'FERROUS SULFATE', CURDATE() - INTERVAL 2 DAY, 2),
(7, 'medication', 'CEFUROXIME 125', CURDATE() - INTERVAL 3 DAY, 2),
(1, 'medication', 'ASCORBIC ACID (CLAVULANIC ACID)', CURDATE() - INTERVAL 4 DAY, 2);

-- Insert corresponding detailed records
INSERT INTO consultations (patient_id, doctor_id, consultation_type, consultation_date) VALUES
(1, 2, 'General Checkup', CURDATE()),
(3, 2, 'Follow-up', CURDATE() - INTERVAL 1 DAY),
(5, 2, 'Emergency', CURDATE() - INTERVAL 2 DAY),
(7, 2, 'General Checkup', CURDATE() - INTERVAL 3 DAY);

INSERT INTO diagnostic_tests (patient_id, test_type, test_date, ordered_by) VALUES
(1, 'RAPID COVID/HEP/STI', CURDATE(), 2),
(3, 'COMPLETE BLOOD COUNT', CURDATE() - INTERVAL 1 DAY, 2),
(5, 'HEMOGLOBIN A1C', CURDATE() - INTERVAL 2 DAY, 2),
(7, 'URINALYSIS', CURDATE() - INTERVAL 3 DAY, 2),
(1, 'OBSTETRICS PA GENES', CURDATE() - INTERVAL 4 DAY, 2);

INSERT INTO medications (patient_id, medication_name, prescribed_date, prescribed_by) VALUES
(1, 'LANOXIN 200 MCG/MSAL', CURDATE(), 2),
(3, 'METOPROLOL (BETALOC/LOPRESOR)', CURDATE() - INTERVAL 1 DAY, 2),
(5, 'FERROUS SULFATE', CURDATE() - INTERVAL 2 DAY, 2),
(7, 'CEFUROXIME 125', CURDATE() - INTERVAL 3 DAY, 2),
(1, 'ASCORBIC ACID (CLAVULANIC ACID)', CURDATE() - INTERVAL 4 DAY, 2);
