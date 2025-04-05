import React, { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add this function to specifically close the sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-container d-flex">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <div className="dashboard-content w-100">
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid py-3">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Patients</h5>
                  <p className="card-text fs-4">245</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Appointments</h5>
                  <p className="card-text fs-4">18</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Referrals</h5>
                  <p className="card-text fs-4">7</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <div className="card h-100 dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Notifications</h5>
                  <p className="card-text fs-4">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add overlay that closes sidebar when clicked (mobile only) */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none" 
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;