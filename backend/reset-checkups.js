// reset-checkups.js - Script to reset today\'s checkups
const fs = require("fs");
const path = require("path");

// Define paths
const DATA_DIR = path.join(__dirname, "data");
const TODAYS_CHECKUPS_FILE = path.join(DATA_DIR, "todaysCheckups.json");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");

// Function to load data from file
function loadDataFromFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading data from " + filePath + ":", error);
  }
  return defaultValue;
}

// Function to save data to file
function saveDataToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log("Data saved to " + filePath);
  } catch (error) {
    console.error("Error saving data to " + filePath + ":", error);
  }
}

// Function to process appointments for today
function processAppointmentsForToday() {
  try {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    console.log("Checking for appointments scheduled for today: " + today);
    
    const scheduledAppointments = loadDataFromFile(APPOINTMENTS_FILE, []);
    const todaysCheckUps = loadDataFromFile(TODAYS_CHECKUPS_FILE, []);
    
    // Find appointments scheduled for today
    const todayAppointments = scheduledAppointments.filter(app => app.date === today);
    
    if (todayAppointments.length === 0) {
      console.log("No appointments found for today.");
      return todaysCheckUps;
    }
    
    console.log("Found " + todayAppointments.length + " appointments for today.");
    
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
          id: "appointment_" + appointment.id,
          appointmentId: appointment.id,
          name: appointment.patientName,
          familyName: appointment.familyName || "",
          purpose: appointment.purpose || "Not Specified",
          scheduledTime: appointment.time,
          loggedInAt: new Date().toISOString(),
          queueNumber: updatedCheckUps.length + 1,
          status: "Waiting"
        };
        
        updatedCheckUps.push(newCheckUp);
        changes = true;
        console.log("Added appointment for " + appointment.patientName + " to today's check-ups.");
      }
    }
    
    if (changes) {
      console.log("Updated list with scheduled appointments.");
    }
    return updatedCheckUps;
  } catch (error) {
    console.error("Error processing appointments for today:", error);
    return [];
  }
}

// Main reset function
function resetCheckUps() {
  try {
    console.log("Starting checkups reset...");
    
    // Create a backup of current data
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupFile = path.join(DATA_DIR, "todaysCheckups." + timestamp + ".bak.json");
    const currentData = loadDataFromFile(TODAYS_CHECKUPS_FILE, []);
    saveDataToFile(backupFile, currentData);
    console.log("Backup created at " + backupFile);
    
    // Get today's appointments
    const newCheckUps = processAppointmentsForToday();
    
    // Save the reset data
    saveDataToFile(TODAYS_CHECKUPS_FILE, newCheckUps);
    
    console.log("Reset completed successfully!");
    console.log("New checkups list has " + newCheckUps.length + " items");
  } catch (error) {
    console.error("Error resetting checkups:", error);
  }
}

// Execute the reset
resetCheckUps();
