import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/Login.css";
import logoImage from '../images/maybunga.png';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [patientName, setPatientName] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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

            // Check if user is admin
            const isAdminUser = user.role === "admin";
            setIsAdmin(isAdminUser);

            if (user.role === "patient" || user.role === "member") {
                localStorage.setItem("patientId", user.id);
                localStorage.setItem("patientName", user.name);
                setPatientName(user.firstName || user.name.split(' ')[0]);
            }

            setIsLoggedIn(true);

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
        setIsAdmin(false);
        setPatientName("");
        setEmail("");
        setPassword("");
        
        // Redirect to login page
        navigate("/login");
    };

    return (
        <div className="login-wrapper">
            <div className="container">
                <div className="login-card">
                    <div className="text-center mb-4">
                        <img 
                            src={logoImage} 
                            alt="Maybunga Health Center Logo" 
                            className="login-logo"
                        />
                        <h2 className="mt-3">Sign In</h2>
                    </div>

                    {isLoggedIn ? (
                        <div className="welcome-container text-center">
                            <h2>Welcome</h2>
                            <h3>{isAdmin ? "Admin" : patientName}</h3>
                            <button
                                className="btn btn-danger w-100 mt-3"
                                onClick={handleLogout}
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <div className="login-form">
                            {loginError && <div className="alert alert-danger">{loginError}</div>}
                            
                            <div className="form-group mb-3">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="email"
                                    id="username"
                                    className="form-control"
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
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Password"
                                    />
                                    <span 
                                        className={`password-toggle-icon ${showPassword ? 'visible' : ''}`}
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? 
                                            <i className="bi bi-eye"></i> : 
                                            <i className="bi bi-eye-slash"></i>
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
                                className="btn btn-primary w-100" 
                                onClick={handleLogin}
                            >
                                Log In
                            </button>

                            <div className="text-center mt-3">
                                <a href="#" className="forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                            <div className="register-link text-center mt-3">
                                <a href="/register">Register instead</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;