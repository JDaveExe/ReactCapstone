import React, { useState } from 'react';
import { Clock, Calendar, User, Check, XCircle } from 'lucide-react';

const SessionsList = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('unfinished');

  // Temporary mock data - this will be replaced with actual backend data later
  const mockSessions = {
    unfinished: [
      { id: 1, patientName: 'John Doe', date: '2024-01-20', time: '10:00', description: 'Initial consultation', status: 'pending' },
      { id: 2, patientName: 'Jane Smith', date: '2024-01-21', time: '14:30', description: 'Follow-up', status: 'pending' },
    ],
    finished: [
      { id: 3, patientName: 'Mike Johnson', date: '2024-01-18', time: '09:00', description: 'Final checkup', status: 'completed' },
      { id: 4, patientName: 'Sarah Williams', date: '2024-01-17', time: '16:00', description: 'Therapy session', status: 'completed' },
    ]
  };

  const handleCompleteSession = (sessionId) => {
    // This will be implemented with actual API calls later
    console.log(`Completing session ${sessionId}`);
  };

  const handleCancelSession = (sessionId) => {
    // This will be implemented with actual API calls later
    console.log(`Cancelling session ${sessionId}`);
  };

  const TabButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: '12px 24px',
        background: isActive ? '#38bdf8' : '#1e293b',
        color: '#f1f5f9',
        border: '1px solid #334155',
        borderRadius: 8,
        cursor: 'pointer',
        minWidth: 180,
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );

  const SessionCard = ({ session }) => (
    <div style={{
      background: '#1e293b',
      padding: 20,
      borderRadius: 12,
      marginBottom: 16,
      border: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        background: '#334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <User size={24} color="#38bdf8" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 18, fontWeight: 600 }}>{session.patientName}</h3>
          <div style={{ 
            padding: '4px 12px',
            borderRadius: 16,
            background: session.status === 'completed' ? '#064e3b' : '#0c4a6e',
            color: session.status === 'completed' ? '#34d399' : '#38bdf8',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            {session.status === 'completed' ? <Check size={14} /> : <Clock size={14} />}
            {session.status === 'completed' ? 'Completed' : 'Pending'}
          </div>
        </div>
        <p style={{ color: '#94a3b8', margin: '8px 0' }}>{session.description}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
            <Calendar size={16} />
            <span>{session.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
            <Clock size={16} />
            <span>{session.time}</span>
          </div>
        </div>
      </div>
      {session.status === 'pending' && userRole === 'doctor' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => handleCompleteSession(session.id)}
            style={{
              padding: '8px 16px',
              background: '#0d9488',
              color: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0f766e'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0d9488'}
          >
            <Check size={16} />
            Complete
          </button>
          <button 
            onClick={() => handleCancelSession(session.id)}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: '#f1f5f9',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
          >
            <XCircle size={16} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <TabButton 
          label="Unfinished Sessions" 
          isActive={activeTab === 'unfinished'} 
          onClick={() => setActiveTab('unfinished')} 
        />
        <TabButton 
          label="Finished Sessions" 
          isActive={activeTab === 'finished'} 
          onClick={() => setActiveTab('finished')} 
        />
      </div>
      <div>
        {mockSessions[activeTab].map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default SessionsList;
