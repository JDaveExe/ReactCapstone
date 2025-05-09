import React from "react";
import "../styles/PatientDashboard.css";

const PatientDashboard = ({ patientName }) => {
  return (
    <div className="patient-dashboard-wrapper" style={{ display: "flex", height: "100vh" }}>
      <aside className="sidebar" style={{ width: "250px", background: "#181d23", color: "#fff", padding: "24px 0" }}>
        <div className="sidebar-title" style={{ fontWeight: "bold", fontSize: "20px", paddingLeft: "24px", marginBottom: "24px" }}>
          Maybunga Health Ce...
        </div>
        <ul className="sidebar-nav" style={{ listStyle: "none", padding: 0 }}>
          <li className="nav-item active" style={{ padding: "12px 24px", display: "flex", alignItems: "center", background: "#23272e", borderRadius: "6px", marginBottom: "8px" }}>
            <i className="bi bi-columns-gap" style={{ marginRight: "8px" }}></i>
            <span>Dashboard</span>
          </li>
        </ul>
      </aside>
      <main className="main-content" style={{ flex: 1, background: "linear-gradient(120deg, #2c2c2c 0%, #b9936c 100%)", minHeight: "100vh", position: "relative" }}>
        <div className="top-bar" style={{ display: "flex", alignItems: "center", padding: "16px 32px 0 32px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button className="btn btn-outline-secondary me-2">&lt; Back</button>
            <button className="btn btn-outline-danger">Logout</button>
          </div>
          <span style={{ textAlign: "center", fontWeight: "bold", fontSize: "28px", flex: 1 }}>Maybunga Health Center</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="btn btn-outline-dark">Dark Mode</button>
            <span style={{ display: "flex", alignItems: "center" }}>
              <i className="bi bi-person-circle" style={{ fontSize: "24px", color: "#1976d2", marginRight: "4px" }}></i>
              Admin
            </span>
          </div>
        </div>
        <div className="welcome-card" style={{
          position: "absolute",
          top: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "600px",
          width: "90%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "32px",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "12px" }}>Welcome, {patientName || "damayan"}!</h2>
          <p style={{ color: "#555" }}>
            This is your patient dashboard. Use the sidebar to navigate through your medical records, checkups, and more.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;