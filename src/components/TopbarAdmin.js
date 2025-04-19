import React, { useState } from "react";
import "../styles/topbar.css";
import userIcon from "../images/user.png";

const TopbarAdmin = ({ toggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/"; // Redirect to homepage
  };

  const goBack = () => {
    window.history.back(); // Navigate back
  };

  return (
    <header className="topbar bg-light shadow-sm py-2 px-3">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-sm btn-outline-secondary d-md-none me-2" 
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
          <button className="btn btn-outline-secondary btn-sm back-btn me-2" onClick={goBack}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button 
            className="btn btn-outline-danger btn-sm logout-btn" 
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                handleLogout();
              }
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
        <h2 className="topbar-title m-0 d-none d-md-block">Maybunga Health Center</h2>
        <div className="profile-container">
          <button 
            className="profile-btn btn btn-sm d-flex align-items-center" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <img src={userIcon} alt="Profile" className="profile-icon rounded-circle me-2" width="30" height="30" />
            <span className="d-none d-md-inline">Admin</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu show">
              <button className="dropdown-item logout-btn" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopbarAdmin;