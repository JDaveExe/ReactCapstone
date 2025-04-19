import React, { useState, useEffect } from "react";
    import "../styles/SidebarAdmin.css"; // Adjust the path as necessary

    const SidebarAdmin = ({ isOpen, closeSidebar, isCollapsed, toggleCollapse }) => {
    const [isReportDropdownOpen, setReportDropdownOpen] = useState(false);
    const [isPatientDropdownOpen, setPatientDropdownOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.sidebar');
        if (isOpen && sidebar && !sidebar.contains(event.target)) {
            closeSidebar();
        }
        };

        if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeSidebar]);

    const handleNavigation = (path) => {
        console.log("Navigating to:", path); // Debug: Log navigation path
        
        if (window.history && window.history.pushState) {
        window.history.pushState({}, '', path);
        
        // Dispatch a custom event that App.js can listen to for route changes
        const navigationEvent = new CustomEvent('locationChange', { detail: { path } });
        window.dispatchEvent(navigationEvent);
        console.log("Event dispatched for:", path); // Debug: Confirm event dispatched
        } else {
        // Fallback for older browsers
        window.location.pathname = path;
        }
        
        if (window.innerWidth < 768) {
        closeSidebar();
        }
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.body.classList.toggle("dark-mode", newDarkMode);
        // You might want to save this preference to localStorage
        localStorage.setItem('darkMode', newDarkMode);
    };

    return (
        <>
        {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        <div className={`sidebar bg-dark text-light ${isOpen ? 'show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="p-3">
            <button 
                className="btn btn-sm btn-close btn-close-white float-end d-md-none" 
                onClick={closeSidebar}
                aria-label="Close sidebar"
            ></button>
            
            {!isCollapsed && (
                <h2 className="text-center py-3">Maybunga</h2>
            )}
            
            <button 
                className="collapse-toggle btn btn-dark btn-sm position-absolute" 
                onClick={toggleCollapse}
            >
                <i className={`bi bi-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
            </button>
            
            <ul className="nav flex-column">
                <li className="nav-item">
                <button 
                    className="nav-link text-start text-light w-100 active" 
                    onClick={() => handleNavigation("/admin/dashboard")}
                    title="Dashboard"
                >
                    <i className="bi bi-speedometer2 me-2"></i>
                    {!isCollapsed && "Dashboard"}
                </button>
                </li>
                
                <li className="nav-item">
                <button 
                    className={`nav-link text-start text-light w-100 d-flex justify-content-between align-items-center`} 
                    onClick={() => !isCollapsed && setPatientDropdownOpen(!isPatientDropdownOpen)}
                    title="Patient Management"
                >
                    <span>
                    <i className="bi bi-people me-2"></i>
                    {!isCollapsed && "Patient Management"}
                    </span>
                    {!isCollapsed && (
                    <i className={`bi bi-chevron-${isPatientDropdownOpen ? 'up' : 'down'}`}></i>
                    )}
                </button>
                </li>

                {!isCollapsed && isPatientDropdownOpen && (
                <li className="nav-item submenu">
                    <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                        <button 
                        className="nav-link text-start ps-4 text-light w-100" 
                        onClick={() => handleNavigation("/admin/manage-patient-data")}
                        >
                        Manage Patient Data
                        </button>
                    </li>
                    </ul>
                </li>
                )}
                
                <li className="nav-item">
                <button 
                    className={`nav-link text-start text-light w-100 d-flex justify-content-between align-items-center`}
                    onClick={() => !isCollapsed && setReportDropdownOpen(!isReportDropdownOpen)}
                    title="Reports"
                >
                    <span>
                    <i className="bi bi-file-earmark-bar-graph me-2"></i>
                    {!isCollapsed && "Reports"}
                    </span>
                    {!isCollapsed && (
                    <i className={`bi bi-chevron-${isReportDropdownOpen ? 'up' : 'down'}`}></i>
                    )}
                </button>
                </li>
                
                {!isCollapsed && isReportDropdownOpen && (
                <li className="nav-item submenu">
                    <ul className="nav flex-column ms-3">
                    <li className="nav-item">
                        <button 
                        className="nav-link text-start ps-4 text-light w-100" 
                        onClick={() => handleNavigation("/admin/report/generate")}
                        >
                        Generate & Export
                        </button>
                    </li>
                    </ul>
                </li>
                )}

                <li className="nav-item">
                <button 
                    className="nav-link text-start text-light w-100" 
                    onClick={() => handleNavigation("/admin/settings")}
                    title="Admin Settings"
                >
                    <i className="bi bi-sliders me-2"></i>
                    {!isCollapsed && "Admin Settings"}
                </button>
                </li>
                
                <li className="nav-item">
              <button 
                className="nav-link text-start text-light w-100" 
                onClick={() => handleNavigation("/referral")}
                title="Referral"
              >
                <i className="bi bi-arrow-left-right me-2"></i>
                {!isCollapsed && "Referral"}
              </button>
            </li>
                            
                <li className="nav-item">
                <button 
                    className="nav-link text-start text-light w-100 d-flex justify-content-between align-items-center" 
                    onClick={() => handleNavigation("/admin/appearance")}
                    title="Appearance"
                >
                    <span>
                    <i className="bi bi-palette me-2"></i>
                    {!isCollapsed && "Appearance"}
                    </span>
                    {!isCollapsed && (
                    <div className="form-check form-switch ms-2">
                        <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        id="darkModeSwitch"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        />
                    </div>
                    )}
                </button>
                </li>
            </ul>
            </div>
        </div>
        </>
    );
    };

    export default SidebarAdmin;