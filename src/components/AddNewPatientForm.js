import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFamilies, addPatientAsAdmin } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/AddNewPatientForm.css';

const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
const pasigStreets = [
  'Amang Rodriguez Avenue', 'C. Raymundo Avenue', 'Ortigas Avenue', 'Shaw Boulevard',
  'E. Rodriguez Jr. Avenue (C-5)', 'Marcos Highway', 'Julia Vargas Avenue',
  'F. Legaspi Bridge', 'San Guillermo Street', 'Dr. Sixto Antonio Avenue', 'Other'
];
const streetToBarangay = {
  'Amang Rodriguez Avenue': ['Manggahan', 'Rosario', 'Dela Paz'],
  'C. Raymundo Avenue': ['Caniogan', 'Pineda', 'Rosario'],
  'Ortigas Avenue': ['San Antonio', 'Ugong', 'Kapitolyo'],
  'Shaw Boulevard': ['Kapitolyo', 'Oranbo', 'Bagong Ilog'],
  'E. Rodriguez Jr. Avenue (C-5)': ['Ugong', 'Bagong Ilog', 'Pinagbuhatan'],
  'Marcos Highway': ['Maybunga', 'Manggahan', 'Santolan'],
  'Julia Vargas Avenue': ['San Antonio', 'Oranbo', 'Ugong'],
  'F. Legaspi Bridge': ['San Joaquin', 'Kalawaan', 'Malinao'],
  'San Guillermo Street': ['San Jose', 'Pineda', 'Palatiw'],
  'Dr. Sixto Antonio Avenue': ['Kapasigan', 'Bagong Ilog', 'Caniogan'],
  'Other': ['Bagong Katipunan', 'Bagong Ilog', 'Bambang', 'Buting', 'Caniogan', 'Dela Paz', 'Kalawaan', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga', 'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad', 'San Antonio', 'San Joaquin', 'San Jose', 'San Miguel', 'San Nicolas', 'Santa Cruz', 'Santa Lucia', 'Santa Rosa', 'Santo Tomas', 'Santolan', 'Sumilang', 'Ugong']
};

const checkPasswordStrength = (password) => {
  if (!password) return "";
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const length = password.length;

  if (length === 0) return "";
  if (length < 4) return "very-weak";
  if (length < 6) return "weak";

  const securityFeatures = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (length >= 6 && length < 8) {
    return securityFeatures >= 2 ? "medium" : "weak";
  }
  if (length >= 8 && length < 10) {
    return securityFeatures >= 2 ? "strong" : "medium";
  }
  if (length >= 10) {
    return securityFeatures >= 3 ? "very-strong" : securityFeatures >= 2 ? "strong" : "medium";
  }
  return "medium";
};

export default function AddNewPatientForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    password: '',
    repeatPassword: '',
    phoneNumber: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: 'Pasig',
    region: 'Metro Manila',
    philHealthNumber: '',
    membershipStatus: 'Member',
    dateOfBirth: null,
    age: '',
    gender: '',
    civilStatus: '',
    familyName: '',
  });

  const [existingFamilies, setExistingFamilies] = useState([]);
  const [selectedExistingFamily, setSelectedExistingFamily] = useState('');
  const [newFamilyNameInput, setNewFamilyNameInput] = useState('');
  const [showNewFamilyField, setShowNewFamilyField] = useState(false);
  
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    const fetchFamiliesData = async () => {
      setLoadingFamilies(true);
      try {
        const response = await getFamilies();
        setExistingFamilies(response.data.map(f => f.familyName));
      } catch (error) {
        console.error("Error fetching families:", error);
        setMessage({ type: 'error', content: 'Could not load existing families.' });
      }
      setLoadingFamilies(false);
    };
    fetchFamiliesData();
  }, []);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength("");
    }
  }, [formData.password]);

  const getAvailableBarangays = () => {
    if (formData.street) {
      return streetToBarangay[formData.street] || [];
    }
    return streetToBarangay['Other'] || [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'street') {
      setFormData(prev => ({ ...prev, street: value, barangay: '' }));    } else if (name === 'phoneNumber') {
      // Limit phone number to 11 digits and allow only numeric characters
      const numericValue = value.replace(/\D/g, '');
      const limitedValue = numericValue.slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: limitedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    const today = new Date();
    let computedAge = '';
    if (date) {
      computedAge = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        computedAge--;
      }
      computedAge = computedAge.toString();
    }
    setFormData(prev => ({ ...prev, dateOfBirth: date, age: computedAge }));
  };

  const handleFamilyOptionChange = (e) => {
    const value = e.target.value;
    setSelectedExistingFamily(value);
    if (value === '__NEW__') {
      setShowNewFamilyField(true);
      setFormData(prev => ({ ...prev, familyName: newFamilyNameInput }));
    } else {
      setShowNewFamilyField(false);
      setNewFamilyNameInput('');
      setFormData(prev => ({ ...prev, familyName: value }));
    }
  };
  
  const handleNewFamilyInputChange = (e) => {
    const newName = e.target.value;
    setNewFamilyNameInput(newName);
    if (showNewFamilyField) {
        setFormData(prev => ({ ...prev, familyName: newName }));
    }
  }

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowRepeatPassword = () => setShowRepeatPassword(!showRepeatPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (formData.password !== formData.repeatPassword) {
      setMessage({ type: 'error', content: 'Passwords do not match.' });
      return;
    }
    if (showNewFamilyField && !newFamilyNameInput.trim()) {
        setMessage({ type: 'error', content: 'New Family Name cannot be empty if selected.'});
        return;
    }
    if (!showNewFamilyField && !selectedExistingFamily) {
        setMessage({ type: 'error', content: 'Please select or create a family group.'});
        return;
    }
    
    let finalFamilyName = '';
    if (showNewFamilyField) {
        finalFamilyName = newFamilyNameInput.trim();
    } else {
        finalFamilyName = selectedExistingFamily;
    }

    if (!finalFamilyName) {
        setMessage({ type: 'error', content: 'Family Name is required.' });
        return;
    }

    setSubmitting(true);
    
    const patientData = {
      ...formData,
      familyName: finalFamilyName,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null,
    };
    delete patientData.repeatPassword; 

    try {
      await addPatientAsAdmin(patientData);
      setMessage({ type: 'success', content: 'Patient added successfully!' });
      setSubmitting(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding patient:", error);
      setMessage({ type: 'error', content: error.response?.data?.error || 'Failed to add patient. Please try again.' });
      setSubmitting(false);
    }
  };
  return (
    <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '900px', margin: '20px auto' }}>
      <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, marginBottom: 30, textAlign: 'center' }}>Add New Patient</h2>
      {message.content && (
        <Alert variant={message.type === 'error' ? 'danger' : 'success'} className="mb-4">
          {message.content}
        </Alert>
      )}
      <Form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: '30px', borderRadius: '8px' }}>
        <Row className="mb-3">
          <Col md={3}><Form.Group><Form.Control type="text" placeholder="First Name*" name="firstName" value={formData.firstName} onChange={handleChange} required /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Control type="text" placeholder="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Control type="text" placeholder="Last Name*" name="lastName" value={formData.lastName} onChange={handleChange} required /></Form.Group></Col>
          <Col md={3}><Form.Group><Form.Select name="suffix" value={formData.suffix} onChange={handleChange}>{suffixOptions.map(s => <option key={s} value={s}>{s || 'Suffix'}</option>)}</Form.Select></Form.Group></Col>
        </Row>        <Row className="mb-3">
          <Col md={6}><Form.Group><Form.Control type="email" placeholder="Email (optional if phone number is provided)" name="email" value={formData.email} onChange={handleChange} /></Form.Group></Col>
          <Col md={6}>
            <Form.Group>
              <Form.Control 
                type="tel" 
                placeholder="Phone Number (e.g. 09XXXXXXXXX)*" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                maxLength={11} 
                pattern="^09\d{9}$" 
                title="Enter a valid Philippine phone number starting with 09" 
                required 
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="form-text-highlight mb-3 ms-1 d-block">
            Provide either an email or a phone number.
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Initial Password*"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingRight: '40px' }}
              />
              <div
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
              </div>
            </div>            {formData.password && (
              <>
                <div className={`password-strength-indicator mt-2 ${passwordStrength}`}>
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                  <div className="strength-bar"></div>
                </div>
                <Form.Text className="strength-text">
                  {passwordStrength.replace('-', ' ')}
                </Form.Text>
              </>
            )}
          </Col>
          <Col md={6}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Form.Control
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repeat Initial Password*"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                required
                style={{ paddingRight: '40px' }}
              />
              <div
                onClick={toggleShowRepeatPassword}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showRepeatPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
            <Col md={6}>                <Form.Group>
                    <Form.Label>Membership Status*</Form.Label>
                    <Form.Select name="membershipStatus" value={formData.membershipStatus} onChange={handleChange} required>
                        <option value="Member">Member</option>
                        <option value="Non-Member">Non-Member</option>
                        <option value="Dependent">Dependent</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={6}>                
                <Form.Group>
                    <Form.Label>PhilHealth Number</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="PhilHealth Number" 
                        name="philHealthNumber" 
                        value={formData.philHealthNumber} 
                        onChange={handleChange} 
                        disabled={formData.membershipStatus === 'Non-Member'} 
                    />
                    {formData.membershipStatus === 'Non-Member' && (
                        <Form.Text className="text-muted">
                            PhilHealth Number not required for Non-Members
                        </Form.Text>
                    )}
                </Form.Group>
            </Col>
        </Row>        <Row className="mb-4">
          <Col md={3}><Form.Group><Form.Control type="text" placeholder="House No./Bldg No.*" name="houseNo" value={formData.houseNo} onChange={handleChange} required /></Form.Group></Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select name="street" value={formData.street} onChange={handleChange} required>
                <option value="">Select Street*</option>
                {pasigStreets.map(s => <option key={s} value={s}>{s}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Select name="barangay" value={formData.barangay} onChange={handleChange} required disabled={!formData.street}>
                <option value="">Select Barangay*</option>
                {getAvailableBarangays().map(b => <option key={b} value={b}>{b}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}><Form.Group><Form.Control type="text" placeholder="City" name="city" value={formData.city} readOnly /></Form.Group></Col>
          <Col md={2}><Form.Group><Form.Control type="text" placeholder="Region" name="region" value={formData.region} readOnly /></Form.Group></Col>
        </Row>
        
        <Row className="mb-4">          <Col md={3}>
            <Form.Group>              <DatePicker
                selected={formData.dateOfBirth}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Date of Birth*"
                className="form-control date-picker-input"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                maxDate={new Date()}
                required
                popperClassName="date-picker-popper"
                renderYearContent={year => (
                  <span style={{ color: "#ffffff", padding: "0 5px" }}>{year}</span>
                )}
                popperProps={{
                  positionFixed: true
                }}
              />
            </Form.Group>
          </Col>
          <Col md={3}><Form.Group><Form.Control type="text" placeholder="Age" name="age" value={formData.age} readOnly /></Form.Group></Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender*</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                <option value="">Civil Status*</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
                <option value="Divorced">Divorced</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>        <Row className="mb-4">
          <Col md={showNewFamilyField ? 6 : 6}>            
            <Form.Group controlId="selectFamilyGroup">
              <Form.Label>Assign to Family Group*</Form.Label>
              <Form.Select 
                onChange={handleFamilyOptionChange} 
                value={selectedExistingFamily} 
                disabled={loadingFamilies}
                style={{maxWidth: "300px"}}
              >
                <option value="">{loadingFamilies ? 'Loading families...' : 'Select Family'}</option>
                {!loadingFamilies && existingFamilies.map(fam => <option key={fam} value={fam}>{fam}</option>)}
                <option value="__NEW__">Create New</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {showNewFamilyField && (
            <Col md={6}>              <Form.Group controlId="newFamilyName">
                <Form.Label>New Family Name*</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter New Family Name" 
                  value={newFamilyNameInput}
                  onChange={handleNewFamilyInputChange}
                  required={showNewFamilyField} 
                />
              </Form.Group>
            </Col>
          )}
        </Row>
          <div className="d-flex justify-content-center mt-5">
          {onCancel && <Button variant="outline-light" onClick={onCancel} disabled={submitting} className="me-3 py-2 px-4">Cancel</Button>}
          <Button variant="primary" type="submit" disabled={submitting} className="py-2 px-5" style={{fontSize: '1rem'}}>
            {submitting ? 'Adding Patient...' : 'Add Patient'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
