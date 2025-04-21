import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Login.css";
import logoImage from '../images/maybunga.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [patientName, setPatientName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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

            if (user.role === "patient" || user.role === "member") {
                localStorage.setItem("patientId", user.id);
                localStorage.setItem("patientName", user.name);
                setPatientName(user.firstName || user.name.split(' ')[0]);
            }

            setIsLoggedIn(true);

            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard"); // Patient dashboard
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
        localStorage.removeItem("firstName");
        
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
                                    <div className="password-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            className="form-control"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Enter your password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                            style={{ cursor: "pointer", marginLeft: "10px" }}
                                        >
                                            {showPassword ? "👁️" : "🙈"}
                                        </span>
                                    </div>
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