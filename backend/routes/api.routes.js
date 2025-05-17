const express = require('express');
const router = express.Router();
const db = require('../config/db.config'); // Adjusted path to db.config

// Helper function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Test API endpoint
router.get('/test', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'MySQL connection successful!', result: results[0].solution });
  });
});

// Add diagnostic routes
router.get('/status', (req, res) => {
  res.json({
    server: 'running',
    database: db.state === 'authenticated' ? 'connected' : 'disconnected'
  });
});

router.get('/database-test', async (req, res) => {
  try {
    db.query('SHOW TABLES', (err, results) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: err.message,
          code: err.code
        });
      }
      
      res.json({
        status: 'success',
        tables: results.map(r => Object.values(r)[0]),
        message: 'Database connection working'
      });
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
  }
});

// Admin creation endpoint (you may want to secure this in production)
router.post('/create-admin', (req, res) => {
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'adminpassword', // In production, use a hashed password
    membershipStatus: 'admin'
  };

  db.query('SELECT id FROM users WHERE email = ?', [adminUser.email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(200).json({ message: 'Admin account already exists' });
    }

    db.query(
      'INSERT INTO users (firstName, lastName, email, password, membershipStatus) VALUES (?, ?, ?, ?, ?)',
      [adminUser.firstName, adminUser.lastName, adminUser.email, adminUser.password, adminUser.membershipStatus],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Admin account created successfully' });
      }
    );
  });
});

// Enhanced registration endpoint with validation and logging
router.post('/register', (req, res) => {
  console.log('==== /api/register endpoint hit ====' );
  console.log('Registration payload received:', {
    ...req.body,
    password: '******' // Mask password in logs
  });
  console.log('==== Registration Process Started ====');
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    phoneNumber,
    password,
    houseNo,
    street,
    barangay,
    city,
    region,
    philHealthNumber,
    membershipStatus,
    dateOfBirth,
    age,
    gender,
    civilStatus
  } = req.body;

  console.log('Incoming registration payload:', JSON.stringify({
    ...req.body,
    password: '********' // Mask password in logs
  }));

  // Validate required fields
  if (!firstName || !lastName || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'First name, last name, and password are required'
    });
  }

  // Require at least one of email or phoneNumber
  if (!email && !phoneNumber) {
    console.log('Missing email and phone number');
    return res.status(400).json({
      error: 'Either email or phone number is required'
    });
  }

  // Validate email format if provided
  if (email && !validateEmail(email)) {
    console.log('Invalid email format:', email);
    return res.status(400).json({ 
      error: 'Invalid email format'
    });
  }

  // Validate Philippine phone number if provided
  if (phoneNumber) {
    // Accepts +639XXXXXXXXX or 09XXXXXXXXX
    const phPhoneRegex = /^(\+639|09)\d{9}$/;
    if (!phPhoneRegex.test(phoneNumber)) {
      console.log('Invalid Philippine phone number:', phoneNumber);
      return res.status(400).json({
        error: 'Invalid Philippine phone number format. Use +639XXXXXXXXX or 09XXXXXXXXX.'
      });
    }
  }

  // Check for existing email or phone number
  let checkQuery;
  let checkValues;
  if (email && phoneNumber) {
    checkQuery = 'SELECT id, email, phoneNumber FROM users WHERE email = ? OR phoneNumber = ?';
    checkValues = [email.toLowerCase(), phoneNumber];
  } else if (email) {
    checkQuery = 'SELECT id, email FROM users WHERE email = ?';
    checkValues = [email.toLowerCase()];
  } else {
    checkQuery = 'SELECT id, phoneNumber FROM users WHERE phoneNumber = ?';
    checkValues = [phoneNumber];
  }

  db.query(checkQuery, checkValues, (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ 
        error: 'Database error during user check', 
        details: err.message 
      });
    }

    console.log('Duplicate email/phone check results:', results);

    // Enhanced duplicate check: distinguish between email and phone number
    let duplicateEmail = false;
    let duplicatePhone = false;
    if (results.length > 0) {
      results.forEach(row => {
        if (email && row.email && row.email.toLowerCase() === email.toLowerCase()) duplicateEmail = true;
        if (phoneNumber && row.phoneNumber === phoneNumber) duplicatePhone = true;
      });
    }

    if (duplicateEmail) {
      console.log('Email already registered:', email);
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (duplicatePhone) {
      console.log('Phone number already registered:', phoneNumber);
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    // Parse date properly
    let formattedDate = null;
    if (dateOfBirth) {
      try {
        // Try to handle both ISO string and date object formats
        formattedDate = new Date(dateOfBirth);
        if (isNaN(formattedDate.getTime())) {
          console.log('Invalid date format received:', dateOfBirth);
          formattedDate = null;
        } else {
          formattedDate = formattedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          console.log('Formatted date:', formattedDate);
        }
      } catch (e) {
        console.error('Error parsing date:', e);
        formattedDate = null;
      }
    }

    const query = `INSERT INTO users (
      firstName, middleName, lastName, suffix, email, phoneNumber, password, 
      houseNo, street, barangay, city, region, 
      philHealthNumber, membershipStatus, dateOfBirth, age, gender, civilStatus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      firstName,
      middleName || '',
      lastName,
      suffix || '',
      email ? email.toLowerCase() : null,
      phoneNumber || '',
      password, // In a production environment, this should be hashed
      houseNo || '',
      street || '',
      barangay || '',
      city || '',
      region || '',
      philHealthNumber || '',
      membershipStatus || '',
      formattedDate, // Use properly formatted date
      age || null,
      gender || '',
      civilStatus || ''
    ];

    console.log('Executing user insertion with values:', values.map((val, i) => 
      i === 5 ? '********' : val)); // Mask password in logs

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        console.error('SQL Error Code:', err.code);
        console.error('SQL Error Number:', err.errno);
        console.error('SQL State:', err.sqlState);
        
        // Handle specific SQL errors
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            error: 'Email already registered',
            details: 'This email address is already in use'
          });
        }
        
        return res.status(500).json({ 
          error: 'Failed to register user',
          details: err.message 
        });
      }
      
      console.log('User registered successfully:', email);
      console.log('User ID:', result.insertId);

      // After successful registration, add to unsorted_members with status
      db.query('INSERT INTO unsorted_members (userId, name, status) VALUES (?, ?, ?)', [result.insertId, `${firstName} ${lastName}`, 'unsorted'], (err2) => {
        if (err2) {
          console.error('Error adding to unsorted_members:', err2);
        } else {
          console.log('User added to unsorted_members with status "unsorted"');
        }
      });

      console.log('==== Registration Process Completed ====');
      
      res.status(201).json({ 
        message: 'User registered successfully!',
        userId: result.insertId
      });
    });
  });
});

// Enhanced login endpoint to accept email or phone number for authentication
router.post('/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required' });
  }

  console.log('Login attempt:', { emailOrPhone });

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phoneNumber = ?';

  db.query(query, [emailOrPhone, emailOrPhone], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('User not found for email/phone:', emailOrPhone);
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const user = results[0];

    if (user.password !== password) {
      console.log('Invalid password for user:', emailOrPhone);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', emailOrPhone);

    // Improved role determination logic
    let role;
    if (user.membershipStatus?.toLowerCase() === 'admin') {
      role = 'admin';
    } else if (user.membershipStatus?.toLowerCase() === 'member' || 
               user.membershipStatus?.toLowerCase() === 'nonmember') {
      role = 'patient';
    } else {
      role = 'patient'; // Default role
    }

    // After successful login, create a checkup record for today
    if (role === 'patient') {
      const now = new Date();
      const checkupDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const checkupTime = now.toTimeString().slice(0, 8); // HH:MM:SS
      db.query(
        'INSERT INTO checkup_records (userId, name, checkupDate, checkupTime, purpose, status) VALUES (?, ?, ?, ?, \'\', \'pending\')',
        [user.id, `${user.firstName} ${user.lastName}`, checkupDate, checkupTime],
        (err) => {
          if (err) {
            console.error('Error creating checkup record on login:', err);
          } else {
            console.log('Checkup record created for user login:', user.id);
          }
        }
      );
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: role
      }
    });
  });
});

// Enhanced endpoint to fetch patient name
router.post('/get-patient-name', (req, res) => {
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

// Endpoint to get user details for patient profile
router.post('/get-user-details', (req, res) => {
  const { email } = req.body;
  console.log('Fetching user details for email:', email);

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log('No user found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user data
    const user = results[0];
    
    // Remove sensitive information (like password) before sending
    delete user.password;
    
    console.log('Found user details for profile:', {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim()
    });

    res.status(200).json({ 
      message: 'User details retrieved successfully',
      user: user
    });
  });
});

// Add checkup record on login
router.post('/checkup-login', (req, res) => {
  const { userId, name } = req.body;
  const now = new Date();
  const checkupDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const checkupTime = now.toTimeString().slice(0, 8); // HH:MM:SS
  const query = `INSERT INTO checkup_records (userId, name, checkupDate, checkupTime, purpose, status) VALUES (?, ?, ?, ?, '', 'pending')`;
  db.query(query, [userId, name, checkupDate, checkupTime], (err, result) => {
    if (err) {
      console.error('Error inserting checkup record:', err);
      return res.status(500).json({ error: 'Failed to create checkup record' });
    }
    res.status(201).json({ message: 'Checkup record created' });
  });
});

// Get today's checkup records (for admin)
router.get('/checkup-today', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  db.query('SELECT * FROM checkup_records WHERE checkupDate = ?', [today], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch checkup records' });
    res.json(results);
  });
});

// Get all checkup records (for doctor)
router.get('/checkup-records', (req, res) => {
  db.query('SELECT * FROM checkup_records', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch checkup records' });
    res.json(results);
  });
});

// Doctor updates purpose and marks as done
router.patch('/checkup/:id/purpose', (req, res) => {
  const { id } = req.params;
  const { purpose, status, doctorId } = req.body;
  db.query('UPDATE checkup_records SET purpose = ?, status = ?, doctorId = ? WHERE id = ?', [purpose, status, doctorId, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update checkup record' });
    res.json({ message: 'Checkup record updated' });
  });
});

// Add to unsorted members on registration
router.post('/unsorted', (req, res) => {
  const { userId, name } = req.body;
  db.query('INSERT INTO unsorted_members (userId, name) VALUES (?, ?)', [userId, name], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to add to unsorted members' });
    res.status(201).json({ message: 'Added to unsorted members' });
  });
});

// Get unsorted members
router.get('/unsorted', (req, res) => {
  const query = `
    SELECT 
      um.id AS unsorted_member_id, 
      um.registrationTime, 
      um.status,
      u.id AS userId, 
      u.firstName, 
      u.lastName, 
      u.email, 
      u.phoneNumber 
    FROM unsorted_members um
    JOIN users u ON um.userId = u.id
    WHERE um.status = "unsorted"
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch unsorted members', details: err.message });
    }
    res.json(results);
  });
});

// Assign family and mark as sorted
router.patch('/unsorted/:id/assign-family', (req, res) => {
  const { id } = req.params; // This is unsorted_member_id
  const { familyName: rawFamilyName, sortedBy } = req.body; // familyName is expected, sortedBy is optional
  const familyName = rawFamilyName ? rawFamilyName.trim() : ''; // Trimmed familyName

  if (!familyName || familyName === '') { // Use trimmed familyName for validation
    return res.status(400).json({ error: 'Family name is required.' });
  }

  db.query('SELECT userId FROM unsorted_members WHERE id = ?', [id], (err, umResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error finding unsorted member.', details: err.message });
    }
    if (umResults.length === 0) {
      return res.status(404).json({ error: 'Unsorted member not found.' });
    }
    const userId = umResults[0].userId;

    // Define the function that handles updating user and unsorted_member records
    const updateMemberAndUserRecords = (currentFamilyId) => {
      // Step 1: Update users table
      db.query('UPDATE users SET familyId = ? WHERE id = ?', [currentFamilyId, userId], (userUpdateErr) => {
        if (userUpdateErr) {
          return res.status(500).json({ error: 'Failed to update user record.', details: userUpdateErr.message });
        }

        const finalSortedBy = sortedBy || 'admin'; // Default to 'admin' if not provided
        
        // Step 2: Update unsorted_members table
        db.query(
          'UPDATE unsorted_members SET status = "sorted", familyId = ?, assignedFamily = ?, sortedBy = ?, sortedAt = NOW() WHERE id = ?',
          [currentFamilyId, familyName, finalSortedBy, id],
          (umUpdateErr) => {
            if (umUpdateErr) {
              return res.status(500).json({ error: 'Failed to update unsorted_member record.', details: umUpdateErr.message });
            }
            res.json({ message: 'Family assigned and member sorted successfully' });
          }
        );
      });
    };

    // Find or create family
    db.query('SELECT id FROM families WHERE familyName = ?', [familyName], (famErr, famResults) => {
      if (famErr) {
        return res.status(500).json({ error: 'Database error checking family.', details: famErr.message });
      }

      if (famResults.length > 0) {
        // Family exists
        const existingFamilyId = famResults[0].id;
        updateMemberAndUserRecords(existingFamilyId);
      } else {
        // Family does not exist, create new family
        db.query('INSERT INTO families (familyName) VALUES (?)', [familyName], (newFamErr, newFamResult) => {
          if (newFamErr) {
            return res.status(500).json({ error: 'Database error creating family.', details: newFamErr.message });
          }
          // More robust check for insertId
          if (!newFamResult || typeof newFamResult.insertId !== 'number' || newFamResult.insertId <= 0) {
            return res.status(500).json({ error: 'Failed to get a valid ID for new family.' });
          }
          const newFamilyId = newFamResult.insertId;
          updateMemberAndUserRecords(newFamilyId);
        });
      }
    });
  });
});

// Get all sorted families and their members
router.get('/sorted-families', (req, res) => {
  // First, get all families
  db.query('SELECT id, familyName FROM families', (err, familiesResults) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch families', details: err.message });
    }

    // If no families, return empty array
    if (!familiesResults || familiesResults.length === 0) {
      return res.json([]);
    }

    // Get all users with their family info
    db.query(`
      SELECT 
        u.id, 
        u.firstName, 
        u.lastName, 
        u.familyId,
        CONCAT(u.firstName, ' ', u.lastName) as name
      FROM 
        users u
      WHERE 
        u.familyId IS NOT NULL
    `, (err, usersResults) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users with family data', details: err.message });
      }

      // Create array of family objects with their members
      const familiesWithMembers = familiesResults.map(family => {
        // Find all users belonging to this family
        const familyMembers = usersResults.filter(user => 
          user.familyId === family.id
        );

        return {
          id: family.id, // Ensure family ID is included at the top level of the family object
          familyName: family.familyName,
          members: familyMembers.map(member => ({
            id: member.id,
            name: member.name // This was already correctly concatenating firstName and lastName
          }))
        };
      });

      res.json(familiesWithMembers);
    });
  });
});

// Endpoint to get all registered patients (excluding unsorted ones)
router.get('/patients', (req, res) => {
  const query = `
    SELECT u.*
    FROM users u
    LEFT JOIN unsorted_members um ON u.id = um.userId AND um.status = 'unsorted'
    WHERE um.id IS NULL AND u.membershipStatus != 'admin';
  `;
  // Exclude users with membershipStatus 'admin' as they are not patients

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patients', details: err.message });
    }
    // Remove password before sending
    const patients = results.map(patient => {
      const { password, ...patientWithoutPassword } = patient;
      return patientWithoutPassword;
    });
    res.json(patients);
  });
});

// Endpoint to get all unique family names
router.get('/families', (req, res) => {
  db.query('SELECT id, familyName FROM families ORDER BY familyName ASC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch families' });
    }
    
    // Ensure each family has a numeric ID and proper formatting
    const formattedResults = results.map(f => ({ 
      id: parseInt(f.id, 10), // Ensure ID is a number
      familyName: f.familyName.trim() // Trim any whitespace
    }));
    
    res.json(formattedResults);
  });
});

// Endpoint to get a specific patient by ID
router.get('/patients/:id', (req, res) => {
  const patientId = req.params.id;
  
  const query = `
    SELECT u.*
    FROM users u
    WHERE u.id = ? AND u.membershipStatus != 'admin';
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient', details: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: `Patient with ID ${patientId} not found` });
    }
    
    // Remove password before sending
    const { password, ...patientWithoutPassword } = results[0];
    res.json(patientWithoutPassword);
  });
});

// Endpoint to get members of a specific family by familyId
router.get('/families/:familyId/members', (req, res) => {
  const { familyId } = req.params;

  if (!familyId) {
    return res.status(400).json({ error: 'Family ID is required.' });
  }

  // Convert familyId to a number for comparison (if it's a numeric string)
  const familyIdNum = parseInt(familyId, 10);
  
  // Updated query with better debugging and explicit parameter binding to the right type
  const query = `
    SELECT u.id, u.firstName, u.lastName, u.email, u.phoneNumber, u.membershipStatus, 
           u.familyId, f.familyName, f.id as actualFamilyId
    FROM users u
    JOIN families f ON u.familyId = f.id
    WHERE u.familyId = ?
  `;
  
  db.query(query, [familyIdNum], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error fetching family members.', details: err.message });
    }
    if (results.length === 0) {
      // Check if the family exists
      const familyCheckQuery = `SELECT * FROM families WHERE id = ?`;
      db.query(familyCheckQuery, [familyIdNum], (famErr, famResults) => {
        res.json([]); // Return empty array as no members found
      });
    } else {
      const members = results.map(member => {
        const { password, ...memberWithoutPassword } = member;
        return memberWithoutPassword;
      });
      res.json(members);
    }
  });
});

// Endpoint for Admin to add a new patient and assign to a family directly
router.post('/admin/add-patient', async (req, res) => {
  const {
    firstName, middleName, lastName, suffix, email, phoneNumber, password,
    houseNo, street, barangay, city, region, philHealthNumber,
    membershipStatus, dateOfBirth, age, gender, civilStatus,
    familyName: rawFamilyName // familyName is expected from the frontend
  } = req.body;
  const familyName = rawFamilyName ? rawFamilyName.trim() : ''; // Trimmed familyName

  if (!firstName || !lastName || !password || !membershipStatus || !familyName) { // Use trimmed familyName for validation
    return res.status(400).json({ error: 'Missing required fields: firstName, lastName, password, membershipStatus, or familyName are required.' });
  }
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phone number is required.' });
  }
  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (phoneNumber) {
    const phPhoneRegex = /^(\+639|09)\d{9}$/;
    if (!phPhoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid Philippine phone number format. Use +639XXXXXXXXX or 09XXXXXXXXX.' });
    }
  }

  let checkExistingQuery = 'SELECT id, email, phoneNumber FROM users WHERE';
  const existingParams = [];
  if (email && phoneNumber) {
    checkExistingQuery += ' (LOWER(email) = LOWER(?) OR phoneNumber = ?)';
    existingParams.push(email, phoneNumber);
  } else if (email) {
    checkExistingQuery += ' LOWER(email) = LOWER(?)';
    existingParams.push(email);
  } else {
    checkExistingQuery += ' phoneNumber = ?';
    existingParams.push(phoneNumber);
  }

  db.query(checkExistingQuery, existingParams, (err, existingUserResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error during user check.' });
    }
    if (existingUserResults.length > 0) {
      let msg = '';
      if (email && existingUserResults.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())) {
        msg = 'Email already registered.';
      }
      if (phoneNumber && existingUserResults.some(u => u.phoneNumber === phoneNumber)) {
        msg += (msg ? ' ' : '') + 'Phone number already registered.';
      }
      return res.status(409).json({ error: msg || 'User with this email or phone number already exists.' });
    }

    db.query('SELECT id FROM families WHERE familyName = ?', [familyName], (famErr, famResults) => {
      if (famErr) {
        return res.status(500).json({ error: 'Database error checking family.' });
      }

      const insertUserWithFamily = (family_id) => {
        const formattedDOB = dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null;
        const userQuery = `INSERT INTO users (
            firstName, middleName, lastName, suffix, email, phoneNumber, password,
            houseNo, street, barangay, city, region, philHealthNumber,
            membershipStatus, dateOfBirth, age, gender, civilStatus, familyId 
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const userValues = [
            firstName, middleName || null, lastName, suffix || null, email ? email.toLowerCase() : null,
            phoneNumber || null, password,
            houseNo || null, street || null, barangay || null, city || 'Pasig',
            region || 'Metro Manila', philHealthNumber || null, membershipStatus, formattedDOB, age || null,
            gender || null, civilStatus || null, family_id
        ];

        db.query(userQuery, userValues, (userErr, userResult) => {
          if (userErr) {
            return res.status(500).json({ error: 'Failed to add new patient.', details: userErr.message });
          }
          res.status(201).json({ message: 'Patient added successfully by admin!', userId: userResult.insertId, familyId: family_id });
        });
      };

      if (famResults.length > 0) {
        const familyIdToUse = famResults[0].id;
        insertUserWithFamily(familyIdToUse);
      } else {
        db.query('INSERT INTO families (familyName) VALUES (?)', [familyName], (newFamErr, newFamResult) => {
          if (newFamErr) {
            return res.status(500).json({ error: 'Database error creating family.' });
          }
          const familyIdToUse = newFamResult.insertId;
          insertUserWithFamily(familyIdToUse);
        });
      }
    });
  });
});

// Endpoint to add a new surname (family)
router.post('/add-surname', (req, res) => {
  const { familyName } = req.body;

  if (!familyName || typeof familyName !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing familyName' });
  }

  const query = 'INSERT INTO families (familyName) VALUES (?)';

  db.query(query, [familyName], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add new surname', details: err.message });
    }

    console.log('Insert result:', result); // Debug log to check the insertId
    res.status(201).json({ message: 'New surname added successfully', familyId: result.insertId });
  });
});

// In-memory store for today's check-ups (in production, use a database)
let todaysCheckUps = [];

// In-memory store for session history (replace with database in production)
let sessionHistory = [];

// Endpoint to get today's check-ups
router.get('/checkups/today', (req, res) => {
  res.json(todaysCheckUps);
});

// Endpoint to add a patient to today's check-ups
router.post('/checkups/today', (req, res) => {
  const patientData = req.body;
  
  // Check if patient already exists in list
  if (todaysCheckUps.find(p => p.id === patientData.id)) {
    return res.status(200).json({ message: 'Patient already in check-up list', checkUps: todaysCheckUps });
  }
  
  // Add queue number, status, and login time
  const queueNumber = todaysCheckUps.length + 1;
  const newCheckUp = {
    ...patientData,
    loggedInAt: new Date().toISOString(),
    queueNumber,
    status: 'Waiting',
    purpose: 'Not Specified'
  };
  
  // Add to list
  todaysCheckUps.push(newCheckUp);
  console.log('Added patient to check-up list:', { ...newCheckUp, fullList: todaysCheckUps.length });
  
  res.status(201).json({ message: 'Patient added to check-up list', checkUp: newCheckUp, checkUps: todaysCheckUps });
});

// Endpoint to update a check-up item
router.put('/checkups/today/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const index = todaysCheckUps.findIndex(item => item.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Check-up not found' });
  }
  
  // Update the item
  todaysCheckUps[index] = { ...todaysCheckUps[index], ...updateData };
  console.log('Updated check-up:', todaysCheckUps[index]);
  
  res.json({ message: 'Check-up updated', checkUp: todaysCheckUps[index], checkUps: todaysCheckUps });
});

// Endpoint to clear today's check-ups
router.delete('/checkups/today', (req, res) => {
  todaysCheckUps = [];
  console.log('Cleared all today\'s check-ups.');
  res.status(200).json({ message: 'All today\'s check-ups cleared successfully' });
});

// POST /api/sessionhistory - Add a session to history
router.post('/sessionhistory', (req, res) => {
  try {
    const sessionData = req.body;
    // Basic validation for sessionData
    if (!sessionData || typeof sessionData !== 'object' || Object.keys(sessionData).length === 0) {
      console.error('[API /api/sessionhistory POST] Invalid or empty session data received:', sessionData);
      return res.status(400).json({ message: 'Invalid or empty session data provided.' });
    }

    const newHistoryEntry = {
      ...sessionData,
      historyId: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID for the history entry
      archivedAt: new Date().toISOString() // Timestamp of when it was archived
    };

    sessionHistory.push(newHistoryEntry);
    console.log('[API /api/sessionhistory POST] Session added to history. Total history items:', sessionHistory.length);
    res.status(201).json({ message: 'Session archived successfully', session: newHistoryEntry });
  } catch (error) {
    console.error('[API /api/sessionhistory POST] Error archiving session:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while archiving session.' });
  }
});

// GET /api/sessionhistory - Retrieve all session history
router.get('/sessionhistory', (req, res) => {
  try {
    console.log(`[API /api/sessionhistory GET] Retrieving session history. Total items: ${sessionHistory.length}`);
    res.status(200).json(sessionHistory);
  } catch (error) {
    console.error('[API /api/sessionhistory GET] Error retrieving session history:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while retrieving session history.' });
  }
});

module.exports = router;
