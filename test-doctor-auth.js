// Test script to verify doctor authentication storage
console.log("=== Doctor Authentication Test ===");

// Function to test localStorage after doctor login
function testDoctorLocalStorage() {
    console.log("\n--- Testing Doctor Authentication Data ---");
    
    const userRole = localStorage.getItem("userRole");
    const doctorId = localStorage.getItem("doctorId");
    const doctorName = localStorage.getItem("doctorName");
    const userId = localStorage.getItem("userId");
    
    console.log("User Role:", userRole);
    console.log("Doctor ID:", doctorId);
    console.log("Doctor Name:", doctorName);
    console.log("User ID:", userId);
    
    // Validate doctor authentication
    if (userRole === "doctor") {
        console.log("✅ User role is correctly set to 'doctor'");
        
        if (doctorId) {
            console.log("✅ Doctor ID is stored:", doctorId);
        } else {
            console.log("❌ Doctor ID is missing");
        }
        
        if (doctorName) {
            console.log("✅ Doctor Name is stored:", doctorName);
        } else {
            console.log("❌ Doctor Name is missing");
        }
        
        if (userId) {
            console.log("✅ User ID is stored:", userId);
        } else {
            console.log("❌ User ID is missing");
        }
        
        return {
            isValid: userRole === "doctor" && doctorId && doctorName && userId,
            data: { userRole, doctorId, doctorName, userId }
        };
    } else {
        console.log("❌ User is not logged in as a doctor");
        return { isValid: false, data: null };
    }
}

// Function to test session completion data
function testSessionCompletionData() {
    console.log("\n--- Session Completion Data Test ---");
    
    const doctorAuth = testDoctorLocalStorage();
    
    if (!doctorAuth.isValid) {
        console.log("❌ Cannot test session completion - doctor not authenticated");
        return false;
    }
    
    // Simulate session completion data
    const mockSession = {
        id: "test_session_123",
        name: "Test Patient",
        status: "Completed",
        purpose: "General Consultation",
        notes: "Test notes",
        prescription: "Test prescription"
    };
    
    // Create the session data that would be sent to archiveSession
    const sessionToArchive = {
        ...mockSession,
        completedAt: new Date().toISOString(),
        patientName: mockSession.name,
        doctorId: doctorAuth.data.doctorId,
        doctorName: doctorAuth.data.doctorName
    };
    
    console.log("Session to archive would contain:");
    console.log("- Patient Name:", sessionToArchive.patientName);
    console.log("- Doctor ID:", sessionToArchive.doctorId);
    console.log("- Doctor Name:", sessionToArchive.doctorName);
    console.log("- Completed At:", sessionToArchive.completedAt);
    
    return sessionToArchive;
}

// Export functions for browser console testing
window.testDoctorLocalStorage = testDoctorLocalStorage;
window.testSessionCompletionData = testSessionCompletionData;

console.log("\n=== Instructions ===");
console.log("1. Login as a doctor in the application");
console.log("2. Open browser console (F12)");
console.log("3. Run: testDoctorLocalStorage()");
console.log("4. Complete a session and check session history");
console.log("5. Run: testSessionCompletionData()");
