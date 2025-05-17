import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Sessions.css';
import { Clock, Calendar, User, Check, Edit, ArrowRight, FileText } from 'lucide-react';

const Sessions = ({ userRole = 'doctor' }) => {
  // State for sessions and user interactions
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "ongoing", or "completed"

  // Fetch session data on component mount
  useEffect(() => {
    fetchSessions();
  }, [userRole]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch data from your backend API
      // const response = await axios.get('http://localhost:5000/api/active-sessions', {
      //   params: { userRole, userId: localStorage.getItem('userId') }
      // });
      // setSessions(response.data);
      
      // For now using mock data for active sessions
      const mockData = [
        { 
          id: 1, 
          queueNumber: 1, 
          patientName: 'John Doe', 
          time: '09:00 AM', 
          purpose: 'General Consultation', 
          date: todayDate, 
          status: 'In Progress',
          notes: 'Patient complaining of headaches for the past week. Initial assessment shows signs of tension headache.'
        },
        { 
          id: 2, 
          queueNumber: 2, 
          patientName: 'Maria Garcia', 
          time: '10:30 AM', 
          purpose: 'Follow-up Check', 
          date: todayDate, 
          status: 'Completed',
          notes: 'Follow-up for previous treatment. Recovery proceeding well, no complications observed.'
        },
        { 
          id: 3, 
          queueNumber: 3, 
          patientName: 'Carlos Reyes', 
          time: '01:00 PM', 
          purpose: 'Eye Exam', 
          date: todayDate, 
          status: 'In Progress',
          notes: 'Patient due for annual eye examination. No prior issues reported.'
        },
        { 
          id: 4, 
          queueNumber: 4, 
          patientName: 'Sarah Johnson', 
          time: '02:30 PM', 
          purpose: 'Vaccination', 
          date: todayDate, 
          status: 'Waiting',
          notes: 'Scheduled for routine vaccination. Previous record shows no adverse reactions.'
        },
      ];
      setSessions(mockData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load active sessions. Please try again later.");
      setLoading(false);
    }
  };
  // Filter by patient name and status
  const filtered = sessions.filter(session => {
    const nameMatch = session.patientName.toLowerCase().includes(search.toLowerCase());
    
    // Apply status filter if not "all"
    if (activeFilter === "all") {
      return nameMatch;
    } else if (activeFilter === "ongoing") {
      return nameMatch && session.status !== 'Completed';
    } else {
      return nameMatch && session.status === 'Completed';
    }
  });

  // Sort by selected field
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'queueNumber') {
      return sortOrder === 'asc' ? a.queueNumber - b.queueNumber : b.queueNumber - a.queueNumber;
    } else if (sortField === 'date') {
      // Parse date and time for both a and b
      const dA = new Date(a.date + ' ' + a.time);
      const dB = new Date(b.date + ' ' + b.time);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    } else if (sortField === 'time') {
      // If dates are the same, sort by time; otherwise, keep date order
      const dA = new Date(a.date + ' ' + a.time);
      const dB = new Date(b.date + ' ' + b.time);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCompleteSession = async (session) => {
    try {
      // In production, this would update the backend
      // await axios.patch(`http://localhost:5000/api/sessions/${session.id}/complete`, { 
      //   status: 'Completed',
      //   notes: session.notes,
      //   completedAt: new Date().toISOString()
      // });
      
      console.log(`Session completed for ${session.patientName}`);
      
      // Update the session status in our local state
      setSessions(sessions.map(s => 
        s.id === session.id ? { ...s, status: 'Completed' } : s
      ));
    } catch (err) {
      console.error("Error completing session:", err);
      alert("Failed to complete session. Please try again.");
    }
  };

  const handleSaveNotes = async (sessionId) => {
    try {
      // In production, this would update the backend
      // await axios.patch(`http://localhost:5000/api/sessions/${sessionId}/notes`, { 
      //   notes: noteText
      // });
      
      console.log(`Notes saved for session ${sessionId}`);
      
      // Update the session notes in our local state
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, notes: noteText } : s
      ));
      
      // Exit edit mode
      setEditingNotes(null);
    } catch (err) {
      console.error("Error saving notes:", err);
      alert("Failed to save notes. Please try again.");
    }
  };

  const startEditNotes = (session) => {
    setEditingNotes(session.id);
    setNoteText(session.notes || '');
  };

  if (loading) {
    return <div className="loading">Loading active sessions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h1>Sessions</h1>
        <div className="filter-toggle">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ongoing')}
          >
            Ongoing
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      
      {sorted.length === 0 ? (
        <div className="no-sessions">
          <p>No active sessions found.</p>
        </div>
      ) : (
        <div className="session-cards">
          {sorted.map((session) => (
            <div className={`session-card ${session.status.toLowerCase().replace(' ', '-')}`} key={session.id}>
              <div className="card-header">
                <div className="queue-number">#{session.queueNumber}</div>
                <div className="patient-name">{session.patientName}</div>
                <div className={`status-badge ${session.status.toLowerCase().replace(' ', '-')}`}>
                  <span>{session.status}</span>
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{session.date}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{session.time}</span>
                </div>
                <div className="detail-item purpose">
                  <span>Purpose:</span>
                  <strong>{session.purpose}</strong>
                </div>
                
                <div className="notes-section">
                  <div className="notes-header">
                    <div className="notes-title">
                      <FileText size={16} />
                      <span>Session Notes</span>
                    </div>
                    {session.status !== 'Completed' && (
                      <button 
                        className="edit-notes-btn"
                        onClick={() => startEditNotes(session)}
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                  
                  {editingNotes === session.id ? (
                    <div className="notes-edit">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={4}
                        placeholder="Enter session notes..."
                      />
                      <div className="notes-actions">
                        <button 
                          className="cancel-btn"
                          onClick={() => setEditingNotes(null)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="save-btn"
                          onClick={() => handleSaveNotes(session.id)}
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="notes-content">
                      {session.notes || 'No notes recorded yet.'}
                    </div>
                  )}
                </div>
              </div>
              
              {session.status !== 'Completed' && (
                <div className="card-actions">
                  <button 
                    className="complete-session-btn"
                    onClick={() => handleCompleteSession(session)}
                    disabled={session.status === 'Waiting'}
                  >
                    <span>
                      {session.status === 'Waiting' 
                        ? 'Waiting for Patient' 
                        : session.status === 'In Progress' 
                        ? 'Complete Session' 
                        : 'Session Completed'}
                    </span>
                    {session.status === 'In Progress' && <Check size={16} />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;