import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Registration.css';

const Registration = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    password: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: 'Pasig',
    region: 'Metro Manila',
    contactNumber: '',
    philHealthNumber: '',
    membershipStatus: '',
    dateOfBirth: null,
    age: '',
    gender: '',
    civilStatus: ''
  });

  // State for registration messages
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationError, setRegistrationError] = useState('');

  // Suffix options
  const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

  // Streets in Pasig
  const pasigStreets = [
    'Amang Rodriguez Avenue',
    'C. Raymundo Avenue',
    'Ortigas Avenue',
    'Shaw Boulevard',
    'E. Rodriguez Jr. Avenue (C-5)',
    'Marcos Highway',
    'Julia Vargas Avenue',
    'F. Legaspi Bridge',
    'San Guillermo Street',
    'Dr. Sixto Antonio Avenue'
  ];

  // Barangays mapped to streets
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
    'Dr. Sixto Antonio Avenue': ['Kapasigan', 'Bagong Ilog', 'Caniogan']
  };

  // Return available barangays based on selected street
  const getAvailableBarangays = () => {
    if (formData.street) {
      return streetToBarangay[formData.street] || [];
    }
    return [];
  };

  // Handle input changes and update formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'street') {
      // Reset barangay when street changes
      setFormData({
        ...formData,
        street: value,
        barangay: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle the change of the date and calculate age
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
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date,
      age: computedAge
    }));
  };

  // Handle form submission with improved error handling
  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegistrationMessage('');
    setRegistrationError('');
    
    // Basic client-side validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setRegistrationError('Please fill in all required fields');
      return;
    }
    
    try {
      console.log('Submitting form data:', formData);
      
      // Format dateOfBirth for backend
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null
      };
      
      const response = await axios.post('http://localhost:5000/api/register', formattedData);
      console.log('Backend response:', response.data);
      
      setRegistrationMessage(response.data.message || 'Registration successful!');
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        email: '',
        password: '',
        houseNo: '',
        street: '',
        barangay: '',
        city: 'Pasig',
        region: 'Metro Manila',
        contactNumber: '',
        philHealthNumber: '',
        membershipStatus: '',
        dateOfBirth: null,
        age: '',
        gender: '',
        civilStatus: ''
      });
    } catch (error) {
      console.error('Error during registration:', error);
      
      // Improved error handling to catch all possible error response formats
      if (error.response) {
        const errorData = error.response.data;
        console.error('Backend error response:', errorData);
        
        if (errorData.error) {
          setRegistrationError(errorData.error);
        } else if (errorData.message) {
          setRegistrationError(errorData.message);
        } else if (errorData.details) {
          setRegistrationError(errorData.details);
        } else {
          setRegistrationError(`Registration failed (${error.response.status})`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setRegistrationError('Server did not respond. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setRegistrationError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Container
      className="mt-5 mb-5"
      style={{
        backgroundImage: 'url(/images/homepage.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
        borderRadius: '10px'
      }}
    >
      <Card
        className="registration-card"
        style={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <Card.Body>
          <h2
            className="text-center mb-4"
            style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#333' }}
          >
            Registration
          </h2>
          {registrationMessage && <div className="alert alert-success">{registrationMessage}</div>}
          {registrationError && <div className="alert alert-danger">{registrationError}</div>}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="firstName">
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="middleName">
                  <Form.Control
                    type="text"
                    placeholder="Middle Name"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="lastName">
                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="suffix">
                  <Form.Select name="suffix" value={formData.suffix} onChange={handleChange}>
                    <option value="" disabled>
                      Suffix
                    </option>
                    {suffixOptions.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option || 'None'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={2}>
                <Form.Group controlId="houseNo">
                  <Form.Control
                    type="text"
                    placeholder="House No."
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="street">
                  <Form.Select name="street" value={formData.street} onChange={handleChange} required>
                    <option value="" disabled>
                      Street
                    </option>
                    {pasigStreets.map((street, idx) => (
                      <option key={idx} value={street}>
                        {street}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="barangay">
                  <Form.Select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    disabled={!formData.street}
                    required
                  >
                    <option value="" disabled>
                      Barangay
                    </option>
                    {getAvailableBarangays().map((barangay, idx) => (
                      <option key={idx} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="city">
                  <Form.Control type="text" placeholder="City" name="city" value={formData.city} readOnly />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="region">
                  <Form.Control type="text" placeholder="Region" name="region" value={formData.region} readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="contactNumber">
                  <Form.Control
                    type="text"
                    placeholder="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="philHealthNumber">
                  <Form.Control
                    type="text"
                    placeholder="PhilHealth Number"
                    name="philHealthNumber"
                    value={formData.philHealthNumber}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="membershipStatus">
                  <Row>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="radio"
                          id="member"
                          name="membershipStatus"
                          value="member"
                          checked={formData.membershipStatus === 'member'}
                          onChange={handleChange}
                          label="Member"
                        />
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="radio"
                          id="nonmember"
                          name="membershipStatus"
                          value="nonmember"
                          checked={formData.membershipStatus === 'nonmember'}
                          onChange={handleChange}
                          label="Non Member"
                        />
                      </div>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="dateOfBirth">
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={handleDateChange}
                    className="form-control"
                    placeholderText="Date Of Birth"
                    dateFormat="MM/dd/yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="age">
                  <Form.Control
                    type="text"
                    placeholder="Age"
                    name="age"
                    value={formData.age}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="gender">
                  <Form.Select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="civilStatus">
                  <Form.Select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                    <option value="" disabled>
                      Civil Status
                    </option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="primary"
                type="submit"
                className="register-btn"
                style={{
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  padding: '10px 20px',
                  fontSize: '16px',
                  borderRadius: '5px'
                }}
              >
                Register
              </Button>
            </div>
            <div className="text-center mt-3">
              <a
                href="/login"
                className="login-link"
                style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Login Instead
              </a>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Registration;