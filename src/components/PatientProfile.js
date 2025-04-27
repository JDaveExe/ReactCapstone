import React, { useState, useEffect } from "react";
import "../styles/PatientProfile.css";

const PatientProfile = () => {
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [age, setAge] = useState("");

  // Barangay filtering logic (to be updated with actual data)
  const barangayOptions = {
    "Street 1": ["Barangay A", "Barangay B"],
    "Street 2": ["Barangay C", "Barangay D"],
  };
  
  // Sample places of birth (can be updated with actual data)
  const birthPlaceOptions = [
    "Manila", 
    "Quezon City", 
    "Cebu", 
    "Davao", 
    "Pasig", 
    "Makati",
    "Other"
  ];

  const handleStreetChange = (e) => {
    setStreet(e.target.value);
    setBarangay(""); // Reset barangay selection when street changes
  };

  // Use useEffect to calculate age whenever any birth date component changes
  useEffect(() => {
    if (birthMonth && birthDay && birthYear) {
      const birthDate = new Date(
        parseInt(birthYear),
        parseInt(birthMonth) - 1,
        parseInt(birthDay)
      );
      
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      
      // Check if birthday hasn't occurred yet this year
      if (
        today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }
      
      setAge(calculatedAge.toString());
    } else {
      setAge("");
    }
  }, [birthMonth, birthDay, birthYear]);
  
  return (
    <div className="patient-profile">
      <h2>Patient Profile</h2>
      
      <div className="form-row">
        <div className="form-group"><label>Last Name</label><input type="text" /></div>
        <div className="form-group"><label>First Name</label><input type="text" /></div>
        <div className="form-group small-input"><label>Middle Initial</label><input type="text" /></div>
        <div className="form-group small-input"><label>Suffix</label><input type="text" /></div>
      </div>
      
      <div className="form-row">
        <div className="form-group"><label>House No.</label><input type="text" /></div>
        <div className="form-group">
          <label>Street</label>
          <select value={street} onChange={handleStreetChange}>
            <option value="">Select Street</option>
            {Object.keys(barangayOptions).map((street) => (
              <option key={street} value={street}>{street}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Barangay</label>
          <select value={barangay} onChange={(e) => setBarangay(e.target.value)} disabled={!street}>
            <option value="">Select Barangay</option>
            {street && barangayOptions[street]?.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
        </div>
        <div className="form-group small-input"><label>Municipality</label><input type="text" value="Pasig" readOnly /></div>
        <div className="form-group small-input"><label>Province</label><input type="text" value="Metro Manila" readOnly /></div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Gender</label>
          <select>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Civil Status</label>
          <select>
            <option>Single</option>
            <option>Married</option>
            <option>Widowed</option>
            <option>Divorced</option>
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Date of Birth</label>
          <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
            <option value="">Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Day</label>
          <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
            <option value="">Day</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Year</label>
          <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
            <option value="">Year</option>
            {[...Array(new Date().getFullYear() - 1899)].map((_, i) => (
              <option key={i + 1900} value={i + 1900}>{i + 1900}</option>
            ))}
          </select>
        </div>
        <div className="form-group small-input">
          <label>Age</label>
          <input type="text" value={age} readOnly />
        </div>
        <div className="form-group">
          <label>Place of Birth</label>
          <select>
            <option value="">Select Place of Birth</option>
            {birthPlaceOptions.map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group"><label>Contact Number</label><input type="text" /></div>
        <div className="form-group"><label>Philhealth Number</label><input type="text" /></div>
        <div className="form-group small-input"><label>Member</label><input type="checkbox" /></div>
        <div className="form-group small-input"><label>Non-Member</label><input type="checkbox" /></div>
      </div>
    </div>
  );
};

export default PatientProfile;