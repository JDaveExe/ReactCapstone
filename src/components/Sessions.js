import React, { useState } from 'react';

const Sessions = () => {
  const [activeTab, setActiveTab] = useState('unfinished');

  // Temporary mock data
  const mockSessions = {
    unfinished: [
      { id: 1, patientName: 'John Doe', date: '2024-01-20', time: '10:00', description: 'Initial consultation' },
      { id: 2, patientName: 'Jane Smith', date: '2024-01-21', time: '14:30', description: 'Follow-up' },
    ],
    finished: [
      { id: 3, patientName: 'Mike Johnson', date: '2024-01-18', time: '09:00', description: 'Final checkup' },
      { id: 4, patientName: 'Sarah Williams', date: '2024-01-17', time: '16:00', description: 'Therapy session' },
    ]
  };

  const SessionCard = ({ session }) => (
    <div style={{
      background: '#1e293b',
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      border: '1px solid #475569'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ color: '#38bdf8', margin: 0 }}>{session.patientName}</h3>
        <span style={{ color: '#94a3b8' }}>{session.time}</span>
      </div>
      <div style={{ color: '#94a3b8', marginBottom: 8 }}>{session.date}</div>
      <p style={{ color: '#cbd5e1', margin: '8px 0 0 0' }}>{session.description}</p>
    </div>
  );

  return (
    <div style={{ color: '#f1f5f9' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('unfinished')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'unfinished' ? '#3b82f6' : '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: 6,
            cursor: 'pointer',
            flex: 1
          }}
        >
          Unfinished Sessions
        </button>
        <button
          onClick={() => setActiveTab('finished')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'finished' ? '#3b82f6' : '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: 6,
            cursor: 'pointer',
            flex: 1
          }}
        >
          Finished Sessions
        </button>
      </div>

      <div>
        {mockSessions[activeTab].map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default Sessions;
