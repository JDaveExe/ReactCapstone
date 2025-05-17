import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, CheckSquare, ChevronRight, Grid, List, Bell, Settings, LogOut, X, Menu, Activity, AlarmClock, FileText, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/SidebarDoc.css';
import '../styles/DoctorDashboard.css';
import AdmittingData from './AdmittingData';
import ImmunisationH from './ImmunisationH';
import Referral from './Referral';
import TreatmentRecord from './TreatmentRecord';
import ScheduleVisit from './ScheduleVisit';
import CKProfile from './CKProfile';
import CheckupRecords from './CheckupRecords';
import ScheduleSession from './ScheduleSession';
import SessionsList from './SessionsList';
import UnsortedMembers from './UnsortedMembers';
import RegisteredProfile from './RegisteredProfile';
import { getPatients, getFamilies, getFamilyMembers, getSortedFamilies } from '../services/api';
import { Button } from 'react-bootstrap';

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

export default function DoctorDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('patients');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionView, setActionView] = useState(null);  const [dropdowns, setDropdowns] = useState({
    checkUp: false,
    patientManagement: true,
    personalInfo: true, // For profile section
    contactInfo: true   // For profile section
  });
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const navigate = useNavigate();
  
  // Added for Patient Database functionality
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('database'); // 'database' or 'list'

  useEffect(() => {
    if (activeSection === 'patients') {
      if (viewMode === 'list') {
        setLoadingPatients(true);
        getPatients()
          .then(res => {
            setPatients(res.data);
            setLoadingPatients(false);
          })
          .catch(error => {
            console.error("Error fetching patients:", error);
            setLoadingPatients(false);
          });
      } else if (viewMode === 'database') {
        fetchFamiliesWithMembers();
      }
    }
    if (activeSection !== 'patients' || (activeSection === 'patients' && !actionView)) {
      setSelectedFamily(null);
      setSelectedMember(null);
    }
  }, [activeSection, actionView, viewMode]);

  const fetchFamiliesWithMembers = async () => {
    setLoadingFamilies(true);
    try {
      const res = await getSortedFamilies();
      console.log('DoctorDashboard: Raw sorted families data from API:', res.data);
      
      if (!Array.isArray(res.data)) {
        console.error('DoctorDashboard: API response for sorted families is not an array!', res.data);
        setFamilies([]); 
        setLoadingFamilies(false);
        return;
      }

      const processedFamilies = res.data.map(family => ({
        ...family,
        id: parseInt(family.id, 10),
        members: Array.isArray(family.members) ? family.members.map(member => ({ 
          ...member,
          id: parseInt(member.id, 10)
        })) : []
      }));
      
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
    setMembers(family.members || []); 
    setCurrentSearchTerm(''); // Reset search term when a new family is clicked
    setLoadingMembers(false); // Ensure loading state is off
  };

  const handleBackToFamilies = () => {
    setSelectedFamily(null);
    setMembers([]);
    setCurrentSearchTerm(''); // Clear search term
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActionView(null);
    if (section !== 'patients' || (section === 'patients' && !actionView)) {
      setSelectedFamily(null);
      setSelectedMember(null);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'list' ? 'database' : 'list');
    setSelectedFamily(null);
    setSelectedMember(null);
  };
  const renderPatientList = () => {
    if (viewMode === 'list') {
      if (loadingPatients) {
        return <div style={{ color: '#e5e7eb', textAlign: 'center', padding: '20px' }}>Loading patients...</div>;
      }
      if (patients.length === 0) {
        return <div style={{ color: '#e5e7eb', textAlign: 'center', padding: '20px' }}>No patients found.</div>;
      }
      return (
        <div className="patient-database-container" style={{ padding: '20px', color: '#e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
              Patient List
            </h1>
            <Button
              variant="primary"
              onClick={toggleViewMode}
              style={{ fontSize: '14px', fontWeight: '500', background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              View by Families
            </Button>
          </div>
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8' }}>Membership Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '12px' }}>{patient.firstName} {patient.lastName}</td>
                    <td style={{ padding: '12px' }}>{patient.email}</td>
                    <td style={{ padding: '12px' }}>{patient.phoneNumber}</td>
                    <td style={{ padding: '12px' }}>{patient.membershipStatus}</td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => { 
                          setSelectedMember(patient);
                          setActionView('ck-profile');
                          setActiveSection('patients');
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
          </div>
        </div>
      );
    } else {
      // Database view (families)
      // Log families state directly inside the render logic for 'patients' view
      console.log('DoctorDashboard: Current `families` state in renderContent:', families);

      const filteredFamilies = Array.isArray(families) ? families.filter(family =>
        family && family.familyName && // Add checks for family and familyName
        family.familyName.toLowerCase().includes(currentSearchTerm.toLowerCase())
      ) : [];
      
      return (
        <div className="patient-database-container" style={{ padding: '20px', color: '#e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
              {selectedFamily ? `Family: ${selectedFamily.familyName}` : 'Patient Database (Families)'}
            </h1>
            <Button
              variant="primary"
              onClick={toggleViewMode}
              style={{ fontSize: '14px', fontWeight: '500', background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              View as List
            </Button>
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

          {loadingFamilies && !selectedFamily ? <p>Loading families...</p> :            selectedFamily ? (
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
                    <tbody>                      {selectedFamily.members.map(member => (
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
                                setActiveSection('patients');
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
                  <p>{currentSearchTerm ? 'No families match your search.' : 'No families found.'}</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredFamilies.map((fam, index) => (
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
                        >                          <span style={{ 
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
  };  const renderContent = () => {
    if (actionView && selectedMember) {
      switch (actionView) {
        case 'ck-profile': 
          return (
            <div style={{ color: '#e5e7eb' }}>
              <button
                onClick={() => { 
                  if (viewMode === 'database' && selectedFamily) {
                    setSelectedMember(null); 
                    setActionView(null);
                  } else {
                    setSelectedMember(null); 
                    setActionView(null);
                  }
                }}
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
                {viewMode === 'database' && selectedFamily ? 'Back to Family' : 'Back to Patients'}
              </button>              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '20px', 
                color: '#38bdf8', /* Brighter blue color for better readability */
                textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)', /* Text shadow for better contrast */
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{selectedMember.name || `${selectedMember.firstName || ''} ${selectedMember.lastName || ''}`}</span>
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
                    gap: '8px',
                    fontSize: '14px'                  }}
                  onClick={() => setActionView('registered-profile')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M12 21.7C17 20 22 16.4 22 10c0-5.5-4.5-10-10-10S2 4.5 2 10c0 6.4 5 10 10 11.7z"/>
                  </svg>
                  Registered Profile
                </button>
              </h2>
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
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px', padding: '20px', background: '#1e293b', borderRadius: '8px' }}>
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
                    </div>              </div>
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
              
              {/* First row of buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px', marginBottom: '20px' }}>
                <button 
                  onClick={() => setActionView('ck-profile')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <User size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CHECK UP HISTORY</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Full examination details</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActionView('treatment')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <Activity size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>INDIVIDUAL TREATMENT RECORD</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Previous medical records</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActionView('schedule')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <Calendar size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>SCHEDULE VISIT</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Set up new appointment</div>
                  </div>
                </button>
              </div>
              
              {/* Second row of buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <button 
                  onClick={() => setActionView('admitting')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <FileText size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>ADMITTING DATA</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Admission and discharge info</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActionView('immunization')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <Shield size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>IMMUNIZATION HISTORY</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Vaccination records</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActionView('referral')}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    background: '#1e293b', 
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
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
                  }}>
                    <Activity size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>REFERRAL</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>Specialist referrals</div>
                  </div>
                </button>
              </div>
            </div>
          );
        case 'treatment': return <TreatmentRecord member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'admitting': return <AdmittingData member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'immunization': return <ImmunisationH member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'referral': return <Referral member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;        case 'schedule': return <ScheduleVisit member={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        case 'registered-profile': return <RegisteredProfile patient={selectedMember} onBack={() => { setActionView('ck-profile'); }} />;
        default: setActionView(null);
      }
    }

    switch (activeSection) {
      case 'patients':
        return renderPatientList();
      case 'unsorted':
        return <UnsortedMembers />;
      case 'checkups':
        return <CheckupRecords />;
      case 'scheduledSessions':
        return <ScheduleSession />;
      case 'sessions':
        return <SessionsList onScheduleNew={() => setActiveSection('scheduledSessions')} />;
      default:
        return renderPatientList();
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <div style={{ width: sidebarCollapsed ? 64 : 260, background: '#111827', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
        <div style={{ padding: 18, display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
          <img src={require('../images/maybunga.png')} alt="Maybunga Healthcare Center Logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
          {!sidebarCollapsed && <span style={{ fontWeight: 600, marginLeft: 10 }}>Maybunga Healthcare Center</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarDropdown icon={<Calendar size={18} />} label="Check Up" collapsed={sidebarCollapsed} isOpen={dropdowns.checkUp} onClick={() => setDropdowns(prev => ({ ...prev, checkUp: !prev.checkUp }))}>
            <SidebarItem label="Check Up Today" active={activeSection === 'checkups'} collapsed={sidebarCollapsed} indent onClick={() => handleSectionChange('checkups')} />
            <SidebarItem label="Schedule a Session" active={activeSection === 'scheduledSessions'} collapsed={sidebarCollapsed} indent onClick={() => handleSectionChange('scheduledSessions')} />
            <SidebarItem label="Sessions List" active={activeSection === 'sessions'} collapsed={sidebarCollapsed} indent onClick={() => handleSectionChange('sessions')} />
          </SidebarDropdown>
          <SidebarDropdown icon={<User size={18} />} label="Patient Management" collapsed={sidebarCollapsed} isOpen={dropdowns.patientManagement} onClick={() => setDropdowns(prev => ({ ...prev, patientManagement: !prev.patientManagement }))}>
            <SidebarItem label="Unsorted Members" active={activeSection === 'unsorted'} collapsed={sidebarCollapsed} indent onClick={() => handleSectionChange('unsorted')} />
            <SidebarItem label="Patient Database" active={activeSection === 'patients'} collapsed={sidebarCollapsed} indent onClick={() => handleSectionChange('patients')} />
          </SidebarDropdown>
        </div>
        <div style={{ padding: 18, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 8, color: '#fff', cursor: 'pointer' }}>
            {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 64, background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', marginBottom: 32 }}>          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#64748b', marginRight: 8 }}>YOU ARE HERE &gt;</span>
            {(() => {
              let path = [];
              const baseStyle = { color: '#38bdf8', fontWeight: 600 };
              const linkStyle = { ...baseStyle, cursor: 'pointer', textDecoration: 'underline' };  
              const sep = <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>;

              if (activeSection === 'patients') {
                if (viewMode === 'database') {
                  if (!selectedFamily && !selectedMember && !actionView) {
                    path.push(<span key="db" style={baseStyle}>Patient Database</span>);
                  } else if (selectedFamily && !selectedMember && !actionView) {
                    path.push(<span key="db-link" style={linkStyle} onClick={() => { handleBackToFamilies(); }}>Patient Database</span>);
                    path.push(sep);
                    path.push(<span key="family" style={baseStyle}>{selectedFamily.familyName}</span>);
                  } else if (selectedFamily && selectedMember && actionView) {
                    path.push(<span key="db-link" style={linkStyle} onClick={() => { handleBackToFamilies(); setSelectedMember(null); setActionView(null); }}>Patient Database</span>);
                    path.push(sep);
                    path.push(<span key="family-link" style={linkStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{selectedFamily.familyName}</span>);
                    path.push(sep);                    path.push(<span key="member-link" style={linkStyle} onClick={() => { setActionView(null); }}>{selectedMember.name}</span>);
                    path.push(sep);
                    let actionLabel = '';
                    switch (actionView) {
                      case 'ck-profile': actionLabel = 'Profile'; break;
                      case 'treatment': actionLabel = 'Individual Treatment Record'; break;
                      case 'schedule': actionLabel = 'Schedule Visit'; break;
                      case 'admitting': actionLabel = 'Admitting Data'; break;
                      case 'immunization': actionLabel = 'Immunization History'; break;
                      case 'referral': actionLabel = 'Referral'; break;
                      case 'registered-profile': actionLabel = 'Registered Profile'; break;
                      default: actionLabel = actionView;
                    }
                    path.push(<span key="action" style={baseStyle}>{actionLabel}</span>);
                  }
                } else {
                  // List view mode
                  if (!selectedMember && !actionView) {
                    path.push(<span key="list" style={baseStyle}>Patient List</span>);
                  } else if (selectedMember && actionView) {
                    path.push(<span key="list-link" style={linkStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>Patient List</span>);
                    path.push(sep);                    path.push(<span key="member-link" style={linkStyle} onClick={() => { setActionView(null); }}>{selectedMember.firstName} {selectedMember.lastName}</span>);
                    path.push(sep);
                    let actionLabel = '';
                    switch (actionView) {
                      case 'ck-profile': actionLabel = 'Profile'; break;
                      case 'treatment': actionLabel = 'Individual Treatment Record'; break;
                      case 'schedule': actionLabel = 'Schedule Visit'; break;
                      case 'admitting': actionLabel = 'Admitting Data'; break;
                      case 'immunization': actionLabel = 'Immunization History'; break;
                      case 'referral': actionLabel = 'Referral'; break;
                      case 'registered-profile': actionLabel = 'Registered Profile'; break;
                      default: actionLabel = actionView;
                    }
                    path.push(<span key="action" style={baseStyle}>{actionLabel}</span>);
                  }
                }
              } else if (activeSection === 'unsorted') {
                path.push(<span key="unsorted" style={baseStyle}>Unsorted Members</span>);
              } else if (activeSection === 'checkups') {
                path.push(<span key="checkups" style={baseStyle}>Check Ups Today</span>);
              } else if (activeSection === 'scheduledSessions') {
                path.push(<span key="schedule" style={baseStyle}>Schedule Session</span>);
              } else if (activeSection === 'sessions') {
                path.push(<span key="sessions" style={baseStyle}>Sessions List</span>);
              }
              return path;
            })()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Bell size={18} /></button>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
              <span style={{ fontSize: 14 }}>Doctor</span>
            </div>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
