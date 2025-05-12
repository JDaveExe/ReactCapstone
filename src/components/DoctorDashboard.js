import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, FileText, Beaker, CheckSquare, ChevronRight, Grid, List, Shield, Activity, AlarmClock, Bell, Settings, LogOut, X, Menu } from 'lucide-react';
import '../styles/SidebarDoc.css';
import '../styles/DoctorDashboard.css';
import AdmittingData from './AdmittingData';
import ImmunisationH from './ImmunisationH';
import Referral from './Referral';
import Reports from './Reports';
import Asettings from './Asettings';
import TreatmentRecord from './TreatmentRecord';
import ScheduleVisit from './ScheduleVisit';
import CKProfile from './CKProfile';
import CheckupRecords from './CheckupRecords';

export default function DoctorDashboard() {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [actionView, setActionView] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // for desktop
  const [activeSection, setActiveSection] = useState('checkups');
  const navigate = useNavigate();

  const families = [
    { id: 1, name: 'Smith Family' },
    { id: 2, name: 'Johnson Family' },
    { id: 3, name: 'Williams Family' },
    { id: 4, name: 'Davis Family' },
    { id: 5, name: 'Brown Family' },
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
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleBackClick = () => {
    if (actionView) {
      setActionView(null);
    } else if (selectedMember) {
      setSelectedMember(null);
    } else if (selectedFamily) {
      setSelectedFamily(null);
    }
  };

  return (
    <div className="docdash-root">
      {/* Header */}
      <header className="docdash-header">
        <div className="docdash-header-left">
          <button
            className="docdash-header-btn d-md-none"
            style={{ marginRight: 12, background: 'none', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center' }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
          <div className="docdash-logo"></div>
          <h1 className="docdash-title">Maybunga Healthcare Center</h1>
        </div>
        <div className="docdash-header-right">
          <button className="docdash-header-btn"><Bell size={20} /></button>
          <button className="docdash-header-btn"><Settings size={20} /></button>
          <div className="docdash-header-user">
            <div className="docdash-header-avatar"><User size={18} /></div>
            <span className="docdash-header-admin">Doctor</span>
          </div>
          <button className="docdash-header-btn" onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={20} /></button>
        </div>
      </header>

      {/* Main Content */}
      <div className="docdash-main">
        {/* Sidebar and overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1025 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`docdash-sidebar${sidebarCollapsed ? ' collapsed' : ''}${sidebarOpen ? ' show' : ''}`}
          style={{ zIndex: 1030, position: 'relative' }}
        >
          {/* Collapse/expand button replaces 'Menu' text */}
          <button
            className="docdash-header-btn"
            style={{ margin: '18px 0 12px 18px', background: 'none', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center' }}
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <Menu size={22} /> : <X size={22} />}
          </button>
          <nav className="docdash-menu">
            <ul>
              <li className={`docdash-menuitem${!sidebarCollapsed ? '' : ' docdash-menuitem-collapsed'}`}> 
                <button
                  className={`docdash-menu-link${activeSection === 'checkups' ? ' docdash-menu-link-active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', color: 'inherit', padding: 0, cursor: 'pointer' }}
                  onClick={() => {
                    setActiveSection('checkups');
                    setSelectedFamily(null);
                    setSelectedMember(null);
                    setActionView(null);
                  }}
                >
                  <CheckSquare size={20} className="docdash-menu-icon" />
                  {!sidebarCollapsed && <span>Check Ups</span>}
                </button>
              </li>
              <li className={`docdash-menuitem${activeSection === 'patients' ? ' docdash-menu-link-active' : ''}${!sidebarCollapsed ? '' : ' docdash-menuitem-collapsed'}`}> 
                <button
                  className={`docdash-menu-link${activeSection === 'patients' ? ' docdash-menu-link-active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', color: 'inherit', padding: 0, cursor: 'pointer' }}
                  onClick={() => {
                    setActiveSection('patients');
                    setSelectedFamily(null);
                    setSelectedMember(null);
                    setActionView(null);
                  }}
                >
                  <User size={20} className="docdash-menu-icon" />
                  {!sidebarCollapsed && <span>Patient Database</span>}
                </button>
              </li>
            </ul>
          </nav>

          <div className="docdash-sidebar-bottom">
            <div className="docdash-searchbar">
              <Search size={16} className="docdash-search-icon" />
              <input 
                type="text" 
                placeholder="Search Families" 
                className="docdash-search-input"
              />
            </div>

            <div className="docdash-views-row">
              {/* Show only the icon when collapsed, label and buttons when expanded */}
              {sidebarCollapsed ? (
                <span className="docdash-views-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <Grid size={18} style={{ color: '#fff' }} />
                </span>
              ) : (
                <>
                  <span className="docdash-views-icon" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}>
                    <Grid size={18} style={{ color: '#fff', marginRight: 8 }} />
                  </span>
                  <span className="docdash-views-label" style={{ marginRight: 8 }}>Views:</span>
                  <button 
                    className={`docdash-viewbtn${viewMode === 'list' ? ' docdash-viewbtn-active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </button>
                  <button 
                    className={`docdash-viewbtn${viewMode === 'grid' ? ' docdash-viewbtn-active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="docdash-family-list">
              {families.map(family => (
                <div 
                  key={family.id} 
                  className={`docdash-family-item${selectedFamily === family.id ? ' docdash-family-item-active' : ''}${sidebarCollapsed ? ' docdash-family-item-collapsed' : ''}`}
                  onClick={() => handleFamilyClick(family.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 8 }}
                >
                  <User size={18} style={{ marginRight: sidebarCollapsed ? 0 : 8, color: '#38bdf8' }} />
                  {!sidebarCollapsed && <span>{family.name}</span>}
                  {!sidebarCollapsed && <ChevronRight size={16} />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="docdash-content">
          {/* Breadcrumb */}
          <div style={{ height: 64, background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
              <span style={{ color: '#64748b', marginRight: 8 }}>YOU ARE HERE &gt;</span>
              {/* Breadcrumb navigation logic */}
              {activeSection === 'checkups' && (
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Check Ups</span>
              )}
              {activeSection === 'patients' && (() => {
                const familyObj = families.find(f => f.id === selectedFamily);
                const breadcrumbStyle = { color: '#38bdf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', marginRight: 4 };
                const sep = <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>;
                if (!selectedFamily) {
                  return (
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>Dashboard</span>
                  );
                }
                if (selectedFamily && !selectedMember) {
                  return (
                    <>
                      <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Dashboard</span>
                      {sep}
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{familyObj?.name}</span>
                    </>
                  );
                }
                if (selectedMember && !actionView) {
                  return (
                    <>
                      <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Dashboard</span>
                      {sep}
                      <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.name}</span>
                      {sep}
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedMember.name}</span>
                    </>
                  );
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
                  return (
                    <>
                      <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Dashboard</span>
                      {sep}
                      <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.name}</span>
                      {sep}
                      <span style={breadcrumbStyle} onClick={() => { setActionView(null); }}>{selectedMember.name}</span>
                      {sep}
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{actionLabel}</span>
                    </>
                  );
                }
                return <span style={{ color: '#38bdf8', fontWeight: 600 }}>Dashboard</span>;
              })()}
            </div>
          </div>

          {activeSection === 'checkups' ? (
            <CheckupRecords />
          ) : (
            <>
              {!selectedFamily && (
                <div className="docdash-empty-state">
                  <p>Select a family to view members</p>
                </div>
              )}

              {selectedFamily && !selectedMember && (
                <div>
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
                </div>
              )}

              {selectedMember && !actionView && (
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
                      <div className="docdash-info-item">
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
              )}

              {selectedMember && actionView === 'checkup' && (
                <CKProfile member={selectedMember} onBack={() => setActionView(null)} />
              )}
              {selectedMember && actionView === 'treatment' && (
                <TreatmentRecord member={selectedMember} onBack={() => setActionView(null)} />
              )}
              {selectedMember && actionView === 'admitting' && (
                <AdmittingData member={selectedMember} onBack={() => setActionView(null)} />
              )}
              {selectedMember && actionView === 'immunization' && (
                <ImmunisationH member={selectedMember} onBack={() => setActionView(null)} />
              )}
              {selectedMember && actionView === 'referral' && (
                <Referral member={selectedMember} onBack={() => setActionView(null)} />
              )}
              {selectedMember && actionView === 'schedule' && (
                <ScheduleVisit member={selectedMember} onBack={() => setActionView(null)} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
