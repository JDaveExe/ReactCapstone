import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logoImage from '../images/maybunga.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Store patient name and logged in state
  const [patientName, setPatientName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Dummy user authentication (Replace with Firebase later)
    const users = [
      { email: "admin@example.com", password: "admin123", role: "admin" },
      { email: "patient@example.com", password: "patient123", role: "patient", name: "John Doe" }
    ];

    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("userRole", user.role);
      
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        // For patients, show welcome message instead of redirecting
        setPatientName(user.name);
        setIsLoggedIn(true);
        // You could also trigger some notification to staff here
      }
    } else {
      alert("Invalid email or password!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="login-header">
          Login or Use a QR code
        </div>
        <div className="login-icon">
          <img 
            src={logoImage} 
            alt="Maybunga Health Center Logo" 
            className="logo-image"
          />
        </div>
      </div>
      
      <div className="login-right-panel">
        <div className="login-form-container">
          {isLoggedIn ? (
            <div className="welcome-container">
              <h2 className="welcome-heading">Welcome</h2>
              <h3 className="patient-name">{patientName}</h3>
              <p className="welcome-message">
                Your information has been received by our staff.
                Please wait to be called.
              </p>
              <button 
                className="logout-button" 
                onClick={() => {
                  setIsLoggedIn(false);
                  setPatientName("");
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <>
              <div className="qr-placeholder"></div>
              
              <div className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button className="login-button" onClick={handleLogin}>
                  LOGIN
                </button>
                
                <div className="register-link">
                  <a href="/register">Registered instead</a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;