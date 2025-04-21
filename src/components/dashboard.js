import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import "../styles/dashboard.css";

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [patientName, setPatientName] = useState("Loading...");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in as patient
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("firstName"); // Try getting from localStorage first
    
    console.log("Current user role:", userRole);
    console.log("Current user email:", userEmail);

    // Accept both 'patient' and 'member' roles
    if (!userRole || (userRole !== "patient" && userRole !== "member")) {
      console.log("User not authenticated as patient. Redirecting to login.");
      navigate("/login");
      return;
    }

    // If we already have the first name in localStorage, use it
    if (storedName) {
      console.log("Using stored first name:", storedName);
      setPatientName(storedName);
    } 
    // Otherwise fetch it from backend
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
          }
        })
        .catch(error => {
          console.error("Error fetching patient name:", error);
          setPatientName("Unknown Patient");
        });
    }

    // Get recent activities from localStorage or set defaults
    const storedActivities = localStorage.getItem("recentActivities");
    if (storedActivities) {
      setRecentActivities(JSON.parse(storedActivities));
    } else {
      // Set default activities for first-time login
      const defaultActivities = [
        { id: 1, name: "Patient Profile", path: "/patient-profile", icon: "person" },
        { id: 2, name: "Immunization History", path: "/immunisation-history", icon: "shield" },
        { id: 3, name: "Recent Checkup", path: "/checkup-records", icon: "clipboard-check" },
        { id: 4, name: "Admitting Data", path: "/admitting-data", icon: "file-medical" }
      ];
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
    // Update recent activities before navigating
    updateRecentActivities(path);
    // Navigate to the path
    navigate(path);
  };
  
  // Function to update recent activities
  const updateRecentActivities = (path) => {
    // Find the activity corresponding to this path
    const existingActivityIndex = recentActivities.findIndex(activity => activity.path === path);
    let updatedActivities = [...recentActivities];
    
    if (existingActivityIndex !== -1) {
      // If activity exists, remove it from its current position
      const existingActivity = updatedActivities[existingActivityIndex];
      updatedActivities.splice(existingActivityIndex, 1);
      // Add it to the beginning of the array
      updatedActivities.unshift(existingActivity);
    } else {
      // If it's a new activity, create an appropriate entry
      // This would ideally use a map of paths to names and icons
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
      
      // Add new activity to beginning, ensure we keep only 4 items
      updatedActivities.unshift(newActivity);
    }
    
    // Keep only the 4 most recent activities
    updatedActivities = updatedActivities.slice(0, 4);
    
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
      <div className={`dashboard-content w-100 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid py-3">
          <div className="row g-4">
            {/* Patient Profile Card */}
            <div className="col-12 col-md-5 col-lg-4">
              <div className="card bg-secondary text-white h-100" style={{backgroundColor: "#a67c68 !important"}}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-person-circle" style={{fontSize: "4rem"}}></i>
                  </div>
                  <h3 className="card-title">{patientName}</h3>
                </div>
              </div>
            </div>
            
            {/* Recent Activities Card */}
            <div className="col-12 col-md-7 col-lg-8">
              <div className="card bg-secondary text-white h-100" style={{backgroundColor: "#a67c68 !important"}}>
                <div className="card-body">
                  <h5 className="card-title mb-4">Recent Activities</h5>
                  <div className="row g-3">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="col-12 col-md-6">
                        <button 
                          className="btn btn-light w-100 text-start py-3" 
                          onClick={() => handleNavigation(activity.path)}
                        >
                          <i className={`bi bi-${activity.icon} me-2`}></i>
                          {activity.name}
                        </button>
                      </div>
                    ))}
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
          className="sidebar-overlay d-md-none" 
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default PatientDashboard;