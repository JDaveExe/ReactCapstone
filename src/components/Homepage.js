import React from "react";
import homepageImage from "../images/homepage.webp";
import recordsImage from "../images/records.png";
import qrCodeImage from "../images/qrcode.png";
import consultationImage from "../images/consultation.png";
import folderImage from "../images/folder.png";
import pcImage from "../images/pc.png";
import scanImage from "../images/scan.png";
import ucheckImage from "../images/ucheck.png";
import "../styles/Homepage.css";

const Homepage = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="homepage-container">
        <div className="text-content">
          <h1>Focus on Patient Care, Not Paperwork.</h1>
          <p>A healthcare management system that lets you prioritize what matters most.</p>
          <div className="button-group">
          <a href="/register" className="primary-button">Get Started</a> {/* ✅ Navigate to Register */}
          <a href="/login" className="secondary-button">Log In</a>
        </div>
        </div>
        <div className="image-container">
          <img src={homepageImage} alt="Healthcare Illustration" />
        </div>
      </div>

      {/* EHR Section */}
      <section className="ehr-section">
        <h2>A Health Center EHR Platform That Adapts to Your Needs</h2>
        <div className="features">
          <div className="feature">
            <img src={recordsImage} alt="Patient Record Management" />
            <h3>Patient Record Management</h3>
            <p>Securely store and manage patient data.</p>
            <a href="#">Learn more &gt;</a>
          </div>
          <div className="feature">
            <img src={qrCodeImage} alt="QR Code-Based Access" />
            <h3>QR Code-Based Access</h3>
            <p>Easy retrieval of medical records using QR codes.</p>
            <a href="#">Learn more &gt;</a>
          </div>
          <div className="feature">
            <img src={consultationImage} alt="Consultation & Tracking" />
            <h3>Consultation & Tracking</h3>
            <p>Doctors can log and monitor consultations.</p>
            <a href="#">Learn more &gt;</a>
          </div>
          <div className="feature">
            <img src={folderImage} alt="Secure Data Storage" />
            <h3>Secure Data Storage</h3>
            <p>Safely store medical data with encryption.</p>
            <a href="#">Learn more &gt;</a>
          </div>
        </div>
      </section>

      {/* Devices Section */}
      <section className="ehr-devices">
        <h2>Manage Your Health Center Anytime, Anywhere</h2>
        <p>Streamline scheduling, patient care, and billing with an all-in-one web-based EHR system.</p>
        <div className="devices-image">
          <img src={pcImage} alt="Laptop, tablet, and phone showing the system" />
        </div>
      </section>

      {/* Smart Healthcare Management Section */}
      <section className="ehr-smart">
        <div className="ehr-content">
          <h1>Smart Healthcare Management at Your Fingertips</h1>
          <p>
            Easily store, track, and manage patient records, appointments, and billing—all in one seamless web-based EHR system.
          </p>
          <button>Find your Specialty</button>
        </div>
        <div className="ehr-icons">
          <div>
            <img src={scanImage} alt="QR Code Scanning" width="80px" />
            <p>QR Code Scanning</p>
          </div>
          <div>
            <img src={ucheckImage} alt="User-Friendly Dashboard" width="80px" />
            <p>User-Friendly Dashboard</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
