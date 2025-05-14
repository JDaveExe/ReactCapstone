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
import { getPatients } from '../services/api';

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
  const [actionView, setActionView] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    checkUp: false,
    patientManagement: true
  });
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeSection === 'patients') {
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
    }
    if (activeSection !== 'patients' || (activeSection === 'patients' && !actionView)) {
      setSelectedFamily(null);
      setSelectedMember(null);
    }
  }, [activeSection, actionView]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActionView(null);
    if (section !== 'patients' || (section === 'patients' && !actionView)) {
      setSelectedFamily(null);
      setSelectedMember(null);
    }
  };

  const renderPatientList = () => {
    if (loadingPatients) {
      return <div style={{ color: '#e5e7eb', textAlign: 'center', padding: '20px' }}>Loading patients...</div>;
    }
    if (patients.length === 0) {
      return <div style={{ color: '#e5e7eb', textAlign: 'center', padding: '20px' }}>No patients found.</div>;
    }
    return (
      <div className="patient-database-container" style={{ padding: '20px', color: '#e5e7eb' }}>
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
  };

  const renderContent = () => {
    if (actionView && selectedMember) {
      switch (actionView) {
        case 'ck-profile': return <CKProfile member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
        case 'treatment': return <TreatmentRecord member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
        case 'admitting': return <AdmittingData member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
        case 'immunization': return <ImmunisationH member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
        case 'referral': return <Referral member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
        case 'schedule': return <ScheduleVisit member={selectedMember} onBack={() => { setActionView(null); setSelectedMember(null); }} />;
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
        <div style={{ height: 64, background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#64748b', marginRight: 8 }}>YOU ARE HERE &gt;</span>
            {(() => {
              let path = [];
              const baseStyle = { color: '#38bdf8', fontWeight: 600 };
              const linkStyle = { ...baseStyle, cursor: 'pointer', textDecoration: 'underline' };  
              const sep = <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>;

              if (activeSection === 'patients') {
                if (!selectedMember && !actionView) {
                  path.push(<span key="db" style={baseStyle}>Patient Database</span>);
                } else if (selectedMember && actionView) {
                  path.push(<span key="db-link" style={linkStyle} onClick={() => { handleSectionChange('patients'); setSelectedMember(null); setActionView(null);}}>Patient Database</span>);
                  path.push(sep);
                  path.push(<span key="member-link" style={linkStyle} onClick={() => { setActionView(null); }}>{selectedMember.firstName} {selectedMember.lastName}</span>);
                  path.push(sep);
                  let actionLabel = '';
                  switch (actionView) {
                    case 'ck-profile': actionLabel = 'Check-up Profile'; break;
                    case 'treatment': actionLabel = 'Individual Treatment Record'; break;
                    case 'schedule': actionLabel = 'Schedule Visit'; break;
                    case 'admitting': actionLabel = 'Admitting Data'; break;
                    case 'immunization': actionLabel = 'Immunization History'; break;
                    case 'referral': actionLabel = 'Referral'; break;
                    default: actionLabel = actionView;
                  }
                  path.push(<span key="action" style={baseStyle}>{actionLabel}</span>);
                } else if (selectedMember && !actionView) {
                  path.push(<span key="db-link" style={linkStyle} onClick={() => { handleSectionChange('patients'); setSelectedMember(null);}}>Patient Database</span>);
                  path.push(sep);
                  path.push(<span key="member-name" style={baseStyle}>{selectedMember.firstName} {selectedMember.lastName}</span>);
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