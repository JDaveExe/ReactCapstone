import React, { useState, useEffect } from "react";
import "../styles/sidebar.css";

const Sidebar = ({ isOpen, closeSidebar, isCollapsed, toggleCollapse }) => {
  const [isMedRecordOpen, setMedRecordOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      if (isOpen && sidebar && !sidebar.contains(event.target)) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSidebar]);

  const handleNavigation = (path) => {
    window.location.pathname = path;
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <div className={`sidebar bg-dark text-light ${isOpen ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="p-3">
          <button 
            className="btn btn-sm btn-close btn-close-white float-end d-md-none" 
            onClick={closeSidebar}
            aria-label="Close sidebar"
          ></button>
          
          {!isCollapsed && (
            <h2 className="text-center py-3">Maybunga Health Center</h2>
          )}
          
          <button 
            className="collapse-toggle btn btn-dark btn-sm position-absolute" 
            onClick={toggleCollapse}
          >
            <i className={`bi bi-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
          </button>
          
          <ul className="nav flex-column">
            <li className="nav-item">
              <button 
                className="nav-link text-start text-light w-100" 
                onClick={() => handleNavigation("/dashboard")}
                title="Dashboard"
              >
                <i className="bi bi-speedometer2 me-2"></i>
                {!isCollapsed && "Dashboard"}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link text-start text-light w-100" 
                onClick={() => handleNavigation("/patient-profile")}
                title="Patient Profile"
              >
                <i className="bi bi-person me-2"></i>
                {!isCollapsed && "Patient Profile"}
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className={`nav-link text-start text-light w-100 d-flex justify-content-between align-items-center`}
                onClick={() => !isCollapsed && setMedRecordOpen(!isMedRecordOpen)}
                title="Med Record Summary"
              >
                <span>
                  <i className="bi bi-file-medical me-2"></i>
                  {!isCollapsed && "Med Record Summary"}
                </span>
                {!isCollapsed && (
                  <i className={`bi bi-chevron-${isMedRecordOpen ? 'up' : 'down'}`}></i>
                )}
              </button>
            </li>
            
            {!isCollapsed && isMedRecordOpen && (
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
                title="Notification"
              >
                <i className="bi bi-bell me-2"></i>
                {!isCollapsed && "Notification"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;