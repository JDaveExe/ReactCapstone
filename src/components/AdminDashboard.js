import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Settings, Bell, LogOut, User, Menu, X, Maximize, BarChart2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardAdm.css';
import '../styles/SidebarAdmin.css';
import Manage from './Manage';
import Reports from './Reports';
import Asettings from './Asettings';

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

function DashboardCard({ title, children }) {
  return (
    <div className="dashboard-card" style={{ background: '#1e293b', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.2 }}>{title}</h2>
        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
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
    management: false
  });
  const [selectedView, setSelectedView] = useState('dashboard');
  const navigate = useNavigate();

  const toggleDropdown = (key) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  function renderContent() {
    if (selectedView === 'manage') return <div style={{ color: '#f1f5f9' }}><Manage /></div>;
    if (selectedView === 'reports') return <div style={{ color: '#f1f5f9' }}><Reports /></div>;
    if (selectedView === 'settings') return <div style={{ color: '#f1f5f9' }}><Asettings /></div>;
    return (
      <>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, color: '#f1f5f9', letterSpacing: 0.2 }}>Analytics</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          <DashboardCard title="Consultations (MTD)">
            <div style={{ marginTop: 16 }}>
              <div style={{ background: '#3b82f6', height: 120, width: '100%', borderRadius: 8 }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
                <span>0</span>
                <span>75</span>
              </div>
            </div>
          </DashboardCard>
          <DashboardCard title="10 Diagnostic Test (Month to Date)">
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
          </DashboardCard>
          <DashboardCard title="10 Diagnostic Test (Month to Date)">
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
          </DashboardCard>
          <DashboardCard title="10 Diagnostic Test (Month to Date)">
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
          </DashboardCard>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#f1f5f9', letterSpacing: 0.2 }}>Daily Trend Analysis</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'none', border: 'none', borderRadius: 6, padding: 6, color: '#fff', cursor: 'pointer' }}><Maximize size={16} /></button>
              <button style={{ background: 'none', border: 'none', borderRadius: 6, padding: 6, color: '#fff', cursor: 'pointer' }}><X size={16} /></button>
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
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItem icon={<BarChart2 size={18} />} label="Dashboard" active={selectedView === 'dashboard'} collapsed={collapsed} onClick={() => setSelectedView('dashboard')} />
          <SidebarDropdown icon={<User size={18} />} label="Patient Management" collapsed={collapsed} isOpen={dropdowns.patientManagement} onClick={() => toggleDropdown('patientManagement')}>
            <SidebarItem label="Manage Patient Data" collapsed={collapsed} indent onClick={() => setSelectedView('manage')} />
          </SidebarDropdown>
          <SidebarDropdown icon={<BarChart2 size={18} />} label="Reports" collapsed={collapsed} isOpen={dropdowns.reports} onClick={() => toggleDropdown('reports')}>
            <SidebarItem label="Generate & Export" collapsed={collapsed} indent onClick={() => setSelectedView('reports')} />
          </SidebarDropdown>
          <SidebarDropdown icon={<Settings size={18} />} label="Management & Settings" collapsed={collapsed} isOpen={dropdowns.management} onClick={() => toggleDropdown('management')}>
            <SidebarItem label="Admin Settings" collapsed={collapsed} indent onClick={() => setSelectedView('settings')} />
            <SidebarItem label="Appearance" collapsed={collapsed} indent />
          </SidebarDropdown>
        </div>
        <div style={{ padding: 18, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 8, color: '#fff', cursor: 'pointer' }}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 64, background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#64748b', marginRight: 8 }}>YOU ARE HERE &gt;</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
              {selectedView === 'dashboard' ? 'Dashboard' : selectedView === 'manage' ? 'Manage Patient Data' : selectedView === 'reports' ? 'Generate & Export' : selectedView === 'settings' ? 'Admin Settings' : 'Dashboard'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search" style={{ padding: '7px 14px 7px 32px', borderRadius: 6, background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: 14 }} />
              <Search size={16} style={{ position: 'absolute', left: 8, top: 8, color: '#64748b' }} />
            </div>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Bell size={18} /></button>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
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
