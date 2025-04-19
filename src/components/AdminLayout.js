import React, { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";
import TopbarAdmin from "./TopbarAdmin";
import "../styles/AdminLayout.css"; // Adjust the path as necessary

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Add or remove class from body to adjust main content
    if (!sidebarCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  };

  return (
    <div className="admin-layout">
      <SidebarAdmin
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleCollapse}
      />
      <TopbarAdmin 
        toggleSidebar={toggleSidebar} 
        backButton={
          <button className="btn btn-outline-secondary btn-sm back-btn me-2" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
        }
        logoutButton={
          <button 
            className="btn btn-outline-danger btn-sm logout-btn" 
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                window.location.href = "/"; // Redirect to homepage
              }
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        }
      />
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;