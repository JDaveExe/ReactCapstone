import React from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Topbar />
        <div className="grid-layout">
          <div className="grid-box"></div>
          <div className="grid-box"></div>
          <div className="grid-box"></div>
          <div className="grid-box"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
