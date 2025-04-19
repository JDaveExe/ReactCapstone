import React, { useState } from "react";
import "../styles/AdmittingData.css";

const AdmittingData = () => {
  const [formData, setFormData] = useState({
    placeOfBirth: "",
    attendance: [],
    otherAttendance: "",
    mannerOfDelivery: "",
    feedingType: "",
    motherVitaminA: false,
    motherVitaminADate: "",
    motherIron: false,
    motherIronDate: "",
    motherTetanusToxoid: false,
    motherTetanusToxoidNumber: "",
    infantVitaminK: false,
    infantVitaminKDate: "",
    infantNBS: false,
    infantNBSDate: "",
    complementaryFeeding: {
      month1: "",
      month2: "",
      month3: "",
      month4: "",
      month5: "",
      month6: "",
      complementary: ""
    }
  });

  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      if (name === "attendance") {
        let updatedAttendance = [...formData.attendance];
        if (checked) {
          updatedAttendance.push(value);
        } else {
          updatedAttendance = updatedAttendance.filter(item => item !== value);
        }
        setFormData({ ...formData, attendance: updatedAttendance });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFeedingTableChange = (e, month) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      complementaryFeeding: {
        ...formData.complementaryFeeding,
        [month]: value
      }
    });
  };

  return (
    <div className="admitting-data-container">
      <div className="admitting-data-card">
        <h2 className="admitting-data-title">Admitting Data</h2>
        
        <div className="admitting-data-grid">
          {/* Left Column */}
          <div className="admitting-data-left">
            <div className="form-section">
              <h3>Place of Birth:</h3>
              <div className="radio-group">
                <div className="radio-option">
                  <span className="option-label">Hospital</span>
                  <input
                    type="radio"
                    name="placeOfBirth"
                    value="Hospital"
                    checked={formData.placeOfBirth === "Hospital"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label">Lying-in</span>
                  <input
                    type="radio"
                    name="placeOfBirth"
                    value="Lying-in"
                    checked={formData.placeOfBirth === "Lying-in"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label">House</span>
                  <input
                    type="radio"
                    name="placeOfBirth"
                    value="House"
                    checked={formData.placeOfBirth === "House"}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Attendance:</h3>
              <div className="checkbox-group">
                <div className="checkbox-option">
                  <span className="option-label">Doctor</span>
                  <input
                    type="checkbox"
                    name="attendance"
                    value="Doctor"
                    checked={formData.attendance.includes("Doctor")}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="checkbox-option">
                  <span className="option-label">Nurse</span>
                  <input
                    type="checkbox"
                    name="attendance"
                    value="Nurse"
                    checked={formData.attendance.includes("Nurse")}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="checkbox-option">
                  <span className="option-label">Midwife</span>
                  <input
                    type="checkbox"
                    name="attendance"
                    value="Midwife"
                    checked={formData.attendance.includes("Midwife")}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="checkbox-option">
                  <span className="option-label">Hilot</span>
                  <input
                    type="checkbox"
                    name="attendance"
                    value="Hilot"
                    checked={formData.attendance.includes("Hilot")}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="checkbox-option">
                  <span className="option-label">Others</span>
                  <input
                    type="checkbox"
                    name="attendance"
                    value="Others"
                    checked={formData.attendance.includes("Others")}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="otherAttendance"
                    value={formData.otherAttendance}
                    onChange={handleInputChange}
                    className="inline-text-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Manner of Delivery:</h3>
              <div className="radio-group">
                <div className="radio-option">
                  <span className="option-label long-label">Normal Spontaneous Delivery</span>
                  <input
                    type="radio"
                    name="mannerOfDelivery"
                    value="Normal Spontaneous Delivery"
                    checked={formData.mannerOfDelivery === "Normal Spontaneous Delivery"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label long-label">Cesarean Section (CS)</span>
                  <input
                    type="radio"
                    name="mannerOfDelivery"
                    value="Cesarean Section (CS)"
                    checked={formData.mannerOfDelivery === "Cesarean Section (CS)"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label">Forceps</span>
                  <input
                    type="radio"
                    name="mannerOfDelivery"
                    value="Forceps"
                    checked={formData.mannerOfDelivery === "Forceps"}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Type of Feeding:</h3>
              <div className="radio-group">
                <div className="radio-option">
                  <span className="option-label long-label">Pure Breastfeeding</span>
                  <input
                    type="radio"
                    name="feedingType"
                    value="Pure Breastfeeding"
                    checked={formData.feedingType === "Pure Breastfeeding"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label long-label">Mixed Feeding</span>
                  <input
                    type="radio"
                    name="feedingType"
                    value="Mixed Feeding"
                    checked={formData.feedingType === "Mixed Feeding"}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="radio-option">
                  <span className="option-label long-label">Bottle Feeding</span>
                  <input
                    type="radio"
                    name="feedingType"
                    value="Bottle Feeding"
                    checked={formData.feedingType === "Bottle Feeding"}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="admitting-data-right">
            <div className="form-section">
              <h3>Mother:</h3>
              <div className="parent-section">
                <div className="vitamin-row">
                  <div className="checkbox-option">
                    <span className="option-label">Vitamin A</span>
                    <input
                      type="checkbox"
                      name="motherVitaminA"
                      checked={formData.motherVitaminA}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="date-field">
                    <span>Date:</span>
                    <input
                      type="date"
                      name="motherVitaminADate"
                      value={formData.motherVitaminADate}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
                
                <div className="vitamin-row">
                  <div className="checkbox-option">
                    <span className="option-label">Iron</span>
                    <input
                      type="checkbox"
                      name="motherIron"
                      checked={formData.motherIron}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="date-field">
                    <span>Date:</span>
                    <input
                      type="date"
                      name="motherIronDate"
                      value={formData.motherIronDate}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
                
                <div className="vitamin-row">
                  <div className="checkbox-option">
                    <span className="option-label">Tetanus Toxoid</span>
                    <input
                      type="checkbox"
                      name="motherTetanusToxoid"
                      checked={formData.motherTetanusToxoid}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="tt-number">
                  <span>No. of TT:</span>
                  <input
                    type="number"
                    name="motherTetanusToxoidNumber"
                    value={formData.motherTetanusToxoidNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Infant:</h3>
              <div className="parent-section">
                <div className="vitamin-row">
                  <div className="checkbox-option">
                    <span className="option-label">Vitamin K</span>
                    <input
                      type="checkbox"
                      name="infantVitaminK"
                      checked={formData.infantVitaminK}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="date-field">
                    <span>Date:</span>
                    <input
                      type="date"
                      name="infantVitaminKDate"
                      value={formData.infantVitaminKDate}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
                
                <div className="vitamin-row">
                  <div className="checkbox-option">
                    <span className="option-label">NBS</span>
                    <input
                      type="checkbox"
                      name="infantNBS"
                      checked={formData.infantNBS}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="date-field">
                    <span>Date:</span>
                    <input
                      type="date"
                      name="infantNBSDate"
                      value={formData.infantNBSDate}
                      onChange={handleInputChange}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Feeding Table */}
        <div className="feeding-table-section">
          <table className="feeding-table">
            <thead>
              <tr>
                <th>1st mo.</th>
                <th>2nd mo.</th>
                <th>3rd mo.</th>
                <th>4th mo.</th>
                <th>5th mo.</th>
                <th>6th mo.</th>
                <th className="complementary-heading">COMPLEMENTARY FEEDING</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month1}
                    onChange={(e) => handleFeedingTableChange(e, "month1")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month2}
                    onChange={(e) => handleFeedingTableChange(e, "month2")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month3}
                    onChange={(e) => handleFeedingTableChange(e, "month3")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month4}
                    onChange={(e) => handleFeedingTableChange(e, "month4")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month5}
                    onChange={(e) => handleFeedingTableChange(e, "month5")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={formData.complementaryFeeding.month6}
                    onChange={(e) => handleFeedingTableChange(e, "month6")}
                  />
                </td>
                <td rowSpan="2" className="complementary-cell">
                  <textarea
                    value={formData.complementaryFeeding.complementary}
                    onChange={(e) => handleFeedingTableChange(e, "complementary")}
                  ></textarea>
                </td>
              </tr>
              <tr>
                <td colSpan="6">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmittingData;