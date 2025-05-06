import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import DashboardAdm from "./components/DashboardAdm";
import SidebarAdmin from "./components/SidebarAdmin";
import TopbarAdmin from "./components/TopbarAdmin";
import Reports from "./components/Reports";
import AuthPage from "./components/AuthPage";
import PatientLayout from "./components/PatientLayout";

function App() {
  // Sidebar logic can be handled in each component if needed
  return (
    <Routes>
      {/* Public/User Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<Login />} />

      {/* Patient Routes with Sidebar/Topbar */}
      <Route element={<PatientLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/immunisation-history" element={<ImmunisationH />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/med-history" element={<TreatmentRecord />} />
        <Route path="/checkup-records" element={<CheckupRecords />} />
        <Route path="/admitting-data" element={<AdmittingData />} />
        <Route path="/manage" element={<Manage />} />
      </Route>

      {/* About Us and Contact Us without Sidebar/Topbar */}
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <DashboardAdm />
            </div>
          </div>
        </div>
      } />
      <Route path="/admin/manage-patient-data" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <Manage />
            </div>
          </div>
        </div>
      } />
      <Route path="/admin/settings" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <Asettings />
            </div>
          </div>
        </div>
      } />
      <Route path="/admin/appearance" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <div className="p-4">Appearance Settings Page</div>
            </div>
          </div>
        </div>
      } />
      <Route path="/admin/report/generate" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <Reports />
            </div>
          </div>
        </div>
      } />
      <Route path="/admin/referral" element={
        <div className="app-wrapper admin-app">
          <SidebarAdmin />
          <div className="admin-main-content">
            <TopbarAdmin />
            <div className="admin-content-area">
              <Referral />
            </div>
          </div>
        </div>
      } />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;