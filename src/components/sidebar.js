import React, { useState } from "react";
import "../styles/sidebar.css";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [isMedRecordOpen, setMedRecordOpen] = useState(false);

  // Function to handle navigation using window.location.pathname
  const handleNavigation = (path) => {
    window.location.pathname = path;
    // Close sidebar after navigation on mobile
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <div className={`sidebar bg-dark text-light ${isOpen ? 'show' : ''}`}>
      <div className="p-3">
        {/* Add close button visible only on mobile */}
        <button 
          className="btn btn-sm btn-close btn-close-white float-end d-md-none" 
          onClick={closeSidebar}
          aria-label="Close sidebar"
        ></button>
        
        <h2 className="text-center py-3">Maybunga Health Center</h2>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button 
              className="nav-link text-start text-light w-100" 
              onClick={() => handleNavigation("/dashboard")}
            >
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </button>
          </li>
          
          <li className="nav-item">
            <button 
              className="nav-link text-start text-light w-100" 
              onClick={() => handleNavigation("/patient-profile")}
            >
              <i className="bi bi-person me-2"></i> Patient Profile
            </button>
          </li>
          
          <li className="nav-item">
            <button 
              className={`nav-link text-start text-light w-100 d-flex justify-content-between align-items-center`}
              onClick={() => setMedRecordOpen(!isMedRecordOpen)}
            >
              <span><i className="bi bi-file-medical me-2"></i> Med Record Summary</span>
              <i className={`bi bi-chevron-${isMedRecordOpen ? 'up' : 'down'}`}></i>
            </button>
          </li>
          
          {isMedRecordOpen && (
            <li className="nav-item submenu">
              <ul className="nav flex-column ms-3">
                <li className="nav-item">
                  <button 
                    className="nav-link text-start ps-4 text-light w-100" 
                    onClick={() => handleNavigation("/med-history")}
                  >
                    Individual Treatment Record
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link text-start ps-4 text-light w-100" 
                    onClick={() => handleNavigation("/admitting-data")}
                  >
                    Admitting Data
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link text-start ps-4 text-light w-100" 
                    onClick={() => handleNavigation("/immunisation-history")}
                  >
                    Immunisation History
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link text-start ps-4 text-light w-100" 
                    onClick={() => handleNavigation("/checkup-records")}
                  >
                    Recent Checkups
                  </button>
                </li>
              </ul>
            </li>
          )}
          
          <li className="nav-item">
            <button 
              className="nav-link text-start text-light w-100" 
              onClick={() => handleNavigation("/notification")}
            >
              <i className="bi bi-bell me-2"></i> Notification
            </button>
          </li>
          
          <li className="nav-item">
            <button 
              className="nav-link text-start text-light w-100" 
              onClick={() => handleNavigation("/referral")}
            >
              <i className="bi bi-arrow-left-right me-2"></i> Referral
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;