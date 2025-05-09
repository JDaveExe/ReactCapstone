import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Nav } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { QrReader } from 'react-qr-reader';
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
  const [isQrLogin, setIsQrLogin] = useState(false);
  const [qrData, setQrData] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
 
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
  const [showQrCode, setShowQrCode] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userQrValue, setUserQrValue] = useState("");
 
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
  }
 
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
 
  const toggleQrLogin = () => {
    setIsQrLogin(!isQrLogin);
    if (!isQrLogin) {
      setShowQrScanner(true);
    } else {
      setShowQrScanner(false);
    }
    setLoginError("");
  };
 
  const handleLogin = async () => {
    setLoginError(""); // Clear any previous error messages
 
    // Hard-coded credentials check for admin and doctor
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "Admin User");
      localStorage.setItem("firstName", "Admin");
      console.log("Redirecting to admin dashboard");
      navigate("/admin/dashboard");
      return;
    } else if (email === "doctor@gmail.com" && password === "doctor") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "doctor");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "Doctor User");
      localStorage.setItem("firstName", "Doctor");
      console.log("Redirecting to doctor dashboard");
      navigate("/doctor/dashboard");
      return;
    }
 
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      const { user } = response.data;
 
      console.log("Login response:", user);
 
      // Store user data in localStorage consistently
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
     
      // Make sure we store the name consistently
      if (user.firstName) {
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("userName", `${user.firstName} ${user.lastName}`);
      } else if (user.name) {
        // If firstName is not available but name is, store the full name
        localStorage.setItem("userName", user.name);
        // Try to extract firstName from the full name
        const nameParts = user.name.split(' ');
        if (nameParts.length > 0) {
          localStorage.setItem("firstName", nameParts[0]);
        }
      }
 
      // Store patient ID if available
      if (user.role === "patient" || user.role === "member") {
        localStorage.setItem("patientId", user.id);
        if (!localStorage.getItem("patientName") && user.name) {
          localStorage.setItem("patientName", user.name);
        }
      }
 
      // Regular users (patients/members) go to dashboard
      console.log("Redirecting to patient dashboard");
      navigate("/dashboard");
     
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
 
  const handleQrLogin = async (scannedQrData) => {
    try {
      // Parse the QR data to get email and password
      const qrDataObj = JSON.parse(scannedQrData);
     
      if (!qrDataObj.email || !qrDataObj.authToken) {
        setLoginError("Invalid QR code format");
        return;
      }
     
      // Use the email and token from QR code for login
      const response = await axios.post('http://localhost:5000/api/login', {
        email: qrDataObj.email,
        password: qrDataObj.authToken
      });
     
      const { user } = response.data;
     
      console.log("QR Login response:", user);
     
      // Store user data in localStorage with the same pattern as regular login
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
     
      // Store name data consistently
      if (user.firstName) {
        localStorage.setItem("firstName", user.firstName);
        localStorage.setItem("userName", `${user.firstName} ${user.lastName}`);
      } else if (user.name) {
        localStorage.setItem("userName", user.name);
        // Try to extract firstName from the full name
        const nameParts = user.name.split(' ');
        if (nameParts.length > 0) {
          localStorage.setItem("firstName", nameParts[0]);
        }
      } else if (qrDataObj.name) {
        // If the name is in the QR code
        localStorage.setItem("userName", qrDataObj.name);
        // Try to extract firstName from the QR code name
        const nameParts = qrDataObj.name.split(' ');
        if (nameParts.length > 0) {
          localStorage.setItem("firstName", nameParts[0]);
        }
      }
     
      if (user.role === "patient" || user.role === "member") {
        localStorage.setItem("patientId", user.id);
        if (!localStorage.getItem("patientName") && user.name) {
          localStorage.setItem("patientName", user.name);
        }
      }
     
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
     
    } catch (error) {
      console.error("QR Login failed:", error);
      setLoginError("QR code login failed. Please try again or use password login.");
    }
  };
 
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 'login' && !isQrLogin) {
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
 
  // Generate a unique token for QR code
  const generateQrToken = () => {
    // In a real application, this should be a secure, properly generated token
    // This is just a simple example
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = new Date().getTime().toString(36);
    return randomString + timestamp;
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
     
      // Generate QR token
      const qrToken = generateQrToken();
     
      // Format dateOfBirth as YYYY-MM-DD
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ?
          formData.dateOfBirth.toISOString().split('T')[0] :
          null,
        // Store the original password in a variable
        originalPassword: formData.password
      };
     
      // In a real application, we'd store the QR token in the database
      // For now, we'll just use the original password as the token
     
      const response = await axios.post('http://localhost:5000/api/register', formattedData);
      console.log('Backend response:', response.data);
     
      // Create QR code data
      const qrData = JSON.stringify({
        email: formData.email,
        authToken: formData.password, // In a real app, use a different secure token
        name: `${formData.firstName} ${formData.lastName}`.trim()
      });
     
      setUserQrValue(qrData);
      setRegistrationComplete(true);
      setShowQrCode(true);
     
      setRegistrationMessage('Registration successful! Your QR code is ready below.');
     
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      }));
     
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
 
  // Download QR code as image
  const downloadQRCode = () => {
    const canvas = document.getElementById("user-qr-code");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
     
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `maybunga_health_qr_${formData.firstName}_${formData.lastName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
 
  // Print QR code
  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
   
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Maybunga Health Center - Your QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin: 0 auto;
              max-width: 400px;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
            .header {
              margin-bottom: 20px;
            }
            .user-info {
              margin: 20px 0;
              text-align: left;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #555;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="header">
              <h2>Maybunga Health Center</h2>
              <h3>Quick Login QR Code</h3>
            </div>
           
            <div>
              <img src="${document.getElementById('user-qr-code').toDataURL()}" alt="Your QR Code" style="width: 200px; height: 200px;">
            </div>
           
            <div class="user-info">
              <p><strong>Name:</strong> ${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName} ${formData.suffix || ''}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
           
            <div class="instructions">
              <p><strong>Instructions:</strong></p>
              <ol>
                <p>1. Keep this QR code safe and private</p>
                <p>2. Use this QR code to quickly log in to the Maybunga Health Center system</p>
                <p>3. If you lose this QR code, please contact the administrator</p>
              </ol>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
   
    printWindow.document.close();
  };
 
  // Toggle between login and registration forms
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear errors when switching tabs
    setLoginError('');
    setRegistrationError('');
    setRegistrationMessage('');
    setIsQrLogin(false);
    setShowQrScanner(false);
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
       
        {!isQrLogin ? (
          // Regular login form
          <>
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
              className="btn btn-primary w-100 btn-lg mb-3"
              onClick={handleLogin}
            >
              Log In
            </button>
          </>
        ) : (
          // QR Code login form
          <div className="qr-scanner-container text-center">
            <h4 className="mb-3">Scan Your QR Code to Login</h4>
           
            {showQrScanner && (
              <div className="qr-reader-wrapper mb-3">
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={(result) => {
                    if (result) {
                      setQrData(result.text);
                      handleQrLogin(result.text);
                      setShowQrScanner(false);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            )}
           
            <div className="text-center">
              <p className="text-muted">
                Position your QR code within the camera frame
              </p>
            </div>
          </div>
        )}
       
        <button
          className="btn btn-outline-secondary w-100"
          onClick={toggleQrLogin}
        >
          {isQrLogin ? "Login with Password" : "Login with QR Code"}
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
       
        {showQrCode && registrationComplete ? (
          <div className="qr-code-container text-center">
            <h4 className="mb-3">Your QR Code for Quick Login</h4>
            <div className="mb-3">
              <QRCode
                id="user-qr-code"
                value={userQrValue}
                size={200}
                level="H"
                includeMargin={true}
                className="mb-3"
              />
            </div>
            <p className="text-muted mb-4">
              Save this QR code to quickly log in to your account in the future.
              You can download or print it for your convenience.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" onClick={downloadQRCode}>
                <i className="bi bi-download me-2"></i>Download QR Code
              </Button>
              <Button variant="outline-primary" onClick={printQRCode}>
                <i className="bi bi-printer me-2"></i>Print QR Code
              </Button>
            </div>
            <div className="mt-4">
              <Button variant="link" onClick={() => {
                setShowQrCode(false);
                setActiveTab('login');
              }}>
                Go to Login
              </Button>
            </div>
          </div>
        ) : (
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
                      <Form.Check
                        type="radio"
                        id="member"
                        name="membershipStatus"
                        value="member"
                        checked={formData.membershipStatus === 'member'}
                        onChange={handleChange}
                        label="Member"
                        className="me-3"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Check
                        type="radio"
                        id="nonmember"
                        name="membershipStatus"
                        value="nonmember"
                        checked={formData.membershipStatus === 'nonmember'}
                        onChange={handleChange}
                        label="Non-Member"
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
 
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="dateOfBirth">
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={handleDateChange}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Date of Birth"
                    className="form-control"
                    maxDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="civilStatus">
                  <Form.Select name="civilStatus" value={formData.civilStatus} onChange={handleChange} required>
                    <option value="" disabled>
                      Civil Status
                    </option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
 
            <div className="text-center mt-4">
              <Button variant="primary" type="submit" className="w-100">
                Register
              </Button>
            </div>
          </Form>
        )}
      </div>
    );
  };
 
  return (
    <Container fluid className="auth-container">
      <Row>
        <Col lg={6} className="auth-left">
          <div className="logo-container mb-4">
            <img src={logoImage} alt="Maybunga Health Center Logo" className="logo-image" />
            <h3>Maybunga Health Center</h3>
          </div>
          <div className="welcome-message">
            <h1>Welcome to the Official Health Care System</h1>
            <p className="subtitle">Register or log in to access your health records and services</p>
          </div>
        </Col>
        <Col lg={6} className="auth-right">
          <Card className="auth-card">
            <Card.Body>
              <Nav variant="tabs" className="auth-tabs mb-4" activeKey={activeTab} onSelect={handleTabChange}>
                <Nav.Item>
                  <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="register">Register</Nav.Link>
                </Nav.Item>
              </Nav>
 
              {activeTab === 'login' ? renderLoginForm() : renderRegistrationForm()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
 
export default AuthPage;