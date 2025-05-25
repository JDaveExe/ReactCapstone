const express = require('express');
const router = express.Router();
const db = require('../config/db.config'); // Adjusted path to db.config
const fs = require('fs');
const path = require('path');

// Define paths for persistent storage files
const DATA_DIR = path.join(__dirname, '..', 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const TODAYS_CHECKUPS_FILE = path.join(DATA_DIR, 'todaysCheckups.json');
const SESSION_HISTORY_FILE = path.join(DATA_DIR, 'sessionHistory.json');
const VITAL_SIGNS_FILE = path.join(DATA_DIR, 'vitalSigns.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files on startup
function loadDataFromFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return defaultValue;
}

// Save data to file
function saveDataToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
}

// Users data file path
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');

// Function to check and process appointments for today
function processAppointmentsForToday() {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    console.log(`[API] Checking for appointments scheduled for today: ${today}`);
    
    const scheduledAppointments = loadDataFromFile(APPOINTMENTS_FILE, []);
    const todaysCheckUps = loadDataFromFile(TODAYS_CHECKUPS_FILE, []);
    
    // Find appointments scheduled for today
    const todayAppointments = scheduledAppointments.filter(app => app.date === today);
    
    if (todayAppointments.length === 0) {
      console.log('[API] No appointments found for today.');
      return;
    }
    
    console.log(`[API] Found ${todayAppointments.length} appointments for today.`);
    
    // Check if appointments are already in today's check-ups
    let updatedCheckUps = [...todaysCheckUps];
    let changes = false;
    
    for (const appointment of todayAppointments) {
      const alreadyInList = updatedCheckUps.some(checkup => 
        checkup.appointmentId === appointment.id || 
        (checkup.name === appointment.patientName && 
         checkup.scheduledTime === appointment.time)
      );
      
      if (!alreadyInList) {
        // Add to today's check-ups
        const newCheckUp = {
          id: `appointment_${appointment.id}`,
          appointmentId: appointment.id,
          name: appointment.patientName,
          familyName: appointment.familyName || '',
          purpose: appointment.purpose || 'Not Specified',
          scheduledTime: appointment.time,
          loggedInAt: new Date().toISOString(),
          queueNumber: updatedCheckUps.length + 1,
          status: 'Waiting'
        };
        
        updatedCheckUps.push(newCheckUp);
        changes = true;
        console.log(`[API] Added appointment for ${appointment.patientName} to today's check-ups.`);
      }
    }
    
    if (changes) {
      saveDataToFile(TODAYS_CHECKUPS_FILE, updatedCheckUps);
      console.log('[API] Updated today\'s check-ups with scheduled appointments.');
    }
  } catch (error) {
    console.error('[API] Error processing appointments for today:', error);
  }
}

// Add this to the top of api.routes.js after other functions

// Check if today's checkups should be reset based on date
function shouldResetCheckups() {
  try {
    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we have data for a previous date
    if (todaysCheckUps.length > 0) {
      // Get date from first checkup (assumes all checkups are from same day)
      const checkupDate = new Date(todaysCheckUps[0].loggedInAt).toISOString().split('T')[0];
        // If the dates don't match, we should reset
      if (checkupDate !== today) {
        console.log(`[API] Detected date change from ${checkupDate} to ${today}. Resetting checkups.`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('[API] Error checking if checkups should reset:', error);
    return false;
  }
}

// Function to reset today's checkups
function resetTodaysCheckups() {
  try {
    console.log("[API] Resetting today's checkups for new day");
    
    // Create backup of previous day's data
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const backupFile = path.join(DATA_DIR, `todaysCheckups.${timestamp}.bak.json`);
    saveDataToFile(backupFile, todaysCheckUps);
    
    // Reset to empty array
    todaysCheckUps = [];
    saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
    
    // Process today's appointments
    processAppointmentsForToday();
    
    console.log('[API] Successfully reset checkups for new day');
    return true;
  } catch (error) {
    console.error('[API] Error resetting checkups:', error);
    return false;
  }
}

// In-memory storage for data
let scheduledAppointments = loadDataFromFile(APPOINTMENTS_FILE);
let todaysCheckUps = loadDataFromFile(TODAYS_CHECKUPS_FILE);
let sessionHistory = loadDataFromFile(SESSION_HISTORY_FILE, []);

// Add reset check after loading todaysCheckUps
console.log('[API] Checking if checkups need to be reset...');
if (shouldResetCheckups()) {
  resetTodaysCheckups();
}

// Endpoint to get all scheduled appointments
router.get('/appointments', (req, res) => {
  res.json(scheduledAppointments);
});

// Endpoint to add a new scheduled appointment
router.post('/appointments', (req, res) => {
  const appointmentData = req.body;
  
  if (!appointmentData.id) {
    appointmentData.id = Date.now().toString(); // Generate a unique ID
  }
  
  // Check if appointment already exists
  const existingIndex = scheduledAppointments.findIndex(a => a.id === appointmentData.id);
  if (existingIndex !== -1) {
    // Update existing appointment
    scheduledAppointments[existingIndex] = appointmentData;
    saveDataToFile(APPOINTMENTS_FILE, scheduledAppointments);
    return res.json({ 
      message: 'Appointment updated successfully', 
      appointment: appointmentData,
      appointments: scheduledAppointments
    });
  }
  
  // Add new appointment
  scheduledAppointments.push(appointmentData);
  saveDataToFile(APPOINTMENTS_FILE, scheduledAppointments);
  
  res.status(201).json({ 
    message: 'Appointment scheduled successfully', 
    appointment: appointmentData,
    appointments: scheduledAppointments
  });
});

// Endpoint to delete a scheduled appointment
router.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;
  
  const index = scheduledAppointments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  
  const deletedAppointment = scheduledAppointments[index];
  scheduledAppointments.splice(index, 1);
  saveDataToFile(APPOINTMENTS_FILE, scheduledAppointments);
  
  res.json({ 
    message: 'Appointment deleted successfully', 
    appointment: deletedAppointment,
    appointments: scheduledAppointments
  });
});

// Endpoint to get today's check-ups
router.get('/checkups/today', (req, res) => {
  res.json(todaysCheckUps);
});

// Endpoint to reset today's check-ups
router.post('/checkups/today/reset', (req, res) => {
  try {
    // Create backup of current data
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(DATA_DIR, `todaysCheckups.manual_reset.${timestamp}.bak.json`);
    saveDataToFile(backupFile, todaysCheckUps);
    console.log(`[API] Manual reset triggered. Backup saved to ${backupFile}`);
    
    // Reset to empty array
    todaysCheckUps = [];
    
    // Process today's appointments to re-populate the list
    processAppointmentsForToday();
    
    // Save the updated list
    saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
    
    res.status(200).json({ 
      message: 'Today\'s check-ups reset successfully',
      checkUps: todaysCheckUps
    });
  } catch (error) {
    console.error('[API] Error during check-ups reset:', error);
    res.status(500).json({ message: 'Error resetting check-ups', error: error.toString() });
  }
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
  saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
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
  saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
  console.log('Updated check-up:', todaysCheckUps[index]);
  
  res.json({ message: 'Check-up updated', checkUp: todaysCheckUps[index], checkUps: todaysCheckUps });
});
// Endpoint to clear today's check-ups
router.delete('/checkups/today', (req, res) => {
  todaysCheckUps = [];
  saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
  console.log('Cleared all today\'s check-ups.');
  res.status(200).json({ message: 'All today\'s check-ups cleared successfully' });
});

// GET /api/sessionhistory - Retrieve session history
router.get('/sessionhistory', (req, res) => {
  try {
    console.log('[API GET /sessionhistory] Retrieving session history');
    res.json(sessionHistory);
  } catch (error) {
    console.error('[API GET /sessionhistory] Error:', error);
    res.status(500).json({ message: 'Failed to retrieve session history', error: error.message });
  }
});

// POST /api/sessionhistory - Add a session to history
router.post('/sessionhistory', (req, res) => {
  try {    const sessionData = req.body;
    if (!sessionData || typeof sessionData !== 'object' || Object.keys(sessionData).length === 0) {
      console.error('[API /api/sessionhistory POST] Invalid or empty session data received:', sessionData);
      return res.status(400).json({ message: 'Invalid or empty session data provided.' });
    }
    
    // Debug log to see what fields we have for the patient name
    console.log('[API /api/sessionhistory POST] Patient information received:', {
      name: sessionData.name,
      patientName: sessionData.patientName,
      fullSessionData: sessionData
    });

    const archivedAt = new Date().toISOString(); // Timestamp of when it was archived
    const historyId = `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`;    // Create a history entry with consistent data structure
    const historyEntry = {
      historyId,
      sessionId: sessionData.id || sessionData.sessionId || historyId,
      patientId: sessionData.patientId || null,
      // Ensure we get the patient name correctly
      patientName: sessionData.name || sessionData.patientName || "Unknown Patient",
      doctorId: sessionData.doctorId || null,
      doctorName: sessionData.doctorName || null,
      loggedInAt: sessionData.loggedInAt || sessionData.startTime || archivedAt,
      completedAt: sessionData.completedAt || archivedAt,
      archivedAt,
      purpose: sessionData.purpose || "Not specified",
      notes: sessionData.notes || "",
      prescription: sessionData.prescription || "", // Added prescription field
      status: 'Archived',
      originalData: sessionData // Store the original data for reference
    };

    // Add to history
    sessionHistory.push(historyEntry);
    
    // Save to file
    saveDataToFile(SESSION_HISTORY_FILE, sessionHistory);
    
    console.log(`[API /sessionhistory] Archived session for ${historyEntry.patientName}`);
    
    res.status(201).json({ 
      message: 'Session archived successfully', 
      session: historyEntry,
      history: sessionHistory 
    });
  } catch (error) {
    console.error('[API /api/sessionhistory POST] Error:', error);
    res.status(500).json({ message: 'Failed to archive session', error: error.message });
  }
});

// POST /api/login - User login
router.post('/login', (req, res) => {
  const { emailOrPhone, password, email } = req.body;
  
  // Determine which field to use for authentication
  const searchField = email ? 'email' : emailOrPhone.includes('@') ? 'email' : 'phoneNumber';
  const searchValue = email || emailOrPhone;
  
  console.log(`[API /api/login] Attempting login with ${searchField}: ${searchValue}`);
  
  // Query the database to find the user
  db.query(
    `SELECT id, firstName, lastName, email, phoneNumber, membershipStatus, password FROM users WHERE ${searchField} = ?`,
    [searchValue],
    (err, results) => {
      if (err) {
        console.error('[API /api/login] Database error:', err);
        return res.status(500).json({ message: 'Server error during login' });
      }
      
      if (results.length === 0) {
        console.log(`[API /api/login] No user found with ${searchField}: ${searchValue}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = results[0];
      console.log(`[API /api/login] User found: ${user.firstName} ${user.lastName || ''}`);
      
      // Simple password check (in production, use bcrypt or another hashing library)
      if (user.password !== password) {
        console.log('[API /api/login] Invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Determine user role based on membership status
      let role = 'patient';
      if (user.membershipStatus === 'admin') {
        role = 'admin';
      } else if (user.membershipStatus === 'doctor') {
        role = 'doctor';
      } else if (user.membershipStatus === 'Member') {
        role = 'member';
      }
      
      // Prepare response
      const userResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: role,
        name: `${user.firstName} ${user.lastName || ''}`.trim()
      };
      
      console.log(`[API /api/login] Login successful for user ID: ${user.id}, role: ${role}`);
      res.json({
        message: 'Login successful',
        user: userResponse
      });
    }
  );
});

// Adding login endpoint - place this near the top of the file
router.post('/login', (req, res) => {
  const { email, phoneNumber, password } = req.body;
  
  if (!email && !phoneNumber) {
    return res.status(400).json({
      status: 'error',
      message: 'Email or phone number is required'
    });
  }

  let query, params;
  
  if (email) {
    query = 'SELECT id, firstName, lastName, email, phoneNumber, membershipStatus FROM users WHERE email = ? AND password = ?';
    params = [email, password];
  } else {
    query = 'SELECT id, firstName, lastName, email, phoneNumber, membershipStatus FROM users WHERE phoneNumber = ? AND password = ?';
    params = [phoneNumber, password];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // User found, return user data
    const user = results[0];
    
    res.json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        membershipStatus: user.membershipStatus
      }
    });
  });
});

// Endpoint to get sorted families with their members
router.get('/sorted-families', (req, res) => {
  try {
    // Query to get all families with their members
    const query = `
      SELECT 
        f.id as familyId,
        f.familyName,
        u.id as memberId,
        u.firstName,
        u.lastName,
        u.email,
        u.phoneNumber,
        u.membershipStatus,
        u.dateOfBirth,
        u.gender,
        u.philHealthNumber,
        u.houseNo,
        u.street,
        u.barangay,
        u.city,
        u.region
      FROM 
        families f
      LEFT JOIN 
        users u ON u.familyId = f.id
      ORDER BY 
        f.familyName, u.firstName
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching sorted families:", err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch families',
          error: err.message
        });
      }

      // Group results by family
      const families = [];
      const familyMap = {};

      results.forEach(row => {
        if (!row.familyId) return; // Skip if no family id
        
        // If this is the first time we're seeing this family
        if (!familyMap[row.familyId]) {
          const family = {
            id: row.familyId,
            familyName: row.familyName,
            members: []
          };
          
          families.push(family);
          familyMap[row.familyId] = family;
        }
        
        // Add the member to the family if member data exists
        if (row.memberId) {
          familyMap[row.familyId].members.push({
            id: row.memberId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            phoneNumber: row.phoneNumber,
            membershipStatus: row.membershipStatus,
            dateOfBirth: row.dateOfBirth,
            gender: row.gender,
            philHealthNumber: row.philHealthNumber,
            address: {
              houseNo: row.houseNo,
              street: row.street,
              barangay: row.barangay,
              city: row.city,
              region: row.region
            }
          });
        }
      });

      console.log(`[API] Retrieved ${families.length} families with members`);
      res.json(families);
    });
  } catch (error) {
    console.error("Server error in /sorted-families:", error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Endpoint to add a new surname (family)
router.post('/add-surname', (req, res) => {
  try {
    // Accept either surname or familyName from the request body
    const surname = req.body.surname || req.body.familyName;
    
    if (!surname) {
      return res.status(400).json({ error: 'Surname/Family name is required' });
    }
    
    console.log(`[API] Adding new surname: ${surname}`);
    
    // Insert new family - make sure column name matches your database schema
    db.query('INSERT INTO families (familyName) VALUES (?)', [surname], (err, result) => {
      if (err) {
        console.error('[API] Error adding surname:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(`[API] Added new family with ID: ${result.insertId}`);
      res.status(201).json({ familyId: result.insertId, familyName: surname });
    });
  } catch (error) {
    console.error('[API] Error in /add-surname endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to assign a patient to a family
router.post('/assign-to-family', (req, res) => {
  try {
    const { userId, familyId } = req.body;
    
    if (!userId || !familyId) {
      return res.status(400).json({ error: 'User ID and Family ID are required' });
    }
    
    console.log(`[API] Assigning user ${userId} to family ${familyId}`);
    
    // Update user's familyId
    db.query('UPDATE users SET familyId = ? WHERE id = ?', [familyId, userId], (err, result) => {
      if (err) {
        console.error('[API] Error assigning user to family:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      console.log(`[API] User ${userId} assigned to family ${familyId}`);
      res.json({ message: 'User assigned to family successfully' });
    });
  } catch (error) {
    console.error('[API] Error in /assign-to-family endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to assign an unsorted member to a family by family name
router.patch('/unsorted/:memberId/assign-family', (req, res) => {
  try {
    const { memberId } = req.params;
    const { familyName } = req.body;
    
    if (!memberId || !familyName) {
      return res.status(400).json({ error: 'Member ID and Family Name are required' });
    }
    
    console.log(`[API] Assigning unsorted member ${memberId} to family "${familyName}"`);
    
    // First, check if the family exists
    db.query('SELECT id FROM families WHERE familyName = ?', [familyName], (err, families) => {
      if (err) {
        console.error('[API] Error checking family:', err);
        return res.status(500).json({ error: err.message });
      }
      
      let familyId;
      
      // If family doesn't exist, create it
      if (families.length === 0) {
        console.log(`[API] Family "${familyName}" doesn't exist, creating new family`);
        db.query('INSERT INTO families (familyName) VALUES (?)', [familyName], (err, result) => {
          if (err) {
            console.error('[API] Error creating new family:', err);
            return res.status(500).json({ error: err.message });
          }
          
          familyId = result.insertId;
          assignMemberToFamily(memberId, familyId);
        });
      } else {
        // Family exists, use its ID
        familyId = families[0].id;
        assignMemberToFamily(memberId, familyId);
      }
    });
    
    // Helper function to assign the member to the family
    function assignMemberToFamily(memberId, familyId) {
      db.query('UPDATE users SET familyId = ? WHERE id = ?', [familyId, memberId], (err, result) => {
        if (err) {
          console.error(`[API] Error assigning member ${memberId} to family ${familyId}:`, err);
          return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Member not found' });
        }
        
        console.log(`[API] Member ${memberId} assigned to family ${familyId} (${familyName})`);
        res.json({ 
          message: 'Member assigned to family successfully',
          memberId,
          familyId,
          familyName
        });
      });
    }
  } catch (error) {
    console.error('[API] Error in /unsorted/:memberId/assign-family endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for user login
router.post('/login', (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        details: 'Please provide email/phone and password'
      });
    }
    
    let query, queryParams;
    if (email) {
      query = 'SELECT * FROM users WHERE email = ?';
      queryParams = [email];
      console.log(`[API] Login attempt with email: ${email}`);
    } else {
      query = 'SELECT * FROM users WHERE phoneNumber = ?';
      queryParams = [phoneNumber];
      console.log(`[API] Login attempt with phone: ${phoneNumber}`);
    }
    
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('[API] Database error during login:', err);
        return res.status(500).json({ error: 'Database error during login' });
      }
      
      if (results.length === 0) {
        console.log('[API] User not found during login');
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = results[0];
      
      // Simple password verification (in production, use bcrypt)
      if (user.password === password) {
        console.log(`[API] Successful login for user: ${user.id}`);
        
        // Don't send password back to client
        const { password, ...userData } = user;
        
        res.json({
          message: 'Login successful',
          user: userData
        });
      } else {
        console.log('[API] Invalid password during login');
        res.status(401).json({ error: 'Invalid password' });
      }
    });
  } catch (error) {
    console.error('[API] Error in /login endpoint:', error);
    res.status(500).json({ error: 'Login error', details: error.message });
  }
});

// Endpoint to get user profile by ID
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('[API] Error fetching user profile:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't send password back to client
      const { password, ...userData } = results[0];
      
      res.json(userData);
    });
  } catch (error) {
    console.error('[API] Error in /user/:userId endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get unsorted members (users without a familyId)
router.get('/unsorted', (req, res) => {
  try {
    console.log('[API] Fetching unsorted members');
    
    db.query(`
      SELECT * FROM users 
      WHERE familyId IS NULL OR familyId = 0
      ORDER BY lastName, firstName
    `, (err, results) => {
      if (err) {
        console.error('[API] Error fetching unsorted members:', err);
        return res.status(500).json({ error: err.message });
      }
      
      // Don't send passwords back to client
      const unsortedMembers = results.map(user => {
        const { password, ...userData } = user;
        return userData;
      });
      
      console.log(`[API] Returning ${unsortedMembers.length} unsorted members`);
      res.json(unsortedMembers);
    });
  } catch (error) {
    console.error('[API] Error in /unsorted endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add unsorted members endpoint
router.get('/unsorted-members', (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.phoneNumber,
        u.membershipStatus,
        u.dateOfBirth,
        u.gender,
        u.civilStatus,
        u.philHealthNumber,
        u.houseNo,
        u.street,
        u.barangay,
        u.city,
        u.region
      FROM 
        users u
      WHERE 
        u.familyId IS NULL
        AND u.membershipStatus != 'admin'
      ORDER BY 
        u.firstName, u.lastName
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching unsorted members:", err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch unsorted members',
          error: err.message
        });
      }

      // Format the results
      const members = results.map(member => ({
        id: member.id,
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        email: member.email || '',
        phoneNumber: member.phoneNumber || '',
        membershipStatus: member.membershipStatus || 'nonmember',
        dateOfBirth: member.dateOfBirth,
        gender: member.gender || '',
        civilStatus: member.civilStatus || '',
        philHealthNumber: member.philHealthNumber || '',
        address: {
          houseNo: member.houseNo || '',
          street: member.street || '',
          barangay: member.barangay || '',
          city: member.city || '',
          region: member.region || ''
        }
      }));

      console.log(`[API] Retrieved ${members.length} unsorted members`);
      res.json(members);
    });
  } catch (error) {
    console.error("Server error in /unsorted-members:", error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Create a new family
router.post('/families', (req, res) => {
  const { familyName } = req.body;
  
  if (!familyName) {
    return res.status(400).json({
      status: 'error',
      message: 'Family name is required'
    });
  }
  
  const query = 'INSERT INTO families (familyName) VALUES (?)';
  
  db.query(query, [familyName], (err, result) => {
    if (err) {
      console.error("Error creating new family:", err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create new family',
        error: err.message
      });
    }
    
    const newFamily = {
      id: result.insertId,
      familyName,
      members: []
    };
    
    console.log(`[API] Created new family: ${familyName} (ID: ${result.insertId})`);
    res.status(201).json(newFamily);
  });
});

// Endpoint to get all families
router.get('/families', (req, res) => {
  const query = 'SELECT id, familyName FROM families ORDER BY familyName';
  db.query(query, (err, results) => {
    if (err) {
      console.error("[API /families] Error fetching families:", err);
      return res.status(500).json({ message: "Failed to fetch families", error: err.message });
    }
    console.log(`[API /families] Retrieved ${results.length} families`);
    res.json(results);
  });
});

// Update a family
router.put('/families/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { familyName } = req.body;
    
    if (!familyName) {
      return res.status(400).json({
        status: 'error',
        message: 'Family name is required'
      });
    }
    
    const query = `UPDATE families SET familyName = ? WHERE id = ?`;
    db.query(query, [familyName, id], (err, result) => {
      if (err) {
        console.error(`Error updating family ${id}:`, err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update family',
          error: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Family not found'
        });
      }
      
      console.log(`[API] Updated family ${id} name to "${familyName}"`);
      
      res.json({
        status: 'success',
        message: 'Family updated successfully',
        family: {
          id: parseInt(id),
          familyName: familyName
        }
      });
    });
  } catch (error) {
    console.error(`Server error in PUT /families/${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete a family
router.delete('/families/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // First, update all members to have NULL familyId
    db.query('UPDATE users SET familyId = NULL WHERE familyId = ?', [id], (err) => {
      if (err) {
        console.error(`Error removing family association from users for family ${id}:`, err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update family members',
          error: err.message
        });
      }
      
      // Then delete the family
      db.query('DELETE FROM families WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error(`Error deleting family ${id}:`, err);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to delete family',
            error: err.message
          });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: 'error',
            message: 'Family not found'
          });
        }
        
        console.log(`[API] Deleted family ${id} and removed association from members`);
        
        res.json({
          status: 'success',
          message: 'Family deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error(`Server error in DELETE /families/${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Add a member to a family
router.post('/families/:familyId/members', (req, res) => {
  try {
    const { familyId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }
    
    // First, check if the family exists
    db.query('SELECT * FROM families WHERE id = ?', [familyId], (err, families) => {
      if (err) {
        console.error(`Error checking family ${familyId}:`, err);
        return res.status(500).json({
          status: 'error',
          message: 'Database error',
          error: err.message
        });
      }
      
      if (families.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Family not found'
        });
      }
      
      // Then check if the user exists
      db.query('SELECT * FROM users WHERE id = ?', [userId], (err, users) => {
        if (err) {
          console.error(`Error checking user ${userId}:`, err);
          return res.status(500).json({
            status: 'error',
            message: 'Database error',
            error: err.message
          });
        }
        
        if (users.length === 0) {
          return res.status(404).json({
            status: 'error',
            message: 'User not found'
          });
        }
        
        // Update the user's familyId
        db.query('UPDATE users SET familyId = ? WHERE id = ?', [familyId, userId], (err, result) => {
          if (err) {
            console.error(`Error adding user ${userId} to family ${familyId}:`, err);
            return res.status(500).json({
              status: 'error',
              message: 'Failed to add member to family',
              error: err.message
            });
          }
          
          const user = users[0];
          console.log(`[API] Added user ${userId} (${user.firstName} ${user.lastName}) to family ${familyId}`);
          
          res.json({
            status: 'success',
            message: 'Member added to family successfully',
            member: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              familyId: parseInt(familyId)
            }
          });
        });
      });
    });
  } catch (error) {
    console.error(`Server error in POST /families/${req.params.familyId}/members:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove a member from a family
router.delete('/families/:familyId/members/:userId', (req, res) => {
  try {
    const { familyId, userId } = req.params;
    
    // Check if the user is part of this family
    db.query('SELECT * FROM users WHERE id = ? AND familyId = ?', [userId, familyId], (err, users) => {
      if (err) {
        console.error(`Error checking user ${userId} in family ${familyId}:`, err);
        return res.status(500).json({
          status: 'error',
          message: 'Database error',
          error: err.message
        });
      }
      
      if (users.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Member not found in this family'
        });
      }
      
      // Remove the user from the family
      db.query('UPDATE users SET familyId = NULL WHERE id = ?', [userId], (err, result) => {
        if (err) {
          console.error(`Error removing user ${userId} from family ${familyId}:`, err);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to remove member from family',
            error: err.message
          });
        }
        
        const user = users[0];
        console.log(`[API] Removed user ${userId} (${user.firstName} ${user.lastName}) from family ${familyId}`);
        
        res.json({
          status: 'success',
          message: 'Member removed from family successfully'
        });
      });
    });
  } catch (error) {
    console.error(`Server error in DELETE /families/${req.params.familyId}/members/${req.params.userId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Create a new family
router.post('/families', (req, res) => {
  const { familyName } = req.body;
  
  if (!familyName) {
    return res.status(400).json({
      status: 'error',
      message: 'Family name is required'
    });
  }
  
  const query = 'INSERT INTO families (familyName) VALUES (?)';
  
  db.query(query, [familyName], (err, result) => {
    if (err) {
      console.error("Error creating new family:", err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create new family',
        error: err.message
      });
    }
    
    const newFamily = {
      id: result.insertId,
      familyName,
      members: []
    };
    
    console.log(`[API] Created new family: ${familyName} (ID: ${result.insertId})`);
    res.status(201).json(newFamily);
  });
});

// Add a member to a family
router.put('/families/:familyId/members/:memberId', (req, res) => {
  const { familyId, memberId } = req.params;
  
  if (!familyId || !memberId) {
    return res.status(400).json({
      status: 'error',
      message: 'Family ID and Member ID are required'
    });
  }
  
  // First check if the family exists
  db.query('SELECT * FROM families WHERE id = ?', [familyId], (familyErr, familyResults) => {
    if (familyErr) {
      console.error("Error checking family:", familyErr);
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        error: familyErr.message
      });
    }
    
    if (familyResults.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Family not found'
      });
    }
    
    // Check if the member exists
    db.query('SELECT * FROM users WHERE id = ?', [memberId], (memberErr, memberResults) => {
      if (memberErr) {
        console.error("Error checking member:", memberErr);
        return res.status(500).json({
          status: 'error',
          message: 'Database error',
          error: memberErr.message
        });
      }
      
      if (memberResults.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Member not found'
        });
      }
      
      // Update the member's familyId
      db.query('UPDATE users SET familyId = ? WHERE id = ?', [familyId, memberId], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating member's family:", updateErr);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to update member',
            error: updateErr.message
          });
        }
        
        console.log(`[API] Added member (ID: ${memberId}) to family (ID: ${familyId})`);
        res.json({
          status: 'success',
          message: 'Member added to family',
          familyId,
          memberId
        });
      });
    });
  });
});

// Remove a member from a family
router.delete('/families/:familyId/members/:memberId', (req, res) => {
  const { familyId, memberId } = req.params;
  
  if (!familyId || !memberId) {
    return res.status(400).json({
      status: 'error',
      message: 'Family ID and Member ID are required'
    });
  }
  
  // Update the member's familyId to NULL
  db.query('UPDATE users SET familyId = NULL WHERE id = ? AND familyId = ?', [memberId, familyId], (err, result) => {
    if (err) {
      console.error("Error removing member from family:", err);
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        error: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found in the specified family'
      });
    }
    
    console.log(`[API] Removed member (ID: ${memberId}) from family (ID: ${familyId})`);
    res.json({
      status: 'success',
      message: 'Member removed from family',
      familyId,
      memberId
    });
  });
});

// Test API endpoint
router.get('/test', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'MySQL connection successful!', result: results[0].solution });
  });
});

// Process any appointments for today when the server starts
processAppointmentsForToday();

// Add endpoint to fetch patient data by ID
router.get('/patients/:id', (req, res) => {
  const { id } = req.params;
  // Assuming 'patients' are stored in the 'users' table
  const query = 'SELECT * FROM users WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(`[API /patients/:id] Database error for ID ${id}:`, err);
      return res.status(500).json({ message: 'Server error fetching patient data', error: err.message });
    }

    if (results.length === 0) {
      console.log(`[API /patients/:id] No patient found with ID ${id}`);
      return res.status(404).json({ message: `Patient with ID ${id} not found` });
    }

    const patient = results[0];
    // Destructure to separate address fields and exclude password
    const { password, houseNo, street, barangay, city, region, ...basicPatientData } = patient;

    // Create the nested address object
    const formattedPatient = {
      ...basicPatientData,
      address: {
        houseNo: houseNo || '',
        street: street || '',
        barangay: barangay || '',
        city: city || '',
        region: region || ''
      }
    };
    
    // Ensure a 'name' field is present if the frontend relies on it directly
    // (e.g. from patient prop that might only have id, firstName, lastName)
    if (!formattedPatient.name && formattedPatient.firstName) {
        formattedPatient.name = `${formattedPatient.firstName} ${formattedPatient.lastName || ''}`.trim();
    }

    console.log(`[API /patients/:id] Successfully retrieved patient ID ${id}`);
    res.json(formattedPatient);
  });
});

// Endpoint to fetch all patients
router.get('/patients', (req, res) => {
  console.log('[API /patients] Fetching all registered patients...');
    // Query to get all users who are patients (role = 'patient' or 'member')
  const query = `
    SELECT 
      id, 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      gender, 
      dateOfBirth,
      age,
      houseNo,
      street,
      barangay,
      city,
      region,
      philHealthNumber, 
      membershipStatus,
      familyId,
      civilStatus,
      createdAt
    FROM users 
    WHERE membershipStatus IN ('patient', 'member') 
    ORDER BY lastName, firstName
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('[API /patients] Database error fetching patients:', err);
      return res.status(500).json({ 
        message: 'Failed to fetch patients', 
        error: err.message 
      });
    }
    
    console.log(`[API /patients] Successfully retrieved ${results.length} patients`);
    res.json(results);
  });
});

// Schedule a daily check at midnight to process new appointments for the day
const scheduleAppointmentCheck = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to midnight
  
  const timeUntilMidnight = tomorrow - now;
  console.log(`[API] Scheduling next appointment check in ${Math.round(timeUntilMidnight / (1000 * 60 * 60))} hours.`);
  
  setTimeout(() => {
    console.log('[API] Running scheduled midnight appointment check.');
    processAppointmentsForToday();
    scheduleAppointmentCheck(); // Schedule the next check
  }, timeUntilMidnight);
};

// Start the scheduler
scheduleAppointmentCheck();

// In-memory storage for vital signs data
let vitalSigns = loadDataFromFile(VITAL_SIGNS_FILE, []);

// Endpoint to record vital signs
router.post('/vital-signs', (req, res) => {
  try {
    const vitalSignsData = req.body;
    
    if (!vitalSignsData) {
      return res.status(400).json({
        message: 'Vital signs data is required'
      });
    }
    
    // Add ID and timestamp if not provided
    const newVitalSignsRecord = {
      ...vitalSignsData,
      id: vitalSignsData.id || `vs_${Date.now()}`,
      recordedAt: vitalSignsData.recordedAt || new Date().toISOString()
    };
    
    // Add to the collection
    vitalSigns.push(newVitalSignsRecord);
    
    // Save to file
    saveDataToFile(VITAL_SIGNS_FILE, vitalSigns);
    
    console.log(`[API] Recorded vital signs for patient: ${newVitalSignsRecord.patientName || 'Unknown'}`);
    
    // Also update the patient's checkup record if it exists
    if (newVitalSignsRecord.checkupId) {
      const checkupIndex = todaysCheckUps.findIndex(c => c.id === newVitalSignsRecord.checkupId);
      if (checkupIndex !== -1) {
        todaysCheckUps[checkupIndex] = {
          ...todaysCheckUps[checkupIndex],
          vitalSigns: newVitalSignsRecord,
          vitalSignsChecked: true
        };
        
        saveDataToFile(TODAYS_CHECKUPS_FILE, todaysCheckUps);
        console.log(`[API] Updated checkup record with vital signs for: ${newVitalSignsRecord.patientName || 'Unknown'}`);
      }
    }
    
    res.status(201).json({
      message: 'Vital signs recorded successfully',
      vitalSigns: newVitalSignsRecord
    });
    
  } catch (error) {
    console.error('[API] Error recording vital signs:', error);
    res.status(500).json({
      message: 'Failed to record vital signs',
      error: error.message
    });
  }
});

// Endpoint to get vital signs by patient ID
router.get('/vital-signs/patient/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Filter vital signs for this patient - convert patientId to the same type for comparison
    // It could be a string or a number in the database, so convert both to strings for comparison
    const patientVitalSigns = vitalSigns.filter(vs => 
      vs.patientId && vs.patientId.toString() === patientId.toString()
    );
    
    res.json(patientVitalSigns);
  } catch (error) {
    console.error('[API] Error fetching vital signs:', error);
    res.status(500).json({
      message: 'Failed to fetch vital signs',
      error: error.message
    });
  }
});

// Endpoint to get a specific vital signs record
router.get('/vital-signs/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the vital signs record
    const vitalSignsRecord = vitalSigns.find(vs => vs.id === id);
    
    if (!vitalSignsRecord) {
      return res.status(404).json({
        message: 'Vital signs record not found'
      });
    }
    
    res.json(vitalSignsRecord);
  } catch (error) {
    console.error('[API] Error fetching vital signs record:', error);
    res.status(500).json({
      message: 'Failed to fetch vital signs record',
      error: error.message
    });
  }
});

// User Registration Endpoint 
router.post('/register', (req, res) => {
  try {
    // Log the registration attempt
    console.log('Registration attempt:', req.body);
    
    // Extract user data from request
    const {
      firstName, lastName, middleName, suffix, email, password, phoneNumber,
      houseNo, street, barangay, city, region, dateOfBirth, age, gender, civilStatus,
      philHealthNumber, membershipStatus
    } = req.body;

    // Check if required fields are provided
    if (!firstName || !lastName || !password) {
      return res.status(400).json({ error: 'First name, last name, and password are required' });
    }

    // Check if either email or phone number is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phone number is required' });
    }

    // Check if user with the same email or phone already exists
    let checkQuery = 'SELECT * FROM users WHERE ';
    let queryParams = [];
    
    if (email) {
      checkQuery += 'email = ?';
      queryParams.push(email);
    }
    
    if (phoneNumber) {
      if (email) {
        checkQuery += ' OR phoneNumber = ?';
      } else {
        checkQuery += 'phoneNumber = ?';
      }
      queryParams.push(phoneNumber);
    }
    
    db.query(checkQuery, queryParams, (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Database error during registration' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'A user with this email or phone number already exists' });
      }
      
      // Create a new user
      const insertQuery = `
        INSERT INTO users 
        (firstName, lastName, middleName, suffix, email, phoneNumber, password, 
        houseNo, street, barangay, city, region, 
        dateOfBirth, age, gender, civilStatus, 
        philHealthNumber, membershipStatus) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
        // If membership status is Non-Member, clear the PhilHealth number
      let finalPhilHealthNumber = philHealthNumber || '';
      if (membershipStatus === 'Non-Member') {
        finalPhilHealthNumber = '';
      }
        // Handle empty email as null for MySQL
      const emailValue = email && email.trim() !== '' ? email : null;
      
      const userValues = [
        firstName,
        lastName,
        middleName || '',
        suffix || '',
        emailValue,
        phoneNumber || '',
        password, // In production, hash the password
        houseNo || '',
        street || '',
        barangay || '',
        city || 'Pasig',
        region || 'Metro Manila',
        dateOfBirth || null,
        age || '',
        gender || '',
        civilStatus || '',
        finalPhilHealthNumber,
        membershipStatus || 'Member'
      ];
      
      db.query(insertQuery, userValues, (err, result) => {
        if (err) {
          console.error('Error inserting new user:', err);
          return res.status(500).json({ error: 'Database error during registration' });
        }
        
        // Create response object (exclude password)
        const responseUser = {
          id: result.insertId,
          firstName,
          lastName,
          middleName: middleName || '',
          suffix: suffix || '',
          email: email || '',
          phoneNumber: phoneNumber || '',
          address: {
            houseNo: houseNo || '',
            street: street || '',
            barangay: barangay || '',
            city: city || 'Pasig',
            region: region || 'Metro Manila',
          },
          dateOfBirth: dateOfBirth || null,
          age: age || '',
          gender: gender || '',
          civilStatus: civilStatus || '',
          philHealthNumber: philHealthNumber || '',
          membershipStatus: membershipStatus || 'Member',
          role: 'patient'
        };
        
        console.log('User registered successfully:', responseUser);
        res.status(201).json({ message: 'Registration successful', user: responseUser });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Admin: Add a new patient endpoint
router.post('/admin/add-patient', (req, res) => {
  try {
    // Log the admin add patient attempt
    console.log('Admin add patient attempt:', req.body);
    
    // Extract patient data from request
    const {
      firstName, lastName, middleName, suffix, email, password, phoneNumber,
      houseNo, street, barangay, city, region, dateOfBirth, age, gender, civilStatus,
      philHealthNumber, membershipStatus, familyName
    } = req.body;

    // Check required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if either email or phone number is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phone number is required' });
    }    // Check if patient with the same email or phone already exists
    let checkQuery = 'SELECT * FROM users WHERE ';
    let queryParams = [];
    
    if (email) {
      checkQuery += 'email = ?';
      queryParams.push(email);
    }
    
    if (phoneNumber) {
      if (email) {
        checkQuery += ' OR phoneNumber = ?';
      } else {
        checkQuery += 'phoneNumber = ?';
      }
      queryParams.push(phoneNumber);
    }
    
    console.log('Checking for existing user with query:', checkQuery, queryParams);
    db.query(checkQuery, queryParams, (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Database error during patient addition' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'A user with this email or phone number already exists' });
      }      // Check if family exists first, otherwise create it
      console.log('Checking for family with name:', familyName);
      
      // If no family name provided, add patient without family assignment (unsorted)
      if (!familyName || familyName.trim() === '') {
        console.log('No family name provided, adding patient as unsorted');
        let processFamilyId = (familyId) => {
          // Insert the new patient into users table
          const insertUserQuery = `
            INSERT INTO users 
            (firstName, lastName, middleName, suffix, email, phoneNumber, password, 
            houseNo, street, barangay, city, region, 
            dateOfBirth, age, gender, civilStatus, 
            philHealthNumber, membershipStatus, familyId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          // Handle empty email as null for MySQL
          const emailValue = email && email.trim() !== '' ? email : null;
          
          const userValues = [
            firstName,
            lastName,
            middleName || '',
            suffix || '',
            emailValue,
            phoneNumber || '',
            password || '', // In production, hash the password
            houseNo || '',
            street || '',
            barangay || '',
            city || 'Pasig',
            region || 'Metro Manila',
            dateOfBirth || null,
            age || '',
            gender || '',
            civilStatus || '',
            membershipStatus === 'Non-Member' ? '' : (philHealthNumber || ''),
            membershipStatus || 'Member',
            familyId // null for unsorted patients
          ];
          
          console.log('Inserting user with values:', userValues);
          db.query(insertUserQuery, userValues, (err, result) => {
            if (err) {
              console.error('Error inserting patient:', err);
              return res.status(500).json({ error: 'Database error during patient addition' });
            }
            
            console.log('Patient added successfully with ID:', result.insertId);
            res.status(201).json({ 
              message: 'Patient added successfully',
              patientId: result.insertId
            });
          });
        };
        
        // Process with null family ID (unsorted patient)
        processFamilyId(null);
        return;
      }
      
      db.query('SELECT id FROM families WHERE familyName = ?', [familyName], (err, familyResults) => {
        if (err) {
          console.error('Error checking family:', err);
          return res.status(500).json({ error: 'Database error during patient addition' });
        }
        
        console.log('Family check results:', familyResults);
        
        let processFamilyId = (familyId) => {
          // Insert the new patient into users table
          const insertUserQuery = `
            INSERT INTO users 
            (firstName, lastName, middleName, suffix, email, phoneNumber, password, 
            houseNo, street, barangay, city, region, 
            dateOfBirth, age, gender, civilStatus, 
            philHealthNumber, membershipStatus, familyId) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
            // Handle empty email as null for MySQL
          const emailValue = email && email.trim() !== '' ? email : null;
          
          const userValues = [            firstName,
            lastName,
            middleName || '',
            suffix || '',
            emailValue,
            phoneNumber || '',
            password || '', // In production, hash the password
            houseNo || '',
            street || '',
            barangay || '',
            city || 'Pasig',
            region || 'Metro Manila',
            dateOfBirth || null,
            age || '',
            gender || '',
            civilStatus || '',
            membershipStatus === 'Non-Member' ? '' : (philHealthNumber || ''),
            membershipStatus || 'Member',
            familyId
          ];
          
          db.query(insertUserQuery, userValues, (err, result) => {
            if (err) {
              console.error('Error inserting new patient:', err);
              return res.status(500).json({ error: 'Database error during patient addition' });
            }
            
            // Create response object
            const responsePatient = {
              id: result.insertId,
              firstName,
              lastName,
              middleName: middleName || '',
              suffix: suffix || '',
              email: email || '',
              phoneNumber: phoneNumber || '',
              address: {
                houseNo: houseNo || '',
                street: street || '',
                barangay: barangay || '',
                city: city || 'Pasig',
                region: region || 'Metro Manila',
              },
              dateOfBirth: dateOfBirth || null,
              age: age || '',
              gender: gender || '',
              civilStatus: civilStatus || '',
              philHealthNumber: philHealthNumber || '',
              membershipStatus: membershipStatus || 'Member',
              familyId: familyId,
              familyName: familyName,
              role: 'patient'
            };
            
            console.log('Patient added successfully by admin:', responsePatient);
            res.status(201).json({ message: 'Patient added successfully', patient: responsePatient });
          });
        };
          // If family doesn't exist, create it first
        if (familyResults.length === 0) {
          console.log('Family does not exist, creating new family:', familyName);
          db.query(
            'INSERT INTO families (familyName) VALUES (?)',
            [familyName],
            (err, insertResult) => {
              if (err) {
                console.error('Error creating family:', err);
                return res.status(500).json({ error: 'Database error during patient addition' });
              }
              
              console.log('Created new family with ID:', insertResult.insertId);
              // Pass the new family ID to the patient creation function
              processFamilyId(insertResult.insertId);
            }
          );
        } else {
          // Use existing family ID
          console.log('Using existing family ID:', familyResults[0].id);
          processFamilyId(familyResults[0].id);
        }
      });
    });
  } catch (error) {
    console.error('Admin add patient error:', error);
    res.status(500).json({ error: 'Server error during patient addition' });
  }
});

// Delete a patient by ID
router.delete('/patients/:id', (req, res) => {
  try {
    const patientId = req.params.id;
    console.log(`[API DELETE /patients/:id] Attempting to delete patient with ID ${patientId}`);

    // First check if the patient exists
    db.query('SELECT id FROM users WHERE id = ?', [patientId], (err, results) => {
      if (err) {
        console.error(`[API DELETE /patients/:id] Database error checking patient ${patientId}:`, err);
        return res.status(500).json({ error: 'Server error checking patient existence' });
      }

      if (results.length === 0) {
        console.log(`[API DELETE /patients/:id] No patient found with ID ${patientId}`);
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Delete the patient record from users table
      db.query('DELETE FROM users WHERE id = ?', [patientId], (err, result) => {
        if (err) {
          console.error(`[API DELETE /patients/:id] Database error deleting patient ${patientId}:`, err);
          return res.status(500).json({ error: 'Server error deleting patient' });
        }

        console.log(`[API DELETE /patients/:id] Successfully deleted patient with ID ${patientId}`);
        
        // Also delete related records (you can add more deletion queries as needed)
        // For example, deleting checkup records
        db.query('DELETE FROM checkup_records WHERE userId = ?', [patientId], (err, result) => {
          if (err) {
            console.error(`[API DELETE /patients/:id] Error deleting related checkup records for patient ${patientId}:`, err);
            // Continue with success response since the main record was deleted
          }
        });
        
        return res.status(200).json({ message: 'Patient deleted successfully' });
      });
    });
  } catch (error) {
    console.error(`[API DELETE /patients/:id] Server error:`, error);
    res.status(500).json({ error: 'Server error during patient deletion' });
  }
});

// Assign a patient to a different family
router.patch('/patients/:id/assign-family', (req, res) => {
  try {
    const patientId = req.params.id;
    const { familyId } = req.body;
    
    console.log(`[API PATCH /patients/:id/assign-family] Assigning patient ${patientId} to family ${familyId}`);
    
    if (!familyId) {
      return res.status(400).json({ 
        message: 'Family ID is required' 
      });
    }
      // First check if the patient exists
    const checkPatientQuery = 'SELECT id, firstName, lastName, familyId FROM users WHERE id = ? AND membershipStatus IN ("patient", "member")';
    db.query(checkPatientQuery, [patientId], (err, patientResults) => {
      if (err) {
        console.error(`[API PATCH /patients/:id/assign-family] Database error checking patient ${patientId}:`, err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      if (patientResults.length === 0) {
        console.log(`[API PATCH /patients/:id/assign-family] No patient found with ID ${patientId}`);
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      const patient = patientResults[0];
      
      // Check if the target family exists
      const checkFamilyQuery = 'SELECT id, familyName FROM families WHERE id = ?';
      db.query(checkFamilyQuery, [familyId], (err, familyResults) => {
        if (err) {
          console.error(`[API PATCH /patients/:id/assign-family] Database error checking family ${familyId}:`, err);
          return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (familyResults.length === 0) {
          console.log(`[API PATCH /patients/:id/assign-family] No family found with ID ${familyId}`);
          return res.status(404).json({ message: 'Target family not found' });
        }
        
        const targetFamily = familyResults[0];
        
        // Update the patient's family assignment
        const updateQuery = 'UPDATE users SET familyId = ? WHERE id = ?';
        db.query(updateQuery, [familyId, patientId], (err, updateResults) => {
          if (err) {
            console.error(`[API PATCH /patients/:id/assign-family] Database error updating patient ${patientId}:`, err);
            return res.status(500).json({ message: 'Database error', error: err.message });
          }
          
          console.log(`[API PATCH /patients/:id/assign-family] Successfully assigned patient ${patientId} (${patient.firstName} ${patient.lastName}) to family ${familyId} (${targetFamily.familyName})`);
          
          res.json({ 
            message: `Patient ${patient.firstName} ${patient.lastName} has been successfully assigned to family "${targetFamily.familyName}"`,
            patientId: patientId,
            familyId: familyId,
            familyName: targetFamily.familyName
          });
        });
      });
    });
    
  } catch (error) {
    console.error('[API PATCH /patients/:id/assign-family] Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;





