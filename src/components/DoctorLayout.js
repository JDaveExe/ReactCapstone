import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import "../styles/DoctorLayout.css";
 
const DoctorLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
 
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
 
  return (
    <div className={`doctor-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <header className="top-bar">
        <div className="menu-toggle" onClick={toggleMobileMenu}>
          <i className="bi bi-list"></i>
        </div>
        <div className="hospital-name">
          <h1>Maybunga Health Center</h1>
        </div>
        <div className="user-info">
          <span>Doctor</span>
          <button className="btn btn-outline-danger btn-sm ms-3">Logout</button>
        </div>
      </header>
 
      <div className="layout-container">
        <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-toggle" onClick={toggleCollapse}>
            <i className={`bi bi-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </div>
         
          {!sidebarCollapsed && <h2 className="sidebar-title">Menu</h2>}
         
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <i className="bi bi-people"></i>
              {!sidebarCollapsed && <span>Patient Database</span>}
            </div>
            <div className="nav-item">
              <i className="bi bi-clipboard-check"></i>
              {!sidebarCollapsed && <span>Checkup</span>}
            </div>
            <div className="nav-item">
              <i className="bi bi-calendar-event"></i>
              {!sidebarCollapsed && <span>Appointments</span>}
            </div>
            <div className="nav-item">
              <i className="bi bi-graph-up"></i>
              {!sidebarCollapsed && <span>Analytics</span>}
            </div>
            <div className="nav-item">
              <i className="bi bi-gear"></i>
              {!sidebarCollapsed && <span>Settings</span>}
            </div>
          </nav>
        </aside>
 
        <main className="main-area">
          <Outlet />
        </main>
 
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
        )}
      </div>
    </div>
  );
};
 
export default DoctorLayout;