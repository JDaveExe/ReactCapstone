import React, { useState } from "react";
import "../styles/topbar.css";
import userIcon from "../images/user.png";

const Topbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = "/"; // Redirect to homepage
  };

  const goBack = () => {
    window.history.back(); // Navigate back
  };

  return (
    <header className="topbar">
      <button className="back-btn" onClick={goBack}>⬅ Back</button>
      <h2 className="topbar-title"></h2>
      <div className="profile-container">
        <button className="profile-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <img src={userIcon} alt="Profile" className="profile-icon" />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
