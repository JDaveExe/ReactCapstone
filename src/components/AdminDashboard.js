import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Search, Settings, Bell, LogOut, User, Menu, X, Maximize, BarChart2, Circle, Calendar, Square, ChevronRight, Activity, AlarmClock, FileText, Shield, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import AdmittingData from './AdmittingData';
import ImmunisationH from './ImmunisationH';
import Referral from './Referral';
import SessionsList from './SessionsList';
import ScheduleSession from './ScheduleSession';
import ScheduleVisit from './ScheduleVisit'; 
import RegisteredProfile from './RegisteredProfile';
import { getPatients, getFamilies, getFamilyMembers, getSortedFamilies, addSurname } from '../services/api'; // Removed debugFamilyMembers and added addSurname
import AddNewPatientForm from './AddNewPatientForm'; // Import AddNewPatientForm
import { Button } from 'react-bootstrap'; // Import Button

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

function LineChart() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1000 300">
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h-${i}`} x1="0" y1={i * 60} x2="1000" y2={i * 60} stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />
      ))}
      <line x1="0" y1="240" x2="1000" y2="240" stroke="#334155" strokeWidth="1" />
      {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, i) => (
        <text key={`month-${i}`} x={i * 200 + 100} y="260" textAnchor="middle" fill="#94a3b8" fontSize="12">{month}</text>
      ))}
      <path d="M0,240 C50,180 100,200 150,160 C200,120 250,140 300,160 C350,180 400,160 450,120 C500,100 550,140 600,160 C650,180 700,140 750,120 C800,100 850,140 900,120 C950,100 1000,140 1000,240 L1000,240 L0,240 Z" fill="rgba(59,130,246,0.15)" />
      <path d="M0,180 C50,120 100,140 150,100 C200,60 250,80 300,100 C350,120 400,100 450,60 C500,40 550,80 600,100 C650,120 700,80 750,60 C800,40 850,80 900,60 C950,40 1000,80 1000,120" stroke="#3B82F6" strokeWidth="2" fill="none" />
      <path d="M0,80 C50,120 100,100 150,160 C200,200 250,180 300,140 C350,120 400,140 450,180 C500,220 550,180 600,120 C650,80 700,100 750,160 C800,220 850,180 900,120 C950,60 1000,80 1000,120" stroke="#10B981" strokeWidth="2" fill="none" />
      <path d="M0,140 C50,160 100,180 150,140 C200,120 250,140 300,160 C350,180 400,160 450,120 C500,100 550,120 600,180 C650,200 700,160 750,120 C800,100 850,160 900,220 C950,200 1000,160 1000,140" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);  
  const [dropdowns, setDropdowns] = useState({
    patientManagement: false,
    reports: false,
    checkUp: false,
    sessions: false,
    personalInfo: true, // For profile section
    contactInfo: true   // For profile section
  });
  const [selectedView, setSelectedView] = useState('dashboard');
  const [zoomedChart, setZoomedChart] = useState(null);
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'admin');
  const [showAddNewPatientForm, setShowAddNewPatientForm] = useState(false);
  const [actionView, setActionView] = useState(null); // Added for member profile view
  const [managePatientDropdownOpen, setManagePatientDropdownOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(null); // null, 'initial', 'cooldown', 'final'
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]); // This will now store members of the selected family from the nested structure
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false); // May not be needed if members are fetched with families
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // General search term

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
    setLoadingFamilies(true);
    try {
      const res = await getSortedFamilies();
      console.log('AdminDashboard: Raw sorted families data from API (res.data):', res.data); // LOG 1
      
      if (!Array.isArray(res.data)) {
        console.error('AdminDashboard: API response for sorted families is not an array!', res.data);
        setFamilies([]); 
        setLoadingFamilies(false);
        return;
      }

      const processedFamilies = res.data.map(family => ({
        ...family,
        id: parseInt(family.id, 10), // Will be NaN if family.id is null or not a number
        members: Array.isArray(family.members) ? family.members.map(member => ({ 
          ...member,
          id: parseInt(member.id, 10)
        })) : []
      }));
      console.log('AdminDashboard: Processed families (before setFamilies):', processedFamilies); // LOG 2
      
      setFamilies(processedFamilies);

    } catch (error) {
      console.error("Error fetching sorted families:", error);
      setFamilies([]);
    }
    setLoadingFamilies(false);
  };

  const handleFamilyClick = (family) => {
    console.log(`Clicking on family: ${JSON.stringify(family)}`);
    setSelectedFamily(family);
    // Members are already part of the family object, so just set them
    setMembers(family.members || []); 
    setCurrentSearchTerm(''); // Reset search term when a new family is clicked
    // No need for a separate API call to fetch members
    setLoadingMembers(false); // Ensure loading state is off
  };
  const handleBackToFamilies = () => {
    setSelectedFamily(null);
    setSelectedMember(null);
    setActionView(null);
    setMembers([]);
    setCurrentSearchTerm(''); // Clear search term
    setManagePatientDropdownOpen(false); // Close dropdown if open
    setDeleteStep(null); // Reset delete process
    setCooldownTimer(0);
  };

  const handleDeletePatientData = () => {
    // Actual deletion logic will go here
    alert(`Deleting data for ${selectedMember?.name || selectedMember?.firstName + ' ' + selectedMember?.lastName}`);
    setDeleteStep(null);
    // Potentially navigate back or refresh data
    handleBackToFamilies(); // Go back to family list after deletion
  };

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
  function renderContent() {
    console.log('AdminDashboard actionView:', actionView, 'selectedMember:', selectedMember); // DEBUG LINE
    if (actionView && selectedMember) {
      switch (actionView) {        case 'ck-profile': 
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
                Back to Families              </button>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  margin: 0, 
                  color: '#38bdf8', /* Brighter blue color for better readability */
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)' /* Text shadow for better contrast */
                }}>
                  {selectedMember.name || `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`}
                </h2>
                
                <div style={{ display: 'flex', gap: '16px', position: 'relative' }}> {/* Added position: 'relative' for dropdown positioning */}
                  {/* Manage Patient Dropdown Button */}
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
                    Manage Patient
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
                        onClick={() => { alert('Notify functionality to be implemented'); setManagePatientDropdownOpen(false); }}
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
                          color: '#e5e7eb',
                          cursor: 'pointer',
                           borderBottom: '1px solid #334155' // Separator line
                        }}
                        onClick={() => { alert('Assign to a different family functionality to be implemented'); setManagePatientDropdownOpen(false); }}
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
                  
                  <button
                    style={{
                      background: '#1e293b',
                      color: '#e5e7eb',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}                    onClick={() => setActionView('registered-profile')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M12 21.7C17 20 22 16.4 22 10c0-5.5-4.5-10-10-10S2 4.5 2 10c0 6.4 5 10 10 11.7z"/>
                    </svg>
                    Registered Profile
                  </button>
                </div>
              </div>
              
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
                    <p>Are you absolutely sure you want to permanently delete all data for {selectedMember?.name || `${selectedMember?.firstName || ''} ${selectedMember?.lastName || ''}`}?</p>
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
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
                      <div style={{ flex: '1', minWidth: '200px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Age</div>
                        <div>{selectedMember.age || '40'} years</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Gender</div>
                        <div>{selectedMember.gender || 'Male'}</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Last Checkup</div>
                        <div>{selectedMember.lastCheckup || '2025-03-20'}</div>
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
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Phone</div>
                        <div>{selectedMember.phoneNumber || '(555) 567-8901'}</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Email</div>
                        <div>{selectedMember.email || 'robert@example.com'}</div>
                      </div>
                      <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}>Address</div>
                        <div>{selectedMember.address || '456 Oak Ave, Townsville'}</div>
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
                </button>
                <button className="action-button" onClick={() => setActionView('schedule')}>
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
                    <Calendar size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">SCHEDULE VISIT</div>
                    <div className="action-desc">Set up new appointment</div>
                  </div>
                </button>
                <button className="action-button" onClick={() => setActionView('admitting')}>
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
                    <FileText size={22} color="#fff" />
                  </div>
                  <div>
                    <div className="action-title">ADMITTING DATA</div>
                    <div className="action-desc">Admission and discharge info</div>
                  </div>
                </button>
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
                </button>
              </div>
            </div>
          );
        case 'treatment': 
          return <TreatmentRecord member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'admitting': 
          return <AdmittingData member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'immunization': 
          return <ImmunisationH member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'referral': 
          return <Referral member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;        case 'schedule': 
          return <ScheduleVisit member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
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
    }
    if (selectedView === 'scheduledSessions') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Schedule New Session</h2>
          <ScheduleSession />
        </div>
      );
    }
    if (selectedView === 'sessions') {
      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Session Management</h2>
          <SessionsList userRole="admin" />
        </div>
      );
    }
    if (selectedView === 'unsorted') {
      return <div style={{ color: '#f1f5f9' }}><UnsortedMembers /></div>;
    }      if (selectedView === 'patients') {
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
      console.log('AdminDashboard: Current `families` state in renderContent:', families); // LOG 3

      const filteredFamilies = Array.isArray(families) ? families.filter(family =>
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
          />          {loadingFamilies && !selectedFamily ? <p>Loading families...</p> : 
            selectedFamily ? (
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
                        color: '#fff',
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
                    </thead>
                    <tbody>
                      {selectedFamily.members.map(member => (
                        <tr key={member.id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ 
                              padding: '16px',
                              fontWeight: '500',
                              fontSize: '15px',
                              color: '#e2e8f0' /* Lighter color for better readability */
                          }}>{member.name}</td>
                          <td style={{ padding: '16px' }}>
                            <button 
                              onClick={() => { 
                                setSelectedMember(member);
                                setActionView('ck-profile');
                                setSelectedView('patients');
                              }}
                              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div>
                {/* This is the section that lists families */}
                {filteredFamilies.length === 0 ? (
                  <p>{currentSearchTerm ? 'No families match your search.' : 'No families found. (Is `families` state populated?)'}</p>
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
      );
    }
    if (selectedView === 'reports') return <div style={{ color: '#f1f5f9' }}><Reports /></div>;
    if (selectedView === 'settings') return <div style={{ color: '#f1f5f9' }}><Asettings /></div>;

    const chartCards = [
      {
        title: 'Consultations (MTD)',
        content: (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: '#3b82f6', height: 120, width: '100%', borderRadius: 8 }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
              <span>0</span>
              <span>75</span>
            </div>
          </div>
        )
      },
      {
        title: '10 Diagnostic Test (Month to Date)',
        content: (
          <div style={{ marginTop: 16 }}>
            <PieChart colors={['#4C6EF5', '#12B886', '#FA5252', '#FAB005', '#7950F2', '#228BE6']} data={[25, 20, 15, 15, 15, 10]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#4C6EF5', display: 'inline-block', borderRadius: 2 }}></span>RAPID COVID/HEP/STI</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#12B886', display: 'inline-block', borderRadius: 2 }}></span>COMPLETE BLOOD COUNT</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#FA5252', display: 'inline-block', borderRadius: 2 }}></span>BLOOD BIOCHEMISTRY</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#FAB005', display: 'inline-block', borderRadius: 2 }}></span>URINALYSIS</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#7950F2', display: 'inline-block', borderRadius: 2 }}></span>OBSTETRICS PA GENES</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#228BE6', display: 'inline-block', borderRadius: 2 }}></span>OTHER BIOCHEMISTRY</div>
            </div>
          </div>
        )
      },
      {
        title: '10 Diagnostic Test (Month to Date)',
        content: (
          <div style={{ marginTop: 16 }}>
            <PieChart colors={['#FF6B6B', '#22B8CF', '#FD7E14', '#AE3EC9', '#51CF66']} data={[30, 25, 20, 15, 10]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4, marginTop: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#FF6B6B', display: 'inline-block', borderRadius: 2 }}></span>FAMILY PLANNING IMMUNIZATION</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#22B8CF', display: 'inline-block', borderRadius: 2 }}></span>ACUTE RESPIRATORY INFECTION</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#FD7E14', display: 'inline-block', borderRadius: 2 }}></span>CONTRACEPTIVE</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#AE3EC9', display: 'inline-block', borderRadius: 2 }}></span>TB PULMONARY</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#51CF66', display: 'inline-block', borderRadius: 2 }}></span>URINARY TRACT INFECTION</div>
            </div>
          </div>
        )
      },
      {
        title: '10 Diagnostic Test (Month to Date)',
        content: (
          <div style={{ marginTop: 16 }}>
            <PieChart colors={['#339AF0', '#51CF66', '#FF922B', '#F06595', '#845EF7']} data={[35, 25, 20, 12, 8]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4, marginTop: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#339AF0', display: 'inline-block', borderRadius: 2 }}></span>LANOXIN 200 MCG/MSAL</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#51CF66', display: 'inline-block', borderRadius: 2 }}></span>METOPROLOL (BETALOC/LOPRESOR)</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#FF922B', display: 'inline-block', borderRadius: 2 }}></span>FERROUS SULFATE</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#F06595', display: 'inline-block', borderRadius: 2 }}></span>CEFUROXIME 125</div>
              <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ width: 12, height: 12, marginRight: 6, background: '#845EF7', display: 'inline-block', borderRadius: 2 }}></span>ASCORBIC ACID (CLAVULANIC ACID)</div>
            </div>
          </div>
        )
      }
    ];

    if (zoomedChart !== null) {
      if (zoomedChart === 'trend') {
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90vw', maxWidth: 1200, maxHeight: '90vh', overflow: 'auto' }}>
              <DashboardCard title="Daily Trend Analysis" onClose={handleUnzoom}>
                <div style={{ minHeight: 400, minWidth: 600 }}><LineChart /></div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#EF4444', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Consultations</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3B82F6', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Diagnostic Tests</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#10B981', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Medications</span>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        );
      }
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
    }

    return (
      <>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, color: '#f1f5f9', letterSpacing: 0.2 }}>Analytics</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          {chartCards.map((card, idx) =>
            <DashboardCard
              key={idx}
              title={card.title}
              onZoom={() => handleZoomChart(idx)}
            >
              {card.content}
            </DashboardCard>
          )}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 32, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#f1f5f9', letterSpacing: 0.2 }}>Daily Trend Analysis</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'none', border: 'none', borderRadius: 6, padding: 6, color: '#fff', cursor: 'pointer' }} onClick={() => setZoomedChart('trend')}><Maximize size={16} /></button>
            </div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <LineChart />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#EF4444', marginRight: 8, display: 'inline-block' }}></span>
              <span style={{ fontSize: 14 }}>Consultations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3B82F6', marginRight: 8, display: 'inline-block' }}></span>
              <span style={{ fontSize: 14 }}>Diagnostic Tests</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: '#10B981', marginRight: 8, display: 'inline-block' }}></span>
              <span style={{ fontSize: 14 }}>Medications</span>
            </div>
          </div>
        </div>
        {zoomedChart === 'trend' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '90vw', maxWidth: 1200, maxHeight: '90vh', overflow: 'auto' }}>
              <DashboardCard title="Daily Trend Analysis" onClose={handleUnzoom}>
                <div style={{ minHeight: 400, minWidth: 600 }}><LineChart /></div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#EF4444', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Consultations</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#3B82F6', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Diagnostic Tests</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: '#10B981', marginRight: 8, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 14 }}>Medications</span>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
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
          >
            <SidebarItem
              icon={<Circle size={18} />}
              label="Schedule Session"
              active={selectedView === 'scheduledSessions'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('scheduledSessions')}
            />
            <SidebarItem
              icon={<Circle size={18} />}
              label="Sessions List"
              active={selectedView === 'sessions'}
              collapsed={false}
              indent
              onClick={() => setSelectedView('sessions')}
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
      </div>      {/* Main content */}
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
                {selectedView === 'dashboard' ? 'Dashboard' : 
                 selectedView === 'patients' ? 'Patient Database' :
                 selectedView === 'checkups' ? 'Check-Ups Today' :
                 selectedView === 'unsorted' ? 'Unsorted Members' :
                 selectedView === 'scheduledSessions' ? 'Schedule Session' :
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
                  <ChevronRight size={16} style={{ margin: '0 4px' }} />
                  <span style={{ color: '#38bdf8' }}>
                    {selectedMember.name}
                  </span>                  <ChevronRight size={16} style={{ margin: '0 4px' }} />                  <span style={{ color: '#38bdf8' }}>
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
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1e3a8a', marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', fontWeight: 'bold' }}>
                  A
                </div>
                {!collapsed && <span style={{ marginRight: 8 }}>Admin</span>}
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
              )}
            </div>
          </div>
        </div>        {/* Main dashboard content */}
        <div style={{ padding: 24, flex: 1, overflowY: 'auto', height: 'calc(100vh - 65px)' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
