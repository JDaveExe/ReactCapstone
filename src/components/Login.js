import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import logoImage from '../images/maybunga.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [patientName, setPatientName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();

    // Sample user data - in a real app, this would come from an API
    const users = [
        { 
            email: "admin@example.com", 
            password: "admin123", 
            role: "admin",
            name: "Admin User"
        },
        { 
            email: "patient@example.com", 
            password: "patient123", 
            role: "patient", 
            name: "John Doe",
            patientId: "PAT12345"
        }
    ];

    const handleLogin = async () => {
        setLoginError(""); // Clear any previous error messages

        // Find user with matching credentials
        const user = users.find((u) => u.email === email && u.password === password);

        if (user) {
            // Store user data in localStorage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userRole", user.role);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("userName", user.name);
            
            if (user.role === "patient") {
                localStorage.setItem("patientId", user.patientId || "");
                localStorage.setItem("patientName", user.name);
                setPatientName(user.name);
            }

            setIsLoggedIn(true);

            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard"); // Patient dashboard
            }
        } else {
            setLoginError("Invalid email or password!");
            console.error("Login failed: Invalid credentials");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogout = () => {
        // Clear all auth-related localStorage items
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("patientId");
        localStorage.removeItem("patientName");
        
        setIsLoggedIn(false);
        setPatientName("");
        setEmail("");
        setPassword("");
        
        // Redirect to login page
        navigate("/login");
    };

    return (
        <div className="login-container">
            {/* Left Panel */}
            <div className="login-left-panel">
                <div className="login-header">
                    Login or Use a QR code
                </div>
                <div className="login-icon">
                    <img
                        src={logoImage}
                        alt="Maybunga Health Center Logo"
                        className="logo-image img-fluid"
                    />
                </div>
            </div>

            {/* Right Panel */}
            <div className="login-right-panel">
                <div className="login-form-container">
                    {isLoggedIn ? (
                        <div className="welcome-container">
                            <h2 className="welcome-heading">Welcome</h2>
                            <h3 className="patient-name">{patientName}</h3>
                            <button
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="qr-placeholder">
                                <span className="text-muted">QR Code</span>
                            </div>

                            <div className="login-form">
                                {loginError && <div className="alert alert-danger">{loginError}</div>}
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <button className="login-button" onClick={handleLogin}>
                                    LOGIN
                                </button>

                                <div className="register-link">
                                    <a href="/register">Register instead</a>
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