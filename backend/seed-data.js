// This script will add some test data to your database
const db = require('./config/db.config');

console.log('Starting database seed process...');

// Create a sample family
function createFamily() {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO families (familyName) VALUES (?) ON DUPLICATE KEY UPDATE familyName = VALUES(familyName)';
    db.query(query, ['Santos Family'], (err, result) => {
      if (err) {
        console.error('Error creating family:', err);
        return reject(err);
      }
      
      console.log('Created Santos family with ID:', result.insertId || 'already exists');
      resolve(result.insertId || 1); // Return ID or assume ID 1 if already exists
    });
  });
}

// Create a sample user in that family
function createFamilyMember(familyId) {
  return new Promise((resolve, reject) => {
    const hashedPassword = '$2a$10$4JVBPvuXnMassM80a/JEG.pXUmEEcAYihdw4xcRRdk2UHQyEw0pxG'; // 'password123'
    
    const user = {
      firstName: 'Juan',
      lastName: 'Santos',
      email: 'juan.santos@example.com',
      phoneNumber: '09123456789',
      password: hashedPassword,
      houseNo: '123',
      street: 'Amang Rodriguez Avenue',
      barangay: 'Manggahan',
      city: 'Pasig',
      region: 'Metro Manila',
      philHealthNumber: 'PH1234567890',
      membershipStatus: 'Member',
      familyId: familyId,
      gender: 'Male',
      civilStatus: 'Married'
    };
    
    // Check if user exists first
    db.query('SELECT * FROM users WHERE email = ?', [user.email], (err, results) => {
      if (err) {
        console.error('Error checking if user exists:', err);
        return reject(err);
      }
      
      if (results.length > 0) {
        console.log('User already exists, updating family ID...');
        db.query('UPDATE users SET familyId = ? WHERE email = ?', [familyId, user.email], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating user:', updateErr);
            return reject(updateErr);
          }
          
          console.log('Updated user Juan Santos with family ID:', familyId);
          resolve(results[0].id);
        });
      } else {
        // Insert new user
        db.query('INSERT INTO users SET ?', user, (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error creating user:', insertErr);
            return reject(insertErr);
          }
          
          console.log('Created user Juan Santos with ID:', insertResult.insertId);
          resolve(insertResult.insertId);
        });
      }
    });
  });
}

// Create a second family
function createSecondFamily() {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO families (familyName) VALUES (?) ON DUPLICATE KEY UPDATE familyName = VALUES(familyName)';
    db.query(query, ['Reyes Family'], (err, result) => {
      if (err) {
        console.error('Error creating family:', err);
        return reject(err);
      }
      
      console.log('Created Reyes family with ID:', result.insertId || 'already exists');
      resolve(result.insertId || 2); // Return ID or assume ID 2 if already exists
    });
  });
}

// Create a sample user in the second family
function createSecondFamilyMember(familyId) {
  return new Promise((resolve, reject) => {
    const hashedPassword = '$2a$10$4JVBPvuXnMassM80a/JEG.pXUmEEcAYihdw4xcRRdk2UHQyEw0pxG'; // 'password123'
    
    const user = {
      firstName: 'Maria',
      lastName: 'Reyes',
      email: 'maria.reyes@example.com',
      phoneNumber: '09123456790',
      password: hashedPassword,
      houseNo: '456',
      street: 'C. Raymundo Avenue',
      barangay: 'Caniogan',
      city: 'Pasig',
      region: 'Metro Manila',
      philHealthNumber: 'PH9876543210',
      membershipStatus: 'Member',
      familyId: familyId,
      gender: 'Female',
      civilStatus: 'Single'
    };
    
    // Check if user exists first
    db.query('SELECT * FROM users WHERE email = ?', [user.email], (err, results) => {
      if (err) {
        console.error('Error checking if user exists:', err);
        return reject(err);
      }
      
      if (results.length > 0) {
        console.log('User already exists, updating family ID...');
        db.query('UPDATE users SET familyId = ? WHERE email = ?', [familyId, user.email], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating user:', updateErr);
            return reject(updateErr);
          }
          
          console.log('Updated user Maria Reyes with family ID:', familyId);
          resolve(results[0].id);
        });
      } else {
        // Insert new user
        db.query('INSERT INTO users SET ?', user, (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error creating user:', insertErr);
            return reject(insertErr);
          }
          
          console.log('Created user Maria Reyes with ID:', insertResult.insertId);
          resolve(insertResult.insertId);
        });
      }
    });
  });
}

// Run the seeding process
async function seedDatabase() {
  try {
    console.log('Creating sample families and members...');
    const familyId = await createFamily();
    await createFamilyMember(familyId);
    
    const secondFamilyId = await createSecondFamily();
    await createSecondFamilyMember(secondFamilyId);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Start seeding process
seedDatabase();
