import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, Settings, Bell, LogOut, User, Menu, X, Calendar } from 'lucide-react';
import { useNavigate } from "react-router-dom";


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

export default function PatientDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [selectedView, setSelectedView] = useState('dashboard');
  const navigate = useNavigate();

  // Suggestions for future sidebar items:
  // - Appointments
  // - Medical Records
  // - Prescriptions
  // - Billing/Payments
  // - Profile Settings

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: '#fff' }}>
      <div style={{ width: collapsed ? 64 : 260, background: '#111827', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
        <div style={{ padding: 18, display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
          <img src={require('../images/maybunga.png')} alt="Maybunga Healthcare Center Logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
          {!collapsed && <span style={{ fontWeight: 600, marginLeft: 10 }}>Maybunga Healthcare Center</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarItem icon={<User size={18} />} label="Dashboard" active={selectedView === 'dashboard'} collapsed={collapsed} onClick={() => setSelectedView('dashboard')} />
          {/* Future sidebar items can be added here */}
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
              {selectedView === 'dashboard' ? 'Dashboard' : 'Dashboard'}
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
              <span style={{ fontSize: 14 }}>Patient</span>
            </div>
            <button style={{ background: 'none', border: 'none', borderRadius: '50%', padding: 7, color: '#fff', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/home'); }}><LogOut size={18} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 32, background: '#0f172a' }}>
          {/* Main content area is empty for now. Suggestions: Appointments, Medical Records, Prescriptions, Billing, Profile, etc. */}
          <div style={{ color: '#64748b', textAlign: 'center', marginTop: 80, fontSize: 20 }}>
            Welcome to your dashboard!<br />
            <span style={{ fontSize: 15, color: '#94a3b8' }}>
              (Suggestions: Appointments, Medical Records, Prescriptions, Billing, Profile, etc.)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}