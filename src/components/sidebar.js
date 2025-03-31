import React, { useState } from "react";
import "../styles/sidebar.css";

const Sidebar = () => {
  const [isMedRecordOpen, setMedRecordOpen] = useState(false);

  // Function to handle navigation using window.location.pathname
  const handleNavigation = (path) => {
    window.location.pathname = path;
  };

  return (
    <div className="sidebar">
      <h2>Maybunga Health Center</h2>
      <ul>
        <li onClick={() => handleNavigation("/dashboard")}>Dashboard</li>
        <li onClick={() => handleNavigation("/patient-profile")}>Patient Profile</li>

        <li
          className={`menu-item ${isMedRecordOpen ? "open" : ""}`}
          onClick={() => setMedRecordOpen(!isMedRecordOpen)}
        >
          Med Record Summary ▼
        </li>
        {isMedRecordOpen && (
          <ul className="submenu">
            <li onClick={() => handleNavigation("/med-history")}>Individual Treatment Record</li>
            <li onClick={() => handleNavigation("/admitting-data")}>Admitting Data</li>
            <li onClick={() => handleNavigation("/immunisation-history")}>Immunisation History</li>
            <li onClick={() => handleNavigation("/checkup-records")}>Recent Checkups</li>
          </ul>
        )}
        <li onClick={() => handleNavigation("/notification")}>Notification</li>
        <li onClick={() => handleNavigation("/referral")}>Referral</li>
      </ul>
    </div>
  );
};

export default Sidebar;
