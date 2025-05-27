import React, { useState, useEffect, useMemo, useRef, useContext } from 'react'; // Added useRef and useContext
import axios from 'axios';
import { ChevronDown, ChevronUp, Search, Settings, Bell, LogOut, User, Menu, X, Maximize, BarChart2, Circle, Calendar, Square, ChevronRight, Activity, AlarmClock, Shield, Grid, List, QrCode, Heart, RefreshCw, MessageSquare } from 'lucide-react'; // Added QrCode, Heart, RefreshCw, MessageSquare
import DateTimeContext from '../contexts/DateTimeContext';
import CheckUpContext from '../contexts/CheckUpContext';
import { useNavigate } from 'react-router-dom';
import useAnalytics from '../hooks/useAnalytics';
import CheckupDashboard from './CheckupDashboard';
import SimplePieChart from './SimplePieChart';
import { useMedicalAnalytics } from '../contexts/MedicalAnalyticsContext';
import '../styles/DashboardAdm.css';
import '../styles/SidebarAdmin.css';
import '../styles/AdminDashboardV2.css'; // Added for enhanced styling
import Manage from './Manage';
import Reports from './Reports';
import Asettings from './Asettings';
import CheckUpToday from './CheckUpToday';
import UnsortedMembers from './UnsortedMembers';
import CKProfile from './CKProfile';
import TreatmentRecord from './TreatmentRecord';
// import AdmittingData from './AdmittingData'; // Removed as requested
import ImmunisationH from './ImmunisationH';
import Referral from './Referral';
import SessionsList from './SessionsList';
import Sessions from './Sessions';
import ScheduleSession from './ScheduleSession';
// import ScheduleVisit from './ScheduleVisit'; // Removed as requested
import RegisteredProfile from './RegisteredProfile';
import SessionHistory from './SessionHistory';
import ScheduledSession from './ScheduledSession';
import VitalSignsCheck from './VitalSignsCheck';
import SMSNotification from './SMSNotification'; // Import SMS Notification component
import { getPatients, getFamilies, getFamilyMembers, getSortedFamilies, addSurname, assignPatientToFamily, deletePatient } from '../services/api';
import AddNewPatientForm from './AddNewPatientForm'; // Import AddNewPatientForm
import { Button, Modal } from 'react-bootstrap'; // Import Button and Modal
import { QRCodeCanvas } from 'qrcode.react'; // Added QRCodeCanvas for QR generation

// Helper function to format address object into a string
const formatAddress = (addressObj) => {
  if (typeof addressObj === 'string') {
    return addressObj;
  }
  if (typeof addressObj !== 'object' || addressObj === null) {
    return 'N/A'; // Placeholder for invalid or missing address structure
  }

  const parts = [];
  // Combine house number and street
  const streetParts = [];
  if (addressObj.houseNo) streetParts.push(addressObj.houseNo);
  if (addressObj.street) streetParts.push(addressObj.street);
  if (streetParts.length > 0) parts.push(streetParts.join(' '));

  // Add barangay, city, region
  if (addressObj.barangay) parts.push(addressObj.barangay);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.region) parts.push(addressObj.region);
  
  const result = parts.join(', ');
  return result || 'N/A'; // Return 'N/A' if all parts are empty or addressObj was empty
};

function SidebarItem({ icon, label, active, collapsed, indent, onClick }) {
  return (
    <div 
      className={`sidebar-item${active ? ' active' : ''}${indent ? ' indent' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        cursor: 'pointer',
        background: active ? '#1e293b' : 'none',
        color: active ? '#38bdf8' : '#e5e7eb',
        fontWeight: 500,
        fontSize: 15,
        transition: 'color 0.15s, background 0.15s',
      }}
      onClick={onClick}
      onMouseOver={e => { if (!active) e.currentTarget.style.color = '#60a5fa'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.color = '#e5e7eb'; }}
    >
      {icon && <span style={{ marginRight: 14 }}>{icon}</span>}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

function SidebarDropdown({ icon, label, children, collapsed, isOpen, onClick }) {
  return (
    <div>
      <div 
        className="sidebar-dropdown-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          cursor: 'pointer',
          color: isOpen ? '#38bdf8' : '#e5e7eb',
          fontWeight: isOpen ? 600 : 500,
          transition: 'color 0.15s',
        }}
        onClick={onClick}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ marginRight: 14 }}>{icon}</span>}
          {!collapsed && <span>{label}</span>}
        </div>
        {!collapsed && (
          <span>{isOpen ? <ChevronUp size={16} color="#38bdf8" /> : <ChevronDown size={16} color="#e5e7eb" />}</span>
        )}
      </div>
      {isOpen && !collapsed && (
        <div className="sidebar-dropdown-content" style={{ background: '#172136' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DashboardCard({ title, children, onClose, onZoom }) {
  return (
    <div className="dashboard-card" style={{ background: '#1e293b', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 24, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.2 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {onZoom && (
            <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: 6 }} onClick={onZoom} aria-label="Zoom"><Maximize size={16} /></button>
          )}
          {onClose && (
            <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: 6, padding: 6 }} onClick={onClose} aria-label="Close"><Square size={16} /></button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function PieChart({ colors, data }) {
  const total = data.reduce((sum, value) => sum + value, 0);
  let currentAngle = 0;
  return (
    <div style={{ position: 'relative', height: 140, width: 140, margin: '0 auto' }}>
      <svg viewBox="0 0 100 100" width={140} height={140}>
        {data.map((value, i) => {
          const startAngle = currentAngle;
          const angle = (value / total) * 360;
          currentAngle += angle;
          const endAngle = currentAngle;
          const x1 = 50 + 40 * Math.cos((Math.PI / 180) * (startAngle - 90));
          const y1 = 50 + 40 * Math.sin((Math.PI / 180) * (startAngle - 90));
          const x2 = 50 + 40 * Math.cos((Math.PI / 180) * (endAngle - 90));
          const y2 = 50 + 40 * Math.sin((Math.PI / 180) * (endAngle - 90));
          const largeArcFlag = angle > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill={colors[i % colors.length]}
            />
          );
        })}
        <circle cx="50" cy="50" r="25" fill="#1e293b" />
      </svg>
    </div>
  );
}



export default function AdminDashboard() {
  // Add CSS for refresh animation
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // States for Medical Analytics section
  const [vaccineManageOpen, setVaccineManageOpen] = useState(false);
  const [prescriptionManageOpen, setPrescriptionManageOpen] = useState(false);
  const [refreshingCharts, setRefreshingCharts] = useState(false);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'info' // 'info', 'warning', 'danger'
  });
  const handleChartsRefresh = () => {
    setRefreshingCharts(true);
    setTimeout(() => {
      // This forces a re-render of the charts
      setRefreshingCharts(false);
    }, 500);
  };

  // Helper functions for confirmation dialogs
  const showConfirmDialog = (title, message, onConfirm, type = 'info') => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({
      show: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'info'
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    hideConfirmDialog();
  };
  const [isLoading, setIsLoading] = useState(false);  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });  const [collapsed, setCollapsed] = useState(false);
  const { getVaccineChartData, getPrescriptionChartData, resetVaccineData, resetPrescriptionData, generateTestVaccineData, generateTestPrescriptionData } = useMedicalAnalytics();
  const [dropdowns, setDropdowns] = useState({
    patientManagement: false,
    reports: false,
    checkUp: false,
    sessions: false,
    personalInfo: true, // For profile section
    contactInfo: true   // For profile section
  });
  const [selectedView, setSelectedView] = useState('dashboard');const [zoomedChart, setZoomedChart] = useState(null);
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // Added this line  const [patients, setPatients] = useState([]);
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false); // For showing/hiding the Vital Signs Check modal
  const [showSMSModal, setShowSMSModal] = useState(false); // For showing/hiding the SMS Notification modal
  const { getCurrentDate, isSimulated } = useContext(DateTimeContext);
  const { addPatientToCheckUpList } = useContext(CheckUpContext);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Admin');
  const [showAddNewPatientForm, setShowAddNewPatientForm] = useState(false);
  const [actionView, setActionView] = useState(null); // Added for member profile view
  const [managePatientDropdownOpen, setManagePatientDropdownOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(null); // null, 'initial', 'cooldown', 'final'
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [showAssignFamilyModal, setShowAssignFamilyModal] = useState(false); // New state for assign family modal
  const [selectedFamilyForAssignment, setSelectedFamilyForAssignment] = useState(null); // New state for selected family in modal
  const [assignFamilySearchTerm, setAssignFamilySearchTerm] = useState(''); // New state for search term in assign modal
  const [familiesWithMembers, setFamiliesWithMembers] = useState([]); // Ensure this state exists
  
  // Analytics integration
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics('month1');
  
  // QR Code State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [currentMemberForQr, setCurrentMemberForQr] = useState(null);

  // Auto LogIn State
  const [showAutoLoginModal, setShowAutoLoginModal] = useState(false);
  const [currentMemberForAutoLogin, setCurrentMemberForAutoLogin] = useState(null);
  const qrCodeRef = useRef(null);
  // Helper function to get current family name
  const getCurrentFamilyName = () => {
    if (!selectedMember || !selectedMember.familyId || !familiesWithMembers || !Array.isArray(familiesWithMembers)) {
      console.log('[getCurrentFamilyName] Conditions not met:', { selectedMember, familiesWithMembers });
      return 'N/A';
    }
    const currentFamily = familiesWithMembers.find(f => f && f.id === selectedMember.familyId);
    console.log('[getCurrentFamilyName] selectedMember.familyId:', selectedMember.familyId, 'Found family:', currentFamily);
    return currentFamily ? currentFamily.familyName : 'Unknown Family';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsOpen) {
        const settingsButton = event.target.closest('button');
        const settingsDropdown = event.target.closest('div[role="menu"]');
        if (!settingsButton && !settingsDropdown) {
          setSettingsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    let timer;
    if (deleteStep === 'cooldown' && cooldownTimer > 0) {
      timer = setTimeout(() => setCooldownTimer(prev => prev - 1), 1000);
    } else if (deleteStep === 'cooldown' && cooldownTimer === 0) {
      setDeleteStep('final'); // Move to final confirmation step
    }
    return () => clearTimeout(timer);
  }, [deleteStep, cooldownTimer]);

  useEffect(() => {
    fetchFamiliesWithMembers();
    if (selectedView === 'patients' && !showAddNewPatientForm) {
      fetchFamiliesWithMembers(); // Changed to fetch families with nested members
    }
    
    // Clear actionView and selectedMember when changing views
    if (selectedView !== 'patients') {
      setActionView(null);
      setSelectedMember(null);
    }
  }, [selectedView, showAddNewPatientForm]);

  const fetchFamiliesWithMembers = async () => {
    console.log('FETCH_FAMILIES_WITH_MEMBERS_STARTED');
    try {
        console.log('AdminDashboard: Fetching sorted families...');
        const response = await getSortedFamilies(); // Renamed to 'response' for clarity
        console.log('AdminDashboard: Fetched sorted families response:', response);

        // Check if response and response.data exist, and if response.data is an array
        if (response && response.data && Array.isArray(response.data)) {
            const familiesArray = response.data; // Extract the array from response.data
            console.log('AdminDashboard: Processing families:', familiesArray);
            setFamiliesWithMembers(familiesArray);
            console.log('AdminDashboard: familiesWithMembers state updated:', familiesArray);

            // If a family was selected, update its details, especially if a member moved
            if (selectedFamily) {
                const updatedSelectedFamily = familiesArray.find(f => f.id === selectedFamily.id);
                if (updatedSelectedFamily) {
                    setSelectedFamily(updatedSelectedFamily);
                } else {
                    // setSelectedFamily(null); // Or handle as appropriate
                }
            }
             // If a member was selected, ensure their data (like familyId) is fresh
            if (selectedMember) {
                let foundUpdatedMember = null;
                for (const fam of familiesArray) { // Iterate over familiesArray
                    if (fam.members && Array.isArray(fam.members)) { // Ensure fam.members exists and is an array
                        const memberInFam = fam.members.find(m => m.id === selectedMember.id);
                        if (memberInFam) {
                            foundUpdatedMember = memberInFam;
                            break;
                        }
                    }
                }
                if (foundUpdatedMember) {
                    console.log('[fetchFamiliesWithMembers] Updating selectedMember with fresh data:', foundUpdatedMember);
                    setSelectedMember(foundUpdatedMember);
                } else {
                    console.log('[fetchFamiliesWithMembers] Selected member not found in new families data. Clearing selectedMember.');
                    // setSelectedMember(null); 
                    // setActionView(null);
                }
            }
        } else {
            console.error('AdminDashboard: Fetched sorted families data is not an array or is null. Full response object:', response);
            setFamiliesWithMembers([]); // Set to empty array on error or invalid data
        }
    } catch (error) {
        console.error('AdminDashboard: Error fetching families with members:', error);
        setFamiliesWithMembers([]); // Set to empty array on error
    }
    console.log('AdminDashboard: fetchFamiliesWithMembers finished');
  };
  const handleFamilyClick = (family) => {
    console.log(`Clicking on family: ${JSON.stringify(family)}`);
    setSelectedFamily(family);
    setCurrentSearchTerm(''); // Reset search term when a new family is clicked
  };

  const handleBackToFamilies = () => {
    setSelectedFamily(null);
    setSelectedMember(null);
    setActionView(null);
    setCurrentSearchTerm(''); // Clear search term
    setManagePatientDropdownOpen(false); // Close dropdown if open
    setDeleteStep(null); // Reset delete process
    setCooldownTimer(0);
    setShowAssignFamilyModal(false); // Close assign modal if open
    setShowQrModal(false); // Close QR modal if open
    setShowVitalSignsModal(false); // Close vital signs modal if open
  };  const handleVitalSignsCheck = () => {
    console.log('Vital Signs Check button clicked', { selectedMember });
    setShowVitalSignsModal(true);
    console.log('showVitalSignsModal set to:', true);
  };

  const handleSMSNotification = () => {
    console.log('SMS Notification button clicked', { selectedMember });
    setShowSMSModal(true);
    console.log('showSMSModal set to:', true);
  };
  const handleDeletePatientData = async () => {
    try {
      if (!selectedMember?.id) {
        throw new Error('No patient selected for deletion');
      }

      const patientName = selectedMember?.name || `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`.trim();
      setIsLoading(true);
      
      // Store the family ID before deletion for refreshing family data
      const familyId = selectedMember.familyId;
      
      // Call the API to delete the patient
      await deletePatient(selectedMember.id);
      
      // Reset all relevant states
      setDeleteStep(null);
      setIsLoading(false);
      setSelectedMember(null);
      setActionView(null);
      
      // Refresh the families data to ensure UI is up to date
      await fetchFamiliesWithMembers();
      
      // Show success message with auto-hide after 5 seconds
      setNotification({
        show: true,
        message: `Patient ${patientName} deleted successfully`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification(prev => ({...prev, show: false}));
      }, 5000);
      
      // Navigate back to family list 
      handleBackToFamilies();
      
    } catch (error) {
      setIsLoading(false);
      setDeleteStep(null);
      console.error("Error deleting patient data:", error);
      
      // Show error notification with auto-hide after 5 seconds
      setNotification({
        show: true,
        message: `Error deleting patient: ${error.response?.data?.error || error.message || 'Unknown error'}`,
        type: 'danger'
      });
      setTimeout(() => {
        setNotification(prev => ({...prev, show: false}));
      }, 5000);
    }
  };

  const handleOpenAssignFamilyModal = () => {
    setSelectedFamilyForAssignment(null); // Reset selection
    setAssignFamilySearchTerm(''); // Reset search
    setShowAssignFamilyModal(true);
    setManagePatientDropdownOpen(false);
  };

  const handleAssignPatientToNewFamily = async (patientIdToAssign, newFamilyId) => {
    console.log(`[AssignFamily] Initiating assignment. Patient ID: ${patientIdToAssign}, Target Family ID: ${newFamilyId}`);
    console.log('[AssignFamily] Current selectedMember (at start of function):', JSON.parse(JSON.stringify(selectedMember)));
    console.log('[AssignFamily] Current selectedFamilyForAssignment (state):', selectedFamilyForAssignment);


    if (!selectedMember || patientIdToAssign !== selectedMember.id) {
        console.error('[AssignFamily] Mismatch or missing selectedMember. Aborting. PatientID to assign:', patientIdToAssign, 'selectedMember.id:', selectedMember?.id);
        alert('Error: Patient context lost. Please re-select the patient.');
        setShowAssignFamilyModal(false);
        return;
    }

    // CRUCIAL CHECK
    if (selectedMember.familyId === newFamilyId) {
      const currentFamName = getCurrentFamilyName(); // Get name for the alert
      alert(`Patient ${selectedMember.firstName} ${selectedMember.lastName} is already in the family "${currentFamName}" (ID: ${newFamilyId}). No changes made.`);
      console.log(`[AssignFamily] Patient ${selectedMember.id} (current family ID: ${selectedMember.familyId}) is already in target family ID: ${newFamilyId}. Assignment aborted.`);
      setShowAssignFamilyModal(false);
      return;
    }

    console.log(`[AssignFamily] Proceeding: Assign patient ID: ${patientIdToAssign} (current family ID: ${selectedMember.familyId}) to new family ID: ${newFamilyId}`);

    try {
      const response = await assignPatientToFamily(patientIdToAssign, newFamilyId);
      console.log('[AssignFamily] API response object from service:', response);
      if (response && response.data) {
          console.log('[AssignFamily] response.data from service:', response.data);
          if (response.data.message) {
              console.log('[AssignFamily] response.data.message from service:', response.data.message);
          }
          alert(response.data.message || 'Patient assigned successfully!');
          
          // Refresh data
          await fetchFamiliesWithMembers(); // Ensure it's awaited if it's async and matters for subsequent state
          
          setShowAssignFamilyModal(false);
          setSelectedFamilyForAssignment(null); 
          
          // Optional: Update selectedMember with new family info or clear it
          // To see the change reflected immediately if the same patient is viewed,
          // fetchFamiliesWithMembers should update selectedMember if it's still relevant.
          // Or, find the updated patient data and set it.
          // For now, fetchFamiliesWithMembers handles updating selectedMember if found.

      } else {
          console.error('[AssignFamily] Invalid response from server:', response);
          throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('[AssignFamily] Error assigning patient to new family:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      alert(`Failed to assign patient. ${errorMessage}`);
    }
  };

  const filteredFamiliesForAssignment = useMemo(() => {
    if (!assignFamilySearchTerm) {
      return familiesWithMembers.map(f => ({ id: f.id, familyName: f.familyName }));
    }
    return familiesWithMembers
      .map(f => ({ id: f.id, familyName: f.familyName }))
      .filter(f => f.familyName.toLowerCase().includes(assignFamilySearchTerm.toLowerCase()));
  }, [familiesWithMembers, assignFamilySearchTerm]);

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  function handleZoomChart(idx) {
    setZoomedChart(idx);
  }

  function handleUnzoom() {
    setZoomedChart(null);
  }

  const handleAddNewSurname = async () => {
    let surname = prompt('Enter the new surname:');
    if (!surname) return;

    // Capitalize the first letter of the surname
    surname = surname.charAt(0).toUpperCase() + surname.slice(1).toLowerCase();

    try {
      const response = await addSurname({ familyName: surname });
      console.log('Response from addSurname:', response); // Debug log to verify response structure
      
      // The response now contains the data directly from the backend
      const familyId = response.familyId;
      alert(`New surname added successfully with ID: ${familyId}`);
      fetchFamiliesWithMembers(); // Refresh the families list
    } catch (error) {
      console.error('Error adding new surname:', error);
      alert('Failed to add new surname. Please try again.');
    }
  };
  const handleGenerateQrCode = (member) => {
    if (!member) return;
    // IMPORTANT: For actual login via QR, the 'authToken' should be a secure token.
    // Using member.id here as a placeholder. The backend /api/login would need
    // to be adapted to handle this if member.id is used as an authToken.
    // This QR code structure is based on AuthPage.js registration QR.
    
    // Create a display name safely
    const displayName = member.name || 
                      (member.firstName || member.lastName ? 
                        `${member.firstName || ''} ${member.lastName || ''}`.trim() : 
                        'Unknown Member');
                        
    const qrData = JSON.stringify({
      email: member.email || '', // Handle if email is missing
      authToken: member.id || '', // Using ID as a placeholder for authToken for login purposes
      name: displayName
    });    setQrCodeValue(qrData);
    setCurrentMemberForQr({...member, name: displayName}); // Ensure member has name prop
    setShowQrModal(true);
    setManagePatientDropdownOpen(false); // Close manage dropdown if it was open
  };

  const handleAutoLogin = (member) => {
    if (!member) return;
    
    // Create a display name safely
    const displayName = member.name || 
                      (member.firstName || member.lastName ? 
                        `${member.firstName || ''} ${member.lastName || ''}`.trim() : 
                        'Unknown Member');
                        
    setCurrentMemberForAutoLogin({...member, name: displayName});
    setShowAutoLoginModal(true);
    setManagePatientDropdownOpen(false); // Close manage dropdown if it was open
  };

  const confirmAutoLogin = async () => {
    if (!currentMemberForAutoLogin) return;
    
    try {
      await addPatientToCheckUpList(currentMemberForAutoLogin);
      setNotification({
        show: true,
        message: `${currentMemberForAutoLogin.name} has been added to today's check-up list.`,
        type: 'success'
      });
      setShowAutoLoginModal(false);
      setCurrentMemberForAutoLogin(null);
    } catch (error) {
      console.error('Error adding patient to check-up list:', error);
      setNotification({
        show: true,
        message: 'Failed to add patient to check-up list. Please try again.',
        type: 'error'
      });
    }
  };
  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      
      // Create a safe filename from member data
      let fileName = 'patient_qr';
      if (currentMemberForQr) {
        const displayName = currentMemberForQr.name || 
                          (currentMemberForQr.firstName || currentMemberForQr.lastName ? 
                           `${currentMemberForQr.firstName || ''} ${currentMemberForQr.lastName || ''}`.trim() : 
                           'patient');
        fileName = `${displayName.replace(/\s+/g, '_')}_qrcode.png`;
      }
      
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  const printQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      
      // Get display name safely
      const displayName = currentMemberForQr?.name || 
                        (currentMemberForQr?.firstName || currentMemberForQr?.lastName ? 
                         `${currentMemberForQr?.firstName || ''} ${currentMemberForQr?.lastName || ''}`.trim() : 
                         'Patient');
                         
      let windowContent = '<!DOCTYPE html><html><head><title>Print QR Code</title></head><body style="text-align:center;">';
      windowContent += `<h2>QR Code for ${displayName}</h2>`;
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
      }    }
  };  // Chart cards data - keeping only the Patient Checkup Trends chart we made together
  const chartCards = useMemo(() => {
    return [
      {        
        title: 'Patient Checkup Trends',
        content: (
          <div style={{ marginTop: -16, marginLeft: -24, marginRight: -24, marginBottom: -16, width: '100%' }}>
            <CheckupDashboard />
          </div>
        ),
        isFullWidth: true, // Special flag for wider display
        style: { maxWidth: '100%', flex: '1 1 100%' } // Additional styling for full width
      },      {        title: 'Medical Analytics',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 0 }}>
            {/* Charts Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Vaccine Usage Chart */}
              <div style={{ background: '#374151', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                    Vaccine Usage
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={handleChartsRefresh}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      title="Refresh"
                    >
                      <RefreshCw size={16} style={{ animation: refreshingCharts ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                  </div>
                </div>
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => {
                    const vaccineData = getVaccineChartData();
                    if (vaccineData.length === 0 || refreshingCharts) {
                      return (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                          <Activity size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                          <div style={{ fontSize: 14 }}>No vaccine data available</div>
                          <div style={{ fontSize: 12, marginTop: 4 }}>Vaccines administered will appear here</div>
                        </div>
                      );
                    }
                    return (
                      <SimplePieChart 
                        data={vaccineData}
                        width={280}
                        height={280}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Prescription Usage Chart */}
              <div style={{ background: '#374151', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>
                    Prescription Usage
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={handleChartsRefresh}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px',
                        borderRadius: '4px'
                      }}
                      title="Refresh"
                    >
                      <RefreshCw size={16} style={{ animation: refreshingCharts ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                  </div>
                </div>
                <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => {
                    const prescriptionData = getPrescriptionChartData();
                    if (prescriptionData.length === 0 || refreshingCharts) {
                      return (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                          <Activity size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                          <div style={{ fontSize: 14 }}>No prescription data available</div>
                          <div style={{ fontSize: 12, marginTop: 4 }}>Prescriptions given will appear here</div>
                        </div>
                      );
                    }
                    return (
                      <SimplePieChart 
                        data={prescriptionData}
                        width={280}
                        height={280}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Manage Buttons Container */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Vaccine Manage Dropdown */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setVaccineManageOpen(!vaccineManageOpen)}
                  style={{
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14
                  }}
                >
                  <Settings size={16} />
                  Manage Vaccines
                  <ChevronDown size={14} style={{ 
                    transform: vaccineManageOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} />
                </button>
                
                {/* Vaccine Dropdown Menu */}
                {vaccineManageOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    zIndex: 1000,
                    background: '#1e293b',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    width: 200,
                    marginTop: 8
                  }}>
                    <div style={{height: '8px'}}></div>
                    
                    <button
                      onClick={() => {
                        setVaccineManageOpen(false);
                        showConfirmDialog(
                          'Generate Test Data',
                          'This will generate random test data for the vaccine usage chart. This action cannot be undone.',
                          () => {
                            generateTestVaccineData();
                            handleChartsRefresh();
                            setNotification({ show: true, message: 'Test vaccine data generated successfully!', type: 'success' });
                            setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
                          },
                          'info'
                        );
                      }}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Activity size={16} />
                      Test Chart
                    </button>
                    
                    <button
                      onClick={() => {
                        setVaccineManageOpen(false);
                        showConfirmDialog(
                          'Reset Vaccine Data',
                          'This will permanently delete all vaccine usage data. This action cannot be undone.',
                          () => {
                            resetVaccineData();
                            handleChartsRefresh();
                            setNotification({ show: true, message: 'Vaccine data has been reset!', type: 'success' });
                            setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
                          },
                          'danger'
                        );
                      }}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        borderRadius: '0 0 8px 8px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <RefreshCw size={16} />
                      Reset Testing
                    </button>
                  </div>
                )}
              </div>

              {/* Prescription Manage Dropdown */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setPrescriptionManageOpen(!prescriptionManageOpen)}
                  style={{
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14
                  }}
                >
                  <Settings size={16} />
                  Manage Prescriptions
                  <ChevronDown size={14} style={{ 
                    transform: prescriptionManageOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }} />                </button>
                
                {/* Prescription Dropdown Menu */}
                {prescriptionManageOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    zIndex: 1000,
                    background: '#1e293b',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    width: 220,
                    marginTop: 8
                  }}>
                    <div style={{height: '8px'}}></div>
                    
                    <button
                      onClick={() => {
                        setPrescriptionManageOpen(false);
                        showConfirmDialog(
                          'Generate Test Data',
                          'This will generate random test data for the prescription usage chart. This action cannot be undone.',
                          () => {
                            generateTestPrescriptionData();
                            handleChartsRefresh();
                            setNotification({ show: true, message: 'Test prescription data generated successfully!', type: 'success' });
                            setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
                          },
                          'info'
                        );
                      }}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Activity size={16} />
                      Test Chart
                    </button>
                    
                    <button
                      onClick={() => {
                        setPrescriptionManageOpen(false);
                        showConfirmDialog(
                          'Reset Prescription Data',
                          'This will permanently delete all prescription usage data. This action cannot be undone.',
                          () => {
                            resetPrescriptionData();
                            handleChartsRefresh();
                            setNotification({ show: true, message: 'Prescription data has been reset!', type: 'success' });
                            setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 3000);
                          },
                          'danger'
                        );
                      }}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: '#f87171',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        borderRadius: '0 0 8px 8px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <RefreshCw size={16} />
                      Reset Testing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
        isFullWidth: true,
        style: { maxWidth: '100%', flex: '1 1 100%' }
      }
    ];
  }, [analyticsData, analyticsLoading, analyticsError, getVaccineChartData, getPrescriptionChartData]);

  function renderContent() {
    console.log('AdminDashboard actionView:', actionView, 'selectedMember:', selectedMember); // DEBUG LINE
    if (actionView && selectedMember) {
      switch (actionView) {        
        case 'ck-profile': 
          return (
            <div className="profile-container" style={{ 
              color: '#e5e7eb', 
              width: '100%',
              maxWidth: '100%',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              <button
                onClick={handleBackToFamilies}
                style={{
                  padding: '8px 16px',
                  background: '#1e293b',
                  color: '#e5e7eb',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ChevronRight style={{ transform: 'rotate(180deg)' }} size={16} />
                Back to Families
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  margin: 0, 
                  color: '#38bdf8', /* Brighter blue color for better readability */
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)' /* Text shadow for better contrast */
                }}>
                  {selectedMember?.name || 
                   (selectedMember?.firstName || selectedMember?.lastName ? 
                     `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`.trim() : 
                     'Member Profile')}
                </h2>
                  <div style={{ display: 'flex', gap: '10px', position: 'relative' }}> {/* Adjusted gap */}
                  {/* Auto LogIn Button */}
                  <button
                    style={{
                      background: '#f5c71a', // Red background
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => handleAutoLogin(selectedMember)}
                  >
                    <Heart size={16} />
                    Auto LogIn
                  </button>

                  {/* New Generate QR Code Button */}
                  <button
                    style={{
                      background: '#10B981', // Green background
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => handleGenerateQrCode(selectedMember)}
                  >
                    <QrCode size={16} />
                    Generate QR Code
                  </button>

                  {/* Existing Manage Menu Button */}
                  <button 
                    style={{
                      background: '#3b82f6', // Blue background
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setManagePatientDropdownOpen(prev => !prev)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/> {/* Edit icon */}
                    </svg>
                    Manage
                    {/* Simple caret down icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {managePatientDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%', // Position below the button
                      right: 0, // Align to the right of the button
                      background: '#1e293b', // Dark background for dropdown
                      border: '1px solid #334155', // Border for dropdown
                      borderRadius: '4px',
                      zIndex: 10, // Ensure dropdown is above other content
                      minWidth: '220px', // Increased width for better readability
                      marginTop: '4px' // Small gap between button and dropdown
                    }}>
                      <button 
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#e5e7eb', // Light text color
                          cursor: 'pointer',
                          borderBottom: '1px solid #334155' // Separator line
                        }}
                        onClick={() => { setActionView('registered-profile'); setManagePatientDropdownOpen(false); }}
                      >
                        Registered Profile
                      </button>
                      <button 
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#e5e7eb',
                          cursor: 'pointer',
                          borderBottom: '1px solid #334155' // Separator line
                        }}
                        onClick={handleOpenAssignFamilyModal} // Updated onClick
                      >
                        Assign to a different family
                      </button>
                      <button 
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#e5e7eb', // Light text color
                          cursor: 'pointer',
                          borderBottom: '1px solid #334155' // Separator line
                        }}
                        onClick={handleSMSNotification}
                      >
                        Notify
                      </button>
                      <button 
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444', // Red color for delete action
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        onClick={() => { setDeleteStep('initial'); setManagePatientDropdownOpen(false); }}
                      >
                        Delete patient data
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Assign Family Modal */}
              {showAssignFamilyModal && selectedMember && (
                <Modal show={showAssignFamilyModal} onHide={() => {
                    setShowAssignFamilyModal(false);
                    setSelectedFamilyForAssignment(null); // Reset on close
                    setAssignFamilySearchTerm(''); // Reset search
                }} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Assign {selectedMember.firstName} {selectedMember.lastName} to a New Family</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>Assigning Patient: <strong>{selectedMember.firstName} {selectedMember.lastName}</strong> (ID: {selectedMember.id})</p>
                    <p>Current Family: <strong>{getCurrentFamilyName()}</strong> (ID: {selectedMember.familyId !== null && selectedMember.familyId !== undefined ? selectedMember.familyId : 'N/A'})</p>
                    <hr />
                    <p><em>Selected family for assignment (state for debugging): {selectedFamilyForAssignment !== null ? selectedFamilyForAssignment : 'None selected'}</em></p>
                    
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Search families to assign to..."
                      value={assignFamilySearchTerm}
                      onChange={(e) => setAssignFamilySearchTerm(e.target.value)}
                    />
                    <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {filteredFamiliesForAssignment.length > 0 ? filteredFamiliesForAssignment.map(fam => {
                        console.log('AssignFamilyModal: Rendering family in list - Name:', fam.familyName, 'ID:', fam.id, 'Current selection for assignment:', selectedFamilyForAssignment);
                        return (
                          <button
                            type="button"
                            key={fam.id}
                            className={`list-group-item list-group-item-action ${selectedFamilyForAssignment === fam.id ? 'active' : ''}`}
                            onClick={() => {
                              console.log('[AssignFamilyModal] Clicked on family - Name:', fam.familyName, 'ID:', fam.id);
                              setSelectedFamilyForAssignment(fam.id);
                              console.log('[AssignFamilyModal] setSelectedFamilyForAssignment called with:', fam.id);
                            }}
                          >
                            {fam.familyName} (ID: {fam.id})
                          </button>
                        );
                      }) : <p className="text-muted">No families found or matching search.</p>}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowAssignFamilyModal(false);
                        setSelectedFamilyForAssignment(null);
                        setAssignFamilySearchTerm('');
                    }}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        console.log('[Assign Modal "Assign" Button Click] selectedMember.id:', selectedMember?.id, 'selectedFamilyForAssignment:', selectedFamilyForAssignment);
                        if (selectedMember && selectedFamilyForAssignment !== null) {
                          handleAssignPatientToNewFamily(selectedMember.id, selectedFamilyForAssignment);
                        } else {
                          console.error('[Assign Modal "Assign" Button Click] Cannot assign: selectedMember or selectedFamilyForAssignment is not set properly.');
                          alert('Please select a family to assign the patient to.');
                        }
                      }}
                      disabled={selectedFamilyForAssignment === null}
                    >
                      Assign
                    </Button>
                  </Modal.Footer>
                </Modal>
              )}

              {/* QR Code Modal */}
              {showQrModal && currentMemberForQr && (
                <Modal show={showQrModal} onHide={() => { setShowQrModal(false); setQrCodeValue(''); setCurrentMemberForQr(null); }} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>QR Code for {currentMemberForQr.name || `${currentMemberForQr.firstName} ${currentMemberForQr.lastName}`}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ textAlign: 'center' }}>
                    <p>Scan this QR code for login or identification.</p>
                    <div ref={qrCodeRef} style={{ margin: '20px auto', display: 'inline-block', border: '1px solid #eee', padding: '10px' }}>
                      {qrCodeValue && <QRCodeCanvas value={qrCodeValue} size={256} level="H" includeMargin={true} />}
                    </div>
                    <p style={{fontSize: '0.8em', color: '#6c757d', marginTop: '10px'}}>
                      This QR code contains identifying information (email and patient ID).
                      For login, the system must be configured to accept patient ID as an authentication token.
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowQrModal(false); setQrCodeValue(''); setCurrentMemberForQr(null); }}>
                      Close
                    </Button>
                    <Button variant="info" onClick={printQRCode}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer" viewBox="0 0 16 16" style={{marginRight: '5px'}}>
                        <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                        <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1-1v2H4V3zm1 5a2 2 0 0 0-2 2v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                      </svg>
                      Print QR Code
                    </Button>
                    <Button variant="primary" onClick={downloadQRCode}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16" style={{marginRight: '5px'}}>
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                      </svg>
                      Download QR Code
                    </Button>
                  </Modal.Footer>
                </Modal>              )}

              {/* Auto LogIn Confirmation Modal */}
              {showAutoLoginModal && currentMemberForAutoLogin && (
                <Modal show={showAutoLoginModal} onHide={() => { setShowAutoLoginModal(false); setCurrentMemberForAutoLogin(null); }} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Confirm Auto LogIn</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>Are you sure you want to add <strong>{currentMemberForAutoLogin.name}</strong> to today's check-up list?</p>
                    <p className="text-muted">This will automatically log them in for today's appointments.</p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowAutoLoginModal(false); setCurrentMemberForAutoLogin(null); }}>
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmAutoLogin}>
                      <Heart size={16} style={{marginRight: '5px'}} />
                      Confirm Auto LogIn
                    </Button>
                  </Modal.Footer>
                </Modal>
              )}

              {/* Delete Confirmation Modals/Dialogs */}
              {deleteStep === 'initial' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', color: '#e5e7eb', textAlign: 'center', maxWidth: '400px' }}>
                    <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '15px' }}>Delete Patient Data?</h3>
                    <p>This action is irreversible. Are you sure you want to delete all data for {selectedMember?.name || `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`}?</p>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-around' }}>
                      <button 
                        onClick={() => { setDeleteStep('cooldown'); setCooldownTimer(10); }}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Yes, Proceed
                      </button>
                      <button 
                        onClick={() => setDeleteStep(null)}
                        style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deleteStep === 'cooldown' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', color: '#e5e7eb', textAlign: 'center', maxWidth: '400px' }}>
                    <h3 style={{ color: '#f97316', marginTop: 0, marginBottom: '15px' }}>Cooldown Active</h3>
                    <p>Please wait for {cooldownTimer} seconds before final confirmation.</p>
                    <p style={{fontSize: '12px', color: '#94a3b8'}}>This is a safety measure to prevent accidental deletion.</p>
                    <div style={{ marginTop: '25px' }}>
                      <button 
                        onClick={() => { setDeleteStep(null); setCooldownTimer(0); }}
                        style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel Deletion
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deleteStep === 'final' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                  <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', color: '#e5e7eb', textAlign: 'center', maxWidth: '400px' }}>
                    <h3 style={{ color: '#ef4444', marginTop: 0, marginBottom: '15px' }}>Final Confirmation</h3>
                    <p>Are you absolutely sure you want to permanently delete all data for {
                      selectedMember?.name || 
                      (selectedMember?.firstName || selectedMember?.lastName ? 
                        `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`.trim() : 
                        'this member')
                    }?</p>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-around' }}>
                      <button 
                        onClick={handleDeletePatientData}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Confirm Delete
                      </button>
                      <button 
                        onClick={() => setDeleteStep(null)}
                        style={{ background: '#334155', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information with dropdown toggle */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    background: '#1e293b',
                    padding: '10px 15px',
                    borderRadius: '8px'
                  }}
                  onClick={() => setDropdowns(prev => ({ ...prev, personalInfo: !prev.personalInfo }))}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>Personal Information</h3>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      background: dropdowns.personalInfo ? '#38bdf8' : '#334155',
                      borderRadius: '50%',
                      transition: 'background 0.2s'
                    }}>
                      {dropdowns.personalInfo ? 
                        <ChevronUp size={18} color="#fff" /> : 
                        <ChevronDown size={18} color="#fff" />
                      }
                    </div>
                  </div>
                  
                  {dropdowns.personalInfo && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>                      <div style={{ flex: '1', minWidth: '200px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Age</div>
                        <div>{selectedMember.age ? `${selectedMember.age} years` : '---'}</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Gender</div>
                        <div>{selectedMember.gender || '---'}</div>
                      </div><div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Last Checkup</div>
                        <div>{selectedMember.lastCheckup || '---'}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Contact Information with dropdown toggle */}
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '15px',
                    background: '#1e293b',
                    padding: '10px 15px',
                    borderRadius: '8px'
                  }}
                  onClick={() => setDropdowns(prev => ({ ...prev, contactInfo: !prev.contactInfo }))}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>Contact Information</h3>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      background: dropdowns.contactInfo ? '#38bdf8' : '#334155',
                      borderRadius: '50%',
                      transition: 'background 0.2s'
                    }}>
                      {dropdowns.contactInfo ? 
                        <ChevronUp size={18} color="#fff" /> : 
                        <ChevronDown size={18} color="#fff" />
                      }
                    </div>
                  </div>
                  
                  {dropdowns.contactInfo && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Phone</div>
                        <div>{selectedMember.phoneNumber || '---'}</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Email</div>
                        <div>{selectedMember.email || '---'}</div>
                      </div>                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Address</div>
                        <div>
                          {selectedMember.address 
                            ? formatAddress(selectedMember.address) 
                            : '---'}
                        </div>
                      </div>
                    </div>
                  )}                
                </div>
                
                {/* Patient Actions Section Title */}
                <div style={{ 
                  marginTop: '30px', 
                  marginBottom: '15px',
                  background: '#1e293b',
                  padding: '15px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#38bdf8', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      background: '#38bdf8',
                      borderRadius: '50%'
                    }}>
                      <Activity size={16} color="#fff" />
                    </div>
                    Patient Actions
                  </h3>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>Select an action to perform</div>
                </div>
              
              {/* 6 Action buttons in a 3x2 grid, matching DoctorDashboard style */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginTop: '10px',
                marginBottom: '20px',
                maxWidth: '100%',
                width: '100%'
              }}>
                <button className="action-button" onClick={() => setActionView('checkup_history_detail')}> {/* Changed actionView */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#38bdf8',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <User size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">CHECK UP HISTORY</div>
                    <div className="action-desc">Full examination details</div>
                  </div>
                </button>
                <button className="action-button" onClick={() => setActionView('treatment')}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#38bdf8',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <Activity size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">INDIVIDUAL TREATMENT RECORD</div>
                    <div className="action-desc">Previous medical records</div>
                  </div>
                </button>                {/* Schedule Visit button removed as requested */}                {/* Admitting Data button removed as requested */}
                <button className="action-button" onClick={() => setActionView('immunization')}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#38bdf8',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <Shield size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">IMMUNIZATION HISTORY</div>
                    <div className="action-desc">Vaccination records</div>
                  </div>
                </button>
                <button className="action-button" onClick={() => setActionView('referral')}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#38bdf8',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <Activity size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">REFERRAL</div>
                    <div className="action-desc">Specialist referrals</div>
                  </div>
                </button>                <button 
                  className="action-button" 
                  onClick={() => {
                    console.log('Vital Signs Check button clicked', { patient: selectedMember });
                    // Make sure selectedMember is correctly set before opening the modal
                    if (selectedMember) {
                      setShowVitalSignsModal(true);
                    } else {
                      console.error('No patient selected for vital signs check');
                      alert('Error: No patient data available for vital signs check');
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#38bdf8',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <Heart size={22} color="#fff" />
                  </div>                  <div>
                    <div className="action-title">VITAL SIGNS CHECK</div>
                    <div className="action-desc">Record patient vitals</div>
                  </div>
                </button>
                
                <button 
                  className="action-button" 
                  onClick={() => {
                    console.log('SMS Notification button clicked', { patient: selectedMember });
                    if (selectedMember) {
                      handleSMSNotification();
                    } else {
                      console.error('No patient selected for SMS notification');
                      alert('Error: No patient data available for SMS notification');
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    background: '#10b981',
                    borderRadius: '8px',
                    marginBottom: 8
                  }}>
                    <MessageSquare size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">SMS NOTIFICATION</div>
                    <div className="action-desc">Send text message</div>
                  </div>
                </button>
              </div>
            </div>
          );case 'treatment': 
          return <TreatmentRecord member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        // case 'admitting': 
        //   return <AdmittingData member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />; // Removed as requested
        case 'immunization': 
          return <ImmunisationH member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'referral': 
          return <Referral member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;        
        // case 'schedule': 
        //   return <ScheduleVisit member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />; // Removed as requested
        case 'registered-profile':
          return <RegisteredProfile patient={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'checkup_history_detail': // Added new case
          return <CKProfile member={selectedMember} onBack={() => setActionView('ck-profile')} />;
        default: 
          setActionView(null);
      }
    }
    
    if (selectedView === 'checkups') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Check-Ups Scheduled for Today</h2>
          <CheckUpToday showDateTimePerPatient />
        </div>
      );
    }    if (selectedView === 'scheduledSessions') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Schedule New Session</h2>
          <ScheduledSession userRole="admin" familiesWithMembers={familiesWithMembers} />
        </div>
      );
    }
    if (selectedView === 'sessions') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Session Management</h2>
          <Sessions userRole="admin" />
        </div>
      );
    }
    if (selectedView === 'sessionHistory') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Session History</h2>
          <SessionHistory userRole="admin" />
        </div>
      );
    }
    if (selectedView === 'unsorted') {
      return <div style={{ color: '#f1f5f9' }}><UnsortedMembers /></div>;
    }      
    if (selectedView === 'patients') {
      if (showAddNewPatientForm) {
        return (
          <AddNewPatientForm
            onSuccess={() => {
              setShowAddNewPatientForm(false);
              fetchFamiliesWithMembers(); // Refresh families/patients list
            }}
            onCancel={() => {
              setShowAddNewPatientForm(false);
            }}
          />
        );
      }

      // Log families state directly inside the render logic for 'patients' view
      console.log('AdminDashboard: Current `familiesWithMembers` state in renderContent:', familiesWithMembers); // LOG 3

      const filteredFamilies = Array.isArray(familiesWithMembers) ? familiesWithMembers.filter(family =>
        family && family.familyName && // Add checks for family and familyName
        family.familyName.toLowerCase().includes(currentSearchTerm.toLowerCase())
      ) : [];
      console.log('AdminDashboard: `filteredFamilies` in renderContent:', filteredFamilies); // LOG 4
      console.log('AdminDashboard: `currentSearchTerm` for families:', currentSearchTerm); // LOG 5

      return (
        <div className="patient-database-container" style={{ padding: '20px', color: '#e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
              {selectedFamily ? `Family: ${selectedFamily.familyName}` : 'Patient Database (Families)'}
            </h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                variant="primary"
                onClick={() => setShowAddNewPatientForm(true)}
                style={{ fontSize: '14px', fontWeight: '500', background: '#3b82f6', borderColor: '#3b82f6' }}
              >
                + Add New Patient
              </Button>
              <Button
                variant="secondary"
                onClick={handleAddNewSurname}
                style={{ fontSize: '14px', fontWeight: '500', background: '#64748b', borderColor: '#64748b' }}
              >
                + Add New Surname
              </Button>
            </div>
          </div>

          <input
            type="text"
            placeholder={selectedFamily ? "Search members..." : "Search families..."}
            value={currentSearchTerm}
            onChange={(e) => setCurrentSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 15px',
              marginBottom: '20px',
              borderRadius: '6px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#e5e7eb',
              fontSize: '14px'
            }}
          />          
          {selectedFamily ? (
              <div>
                {!selectedFamily.members || selectedFamily.members.length === 0 ? (
                  <div>
                    <p>{currentSearchTerm ? 'No members match your search.' : 'No members found for this family.'}</p>
                    <p style={{color: '#64748b', marginTop: '10px'}}>Debug info: Family ID = {selectedFamily.id}, Family Name = {selectedFamily.familyName}</p>
                    <button
                      onClick={() => fetchFamiliesWithMembers()} // Refetch all sorted families
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        marginTop: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Refresh Families Data
                    </button>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#94a3b8' }}>Name</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: '#94a3b8' }}>Actions</th>
                      </tr>
                    </thead>                  <tbody>
                      {selectedFamily.members.map(member => {
                        // Create a display name by safely checking different fields
                        const displayName = member.name || 
                                          (member.firstName || member.lastName ? 
                                            `${member.firstName || ''} ${member.lastName || ''}`.trim() : 
                                            'Unknown Member');
                        
                        return (
                          <tr key={member.id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ 
                                padding: '16px',
                                fontWeight: '500',
                                fontSize: '15px',
                                color: '#e2e8f0' /* Lighter color for better readability */
                            }}>{displayName}</td>
                            <td style={{ padding: '16px' }}>
                              <button 
                                onClick={() => { 
                                  // Ensure member object has name property for display
                                  const enhancedMember = {
                                    ...member,
                                    name: displayName // Add name if missing
                                  };
                                  setSelectedMember(enhancedMember);
                                  setActionView('ck-profile');
                                  setSelectedView('patients');
                                }}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div>
                {/* This is the section that lists families */}
                {filteredFamilies.length === 0 ? (
                  <p>{currentSearchTerm ? 'No families match your search.' : 'No families found. (Is `familiesWithMembers` state populated?)'}</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredFamilies.map((fam, index) => (
                      // Using familyName as key for stability if IDs are null/NaN
                      // It's generally better to have a truly unique ID from the backend for keys.
                      <li key={fam.familyName || index} style={{ marginBottom: '10px' }}>
                        <button 
                          onClick={() => handleFamilyClick(fam)} 
                          style={{
                            width: '100%', 
                            padding: '16px', 
                            background: '#1e293b', 
                            color: '#e5e7eb', 
                            border: 'none', 
                            borderRadius: '8px', 
                            textAlign: 'left', 
                            cursor: 'pointer', 
                            fontSize: '16px',
                            fontWeight: '500',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ 
                              fontWeight: '500', 
                              fontSize: '16px',
                              color: '#e2e8f0' /* Lighter color for better readability */
                          }}>
                            <span style={{ color: '#38bdf8' }}>{fam.familyName}</span> 
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}> (Members: {Array.isArray(fam.members) ? fam.members.length : 'N/A'})</span>
                          </span>
                          <ChevronRight size={20} color="#64748b" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          }
        </div>
      );    }
    if (selectedView === 'reports') return <div style={{ color: '#f1f5f9' }}><Reports /></div>;
    if (selectedView === 'settings') return <div style={{ color: '#f1f5f9' }}><Asettings /></div>;    if (zoomedChart !== null) {
      if (typeof zoomedChart === 'number' && chartCards[zoomedChart]) {
        const card = chartCards[zoomedChart];
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90vw', maxWidth: 900, maxHeight: '90vh', overflow: 'auto' }}>
              <DashboardCard title={card.title} onClose={handleUnzoom}>
                <div style={{ minHeight: 320, minWidth: 320 }}>{card.content}</div>
              </DashboardCard>
            </div>
          </div>
        );
      }
    }    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.2, margin: 0 }}>Analytics</h1>
            {analyticsError && (
              <div style={{ color: '#ef4444', fontSize: 14, marginTop: 4 }}>
                Error loading analytics: {analyticsError}
              </div>
            )}
            {analyticsLoading && (
              <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                Loading analytics data...
              </div>
            )}
          </div>
          <button 
            onClick={refetchAnalytics}
            disabled={analyticsLoading}
            style={{ 
              background: analyticsLoading ? '#374151' : '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              cursor: analyticsLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: analyticsLoading ? 0.6 : 1
            }}
          >
            <Activity size={16} />
            {analyticsLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          {chartCards.map((card, idx) => {
            // Special handling for full-width cards
            if (card.isFullWidth) {
              return (
                <div key={idx} style={{ gridColumn: '1 / -1' }}>
                  <DashboardCard
                    title={card.title}
                    onZoom={() => handleZoomChart(idx)}
                  >
                    {card.content}
                  </DashboardCard>
                </div>
              );
            }
            
            // Regular cards
            return (
              <DashboardCard
                key={idx}
                title={card.title}
                onZoom={() => handleZoomChart(idx)}
              >
                {card.content}
              </DashboardCard>
            );
          })}        </div>
      </>
    );  }
  return (
    <>
      {/* VitalSignsCheck Modal - Positioned at the root level for proper rendering */}
      <VitalSignsCheck
        show={showVitalSignsModal}
        onHide={() => {
          console.log('Modal hide triggered');
          setShowVitalSignsModal(false);
        }}
        patient={selectedMember || {}}
        onComplete={(updatedPatient) => {
          console.log('Vital signs recorded for:', updatedPatient);
          if (selectedMember && updatedPatient) {
            setSelectedMember({
              ...selectedMember,
              vitalSigns: updatedPatient.vitalSigns,
              vitalSignsChecked: true
            });
          }
          setShowVitalSignsModal(false);
        }}      />
        {/* SMS Notification Modal - Positioned at the root level for proper rendering */}
      <SMSNotification
        show={showSMSModal}
        onHide={() => {
          console.log('SMS Modal hide triggered');
          setShowSMSModal(false);
        }}
        patient={selectedMember || {}}
      />
      
      <div className={`admin-dashboard ${collapsed ? 'collapsed' : ''}`} style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#fff' }}>
        {/* Sidebar */}
        <div className="sidebar" style={{ minWidth: collapsed ? 68 : 260, background: '#131e31', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 10, transition: 'min-width 0.3s' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1e3256' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>M</span>
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Maybunga Healthcare</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Center</p>
            </div>
          )}
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Menu */}
        <div style={{ marginTop: 12 }}>
          <SidebarItem
            icon={<BarChart2 size={20} />}
            label="Dashboard"
            active={selectedView === 'dashboard'}
            collapsed={collapsed}
            onClick={() => setSelectedView('dashboard')}
          />
          <SidebarDropdown
            icon={<Calendar size={20} />}
            label="Check Up"
            collapsed={collapsed}
            isOpen={dropdowns.checkUp}
            onClick={() => toggleDropdown('checkUp')}
          >
            <SidebarItem
              icon={<Circle size={18} />}
              label="Check-Ups Today"
              active={selectedView === 'checkups'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('checkups')}
            />
          </SidebarDropdown>

          <SidebarDropdown
            icon={<User size={20} />}
            label="Patient Management"
            collapsed={collapsed}
            isOpen={dropdowns.patientManagement}
            onClick={() => toggleDropdown('patientManagement')}
          >
            <SidebarItem
              icon={<Circle size={18} />}
              label="Unsorted Members"
              active={selectedView === 'unsorted'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('unsorted')}
            />
            <SidebarItem
              icon={<Circle size={18} />}
              label="Patient Database"
              active={selectedView === 'patients'}
              collapsed={false}
              indent
              onClick={() => {
                setSelectedView('patients');
                setSelectedFamily(null); // Reset to family list view
              }}
            />
          </SidebarDropdown>

          <SidebarDropdown
            icon={<Activity size={20} />}
            label="Reports"
            collapsed={collapsed}
            isOpen={dropdowns.reports}
            onClick={() => toggleDropdown('reports')}
          >
            <SidebarItem
              icon={<Circle size={18} />}
              label="General Reports"
              active={selectedView === 'reports'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('reports')}
            />
          </SidebarDropdown>          
          <SidebarDropdown
            icon={<AlarmClock size={20} />}
            label="Sessions"
            collapsed={collapsed}
            isOpen={dropdowns.sessions}
            onClick={() => toggleDropdown('sessions')}
          >            <SidebarItem
              icon={<Circle size={18} />}
              label="Schedule New Session"
              active={selectedView === 'scheduledSessions'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('scheduledSessions')}
            />
            <SidebarItem
              icon={<Circle size={18} />}
              label="Sessions"
              active={selectedView === 'sessions'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('sessions')}
            />
            <SidebarItem
              icon={<Circle size={18} />}
              label="Session History"
              active={selectedView === 'sessionHistory'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('sessionHistory')}
            />
          </SidebarDropdown>

          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            active={selectedView === 'settings'}
            collapsed={collapsed}
            onClick={() => setSelectedView('settings')}
          />
        </div>
      </div>      
      {/* Main content */}
      <div className="main-content" style={{ marginLeft: collapsed ? 68 : 260, transition: 'margin-left 0.3s', flexGrow: 1, padding: '0px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e3256', padding: '16px 32px', position: 'sticky', top: 0, background: '#0f172a', zIndex: 5 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#94a3b8' }}>
              <span>YOU ARE HERE</span>
              <ChevronRight size={16} style={{ margin: '0 4px' }} />
              <span 
                style={{ color: '#38bdf8', cursor: 'pointer' }}
                onClick={() => {
                  if (selectedView === 'patients') {
                    setSelectedFamily(null); // Go back to family list
                  }
                }}
              >
                {                 selectedView === 'dashboard' ? 'Dashboard' : 
                 selectedView === 'patients' ? 'Patient Database' :
                 selectedView === 'checkups' ? 'Check-Ups Today' :
                 selectedView === 'unsorted' ? 'Unsorted Members' :
                 selectedView === 'scheduledSessions' ? 'Schedule New Session' :
                 selectedView === 'sessions' ? 'Sessions List' :
                 selectedView === 'reports' ? 'Reports' :
                 selectedView === 'settings' ? 'Settings' : 'Dashboard'}
              </span>
              {selectedFamily && !selectedMember && (
                <>
                  <ChevronRight size={16} style={{ margin: '0 4px' }} />
                  <span style={{ color: '#38bdf8' }}>{selectedFamily.familyName}</span>
                </>
              )}
              {selectedFamily && selectedMember && actionView && (
                <>
                  <ChevronRight size={16} style={{ margin: '0 4px' }} />
                  <span 
                    style={{ color: '#38bdf8', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedMember(null);
                      setActionView(null);
                    }}
                  >
                    {selectedFamily.familyName}
                  </span>
                  <ChevronRight size={16} style={{ margin: '0 4px' }} />                  <span style={{ color: '#38bdf8' }}>
                    {selectedMember?.name || 
                     (selectedMember?.firstName || selectedMember?.lastName ? 
                      `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`.trim() : 
                      'Member Profile')}
                  </span>                  
                  <ChevronRight size={16} style={{ margin: '0 4px' }} />                  
                  <span style={{ color: '#38bdf8' }}>
                    {actionView === 'ck-profile' ? 'Profile' : 
                     actionView === 'treatment' ? 'Individual Treatment Record' : 
                     actionView === 'admitting' ? 'Admitting Data' : 
                     actionView === 'immunization' ? 'Immunization History' : 
                     actionView === 'referral' ? 'Referral' : 
                     actionView === 'registered-profile' ? 'Registered Profile' : 
                     actionView === 'checkup_history_detail' ? 'Check Up History Detail' :
                     actionView}
                  </span>
                </>
              )}
            </div>
          </div>          <div style={{ display: 'flex', alignItems: 'center' }}>            <div className="current-date" style={{ color: '#94a3b8', fontSize: '14px', marginRight: '16px', display: 'flex', alignItems: 'center' }}>
              <Calendar size={16} style={{ marginRight: '5px' }} />
              {getCurrentDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {isSimulated && <span style={{ marginLeft: '8px', background: '#334155', color: '#38bdf8', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>SIMULATED</span>}
            </div>
            <div style={{ position: 'relative', marginRight: 16 }}>
              <Bell size={20} style={{ cursor: 'pointer' }} />
              <span style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
            </div>
            <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#e5e7eb', padding: 0 }}
                onClick={() => setSettingsOpen(!settingsOpen)}
                aria-haspopup="true"
                aria-expanded={settingsOpen}
              >                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1e3a8a', marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', fontWeight: 'bold' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                {!collapsed && <span style={{ marginRight: 8 }}>{userName}</span>}
                <Settings size={16} />
              </button>
              
              {settingsOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    background: '#1e3256',
                    borderRadius: 8,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: 180,
                  }}
                >
                  <div
                    role="menuitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      color: '#e5e7eb',
                      cursor: 'pointer',
                      borderBottom: '1px solid #334155',
                    }}
                    onClick={() => {
                      // Handle profile click
                    }}
                  >
                    <User size={16} style={{ marginRight: 8 }} />
                    <span>Profile</span>
                  </div>
                  <div
                    role="menuitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      color: '#e5e7eb',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      localStorage.removeItem('userRole');
                      navigate('/');
                    }}
                  >
                    <LogOut size={16} style={{ marginRight: 8 }} />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}          </div>
          </div>
        </div>
          {/* Main dashboard content */}
        <div style={{ padding: 24, flex: 1, overflowY: 'auto', height: 'calc(100vh - 65px)' }}>
          {renderContent()}
        </div>
      </div>
    </div>    {notification.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: notification.type === 'success' ? '#10b981' : 
                           notification.type === 'danger' ? '#ef4444' : 
                           notification.type === 'warning' ? '#f59e0b' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1051,
            maxWidth: '400px'
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1052
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{
              color: '#f1f5f9',
              margin: '0 0 12px 0',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {confirmDialog.title}
            </h3>
            <p style={{
              color: '#94a3b8',
              margin: '0 0 24px 0',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {confirmDialog.message}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={hideConfirmDialog}
                style={{
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={{
                  backgroundColor: confirmDialog.type === 'danger' ? '#ef4444' : 
                                 confirmDialog.type === 'warning' ? '#f59e0b' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  const currentBg = confirmDialog.type === 'danger' ? '#dc2626' : 
                                   confirmDialog.type === 'warning' ? '#d97706' : '#2563eb';
                  e.target.style.backgroundColor = currentBg;
                }}
                onMouseLeave={(e) => {
                  const originalBg = confirmDialog.type === 'danger' ? '#ef4444' : 
                                    confirmDialog.type === 'warning' ? '#f59e0b' : '#3b82f6';
                  e.target.style.backgroundColor = originalBg;
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
