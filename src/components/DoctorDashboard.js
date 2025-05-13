import { useState } from 'react';
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
  const [viewMode, setViewMode] = useState('list');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionView, setActionView] = useState(null);
  const [familySearchTerm, setFamilySearchTerm] = useState('');
  const [dropdowns, setDropdowns] = useState({
    checkUp: false,
    patientManagement: true
  });
  const navigate = useNavigate();

  const families = [
    { id: 1, name: 'Smith Family' },
    { id: 2, name: 'Johnson Family' },
    { id: 3, name: 'Williams Family' },
    { id: 4, name: 'Davis Family' },
    { id: 5, name: 'Brown Family' }
  ];
  const familyMembers = {
    1: [
      { id: 1, name: 'James Smith', age: 15, gender: 'Male', lastCheckup: '2025-04-08', phone: '(555) 123-4567', email: 'james@example.com', address: '123 Main St, Cityville' },
      { id: 2, name: 'Sarah Smith', age: 42, gender: 'Female', lastCheckup: '2025-03-15', phone: '(555) 234-5678', email: 'sarah@example.com', address: '123 Main St, Cityville' },
      { id: 3, name: 'Michael Smith', age: 45, gender: 'Male', lastCheckup: '2025-02-22', phone: '(555) 345-6789', email: 'michael@example.com', address: '123 Main St, Cityville' }
    ],
    2: [
      { id: 4, name: 'Emma Johnson', age: 38, gender: 'Female', lastCheckup: '2025-04-01', phone: '(555) 456-7890', email: 'emma@example.com', address: '456 Oak Ave, Townsville' },
      { id: 5, name: 'Robert Johnson', age: 40, gender: 'Male', lastCheckup: '2025-03-20', phone: '(555) 567-8901', email: 'robert@example.com', address: '456 Oak Ave, Townsville' }
    ],
    3: [
      { id: 6, name: 'Linda Williams', age: 35, gender: 'Female', lastCheckup: '2025-04-05', phone: '(555) 678-9012', email: 'linda@example.com', address: '789 Pine Dr, Villagetown' }
    ],
    4: [
      { id: 7, name: 'Thomas Davis', age: 52, gender: 'Male', lastCheckup: '2025-03-25', phone: '(555) 789-0123', email: 'thomas@example.com', address: '101 Elm St, Hamletville' },
      { id: 8, name: 'Patricia Davis', age: 50, gender: 'Female', lastCheckup: '2025-03-26', phone: '(555) 890-1234', email: 'patricia@example.com', address: '101 Elm St, Hamletville' },
      { id: 9, name: 'Christopher Davis', age: 22, gender: 'Male', lastCheckup: '2025-04-02', phone: '(555) 901-2345', email: 'chris@example.com', address: '101 Elm St, Hamletville' }
    ],
    5: [
      { id: 10, name: 'Jessica Brown', age: 45, gender: 'Female', lastCheckup: '2025-03-18', phone: '(555) 012-3456', email: 'jessica@example.com', address: '202 Cedar Ln, Boroughburg' },
      { id: 11, name: 'Daniel Brown', age: 47, gender: 'Male', lastCheckup: '2025-03-19', phone: '(555) 123-4567', email: 'daniel@example.com', address: '202 Cedar Ln, Boroughburg' }
    ]
  };

  const handleFamilyClick = (familyId) => {
    setSelectedFamily(familyId);
    setSelectedMember(null);
    setActionView(null);
  };
  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setActionView(null);
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
            <SidebarItem label="Check Up Today" active={activeSection === 'checkups'} collapsed={sidebarCollapsed} indent onClick={() => { setActiveSection('checkups'); setSelectedFamily(null); setSelectedMember(null); setActionView(null); }} />
            <SidebarItem label="Schedule a Session" active={activeSection === 'scheduledSessions'} collapsed={sidebarCollapsed} indent onClick={() => { setActiveSection('scheduledSessions'); setSelectedFamily(null); setSelectedMember(null); setActionView(null); }} />
            <SidebarItem label="Sessions List" active={activeSection === 'sessions'} collapsed={sidebarCollapsed} indent onClick={() => { setActiveSection('sessions'); setSelectedFamily(null); setSelectedMember(null); setActionView(null); }} />
          </SidebarDropdown>
          <SidebarDropdown icon={<User size={18} />} label="Patient Management" collapsed={sidebarCollapsed} isOpen={dropdowns.patientManagement} onClick={() => setDropdowns(prev => ({ ...prev, patientManagement: !prev.patientManagement }))}>
            <SidebarItem label="Unsorted Members" active={activeSection === 'unsorted'} collapsed={sidebarCollapsed} indent onClick={() => { setActiveSection('unsorted'); setSelectedFamily(null); setSelectedMember(null); setActionView(null); }} />
            <SidebarItem label="Patient Database" active={activeSection === 'patients'} collapsed={sidebarCollapsed} indent onClick={() => { setActiveSection('patients'); setSelectedFamily(null); setSelectedMember(null); setActionView(null); }} />
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
            {activeSection === 'checkups' && <span style={{ color: '#38bdf8', fontWeight: 600 }}>Check Ups</span>}
            {activeSection === 'sessions' && <span style={{ color: '#38bdf8', fontWeight: 600 }}>Session Management</span>}
            {activeSection === 'scheduledSessions' && <span style={{ color: '#38bdf8', fontWeight: 600 }}>Schedule Session</span>}
            {activeSection === 'unsorted' && <span style={{ color: '#38bdf8', fontWeight: 600 }}>Unsorted Members</span>}
            {activeSection === 'patients' && (() => {
              const familyObj = families.find(f => f.id === selectedFamily);
              const breadcrumbStyle = { color: '#38bdf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', marginRight: 4 };
              const sep = <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>;
              
              if (!selectedFamily) {
                return <span style={{ color: '#38bdf8', fontWeight: 600 }}>Patient Database</span>;
              }
              if (selectedFamily && !selectedMember) {
                return <>
                  <span style={breadcrumbStyle} onClick={() => setSelectedFamily(null)}>Patient Database</span>
                  {sep}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{familyObj?.name}</span>
                </>;
              }
              if (selectedMember && !actionView) {
                return <>
                  <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Patient Database</span>
                  {sep}
                  <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.name}</span>
                  {sep}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedMember.name}</span>
                </>;
              }
              if (selectedMember && actionView) {
                let actionLabel = '';
                switch (actionView) {
                  case 'checkup': actionLabel = 'Check-up Profile'; break;
                  case 'treatment': actionLabel = 'Individual Treatment Record'; break;
                  case 'schedule': actionLabel = 'Schedule Visit'; break;
                  case 'admitting': actionLabel = 'Admitting Data'; break;
                  case 'immunization': actionLabel = 'Immunization History'; break;
                  case 'referral': actionLabel = 'Referral'; break;
                  default: actionLabel = actionView;
                }
                return <>
                  <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Patient Database</span>
                  {sep}
                  <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.name}</span>
                  {sep}
                  <span style={breadcrumbStyle} onClick={() => { setActionView(null); }}>{selectedMember.name}</span>
                  {sep}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{actionLabel}</span>
                </>;
              }
              return <span style={{ color: '#38bdf8', fontWeight: 600 }}>Patient Database</span>;
            })()}
          </div>          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Bell size={18} /></button>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
              <span style={{ fontSize: 14 }}>Doctor</span>
            </div>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 32, background: '#0f172a' }}>          
          {activeSection === 'checkups' ? (
            <CheckupRecords />
          ) : activeSection === 'sessions' ? (
            <div style={{ color: '#f1f5f9' }}>
              <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Session Management</h2>
              <SessionsList userRole="doctor" />
            </div>
          ) : activeSection === 'scheduledSessions' ? (
            <div style={{ color: '#f1f5f9' }}>
              <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Schedule New Session</h2>
              <ScheduleSession />
            </div>
          ) : activeSection === 'unsorted' ? (
            <div style={{ color: '#f1f5f9' }}>
              <UnsortedMembers />
            </div>
          ) : activeSection === 'patients' ? (
            <div style={{ color: '#f1f5f9' }}>              <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Patient Database</h2>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div className="docdash-searchbar" style={{ marginBottom: 16 }}>
                  <Search size={16} className="docdash-search-icon" />
                  <input
                    type="text"
                    placeholder="Search Families"
                    className="docdash-search-input"
                    value={familySearchTerm}
                    onChange={e => setFamilySearchTerm(e.target.value)}
                    style={{ width: '100%', background: '#232a36', color: '#f1f5f9', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', marginLeft: 0 }}
                  />
                </div>                <div className="docdash-views-row" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="docdash-views-label" style={{ marginRight: 8 }}>Views:</span>
                  <button
                    className={`docdash-viewbtn${viewMode === 'list' ? ' docdash-viewbtn-active' : ''}`}
                    onClick={() => setViewMode('list')}
                    style={{ background: viewMode === 'list' ? '#38bdf8' : 'transparent', color: viewMode === 'list' ? '#fff' : '#cbd5e1', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                  <button
                    className={`docdash-viewbtn${viewMode === 'grid' ? ' docdash-viewbtn-active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    style={{ background: viewMode === 'grid' ? '#38bdf8' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#cbd5e1', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }}
                    aria-label="Grid view"
                  >
                    <Grid size={16} />
                  </button>
                </div>
              </div>              {!selectedFamily ? (
                <div className="docdash-family-list">
                  {families
                    .filter(fam => fam.name.toLowerCase().includes(familySearchTerm.toLowerCase()))
                    .map(family => (
                      <div
                        key={family.id}
                        className={`docdash-family-item${selectedFamily === family.id ? ' docdash-family-item-active' : ''}${viewMode === 'grid' ? ' docdash-family-item-grid' : ''}`}
                        onClick={() => handleFamilyClick(family.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                      >
                        <User size={18} style={{ color: '#38bdf8', marginRight: 8 }} />
                        <span style={{ fontWeight: 600 }}>{family.name}</span>
                        <ChevronRight size={16} />
                      </div>
                    ))}
                </div>
              ) : !selectedMember ? (
                <div>
                  <button onClick={() => setSelectedFamily(null)} style={{ marginBottom: 16, background: 'none', color: '#38bdf8', border: 'none', cursor: 'pointer' }}>&lt; Back to Families</button>
                  <h3 className="docdash-section-title">{families.find(f => f.id === selectedFamily)?.name} Members</h3>
                  <div className={viewMode === 'grid' ? 'docdash-members-grid' : 'docdash-members-list'}>
                    {familyMembers[selectedFamily]?.map(member => (
                      <div
                        key={member.id}
                        className={`docdash-member-card${viewMode === 'list' ? ' docdash-member-card-list' : ''}`}
                        onClick={() => handleMemberClick(member)}
                      >
                        <div className="docdash-member-avatar"><User size={20} /></div>
                        <div className="docdash-member-info">
                          <p className="docdash-member-name">{member.name}</p>
                          <p className="docdash-member-last">Last checkup: {member.lastCheckup}</p>
                        </div>
                        <ChevronRight size={16} className="docdash-member-chevron" />
                      </div>
                    ))}
                  </div>
                </div>              ) : !actionView ? (
                <div>
                  <div className="docdash-member-header">
                    <h3 className="docdash-member-detail-title">{selectedMember.name}</h3>
                    <button className="docdash-emailbtn">Email Family</button>
                  </div>
                  <div className="docdash-info-card">
                    <h4 className="docdash-info-title">Personal Information</h4>
                    <div className="docdash-info-grid">
                      <div className="docdash-info-item">
                        <p className="docdash-info-label">Age</p>
                        <p>{selectedMember.age} years</p>
                      </div>
                      <div className="docdash-info-item">
                        <p className="docdash-info-label">Gender</p>
                        <p>{selectedMember.gender}</p>
                      </div>
                      <div className="docdash-info-item">
                        <p className="docdash-info-label">Last Checkup</p>
                        <p>{selectedMember.lastCheckup}</p>
                      </div>
                    </div>
                  </div>
                  <div className="docdash-info-card">
                    <h4 className="docdash-info-title">Contact Information</h4>
                    <div className="docdash-info-grid">
                      <div className="docdash-info-item">
                        <p className="docdash-info-label">Phone</p>
                        <p>{selectedMember.phone}</p>
                      </div>
                      <div className="docdash-info-item">
                        <p className="docdash-info-label">Email</p>
                        <p>{selectedMember.email}</p>
                      </div>
                      <div className="docdash-info-item wide">
                        <p className="docdash-info-label">Address</p>
                        <p>{selectedMember.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="docdash-actions-grid">
                    <div className="docdash-action-card" onClick={() => setActionView('checkup')}>
                      <div className="docdash-action-avatar"><User size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Check-up Profile</h5>
                        <p className="docdash-action-desc">Full examination details</p>
                      </div>
                    </div>
                    <div className="docdash-action-card" onClick={() => setActionView('treatment')}>
                      <div className="docdash-action-avatar"><Activity size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Individual Treatment Record</h5>
                        <p className="docdash-action-desc">Previous medical records</p>
                      </div>
                    </div>
                    <div className="docdash-action-card" onClick={() => setActionView('schedule')}>
                      <div className="docdash-action-avatar"><AlarmClock size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Schedule Visit</h5>
                        <p className="docdash-action-desc">Set up new appointment</p>
                      </div>
                    </div>
                    <div className="docdash-action-card" onClick={() => setActionView('admitting')}>
                      <div className="docdash-action-avatar"><FileText size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Admitting Data</h5>
                        <p className="docdash-action-desc">Admission and discharge info</p>
                      </div>
                    </div>
                    <div className="docdash-action-card" onClick={() => setActionView('immunization')}>
                      <div className="docdash-action-avatar"><Shield size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Immunization History</h5>
                        <p className="docdash-action-desc">Vaccination records</p>
                      </div>
                    </div>
                    <div className="docdash-action-card" onClick={() => setActionView('referral')}>
                      <div className="docdash-action-avatar"><Activity size={20} /></div>
                      <div>
                        <h5 className="docdash-action-title">Referral</h5>
                        <p className="docdash-action-desc">Specialist referrals</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {actionView === 'checkup' && (
                    <CKProfile member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                  {actionView === 'treatment' && (
                    <TreatmentRecord member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                  {actionView === 'admitting' && (
                    <AdmittingData member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                  {actionView === 'immunization' && (
                    <ImmunisationH member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                  {actionView === 'referral' && (
                    <Referral member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                  {actionView === 'schedule' && (
                    <ScheduleVisit member={selectedMember} onBack={() => setActionView(null)} />
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}