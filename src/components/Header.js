import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <h1>Maybunga Healthcare Center</h1>
      <nav className="header-links">
        <Link to="/about-us" className="header-link">About Us</Link>
        <Link to="/contact" className="header-link">Contact</Link>
      </nav>
    </header> 
  );
};

export default Header;
