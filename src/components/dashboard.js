import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from "./sidebar";
import "../styles/dashboard.css";

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [patientName, setPatientName] = useState("Loading...");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in as patient
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("firstName"); // Try getting from localStorage first
    const storedUserName = localStorage.getItem("userName"); // Backup name
    
    console.log("Current user role:", userRole);
    console.log("Current user email:", userEmail);
    console.log("Stored firstName:", storedName);
    console.log("Stored userName:", storedUserName);

    // Accept both 'patient' and 'member' roles
    if (!userRole || (userRole !== "patient" && userRole !== "member")) {
      console.log("User not authenticated as patient. Redirecting to login.");
      navigate("/login");
      return;
    }

    // Set name priority: firstName > userName > fallback
    if (storedName) {
      console.log("Using stored first name:", storedName);
      setPatientName(storedName);
    } 
    else if (storedUserName) {
      console.log("Using stored user name:", storedUserName);
      // Extract first name if possible
      const nameParts = storedUserName.split(' ');
      setPatientName(nameParts[0] || storedUserName);
      // Also store firstName for future use
      if (nameParts[0]) {
        localStorage.setItem("firstName", nameParts[0]);
      }
    }
    // If no name data in localStorage, fetch from backend
    else if (userEmail) {
      console.log("Fetching patient name for email:", userEmail);
      axios.post('http://localhost:5000/api/get-patient-name', { email: userEmail })
        .then(response => {
          console.log("Response from backend:", response.data);
          if (response.data && response.data.firstName) {
            const firstName = response.data.firstName;
            setPatientName(firstName);
            // Store it for future use
            localStorage.setItem("firstName", firstName);
          } else if (response.data && response.data.name) {
            // Fallback if firstName is not available in response
            setPatientName(response.data.name);
            localStorage.setItem("userName", response.data.name);
            // Try to extract firstName from the full name
            const nameParts = response.data.name.split(' ');
            if (nameParts.length > 0) {
              localStorage.setItem("firstName", nameParts[0]);
            }
          } else {
            // Ultimate fallback
            setPatientName("Patient");
          }
        })
        .catch(error => {
          console.error("Error fetching patient name:", error);
          // Use any available name from localStorage as fallback
          if (storedUserName) {
            setPatientName(storedUserName);
          } else {
            setPatientName("Patient");
          }
        });
    } else {
      // If we have no way to get the name, use a default
      setPatientName("Patient");
    }

    // Fetch full patient profile from backend
    const userObj = JSON.parse(localStorage.getItem("user"));
    const profileEmail = userObj?.email || localStorage.getItem("userEmail");
    if (profileEmail) {
      setProfileLoading(true);
      axios.post("http://localhost:5000/api/get-user-details", { email: profileEmail })
        .then(res => {
          if (res.data && res.data.user) {
            setProfile(res.data.user);
          } else {
            setProfileError("Could not load profile info.");
          }
        })
        .catch(() => setProfileError("Could not load profile info."))
        .finally(() => setProfileLoading(false));
    } else {
      setProfileError("No user email found.");
      setProfileLoading(false);
    }

    // IMPORTANT FIX: Always initialize default activities
    const defaultActivities = [
      { id: 1, name: "Patient Profile", path: "/patient-profile", icon: "person" },
      { id: 2, name: "Immunization History", path: "/immunisation-history", icon: "shield" },
      { id: 3, name: "Recent Checkup", path: "/checkup-records", icon: "clipboard-check" },
      { id: 4, name: "Admitting Data", path: "/admitting-data", icon: "file-medical" }
    ];
    
    // Get stored activities or use defaults
    const storedActivities = localStorage.getItem("recentActivities");
    if (storedActivities) {
      try {
        const parsedActivities = JSON.parse(storedActivities);
        // Verify that the activities are properly formatted
        if (Array.isArray(parsedActivities) && parsedActivities.length > 0) {
          setRecentActivities(parsedActivities);
        } else {
          // If stored data is invalid, use defaults
          setRecentActivities(defaultActivities);
          localStorage.setItem("recentActivities", JSON.stringify(defaultActivities));
        }
      } catch (e) {
        console.error("Error parsing stored activities:", e);
        // If parsing fails, use defaults
        setRecentActivities(defaultActivities);
        localStorage.setItem("recentActivities", JSON.stringify(defaultActivities));
      }
    } else {
      // Use defaults for first-time login
      setRecentActivities(defaultActivities);
      localStorage.setItem("recentActivities", JSON.stringify(defaultActivities));
    }
  }, [navigate]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigation = (path) => {
    console.log(`Navigating to path: ${path}`);
    // Update recent activities before navigating
    updateRecentActivities(path);
    // Navigate to the path
    navigate(path);
  };
  
  // Function to update recent activities
  const updateRecentActivities = (path) => {
    console.log(`Updating recent activities for path: ${path}`);
    // Find the activity corresponding to this path
    const existingActivityIndex = recentActivities.findIndex(activity => activity.path === path);
    let updatedActivities = [...recentActivities];
    
    console.log(`Current activities:`, recentActivities);
    console.log(`Activity index for path ${path}: ${existingActivityIndex}`);
    
    if (existingActivityIndex !== -1) {
      // If activity exists, remove it from its current position
      const existingActivity = updatedActivities[existingActivityIndex];
      updatedActivities.splice(existingActivityIndex, 1);
      // Add it to the beginning of the array
      updatedActivities.unshift(existingActivity);
      console.log(`Moved existing activity to front:`, existingActivity);
    } else {
      // If it's a new activity, create an appropriate entry
      const pathSegments = path.split('/');
      const activityName = pathSegments[pathSegments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const newActivity = {
        id: Date.now(),
        name: activityName,
        path: path,
        icon: "folder" // Default icon
      };
      
      console.log(`Created new activity:`, newActivity);
      
      // Add new activity to beginning, ensure we keep only 4 items
      updatedActivities.unshift(newActivity);
    }
    
    // Keep only the 4 most recent activities
    updatedActivities = updatedActivities.slice(0, 4);
    
    console.log(`Updated activities:`, updatedActivities);
    
    // Update state and localStorage
    setRecentActivities(updatedActivities);
    localStorage.setItem("recentActivities", JSON.stringify(updatedActivities));
  };
  
  return (
    <div className="dashboard-container d-flex">
      <Sidebar 
        isOpen={sidebarOpen} 
        closeSidebar={closeSidebar} 
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleCollapse}
      />
      
      <div className={`dashboard-content ${sidebarCollapsed ? 'content-with-collapsed-sidebar' : ''}`}>
        <div className="container-fluid px-4 py-4">
          {/* Welcome message section */}
          <div className="welcome-section mb-4">
            <div className="welcome-card">
              <h5 className="mb-2">Welcome, {patientName}!</h5>
              <p className="mb-0">This is your patient dashboard. Use the sidebar to navigate through your medical records, checkups, and more.</p>
            </div>
          </div>
          
          {/* Recent Activities Section */}
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card activities-card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Recent Activities</h5>
                  <div className="row g-3">
                    {recentActivities && recentActivities.length > 0 ? (
                      recentActivities.map(activity => (
                        <div key={activity.id} className="col-12 col-sm-6">
                          <button 
                            className="activity-btn"
                            onClick={() => handleNavigation(activity.path)}
                          >
                            <i className={`bi bi-${activity.icon} me-2`}></i>
                            <span>{activity.name}</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center">
                        <p>No recent activities found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default PatientDashboard;