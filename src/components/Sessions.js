import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import axios from 'axios';
import '../styles/Sessions.css';
import { Clock, Calendar, User, Check, Edit, ArrowRight, FileText, Loader } from 'lucide-react'; // Added Loader
import CheckUpContext from '../contexts/CheckUpContext'; // Import CheckUpContext

const Sessions = ({ userRole = 'doctor' }) => {
  const { 
    todaysCheckUps, 
    isLoading: contextIsLoading, 
    error: contextError, 
    updateCheckUpItem, 
    archiveSession // Destructure archiveSession from context
  } = useContext(CheckUpContext); // Consume context

  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber"); // Or a relevant field from context data
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [activeFilter, setActiveFilter] = useState("ongoing"); // Default to ongoing

  // Removed local sessions, loading, error states and fetchSessions function

  // Filter by patient name and status from context
  const filtered = todaysCheckUps.filter(session => {
    const nameMatch = session.name && session.name.toLowerCase().includes(search.toLowerCase()); // Use session.name
    
    if (!nameMatch) return false;

    if (activeFilter === "ongoing") {
      return session.status === 'Ongoing';
    } else if (activeFilter === "completed") {
      return session.status === 'Completed';
    } else if (activeFilter === "all") {
      // Show all relevant session statuses for this page (e.g., Ongoing, Completed)
      return session.status === 'Ongoing' || session.status === 'Completed';
    }
    return false;
  });

  // Sort by selected field
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'queueNumber') {
      return sortOrder === 'asc' ? (a.queueNumber || 0) - (b.queueNumber || 0) : (b.queueNumber || 0) - (a.queueNumber || 0);
    }
    // Assuming loggedInAt is the primary timestamp for sorting by date/time
    const timeA = new Date(a.loggedInAt).getTime();
    const timeB = new Date(b.loggedInAt).getTime();

    if (sortField === 'date' || sortField === 'time') { // Simplified sorting for time
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
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
      console.log(`[Sessions] Completing session for ${session.name}`);
      // Update status to 'Completed' in today's check-ups
      await updateCheckUpItem({ ...session, status: 'Completed' });
      
      // Archive the session to permanent history
      // Ensure all necessary session data is passed for archiving
      const sessionToArchive = {
        ...session, // Spread existing session data
        status: 'Completed', // Ensure status is set to Completed
        completedAt: new Date().toISOString(), // Add a completion timestamp
        // Add any other fields required by the session history schema
      };
      await archiveSession(sessionToArchive);

      alert(`Session for ${session.name} marked as Completed and archived.`);
      
      // Optionally, remove from todaysCheckUps if backend doesn't do it or for immediate UI update
      // This depends on whether the backend /api/checkups/today GET endpoint will still return completed sessions
      // or if they are filtered out after archiving.
      // If they are filtered out by the backend, the polling will update the UI.
      // If not, you might want to filter them out client-side:
      // setTodaysCheckUps(prev => prev.filter(s => s.id !== session.id));

    } catch (err) {
      console.error("[Sessions] Error completing session:", err);
      alert("Failed to complete session. Please try again.");
    }
  };

  const handleSaveNotes = async (sessionId) => {
    const sessionToUpdate = todaysCheckUps.find(s => s.id === sessionId);
    if (!sessionToUpdate) return;

    try {
      console.log(`[Sessions] Saving notes for session ${sessionId}`);
      await updateCheckUpItem({ ...sessionToUpdate, notes: noteText });
      setEditingNotes(null);
      alert('Notes saved.');
    } catch (err) {
      console.error("[Sessions] Error saving notes:", err);
      alert("Failed to save notes. Please try again.");
    }
  };

  const startEditNotes = (session) => {
    setEditingNotes(session.id);
    setNoteText(session.notes || '');
  };

  if (contextIsLoading) {
    return <div className="loading"><Loader size={48} /> Loading sessions...</div>;
  }

  if (contextError) {
    return <div className="error">{contextError}</div>;
  }  
  
  return (
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
      </div>
      <div className="search-bar-container" style={{ marginBottom: '20px', marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sessions-search-input"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="no-sessions-message">
          No sessions match the current filter.
        </div>
      ) : (
        <div className="sessions-grid">
          {sorted.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-card-header">
                <div className="session-header-left">
                  <span className="session-queue-number">#{session.queueNumber || session.id}</span>
                  <span className="session-patient-name">{session.name}</span>
                </div>
                <div className="session-header-right">
                  <span className={`session-status-badge status-${session.status ? session.status.toLowerCase().replace(' ', '-') : 'unknown'}`}>
                    {session.status}
                  </span>
                </div>
              </div>
              <div className="session-card-body">
                <div className="session-detail-item">
                  <Calendar size={16} /> {new Date(session.loggedInAt).toLocaleDateString()}
                </div>
                <div className="session-detail-item">
                  <Clock size={16} /> {new Date(session.loggedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                </div>
                <div className="session-detail-item purpose">
                  <strong>Purpose:</strong> {session.purpose || 'Not specified'}
                </div>
                
                {editingNotes === session.id ? (
                  <div className="notes-editor">
                    <textarea 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)} 
                      rows={3}
                      placeholder="Enter session notes..."
                    />
                    <div className="notes-actions">
                      <button onClick={() => handleSaveNotes(session.id)} className="save-notes-btn">Save Notes</button>
                      <button onClick={() => setEditingNotes(null)} className="cancel-notes-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="session-notes-view">
                    <div className="notes-header">
                      <strong><FileText size={16} />Session Notes:</strong>
                      <button onClick={() => startEditNotes(session)} className="edit-notes-btn"><Edit size={14} /></button>
                    </div>
                    <p>{session.notes || 'No notes yet.'}</p>
                  </div>
                )}
              </div>
              {session.status === 'Ongoing' && (
                <div className="session-card-footer">
                  <button 
                    className="complete-session-btn" 
                    onClick={() => handleCompleteSession(session)}
                  >
                    Complete Session <Check size={16} />
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