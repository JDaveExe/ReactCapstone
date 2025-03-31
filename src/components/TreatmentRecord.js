import React, { useState, useEffect } from 'react';
import '../styles/TreatmentRecord.css';

const TreatmentRecord = () => {
  const [formData, setFormData] = useState({
    familyNumber: '',
    name: '',
    address: '',
    philHealthNumber: '',
    sex: '',
    civilStatus: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    contactNumber: '',
    memberType: 'member',
    // Treatment record fields - left column
    leftDate: '',
    leftAge: '',
    leftCC: '',
    leftTemp: '',
    leftO2SAT: '',
    leftP: '',
    leftHT: '',
    leftR: '',
    leftWT: '',
    leftBP: '',
    leftVS: '',
    // Treatment record fields - right column
    rightDate: '',
    rightAge: '',
    rightCC: '',
    rightTemp: '',
    rightO2SAT: '',
    rightP: '',
    rightHT: '',
    rightR: '',
    rightWT: '',
    rightBP: '',
    rightVS: '',
  });

  const [age, setAge] = useState('');

  useEffect(() => {
    // Calculate age when birth date fields change
    if (formData.birthYear && formData.birthMonth && formData.birthDay) {
      const birthDate = new Date(
        parseInt(formData.birthYear), 
        parseInt(formData.birthMonth) - 1,  // JavaScript months are 0-indexed
        parseInt(formData.birthDay)
      );
      
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const isBirthdayPassed = 
        today.getMonth() > birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
      
      if (!isBirthdayPassed) {
        calculatedAge--;
      }
      
      setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
    } else {
      setAge('');
    }
  }, [formData.birthYear, formData.birthMonth, formData.birthDay]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Add API call or data processing logic here
  };

  // Generate month options
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  // Generate years from current year down to 120 years ago
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 121 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  // Field group component to reduce repetition
  const VitalSignsField = ({ prefix, label, name, value }) => (
    <div className="form-field">
      <label>{label}:</label>
      <input 
        type="text" 
        name={`${prefix}${name}`} 
        value={value} 
        onChange={handleChange} 
      />
    </div>
  );

  // Treatment record column component
  const TreatmentColumn = ({ side }) => {
    const prefix = side === 'left' ? 'left' : 'right';
    
    return (
      <div className="treatment-record-column">
        <div className="form-row">
          <VitalSignsField 
            prefix={prefix} 
            label="Date" 
            name="Date" 
            value={formData[`${prefix}Date`]} 
          />
          <VitalSignsField 
            prefix={prefix} 
            label="Age" 
            name="Age" 
            value={formData[`${prefix}Age`]} 
          />
        </div>

        <div className="form-row">
          <div className="form-field cc-field">
            <label>CC:</label>
            <textarea 
              name={`${prefix}CC`} 
              value={formData[`${prefix}CC`]} 
              onChange={handleChange} 
              placeholder="Chief Complaint"
            />
          </div>
        </div>

        <div className="form-row">
          <VitalSignsField 
            prefix={prefix} 
            label="Temp" 
            name="Temp" 
            value={formData[`${prefix}Temp`]} 
          />
          <VitalSignsField 
            prefix={prefix} 
            label="O2 SAT" 
            name="O2SAT" 
            value={formData[`${prefix}O2SAT`]} 
          />
        </div>

        <div className="form-row">
          <VitalSignsField 
            prefix={prefix} 
            label="P" 
            name="P" 
            value={formData[`${prefix}P`]} 
          />
          <VitalSignsField 
            prefix={prefix} 
            label="HT" 
            name="HT" 
            value={formData[`${prefix}HT`]} 
          />
        </div>

        <div className="form-row">
          <VitalSignsField 
            prefix={prefix} 
            label="R" 
            name="R" 
            value={formData[`${prefix}R`]} 
          />
          <VitalSignsField 
            prefix={prefix} 
            label="WT" 
            name="WT" 
            value={formData[`${prefix}WT`]} 
          />
        </div>

        <div className="form-row">
          <VitalSignsField 
            prefix={prefix} 
            label="BP" 
            name="BP" 
            value={formData[`${prefix}BP`]} 
          />
          <VitalSignsField 
            prefix={prefix} 
            label="V/S" 
            name="VS" 
            value={formData[`${prefix}VS`]} 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="treatment-record">
      <h2 className="treatment-record-title">Individual Treatment Record</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="personal-info-section">
          <div className="form-row">
            <div className="form-field family-number">
              <label>Family Number:</label>
              <input 
                type="text" 
                name="familyNumber" 
                value={formData.familyNumber} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field name-field">
              <label>Name:</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-field sex-field">
              <label>Sex:</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-field civil-status-field">
              <label>Civil Status:</label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field address-field">
              <label>Address:</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-field dob-field">
              <label>Date of Birth:</label>
              <div className="dob-container">
                <div className="dob-inputs">
                  <select
                    name="birthMonth"
                    value={formData.birthMonth}
                    onChange={handleChange}
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    name="birthDay"
                    value={formData.birthDay}
                    onChange={handleChange}
                  >
                    <option value="">Day</option>
                    {days.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    name="birthYear"
                    value={formData.birthYear}
                    onChange={handleChange}
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="age-display">
                  Age: {age}
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field philhealth-field">
              <label>PhilHealth Number:</label>
              <input 
                type="text" 
                name="philHealthNumber" 
                value={formData.philHealthNumber} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-field contact-field">
              <label>Contact Number:</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-row member-type-row">
            <div className="member-type-options">
              <div className="member-option">
                <label>
                  <input
                    type="radio"
                    name="memberType"
                    value="member"
                    checked={formData.memberType === 'member'}
                    onChange={(e) => setFormData({...formData, memberType: e.target.value})}
                  />
                  Member
                </label>
              </div>
              <div className="member-option">
                <label>
                  <input
                    type="radio"
                    name="memberType"
                    value="dependent"
                    checked={formData.memberType === 'dependent'}
                    onChange={(e) => setFormData({...formData, memberType: e.target.value})}
                  />
                  Dependent
                </label>
              </div>
              <div className="member-option">
                <label>
                  <input
                    type="radio"
                    name="memberType"
                    value="nonMember"
                    checked={formData.memberType === 'nonMember'}
                    onChange={(e) => setFormData({...formData, memberType: e.target.value})}
                  />
                  Non-Member
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="treatment-records-container">
          <TreatmentColumn side="left" />
          <TreatmentColumn side="right" />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Save Record</button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentRecord;