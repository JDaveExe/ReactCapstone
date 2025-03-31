import React from "react";
import googlePlayImage from "../images/gp.png"; 
import "../styles/Footer.css";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="column">
        <p>Contact Us: (866) 294-7183</p>
        <div className="google-play">
          <img src={googlePlayImage} alt="Google Play" />
        </div>
      </div>

      <div className="column">
        <h3>Solutions</h3>
        <a href="#">EHR</a>
        <a href="#">Telehealth</a>
        <a href="#">Medical Billing</a>
        <a href="#">Revenue Cycle Management</a>
      </div>

      <div className="column">
        <h3>Practice</h3>
        <a href="#">EHR Checklist</a>
        <a href="#">ONC Certification</a>
        <a href="#">MACRA & MIPS</a>
      </div>

      <div className="column">
        <h3>Resources</h3>
        <a href="#">Support Center</a>
        <a href="#">Developer API</a>
        <a href="#">Medical Form Library</a>
      </div>

      <div className="footer-bottom">
        &copy; 2025 EverHealth Solutions Inc. DBA Maybunga Healthcenter. | Privacy | Terms of Use | Site Map
      </div>
    </footer>
  );
};

export default Footer;
