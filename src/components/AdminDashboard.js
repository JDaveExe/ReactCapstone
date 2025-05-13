import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Search, Settings, Bell, LogOut, User, Menu, X, Maximize, BarChart2, Circle, Calendar, Square, ChevronRight, Activity, AlarmClock, FileText, Shield, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardAdm.css';
import '../styles/SidebarAdmin.css';
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
  const [collapsed, setCollapsed] = useState(false);  const [dropdowns, setDropdowns] = useState({
    patientManagement: false,
    reports: false,
    management: false,
    checkUp: false,
    sessions: false
  });
  const [selectedView, setSelectedView] = useState('dashboard');
  const [zoomedChart, setZoomedChart] = useState(null);
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionView, setActionView] = useState(null);
  const [familySearchTerm, setFamilySearchTerm] = useState('');
  const [families, setFamilies] = useState([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'admin');
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
    if (selectedView === 'patients') {
      setLoadingFamilies(true);
      axios.get('http://localhost:5000/api/sorted-families')
        .then(res => {
          setFamilies(res.data);
          setLoadingFamilies(false);
          setSelectedFamily(null);
          setSelectedMember(null);
          setActionView(null);
        })
        .catch(() => setLoadingFamilies(false));
    }
  }, [selectedView]);

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  function handleZoomChart(idx) {
    setZoomedChart(idx);
  }

  function handleUnzoom() {
    setZoomedChart(null);
  }

  function renderContent() {
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
    }
    if (selectedView === 'patients') {
      const selectedFamilyObj = selectedFamily
        ? families.find(fam => fam.familyName === selectedFamily)
        : null;

      return (
        <div style={{ color: '#f1f5f9' }}>
          <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Patient Database</h2>
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
            </div>
            <div className="docdash-views-row" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {loadingFamilies ? (
              <div style={{ textAlign: 'center', marginTop: 32 }}>Loading families...</div>
            ) : !selectedFamily && (
              <div className="docdash-family-list">
                {families
                  .filter(fam => fam.familyName.toLowerCase().includes(familySearchTerm.toLowerCase()))
                  .map(family => (
                    <div
                      key={family.familyName}
                      className={`docdash-family-item${selectedFamily === family.familyName ? ' docdash-family-item-active' : ''}${viewMode === 'grid' ? ' docdash-family-item-grid' : ''}`}
                      onClick={() => setSelectedFamily(family.familyName)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                    >
                      <User size={18} style={{ color: '#38bdf8', marginRight: 8 }} />
                      <span style={{ fontWeight: 600 }}>{family.familyName}</span>
                      <ChevronRight size={16} />
                    </div>
                  ))}
              </div>
            )}
            {selectedFamily && !selectedMember && selectedFamilyObj && (
              <div>
                <button onClick={() => setSelectedFamily(null)} style={{ marginBottom: 16, background: 'none', color: '#38bdf8', border: 'none', cursor: 'pointer' }}>&lt; Back to Families</button>
                <h3 className="docdash-section-title">{selectedFamilyObj.familyName} Members</h3>
                <div className={viewMode === 'grid' ? 'docdash-members-grid' : 'docdash-members-list'}>
                  {selectedFamilyObj.members.map(member => (
                    <div
                      key={member.id}
                      className={`docdash-member-card${viewMode === 'list' ? ' docdash-member-card-list' : ''}`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="docdash-member-avatar"><User size={20} /></div>
                      <div className="docdash-member-info">
                        <p className="docdash-member-name">{member.name}</p>
                      </div>
                      <ChevronRight size={16} className="docdash-member-chevron" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMember && !actionView && (              <div>
                <div className="docdash-member-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 className="docdash-member-detail-title" style={{ fontSize: 24, fontWeight: 700 }}>{selectedMember.name}</h3>
                  <button className="docdash-emailbtn" style={{ background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Email Family</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 24 }}>
                  <div style={{ background: '#232a36', borderRadius: 14, padding: '24px 24px 18px 24px', marginBottom: 0 }}>
                    <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Personal Information</h4>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ flex: 1, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Age</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                      <div style={{ flex: 1, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Gender</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                      <div style={{ flex: 1, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Last Checkup</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#232a36', borderRadius: 14, padding: '24px 24px 18px 24px', marginBottom: 0 }}>
                    <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Contact Information</h4>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ flex: 1, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Phone</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                      <div style={{ flex: 1, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Email</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                      <div style={{ flex: 2, background: '#334155', borderRadius: 10, padding: '18px 20px', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Address</p>
                        <p style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 500 }}></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 24 }}>
                  <div className="docdash-action-card" onClick={() => setActionView('checkup')}><div className="docdash-action-avatar"><User size={20} /></div><div><h5 className="docdash-action-title">Check-up Profile</h5><p className="docdash-action-desc">Full examination details</p></div></div>
                  <div className="docdash-action-card" onClick={() => setActionView('treatment')}><div className="docdash-action-avatar"><Activity size={20} /></div><div><h5 className="docdash-action-title">Individual Treatment Record</h5><p className="docdash-action-desc">Previous medical records</p></div></div>
                  <div className="docdash-action-card" onClick={() => setActionView('schedule')}><div className="docdash-action-avatar"><AlarmClock size={20} /></div><div><h5 className="docdash-action-title">Schedule Visit</h5><p className="docdash-action-desc">Set up new appointment</p></div></div>
                  <div className="docdash-action-card" onClick={() => setActionView('admitting')}><div className="docdash-action-avatar"><FileText size={20} /></div><div><h5 className="docdash-action-title">Admitting Data</h5><p className="docdash-action-desc">Admission and discharge info</p></div></div>
                  <div className="docdash-action-card" onClick={() => setActionView('immunization')}><div className="docdash-action-avatar"><Shield size={20} /></div><div><h5 className="docdash-action-title">Immunization History</h5><p className="docdash-action-desc">Vaccination records</p></div></div>
                  <div className="docdash-action-card" onClick={() => setActionView('referral')}><div className="docdash-action-avatar"><Activity size={20} /></div><div><h5 className="docdash-action-title">Referral</h5><p className="docdash-action-desc">Specialist referrals</p></div></div>
                </div>
              </div>
            )}
            {selectedMember && actionView === 'checkup' && (
              <CKProfile member={selectedMember} onBack={() => setActionView(null)} />
            )}
            {selectedMember && actionView === 'treatment' && (
              <TreatmentRecord member={selectedMember} onBack={() => setActionView(null)} canEdit={userRole === 'doctor'} />
            )}
            {selectedMember && actionView === 'admitting' && (
              <AdmittingData member={selectedMember} onBack={() => setActionView(null)} canEdit={userRole === 'doctor'} />
            )}
            {selectedMember && actionView === 'immunization' && (
              <ImmunisationH member={selectedMember} onBack={() => setActionView(null)} canEdit={userRole === 'doctor'} />
            )}
            {selectedMember && actionView === 'referral' && (
              <Referral member={selectedMember} onBack={() => setActionView(null)} />
            )}
          </div>
        </div>
      );
    }
    if (selectedView === 'manage') return <div style={{ color: '#f1f5f9' }}><Manage /></div>;
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
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <div style={{ width: collapsed ? 64 : 260, background: '#111827', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
        <div style={{ padding: 18, display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
          <img src={require('../images/maybunga.png')} alt="Maybunga Healthcare Center Logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
          {!collapsed && <span style={{ fontWeight: 600, marginLeft: 10 }}>Maybunga Healthcare Center</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>          <SidebarItem icon={<BarChart2 size={18} />} label="Dashboard" active={selectedView === 'dashboard'} collapsed={collapsed} onClick={() => setSelectedView('dashboard')} />
          <SidebarDropdown icon={<Calendar size={18} />} label="Check Up" collapsed={collapsed} isOpen={dropdowns.checkUp} onClick={() => toggleDropdown('checkUp')}>            <SidebarItem label="Check Up Today" active={selectedView === 'checkups'} collapsed={collapsed} indent onClick={() => setSelectedView('checkups')} />
            <SidebarItem label="Schedule a Session" active={selectedView === 'scheduledSessions'} collapsed={collapsed} indent onClick={() => setSelectedView('scheduledSessions')} />
            <SidebarItem label="Sessions List" active={selectedView === 'sessions'} collapsed={collapsed} indent onClick={() => setSelectedView('sessions')} />
          </SidebarDropdown>
          <SidebarDropdown icon={<User size={18} />} label="Patient Management" collapsed={collapsed} isOpen={dropdowns.patientManagement} onClick={() => toggleDropdown('patientManagement')}>
            <SidebarItem label="Unsorted Members" active={selectedView === 'unsorted'} collapsed={collapsed} indent onClick={() => setSelectedView('unsorted')} />
            <SidebarItem label="Patient Database" active={selectedView === 'patients'} collapsed={collapsed} indent onClick={() => setSelectedView('patients')} />
          </SidebarDropdown>          <SidebarDropdown icon={<BarChart2 size={18} />} label="Reports" collapsed={collapsed} isOpen={dropdowns.reports} onClick={() => toggleDropdown('reports')}>
            <SidebarItem label="Generate & Export" collapsed={collapsed} indent onClick={() => setSelectedView('reports')} />
          </SidebarDropdown>
        </div>
        <div style={{ padding: 18, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 8, color: '#fff', cursor: 'pointer' }}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 64, background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#64748b', marginRight: 8 }}>YOU ARE HERE &gt;</span>
            {selectedView === 'patients' && (() => {
              const familyObj = families.find(f => f.familyName === selectedFamily);
              const breadcrumbStyle = { color: '#38bdf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', marginRight: 4 };
              const sep = <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>;
              if (!selectedFamily) {
                return <span style={{ color: '#38bdf8', fontWeight: 600 }}>Patient Database</span>;
              }
              if (selectedFamily && !selectedMember) {
                return <>
                  <span style={breadcrumbStyle} onClick={() => setSelectedFamily(null)}>Patient Database</span>
                  {sep}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{familyObj?.familyName}</span>
                </>;
              }
              if (selectedMember && !actionView) {
                return <>
                  <span style={breadcrumbStyle} onClick={() => { setSelectedFamily(null); setSelectedMember(null); setActionView(null); }}>Patient Database</span>
                  {sep}
                  <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.familyName}</span>
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
                  <span style={breadcrumbStyle} onClick={() => { setSelectedMember(null); setActionView(null); }}>{familyObj?.familyName}</span>
                  {sep}
                  <span style={breadcrumbStyle} onClick={() => { setActionView(null); }}>{selectedMember.name}</span>
                  {sep}
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{actionLabel}</span>
                </>;
              }
              return <span style={{ color: '#38bdf8', fontWeight: 600 }}>Patient Database</span>;
            })()}
            {selectedView !== 'patients' && (
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                {selectedView === 'dashboard' ? 'Dashboard' : selectedView === 'unsorted' ? 'Unsorted Members' : selectedView === 'manage' ? 'Manage Patient Data' : selectedView === 'reports' ? 'Generate & Export' : selectedView === 'settings' ? 'Admin Settings' : 'Dashboard'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>            <button 
              style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}
            >
              <Bell size={18} />
            </button>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: settingsOpen ? '#38bdf8' : '#fff', cursor: 'pointer' }}
              >
                <Settings size={18} />
              </button>
              
              {settingsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                  width: '240px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155' }}>
                    <h6 style={{ margin: 0, color: '#f1f5f9', fontWeight: 600 }}>Management & Settings</h6>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={() => { setSelectedView('settings'); setSettingsOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#f1f5f9',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#334155'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Shield size={16} />
                      User Management
                    </button>
                    <button
                      onClick={() => { setSettingsOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#f1f5f9',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#334155'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <Settings size={16} />
                      System Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
              <span style={{ fontSize: 14 }}>Admin</span>
            </div>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 32, background: '#0f172a' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
