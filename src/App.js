import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import './App.css';
import Homepage from "./components/Homepage";
import RegistrationForm from "./components/Registration";
import Dashboard from "./components/dashboard";
import Login from "./components/Login";
import PatientProfile from "./components/PatientProfile";
import ImmunisationH from "./components/ImmunisationH";
import Referral from "./components/Referral";
import Notification from "./components/Notification";
import TreatmentRecord from "./components/TreatmentRecord";
import AboutUs from "./components/AboutUs";
import ContactPage from "./components/Contact";
import CheckupRecords from "./components/CheckupRecords";
import AdmittingData from "./components/AdmittingData";
import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";
import Manage from "./components/Manage";
import Asettings from "./components/Asettings";
// Correct import paths for admin components
import DashboardAdm from "./components/DashboardAdm";
import SidebarAdmin from "./components/SidebarAdmin";
import TopbarAdmin from "./components/TopbarAdmin";
import Reports from "./components/Reports";
import AuthPage from "./components/AuthPage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Function to determine the current page based on path
  const determineCurrentPage = (path) => {
    console.log("Determining page for path:", path);
    
    // Handle regular paths
    if (path === "/") {
      return { page: "home", isAdmin: false };
    } else if (path === "/register") {
      return { page: "register", isAdmin: false };
    } else if (path === "/dashboard") {
      return { page: "dashboard", isAdmin: false };
    } else if (path === "/login") {
      return { page: "login", isAdmin: false };
    } else if (path === "/patient-profile") {
      return { page: "patient-profile", isAdmin: false };
    } else if (path === "/immunisation-history") { 
      return { page: "immunisation-history", isAdmin: false };
    } else if (path === "/referral") {
      return { page: "referral", isAdmin: false };
    } else if (path === "/notification") {
      return { page: "notification", isAdmin: false };
    } else if (path === "/med-history") {
      return { page: "med-history", isAdmin: false };
    } else if (path === "/about-us") {
      return { page: "about-us", isAdmin: false };
    } else if (path === "/contact") {
      return { page: "contact", isAdmin: false };
    } else if (path === "/checkup-records") {
      return { page: "checkup-records", isAdmin: false };
    } else if (path === "/admitting-data") {
      return { page: "admitting-data", isAdmin: false };
    } else if (path === "/manage") {
      return { page: "manage", isAdmin: false };
    } else if (path === "/auth") {
      return { page: "auth", isAdmin: false };
    } 
    // Handle admin paths
    else if (path === "/admin/dashboard") {
      return { page: "admin-dashboard", isAdmin: true };
    } else if (path === "/admin/manage-patient-data") {
      return { page: "admin-manage-patient", isAdmin: true };
    } else if (path === "/admin/settings") {
      return { page: "admin-settings", isAdmin: true };
    } else if (path === "/admin/appearance") {
      return { page: "admin-appearance", isAdmin: true };
    } else if (path === "/admin/report/generate") {
      return { page: "admin-report-generate", isAdmin: true };
    } else if (path === "/admin/referral") {
      return { page: "admin-referral", isAdmin: true };
    } else if (path.startsWith("/admin/")) {
      return { page: "admin-other", isAdmin: true };
    }
    
    // Default case
    return { page: "home", isAdmin: false };
  };

  // Get current page info based on path
  const pageInfo = determineCurrentPage(currentPath);
  const page = pageInfo.page;
  const isAdminPage = pageInfo.isAdmin;

// In App.js, modify the shouldShowSidebar function:
const shouldShowSidebar = () => {
  const noSidebarPages = ['home', 'login', 'register', 'about-us', 'contact', 'dashboard', 'auth'];
  return !noSidebarPages.includes(page) && !isAdminPage;
};

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    // Listen for custom location change events from our navigation function
    const handleLocationChange = (event) => {
      if (event.detail && event.detail.path) {
        console.log("Location change event received:", event.detail.path);
        setCurrentPath(event.detail.path);
      }
    };
    
    window.addEventListener('locationChange', handleLocationChange);
    
    // Handle browser back/forward navigation with selective prompting
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const pagesThatShouldPrompt = [
        '/patient-profile',
        '/immunisation-history',
        '/referral',
        '/med-history',
        '/checkup-records',
        '/admitting-data',
        '/admin/manage-patient-data',
        '/admin/settings',
        '/admin/appearance'
      ];
      
      // Only show prompt for certain pages
      if (pagesThatShouldPrompt.includes(currentPath)) {
        const confirmBack = window.confirm("Are you sure you want to leave this page? Your changes may not be saved.");
        if (!confirmBack) {
          window.history.pushState(null, "", currentPath);
          return;
        }
      }
      
      setCurrentPath(newPath);
    };

    // Initialize the history state
    window.history.replaceState({ key: 'initial' }, '', window.location.pathname);
    
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('locationChange', handleLocationChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentPath]);

  console.log("Current page:", page, "isAdminPage:", isAdminPage);

  // Render admin layout if it's an admin page
  if (isAdminPage) {
    return (
      <div className="app-wrapper admin-app">
        <SidebarAdmin
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleSidebarCollapse}
        />
        <div className={`admin-main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <TopbarAdmin toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="admin-content-area">
            {page === "admin-dashboard" && <DashboardAdm />}
            {page === "admin-manage-patient" && <Manage />}
            {page === "admin-settings" && <Asettings />}
            {page === "admin-report-generate" && <Reports />}
            {page === "admin-appearance" && <div className="p-4">Appearance Settings Page</div>}
            {page === "admin-referral" && <Referral />}
            {page === "admin-other" && <div className="p-4">Other Admin Page Content</div>}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render regular app layout
  return (
    <div className="app-wrapper">
      {shouldShowSidebar() && (
        <div className="sidebar-container">
          <Sidebar 
            isOpen={isSidebarOpen} 
            closeSidebar={() => setIsSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={toggleSidebarCollapse}
          />
        </div>
      )}

      <div className={`main-content ${!shouldShowSidebar() ? 'full-width' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {shouldShowSidebar() && page !== "dashboard" && page !== "auth" && (
          <Topbar 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebarCollapse={toggleSidebarCollapse}
          />
        )}
        <div className="content-area">
          {page === "home" && <Homepage />}
          {page === "auth" && <AuthPage />}
          {page === "register" && <RegistrationForm />}
          {page === "login" && <Login />}
          {page === "patient-profile" && <PatientProfile />}
          {page === "immunisation-history" && <ImmunisationH />}
          {page === "referral" && <Referral />}
          {page === "notification" && <Notification />}
          {page === "med-history" && <TreatmentRecord />}
          {page === "about-us" && <AboutUs />}
          {page === "contact" && <ContactPage />}
          {page === "checkup-records" && <CheckupRecords />}
          {page === "admitting-data" && <AdmittingData />}
          {page === "manage" && <Manage />}
        </div>
      </div>
    </div>
  );
}

export default App;