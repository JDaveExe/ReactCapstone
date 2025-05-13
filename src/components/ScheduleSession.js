import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, FileText, CheckCircle } from 'lucide-react';
import '../styles/ScheduleSession.css';

export default function ScheduleSession() {
  // Mock data for sessions - will be replaced with backend data later
  const mockSessions = [
    {
      id: 1,
      patientName: "John Doe",
      date: "2025-05-15",
      time: "10:00",
      status: "upcoming"
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2025-05-16",
      time: "14:30",
      status: "upcoming"
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      date: "2025-05-14",
      time: "09:00",
      status: "completed"
    }
  ];

  return (
    <div className="schedule-session-container">
      <div className="session-header">
        <h2 className="schedule-session-title">Schedule New Session</h2>
        <button className="new-session-button">
          <Plus size={20} />
          New Session
        </button>
      </div>

      <div className="sessions-list">
        {mockSessions.map(session => (
          <div key={session.id} className={`session-card ${session.status}`}>
            <div className="session-info">
              <div className="session-patient">
                <Users size={20} className="icon" />
                <h3>{session.patientName}</h3>
              </div>
              
              <div className="session-details">
                <div className="detail">
                  <Calendar size={16} className="icon" />
                  <span>{new Date(session.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="detail">
                  <Clock size={16} className="icon" />
                  <span>{session.time}</span>
                </div>
              </div>
            </div>
            
            <div className="session-status">
              <span className={`status-badge ${session.status}`}>
                {session.status === 'completed' ? <CheckCircle size={16} /> : null}
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
