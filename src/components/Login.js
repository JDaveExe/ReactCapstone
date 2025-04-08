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
    const [loginError, setLoginError] = useState(""); // State for login error message
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoginError(""); // Clear any previous error messages

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                console.log('Login successful:', data);
                localStorage.setItem("userId", data.userId); // Store user ID (or a token if you implement JWT later)
                // For now, let's just set isLoggedIn to true. You'll likely want more robust state management.
                setIsLoggedIn(true);

                // You'll need to determine the user's role from the back-end response
                // For this basic example, let's assume the back-end sends a 'role' property
                const userRole = localStorage.getItem("userRole"); // You might need to fetch this from the back-end

                if (userRole === "admin") {
                    navigate("/dashboard");
                } else {
                    // For patients, update welcome message
                    // You might need to fetch the patient's name from the back-end
                    // based on the userId. For now, we'll keep the dummy patient name logic.
                    const users = [
                        { email: "admin@example.com", password: "admin123", role: "admin" },
                        { email: "patient@example.com", password: "patient123", role: "patient", name: "John Doe" }
                    ];
                    const user = users.find((u) => u.email === email);
                    if (user && user.role === "patient") {
                        setPatientName(user.name);
                    }
                    setIsLoggedIn(true);
                }
            } else {
                // Login failed
                setLoginError(data.message || "Invalid email or password!");
                console.error("Login failed:", data);
            }
        } catch (error) {
            setLoginError("An error occurred during login.");
            console.error("Login error:", error);
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel (unchanged) */}
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
                            <p className="welcome-message">
                                Your information has been received by our staff.
                                Please wait to be called.
                            </p>
                            <button
                                className="logout-button"
                                onClick={() => {
                                    setIsLoggedIn(false);
                                    setPatientName("");
                                    localStorage.removeItem("userId"); // Clear user ID on logout
                                }}
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
                                {loginError && <div className="alert alert-danger">{loginError}</div>} {/* Display error message */}
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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