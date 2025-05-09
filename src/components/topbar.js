import React from "react";
import "../styles/topbar.css";

const Topbar = ({ userName, userRole, onSidebarToggle }) => {
  return (
    <header className="topbar-root">
      {onSidebarToggle && (
        <button className="topbar-sidebar-toggle" onClick={onSidebarToggle}>
          <i className="bi bi-list"></i>
        </button>
      )}
      <div className="topbar-title"></div>
      <div className="topbar-actions">
        <div className="topbar-profile">
          <span className="topbar-profile-avatar">
          </span>
          <span className="topbar-profile-name">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;