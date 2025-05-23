import React, { useState, useEffect, useRef } from 'react';
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
import ActivePrescriptions from './ActivePrescriptions';
import PrescriptionHistory from './PrescriptionHistory';

// SidebarItem Component
function SidebarItem({ icon, label, active, collapsed, indent, onClick, isDropdownItem }) {
  return (
    <div 
      className={`sidebar-item${active ? ' active' : ''}${indent ? ' indent' : ''}${isDropdownItem ? ' sidebar-dropdown-item' : ''}`}
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataForModal, setQrDataForModal] = useState('');
  const [dropdowns, setDropdowns] = useState({
    records: false,
    prescriptions: false,
    settings: false
  });
  const navigate = useNavigate();
  const qrCodeRef = useRef(null);

  const [patient, setPatient] = useState({ name: null }); // Initialize patient as an object with name null
  const [userEmail, setUserEmail] = useState('');
  const [patientId, setPatientId] = useState('');
  useEffect(() => {
    const loadPatientData = () => {
      try {
        const storedEmail = localStorage.getItem('userEmail');
        const storedPatientId = localStorage.getItem('patientId');
        // Try multiple localStorage keys for the patient name
        const storedPatientName = localStorage.getItem('patientName');
        const storedUserName = localStorage.getItem('userName');
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');

        setUserEmail(storedEmail || ''); 
        setPatientId(storedPatientId || '');

        // Try to construct a full name from different localStorage variables
        let fullName = null;

        if (storedPatientName) {
          // Use patientName if available
          fullName = storedPatientName;
        } else if (storedUserName) {
          // Use userName if available
          fullName = storedUserName;
        } else if (storedFirstName) {
          // Construct name from first and last name if available
          fullName = storedLastName ? `${storedFirstName} ${storedLastName}` : storedFirstName;
        }

        if (fullName) {
          setPatient({ name: fullName });
        } else {
          setPatient({ name: null }); // Explicitly set name to null if not found
          console.warn("PatientDashboard: No name found in localStorage. QR code generation might be incomplete or show an alert if name is required.");
        }
        
        console.log("PatientDashboard loaded data from localStorage:", { 
            email: storedEmail, 
            patientId: storedPatientId, 
            fullName: fullName,
            checks: { storedPatientName, storedUserName, storedFirstName, storedLastName } 
        });

      } catch (error) {
        console.error("PatientDashboard: Error loading patient data from localStorage:", error);
        setUserEmail('');
        setPatientId('');
        setPatient({ name: null }); // Ensure patient is an object even on error
      }
    };

    loadPatientData();
  }, []); // Empty dependency array: run once on component mount

  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
     
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `maybunga_health_qr_${patient?.name || 'patient'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      let windowContent = '<!DOCTYPE html><html><head><title>Print QR Code</title></head><body style="text-align:center;">';
      windowContent += `<h2>QR Code for ${patient?.name || 'Patient'}</h2>`;
      windowContent += `<img src="${dataUrl}" style="max-width: 80%; margin-top: 20px;">`;
      windowContent += '<script type="text/javascript">window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; };</script>';
      windowContent += '</body></html>';
      const printWin = window.open('', '', 'width=600,height=600');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
      } else {
        alert('Please allow popups to print the QR code.');
      }
    }
  };

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openQrCodeModal = () => {
    if (patient && patient.name && userEmail && patientId) {
      const qrDataString = JSON.stringify({
        email: userEmail,
        authToken: patientId,
        name: patient.name
      });
      setQrDataForModal(qrDataString);
    } else {
      console.error("QR Code Generation: Patient data is missing.", { patient, userEmail, patientId });
      setQrDataForModal('');
      alert("Could not generate QR code: Essential patient information is missing. Please ensure your profile is complete.");
    }
    setShowQrModal(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
  };

  const records = [
    { id: 1, date: 'May 5, 2025', title: 'Annual Physical Exam', doctor: 'Dr. Sarah Johnson' },
    { id: 2, date: 'April 12, 2025', title: 'Laboratory Results', doctor: 'Laboratory' }
  ];

  const prescriptions = [
    { id: 1, name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', remaining: 5 },
    { id: 2, name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed', remaining: 10 }
  ];

  return (
    <div className="patient-dashboard">
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

          <SidebarDropdown
            icon={<Settings size={18} />}
            label="Settings"
            collapsed={collapsed}
            isOpen={dropdowns.settings}
            onClick={() => toggleDropdown('settings')}
          >
            <SidebarItem
              icon={<QrCode size={18} />}
              label="Generate QR Code"
              collapsed={collapsed}
              indent
              isDropdownItem
              onClick={openQrCodeModal}
            />
          </SidebarDropdown>
        </div>
        <div className="sidebar-toggle">
          <button className="toggle-button" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className="mobile-menu-toggle">
        <button className="toggle-button" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={20} />
        </button>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="breadcrumb">
            <span className="breadcrumb-label">YOU ARE HERE</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-value">
              {activeSection === 'dashboard' ? 'Dashboard' : activeSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <div className="top-bar-controls">
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
              <div className="user-profile" onClick={() => setActiveSection('profile')}>
              <div className="avatar">
                <User size={16} />
              </div>
              <span className="username">{patient?.name || localStorage.getItem('userName') || localStorage.getItem('firstName') || 'Patient'}</span>
            </div>
            
            <button className="icon-button" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {activeSection === 'dashboard' && (
            <>              <h1 style={{ fontSize: 24, fontWeight: 600, color: '#f8fafc', marginTop: 0, marginBottom: '24px' }}>
                Welcome back, {patient?.name || localStorage.getItem('userName') || localStorage.getItem('firstName') || 'Patient'}
              </h1>
              
              {showQrModal && (
                <div className="qr-modal-overlay">
                  <div className="qr-modal-content">
                    <div className="qr-modal-header">
                      <h3>QR Code for {patient?.name || 'Patient'}</h3>
                      <button onClick={() => setShowQrModal(false)} className="close-button">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="qr-modal-body">
                      <p>Scan this QR code for login or identification.</p>
                      <div ref={qrCodeRef} style={{ margin: '20px auto', display: 'inline-block', border: '1px solid #eee', padding: '10px' }}>
                        {qrDataForModal ? <QRCodeCanvas value={qrDataForModal} size={200} level="H" includeMargin={true} id="patient-qr-code" /> : <p>QR Code will be displayed here. If it's not showing, required data might be missing.</p>}
                      </div>
                      <p style={{fontSize: '0.8em', color: '#6c757d', marginTop: '10px'}}>
                        This QR code contains identifying information.
                      </p>
                    </div>
                    <div className="qr-modal-footer">
                      <button onClick={downloadQRCode} className="qr-action-button">
                        <Download size={16} style={{ marginRight: '8px' }} /> Download
                      </button>
                      <button onClick={printQRCode} className="qr-action-button">
                        <Printer size={16} style={{ marginRight: '8px' }} /> Print
                      </button>
                      <button onClick={() => setShowQrModal(false)} className="qr-action-button secondary">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeSection === 'admitting-data' && (
            <AdmittingData />
          )}
            {activeSection === 'treatment-record' && (
            <TreatmentRecord 
              member={{
                name: patient?.name || localStorage.getItem('userName') || localStorage.getItem('firstName') || 'Patient',
                familyId: localStorage.getItem('familyId'),
                philHealthNumber: localStorage.getItem('philHealthNumber'),
                address: localStorage.getItem('address'),
                sex: localStorage.getItem('sex'),
                civilStatus: localStorage.getItem('civilStatus'),
                birthMonth: localStorage.getItem('birthMonth'),
                birthDay: localStorage.getItem('birthDay'),
                birthYear: localStorage.getItem('birthYear'),
                memberType: localStorage.getItem('memberType')
              }}
              onBack={() => setActiveSection('dashboard')}
            />
          )}
          
          {activeSection === 'checkup-history' && (
            <CKProfile member={{ name: patient?.name || 'Patient' }} onBack={() => setActiveSection('dashboard')} />
          )}            {activeSection === 'profile' && (
            <RegisteredProfile 
              patient={{
                id: patientId,
                name: patient?.name,
                email: userEmail,
                firstName: localStorage.getItem('firstName'),
                lastName: localStorage.getItem('lastName')
              }} 
              onBack={() => setActiveSection('dashboard')} 
            />
          )}
            {activeSection === 'active-prescriptions' && (
            <ActivePrescriptions />
          )}
          
          {activeSection === 'prescription-history' && (
            <PrescriptionHistory />
          )}
          
          {(activeSection !== 'dashboard' && 
            activeSection !== 'admitting-data' && 
            activeSection !== 'treatment-record' && 
            activeSection !== 'checkup-history' && 
            activeSection !== 'profile' &&
            activeSection !== 'active-prescriptions' &&
            activeSection !== 'prescription-history') && (
            <div style={{ color: '#64748b', textAlign: 'center', marginTop: 80, fontSize: 20 }}>
              This section ({activeSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}) is under development.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
