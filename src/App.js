import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  let page = "home";

  if (window.location.pathname === "/register") {
    page = "register";
  } else if (window.location.pathname === "/dashboard") {
    page = "dashboard";
  } else if (window.location.pathname === "/login") {
    page = "login";
  } else if (window.location.pathname === "/patient-profile") {
    page = "patient-profile";
  } else if (window.location.pathname === "/immunisation-history") { 
    page = "immunisation-history";
  } else if (window.location.pathname === "/referral") {
    page = "referral";
  } else if (window.location.pathname === "/notification") {
    page = "notification";
  } else if (window.location.pathname === "/med-history") {
    page = "med-history";
  } else if (window.location.pathname === "/about-us") {
    page = "about-us";
  } else if (window.location.pathname === "/contact") {
    page = "contact";
  } else if (window.location.pathname === "/checkup-records") {
    page = "checkup-records";
  } else if (window.location.pathname === "/admitting-data") {
    page = "admitting-data";
  }

  // Add function to check if sidebar should be shown
  const shouldShowSidebar = () => {
    const noSidebarPages = ['home', 'login', 'register', 'about-us', 'contact'];
    return !noSidebarPages.includes(page);
  };

  useEffect(() => {
    const handleBackNavigation = (event) => {
      event.preventDefault();
      const confirmBack = window.confirm("Do you confirm?");
      if (!confirmBack) {
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.history.pushState(null, "", window.location.pathname);
    window.onpopstate = handleBackNavigation;

    return () => {
      window.onpopstate = null;
    };
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        {shouldShowSidebar() && (
          <div className="col-md-2 p-0">
            <Sidebar 
              isOpen={isSidebarOpen} 
              closeSidebar={() => setIsSidebarOpen(false)} 
            />
          </div>
        )}

        {/* Main Area - adjust column width based on sidebar presence */}
        <div className={`${shouldShowSidebar() ? 'col-md-10' : 'col-12'} p-0`}>
          {shouldShowSidebar() && (
            <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          )}
          <div className="p-3">
            {page === "home" && <Homepage />}
            {page === "register" && <RegistrationForm />}
            {page === "dashboard" && <Dashboard />}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
