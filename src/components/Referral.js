import React from "react";
import "../styles/Referral.css";

const Referral = () => {
  return (
    <div className="referral-container">
      <h2 className="referral-header">MAYBUNGA HEALTH CENTER REFERRAL SLIP</h2>
      <div className="patient-info">
        <div className="input-group">
          <label>Full Name :</label>
          <input type="text" />
        </div>
        <div className="input-group">
          <label>Age/Sex:</label>
          <input type="text" />
        </div>
        <div className="input-group">
          <label>Address:</label>
          <div className="address-group">
            <input type="text" placeholder="House No." />
            <select>
              <option value="">Select Street</option>
              <option value="Street 1">Street 1</option>
              <option value="Street 2">Street 2</option>
            </select>
            <select>
              <option value="">Select Barangay</option>
              <option value="Barangay A">Barangay A</option>
              <option value="Barangay B">Barangay B</option>
            </select>
            <input type="text" value="Pasig" readOnly />
            <input type="text" value="Metro Manila" readOnly />
          </div>
        </div>
        <div className="input-group">
          <label>Date:</label>
          <input type="date" />
        </div>
      </div>

      <h3 className="section-title">LABORATORY REQUEST FORM</h3>
      <div className="lab-sections">
        <div className="lab-category">
          <h3>Hematology</h3>
          <label><input type="checkbox" /> CBC WITH PC</label>
          <label><input type="checkbox" /> Blood typing with Rh</label>
          <label><input type="checkbox" /> HBSAG</label>
          <label><input type="checkbox" /> HIV screening</label>
        </div>

        <div className="lab-category">
          <h3>Clinical Microscopy</h3>
          <label><input type="checkbox" /> Urinalysis</label>
        </div>

        <div className="lab-category">
          <h3>Clinical Chemistry</h3>
          <label><input type="checkbox" /> FBGS</label>
          <label><input type="checkbox" /> OGTT</label>
        </div>

        <div className="lab-category">
          <h3>Sonologic Examination</h3>
          <label><input type="checkbox" /> TVS</label>
          <label><input type="checkbox" /> PUTZ</label>
        </div>
      </div>

      <button className="print-button" onClick={() => window.print()}>Print</button>
    </div>
  );
};

export default Referral;
