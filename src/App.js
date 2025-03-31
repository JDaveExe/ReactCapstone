import React, { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
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

function App() {
  let page = "home"; // Default page

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

  // Handle browser back button
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
      window.onpopstate = null; // Cleanup when unmounting
    };
  }, []);

  return (
    <div>
      <Header />
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
      <Footer />
    </div>
  );
}

export default App;
