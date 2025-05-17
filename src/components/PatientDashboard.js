import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Settings, LogOut, User, Menu, X, ChevronDown, ChevronUp,
  FileText, Activity, Pill, Shield, Clock, Home, QrCode, Download, Printer
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/PatientDashboard.css';
import AdmittingData from './AdmittingData';
import TreatmentRecord from './TreatmentRecord';
import CKProfile from './CKProfile';
import RegisteredProfile from './RegisteredProfile';

// SidebarItem Component
function SidebarItem({ icon, label, active, collapsed, indent, onClick }) {
  return (
    <div 
      className={`sidebar-item${active ? ' active' : ''}${indent ? ' indent' : ''}`}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

// SidebarDropdown Component
function SidebarDropdown({ icon, label, children, collapsed, isOpen, onClick }) {
  return (
    <div>
      <div 
        className={`sidebar-dropdown-toggle${isOpen ? ' active' : ''}`}
        onClick={onClick}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ marginRight: '14px' }}>{icon}</span>}
          {!collapsed && <span>{label}</span>}
        </div>
        {!collapsed && (
          <span>{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
        )}
      </div>
      {isOpen && !collapsed && (
        <div className="sidebar-dropdown-content">
          {children}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, children, onClose, onZoom }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">{title}</h2>
        {(onClose || onZoom) && (
          <div className="card-controls">
            {onZoom && (
              <button className="icon-button" onClick={onZoom} aria-label="Zoom">
                <User size={16} />
              </button>
            )}
            {onClose && (
              <button className="icon-button" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function PatientDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showQrDropdown, setShowQrDropdown] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    records: false,
    prescriptions: false
  });
  const navigate = useNavigate();
  
  // Control body overflow to prevent scrollbar issues
  useEffect(() => {
    // Prevent scrolling on the body when the dashboard is mounted
    document.body.style.overflow = 'hidden';
    
    // Cleanup: restore body overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
    // Get patient data from localStorage
  const firstName = localStorage.getItem("firstName") || "Patient";
  const lastName = localStorage.getItem("lastName") || "";
  const patientId = localStorage.getItem("patientId") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  
  // Create patient object with available data
  const patient = {
    id: parseInt(patientId), // Ensure ID is numeric
    name: firstName + (lastName ? " " + lastName : ""),
    firstName: firstName,
    lastName: lastName,
    email: userEmail,
    nextAppointment: "May 20, 2025", // Example data
    pendingPrescriptions: 2,
    recentCheckup: "May 5, 2025"
  };
  
  // Create QR code value based on the patient ID or email
  const qrValue = patientId ? `patientId:${patientId}` : `email:${userEmail}`;
  
  // Function to download QR code
  const downloadQRCode = () => {
    const canvas = document.getElementById("patient-qr-code");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
     
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `maybunga_health_qr_${firstName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Function to print QR code
  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
   
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maybunga Healthcare Center QR Code</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
          }
          .qr-container {
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Maybunga Healthcare Center</h2>
          <p>QR Code for: ${firstName}</p>
          <div class="qr-container">
            <img src="${document.getElementById('patient-qr-code').toDataURL()}" alt="QR Code" />
          </div>
          <p>Scan this QR code for quick login at the healthcare center.</p>
          <div class="footer">
            <p>Printed on: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
  };

  // Example medical records
  const records = [
    { id: 1, date: 'May 5, 2025', title: 'Annual Physical Exam', doctor: 'Dr. Sarah Johnson' },
    { id: 2, date: 'April 12, 2025', title: 'Laboratory Results', doctor: 'Laboratory' }
  ];

  // Example prescriptions
  const prescriptions = [
    { id: 1, name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', remaining: 5 },
    { id: 2, name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed', remaining: 10 }
  ];
  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <div className={`patient-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={require('../images/maybunga.png')} alt="Maybunga Healthcare Center Logo" />
          {!collapsed && <span>Maybunga Healthcare Center</span>}
        </div>
        <div className="sidebar-content">
          <SidebarItem 
            icon={<Home size={18} />} 
            label="Dashboard" 
            active={activeSection === 'dashboard'} 
            collapsed={collapsed} 
            onClick={() => setActiveSection('dashboard')}
          />
          
          <SidebarDropdown
            icon={<FileText size={18} />}
            label="Medical Records"
            collapsed={collapsed}
            isOpen={dropdowns.records}
            onClick={() => toggleDropdown('records')}
          >
            <SidebarItem
              icon={<FileText size={18} />}
              label="Admitting Data"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('admitting-data')}
            />
            <SidebarItem
              icon={<Activity size={18} />}
              label="Treatment Record"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('treatment-record')}
            />
            <SidebarItem
              icon={<Activity size={18} />}
              label="Check Up History"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('checkup-history')}
            />
            <SidebarItem
              icon={<Shield size={18} />}
              label="Immunization History"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('immunization-history')}
            />
          </SidebarDropdown>

          <SidebarDropdown
            icon={<Pill size={18} />}
            label="Prescriptions"
            collapsed={collapsed}
            isOpen={dropdowns.prescriptions}
            onClick={() => toggleDropdown('prescriptions')}
          >
            <SidebarItem
              icon={<Pill size={18} />}
              label="Active Prescriptions"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('active-prescriptions')}
            />
            <SidebarItem
              icon={<Clock size={18} />}
              label="Prescription History"
              collapsed={collapsed}
              indent
              onClick={() => setActiveSection('prescription-history')}
            />
          </SidebarDropdown>

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
            active={activeSection === 'profile'}
            collapsed={collapsed}
            onClick={() => setActiveSection('profile')}
          />

          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activeSection === 'settings'}
            collapsed={collapsed}
            onClick={() => setActiveSection('settings')}
          />
        </div>
        <div className="sidebar-toggle">
          <button className="toggle-button" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile menu toggle */}
      <div className="mobile-menu-toggle">
        <button className="toggle-button" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={20} />
        </button>
      </div>      {/* Main content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="breadcrumb">
            <span className="breadcrumb-label">YOU ARE HERE</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-value">
              {activeSection === 'dashboard' ? 'Dashboard' : activeSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>          <div className="top-bar-controls">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search" 
                className="search-input"
              />
            </div>
            <button className="icon-button">
              <Bell size={18} />
            </button>
            
            <div className="qr-dropdown">
              <button className="icon-button" onClick={() => setShowQrDropdown(!showQrDropdown)}>
                <Settings size={18} />
              </button>
              {showQrDropdown && (
                <div className="qr-dropdown-content">
                  <button className="qr-dropdown-item" onClick={() => {
                    setShowQrCode(true);
                    setShowQrDropdown(false);
                  }}>
                    <QrCode size={16} />
                    <span>Generate QR Code</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="user-profile" onClick={() => setActiveSection('profile')}>
              <div className="avatar">
                <User size={16} />
              </div>
              <span className="username">{firstName}</span>
            </div>
            
            <button className="icon-button" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {activeSection === 'dashboard' && (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f8fafc', marginTop: 0, marginBottom: '24px' }}>
                Welcome back, {firstName}
              </h1>
              
              <div className="dashboard-grid">
                <DashboardCard title="Recent Medical Records">
                  {records.length > 0 ? (
                    <>
                      {records.map(record => (
                        <div key={record.id} className="record-item">
                          <div className="record-date">{record.date}</div>
                          <div className="record-title">{record.title}</div>
                          <div className="record-doctor">
                            <User size={12} />
                            {record.doctor}
                          </div>
                        </div>
                      ))}
                      <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); setActiveSection('checkup-history'); }}>
                        View all records
                      </a>
                    </>
                  ) : (
                    <p>No recent medical records</p>
                  )}
                </DashboardCard>
                
                <DashboardCard title="Active Prescriptions">
                  {prescriptions.length > 0 ? (
                    <>
                      {prescriptions.map(prescription => (
                        <div key={prescription.id} className="record-item">
                          <div className="record-title">{prescription.name} - {prescription.dosage}</div>
                          <div className="record-date">{prescription.frequency}</div>
                          <div className="record-doctor">
                            <Pill size={12} />
                            {prescription.remaining} refills remaining
                          </div>
                        </div>
                      ))}
                      <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); setActiveSection('active-prescriptions'); }}>
                        View all prescriptions
                      </a>
                    </>
                  ) : (
                    <p>No active prescriptions</p>
                  )}
                </DashboardCard>
              </div>
            </>
          )}
          
          {/* QR Code Modal */}
          {showQrCode && (
            <div className="qr-code-modal">
              <div className="qr-code-content">
                <div className="qr-code-header">
                  <h2>Your QR Code</h2>
                  <button className="close-button" onClick={() => setShowQrCode(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="qr-code-container">
                  <QRCodeCanvas 
                    id="patient-qr-code"
                    value={qrValue}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="qr-code-instructions">
                  This QR code contains your patient information. You can use it for quick check-in at Maybunga Healthcare Center.
                </p>
                <div className="qr-code-actions">
                  <button className="qr-action-button download" onClick={downloadQRCode}>
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  <button className="qr-action-button print" onClick={printQRCode}>
                    <Printer size={16} />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          )}
            {activeSection === 'admitting-data' && (
            <AdmittingData />
          )}
          
          {activeSection === 'treatment-record' && (
            <TreatmentRecord />
          )}
          
          {activeSection === 'checkup-history' && (
            <CKProfile member={{ name: firstName }} onBack={() => setActiveSection('dashboard')} />
          )}
            {activeSection === 'profile' && (
            <RegisteredProfile patient={patient} onBack={() => setActiveSection('dashboard')} />
          )}
          
          {(activeSection !== 'dashboard' && 
            activeSection !== 'admitting-data' && 
            activeSection !== 'treatment-record' && 
            activeSection !== 'checkup-history' && 
            activeSection !== 'profile') && (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: 80, fontSize: 20 }}>
              This section ({activeSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}) is under development.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
