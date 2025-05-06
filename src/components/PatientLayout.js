import React from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import { Outlet } from "react-router-dom";

const PatientLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="dashboard-container d-flex">
      <Sidebar 
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={toggleCollapse}
      />
      <div className={`dashboard-content w-100 ${sidebarCollapsed ? 'content-with-collapsed-sidebar' : ''}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid pb-9">
          {/* Removed pt-0 to allow PatientProfile CSS to control padding */}
          <Outlet />
        </div>
      </div>
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default PatientLayout;