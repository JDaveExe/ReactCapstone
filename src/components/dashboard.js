import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Topbar from "./topbar";
import "../styles/dashboard.css";

const PatientDashboard = () => {
  const [patientName, setPatientName] = useState("Loading...");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/home");
  };
  
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("firstName");
    const storedUserName = localStorage.getItem("userName");

    console.log("Current user role:", userRole);
    console.log("Current user email:", userEmail);
    console.log("Stored firstName:", storedName);
    console.log("Stored userName:", storedUserName);

    if (!userRole || (userRole !== "patient" && userRole !== "member")) {
      console.log("User not authenticated as patient. Redirecting to login.");
      navigate("/login");
      return;
    }

    if (storedName) {
      console.log("Using stored first name:", storedName);
      setPatientName(storedName);
    } 
    else if (storedUserName) {
      console.log("Using stored user name:", storedUserName);
      const nameParts = storedUserName.split(' ');
      setPatientName(nameParts[0] || storedUserName);
      if (nameParts[0]) {
        localStorage.setItem("firstName", nameParts[0]);
      }
    }
    else if (userEmail) {
      console.log("Fetching patient name for email:", userEmail);
      axios.post('http://localhost:5000/api/get-patient-name', { email: userEmail })
        .then(response => {
          console.log("Response from backend:", response.data);
          if (response.data && response.data.firstName) {
            const firstName = response.data.firstName;
            setPatientName(firstName);
            localStorage.setItem("firstName", firstName);
          } else if (response.data && response.data.name) {
            setPatientName(response.data.name);
            localStorage.setItem("userName", response.data.name);
            const nameParts = response.data.name.split(' ');
            if (nameParts.length > 0) {
              localStorage.setItem("firstName", nameParts[0]);
            }
          } else {
            setPatientName("Patient");
          }
        })
        .catch(error => {
          console.error("Error fetching patient name:", error);
          if (storedUserName) {
            setPatientName(storedUserName);
          } else {
            setPatientName("Patient");
          }
        });
    } else {
      setPatientName("Patient");
    }
  }, [navigate]);
  
  return (
    <div className="dashboard-root">
      <Topbar userName={patientName} userRole="patient" />
      <main className="dashboard-content patient-dashboard-center">
        <section className="dashboard-welcome-section">
          <div className="dashboard-welcome-card glass-card">
            <div className="dashboard-welcome-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div>
              <h2 className="dashboard-welcome-title">Welcome, {patientName}!</h2>
              <p className="dashboard-welcome-desc">This is your patient dashboard. Here you can view your profile and medical information. Please use the navigation above to explore your account.</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;