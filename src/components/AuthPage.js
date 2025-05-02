import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Nav } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/AuthPage.css';
import logoImage from '../images/maybunga.png';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  // ===== LOGIN STATE =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ===== REGISTRATION STATE =====
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
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [regPasswordStrength, setRegPasswordStrength] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // ===== REGISTRATION DATA =====
  const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
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

  // ===== PASSWORD STRENGTH CHECKER =====
  // Modified to be less punishing
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    // Define criteria
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Less punishing criteria based primarily on length
    const length = password.length;
    
    if (length < 4) return "very-weak";
    if (length < 6) return "weak";
    
    // Count additional security features
    const securityFeatures = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (length >= 6 && length < 8) {
      return securityFeatures >= 2 ? "medium" : "weak";
    }
    
    if (length >= 8 && length < 10) {
      return securityFeatures >= 2 ? "strong" : "medium";
    }
    
    // 10+ characters with at least 2 special features is very strong
    if (length >= 10) {
      return securityFeatures >= 2 ? "very-strong" : "strong";
    }
    
    return "medium";
  };

  // Update password strength whenever registration password changes
  useEffect(() => {
    setRegPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  // ===== LOGIN FUNCTIONS =====
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRegPasswordVisibility = () => {
    setShowRegPassword(!showRegPassword);
  };

  const handleLogin = async () => {
    setLoginError(""); // Clear any previous error messages

    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const { user } = response.data;

      console.log("Login response:", user);

      // Store user data in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);

      // Store firstName directly if available
      if (user.firstName) {
        localStorage.setItem("firstName", user.firstName);
      }

      // Check if user is admin
      const isAdminUser = user.role === "admin";

      if (user.role === "patient" || user.role === "member") {
        localStorage.setItem("patientId", user.id);
        localStorage.setItem("patientName", user.name);
      }

      // Redirect based on role
      if (isAdminUser) {
        console.log("Redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Redirecting to patient dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setLoginError("User not found. Please register first.");
      } else if (error.response && error.response.status === 401) {
        setLoginError("Invalid credentials. Please try again.");
      } else {
        setLoginError("An error occurred. Please try again later.");
      }
      console.error("Login failed:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 'login') {
        handleLogin();
      } else {
        handleSubmit(e);
      }
    }
  };

  // ===== REGISTRATION FUNCTIONS =====
  const getAvailableBarangays = () => {
    if (formData.street) {
      return streetToBarangay[formData.street] || [];
    }
    return [];
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setRegistrationMessage('');
    setRegistrationError('');
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setRegistrationError('Please fill in all required fields');
      return;
    }
    
    try {
      console.log('Submitting form data:', formData);
      
      // Format dateOfBirth as YYYY-MM-DD
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? 
          formData.dateOfBirth.toISOString().split('T')[0] : 
          null
      };
      
      const response = await axios.post('http://localhost:5000/api/register', formattedData);
      console.log('Backend response:', response.data);
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      }));
      
      setRegistrationMessage('Registration successful! Redirecting to profile...');
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        window.location.href = '/patient-profile';
      }, 2000);
      
    } catch (error) {
      // Improved error handling to catch all possible error response formats
      if (error.response) {
        const errorData = error.response.data;
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
        setRegistrationError('Server did not respond. Please check your connection.');
      } else {
        setRegistrationError('Registration failed. Please try again.');
      }
    }
  };

  // Toggle between login and registration forms
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear errors when switching tabs
    setLoginError('');
    setRegistrationError('');
    setRegistrationMessage('');
  };

  // Password strength indicator UI component
  const PasswordStrengthIndicator = ({ strength }) => {
    if (!strength) return null;
    
    const getColorClass = () => {
      switch (strength) {
        case 'very-weak': return 'bg-danger';
        case 'weak': return 'bg-warning';
        case 'medium': return 'bg-info';
        case 'strong': return 'bg-success';
        case 'very-strong': return 'bg-success';
        default: return '';
      }
    };
    
    const getLabel = () => {
      switch (strength) {
        case 'very-weak': return 'Very Weak';
        case 'weak': return 'Weak';
        case 'medium': return 'Medium';
        case 'strong': return 'Strong';
        case 'very-strong': return 'Very Strong';
        default: return '';
      }
    };
    
    return (
      <div className="mt-1">
        <div className="d-flex align-items-center">
          <div className="progress flex-grow-1" style={{height: '5px'}}>
            <div 
              className={`progress-bar ${getColorClass()}`} 
              style={{
                width: 
                  strength === 'very-weak' ? '20%' : 
                  strength === 'weak' ? '40%' : 
                  strength === 'medium' ? '60%' : 
                  strength === 'strong' ? '80%' : '100%'
              }}
            ></div>
          </div>
          <small className="ms-2 text-muted">{getLabel()}</small>
        </div>
      </div>
    );
  };

  const renderLoginForm = () => {
    return (
      <div className="login-form">
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        
        <div className="form-group mb-3">
          <label htmlFor="username">Username</label>
          <input
            type="email"
            id="username"
            className="form-control form-control-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Username"
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password"
            />
            <span 
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? 
                <i className="bi bi-eye-fill"></i> : 
                <i className="bi bi-eye-slash-fill"></i>
              }
            </span>
          </div>
          {/* Password strength indicator removed from login form */}
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="rememberMe">
            Remember me
          </label>
        </div>

        <button 
          className="btn btn-primary w-100 btn-lg" 
          onClick={handleLogin}
        >
          Log In
        </button>

        <div className="text-center mt-3">
          <a href="#" className="forgot-password">
            Forgot password?
          </a>
        </div>
      </div>
    );
  };

  const renderRegistrationForm = () => {
    return (
      <div className="registration-form">
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
                <div className="position-relative">
                  <Form.Control
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span 
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ cursor: 'pointer' }}
                    onClick={toggleRegPasswordVisibility}
                  >
                    {showRegPassword ? 
                      <i className="bi bi-eye-fill"></i> : 
                      <i className="bi bi-eye-slash-fill"></i>
                    }
                  </span>
                </div>
                <PasswordStrengthIndicator strength={regPasswordStrength} />
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
            >
              Register
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="auth-card">
          <div className="text-center mb-4">
            <img 
              src={logoImage} 
              alt="Maybunga Health Center Logo" 
              className="auth-logo"
            />
            <h2 className="mt-3">Maybunga Health Center</h2>
          </div>

          <Nav className="auth-tabs mb-4" variant="tabs">
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'login' ? 'active' : ''}
                onClick={() => handleTabChange('login')}
              >
                Login
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                className={activeTab === 'register' ? 'active' : ''}
                onClick={() => handleTabChange('register')}
              >
                Register
              </Nav.Link>
            </Nav.Item>
          </Nav>
          
          <div className="auth-form-container">
            {activeTab === 'login' ? renderLoginForm() : renderRegistrationForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;