import React, { useState, useEffect } from 'react';
import '../styles/TreatmentRecord.css';
import VitalSignsHistory from './VitalSignsHistory';
import { Button } from 'react-bootstrap';

const TreatmentRecord = ({ member, onBack }) => {
  const [formData, setFormData] = useState({
    familySurname: member?.familyName || member?.familyId || '',
    familyId: member?.familyId || '',
    address: member?.address || '',
    philHealthNumber: member?.philHealthNumber || '',
    sex: member?.sex || member?.gender || '',
    civilStatus: member?.civilStatus || '',
    dateOfBirth: member?.dateOfBirth || '',
    memberType: member?.memberType || 'member',
    // Treatment record fields will be managed differently now
  });

  const [age, setAge] = useState('');
  const [showVitalSignsHistory, setShowVitalSignsHistory] = useState(false);

  useEffect(() => {
    // Calculate age when dateOfBirth changes
    if (formData.dateOfBirth) {
      try {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
      } catch (e) {
        setAge(''); // Invalid date format
      }
    } else {
      setAge('');
    }
  }, [formData.dateOfBirth]);

  // New useEffect to synchronize formData with member prop
  useEffect(() => {
    if (member) {
      setFormData(prevFormData => ({
        ...prevFormData, // Preserve existing treatment data and other non-member-derived fields
        familySurname: member.familyName || member.familyId || '',
        familyId: member.familyId || '',
        address: member.address || '',
        philHealthNumber: member.philHealthNumber || '',
        sex: member.sex || member.gender || '',
        civilStatus: member.civilStatus || '', // Ensure civilStatus is updated from member prop
        dateOfBirth: member.dateOfBirth || '',
        memberType: member.memberType || 'member', // Update memberType from prop, default if not present
      }));
    }
  }, [member]); // Dependency array includes member

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Updated formatDate to handle YYYY-MM-DD or return --- if not valid
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '---';
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      try {
        const date = new Date(dateString + 'T00:00:00'); // Ensure correct parsing by adding time component for UTC
        const monthName = months.find(m => m.value === (date.getMonth() + 1).toString())?.label || '';
        if (monthName) {
          return `${monthName} ${date.getDate()}, ${date.getFullYear()}`;
        }
        return dateString; // Fallback to YYYY-MM-DD if month name not found
      } catch (err) {
        return dateString; // Fallback if date parsing fails
      }
    }
    return '---'; // If not in YYYY-MM-DD or invalid
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
  const labelStyle = { color: '#38bdf8', fontSize: '14px' };
  const readOnlyInputBaseStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    borderColor: '#334155',
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    boxSizing: 'border-box', // Ensure padding doesn't affect overall width
  };
  const readOnlyInputStyle = {
    ...readOnlyInputBaseStyle,
    cursor: 'not-allowed',
  };
  const disabledSelectStyle = {
    ...readOnlyInputBaseStyle,
    appearance: 'none', // Removes default system appearance (like arrows)
    cursor: 'not-allowed',
    paddingRight: '12px', // Ensure text doesn't overlap where an arrow might have been
  };

  return (
    <div className="treatment-record dashboard-card" style={{ 
      backgroundColor: '#0f172a', 
      borderRadius: '8px', 
      padding: '20px',
      color: '#e5e7eb',
      width: '85%',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Blue title bar header */}
      <div style={{ 
        backgroundColor: '#38bdf8', 
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px',
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        Individual Treatment Record
      </div>
      
      <form> {/* Removed onSubmit={handleSubmit} */}
        <div className="personal-info-section" style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #334155'
        }}>
          {/* Row 1: Name (First, Middle, Last, Suffix) */}
          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <div className="form-field" style={{ flex: 1, minWidth: '150px' }}>
              <label style={labelStyle}>First Name:</label>
              <input type="text" value={member?.firstName || ''} readOnly style={readOnlyInputStyle} />
            </div>
            <div className="form-field" style={{ flex: 1, minWidth: '150px' }}>
              <label style={labelStyle}>Middle Name:</label>
              <input type="text" value={member?.middleName || ''} readOnly style={readOnlyInputStyle} />
            </div>
            <div className="form-field" style={{ flex: 1, minWidth: '150px' }}>
              <label style={labelStyle}>Last Name:</label>
              <input type="text" value={member?.lastName || ''} readOnly style={readOnlyInputStyle} />
            </div>
            <div className="form-field" style={{ flex: '0 1 100px', minWidth: '80px' }}>
              <label style={labelStyle}>Suffix:</label>
              <input type="text" value={member?.suffix || ''} readOnly style={readOnlyInputStyle} />
            </div>
          </div>

          {/* Row 2: Address */}
          <div className="form-row" style={{ display: 'flex', marginBottom: '15px' }}>
            <div className="form-field address-field" style={{ flex: '1', minWidth: '200px', width: '100%' }}>
              <label style={labelStyle}>Address:</label>
              <input 
                type="text" 
                name="address" 
                value={typeof formData.address === 'object' ? 
                  (formData.address.street || formData.address.barangay || formData.address.city || formData.address.region ? // Check if any part of address exists
                    `${formData.address.houseNo || ''} ${formData.address.street || ''}, ${formData.address.barangay || ''}, ${formData.address.city || 'Pasig'}, ${formData.address.region || 'Metro Manila'}`.replace(/^,|,$/g, '').replace(/,\s*,/g, ',').trim() : 
                    '' // Display empty if address object is empty
                  ) : formData.address} 
                readOnly
                style={readOnlyInputStyle}
              />
              {typeof formData.address === 'object' && formData.address.barangay && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#94a3b8', 
                  marginTop: '6px' 
                }}>
                  Barangay: {formData.address.barangay}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Date of Birth, Age, Gender & Civil Status */}
          <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Date of Birth Field */}
            <div className="form-field" style={{ flex: '1.5 1 200px', minWidth: '180px' }}>
              <label style={labelStyle}>Date of Birth:</label>
              <input 
                type="text" 
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} // Display YYYY-MM-DD
                readOnly 
                style={readOnlyInputStyle} 
              />
              <div style={{ marginTop: '6px', fontSize: '14px', color: '#94a3b8' }}>
                {formatDateForDisplay(formData.dateOfBirth)}
              </div>
            </div>

            {/* Age Field */}
            <div className="form-field" style={{ flex: '0.5 1 80px', minWidth: '70px' }}>
              <label style={labelStyle}>Age:</label>
              <input 
                type="text" 
                value={age || '---'} 
                readOnly 
                style={{...readOnlyInputStyle, textAlign: 'center'}} 
              />
            </div>

            {/* Gender Field */}
            <div className="form-field" style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <label style={labelStyle}>Gender:</label>
              <input 
                type="text" 
                value={formData.sex || '---'} 
                readOnly 
                style={readOnlyInputStyle} 
              />
            </div>

            {/* Civil Status Field */}
            <div className="form-field" style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <label style={labelStyle}>Civil Status:</label>
              <input 
                type="text" 
                value={formData.civilStatus || '---'} 
                readOnly 
                style={readOnlyInputStyle} 
              />
            </div>
          </div>          {/* Row 4: PhilHealth Information */}
          <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
            <div className="form-field philhealth-field" style={{ flex: '0 0 40%', minWidth: '250px' }}>
              <label style={labelStyle}>PhilHealth Number:</label>
              <input 
                type="text" 
                name="philHealthNumber" 
                value={formData.memberType === 'nonMember' ? '---' : formData.philHealthNumber} 
                readOnly 
                style={readOnlyInputStyle}
              />
              {formData.memberType === 'member' && (
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '6px' }}>
                  Member ID: {formData.philHealthNumber || 'Not Available'}
                </div>
              )}
            </div>
            <div className="member-type-options" style={{ display: 'flex', gap: '15px', marginTop: '22px', alignItems: 'flex-start' }}>
              <div className="member-option">
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}>
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
          
          {/* Vital Signs History Button */}
          <div className="form-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
            <Button
              variant="primary"
              onClick={() => setShowVitalSignsHistory(true)}
              style={{
                backgroundColor: '#38bdf8',
                borderColor: '#38bdf8',
                padding: '10px 20px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <i className="bi bi-activity"></i>
              <i className="bi bi-clock-history"></i>
              View Vital Signs History
            </Button>
          </div>
        </div>
        
        {/* Vital Signs History Modal */}
        <VitalSignsHistory 
          show={showVitalSignsHistory} 
          onHide={() => setShowVitalSignsHistory(false)} 
          patientId={member?.id} 
        />
      </form>
    </div>
  );
};

export default TreatmentRecord;