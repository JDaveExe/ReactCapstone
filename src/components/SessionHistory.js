import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/SessionHistory.css'; 
import { Search, Filter, Calendar, Clock, User, FileText, Loader, ChevronDown, ChevronRight, Stethoscope, Trash2, AlertCircle } from 'lucide-react';
import DateTimeContext from '../contexts/DateTimeContext';

const API_URL = 'http://localhost:5000/api';

// Helper function to safely display values
const getDisplayValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    // Handle address object specifically
    if (value.houseNo !== undefined || value.street !== undefined || value.barangay !== undefined) {
      const parts = [];
      if (value.houseNo) parts.push(value.houseNo);
      if (value.street) parts.push(value.street);
      if (value.barangay) parts.push(value.barangay);
      if (value.city) parts.push(value.city);
      if (value.region) parts.push(value.region);
      return parts.join(', ');
    }
    
    // Convert other objects to a string representation
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.error('Failed to stringify object:', e);
      return '[Object]';
    }
  }
  return value;
};

const SessionHistory = () => {  
  const { isCurrentTimeSimulated } = useContext(DateTimeContext);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // Default filter to "all"
  const [refreshKey, setRefreshKey] = useState(0); // Added to force refresh
  const [expandedItem, setExpandedItem] = useState(null); // Track only ONE expanded item
  const [deleteMessage, setDeleteMessage] = useState(''); // For deletion feedback

  // Toggle expansion - if same item, collapse; if different item, expand new one
  const toggleExpand = (historyId) => {
    setExpandedItem(current => current === historyId ? null : historyId);
  };
  useEffect(() => {
    const fetchSessionHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('[SessionHistory] Fetching session history...');
        const response = await axios.get(`${API_URL}/sessionhistory`);
        
        if (!Array.isArray(response.data)) {
          console.error('[SessionHistory] Expected array but got:', typeof response.data);
          setError('Invalid data format received from server');
          setSessionHistory([]);
          return;
        }
        
        // Sort by archivedAt or completedAt in descending order (newest first)
        const sortedHistory = response.data.sort((a, b) => {
          const dateA = new Date(a.archivedAt || a.completedAt || 0);
          const dateB = new Date(b.archivedAt || b.completedAt || 0);
          return dateB - dateA;
        });
        
        // Group sessions by patient name
        const groupedByPatient = {};
        
        sortedHistory.forEach(session => {
          const patientName = session.patientName || 'Unknown Patient';
          
          if (!groupedByPatient[patientName]) {
            groupedByPatient[patientName] = {
              patientName: patientName,
              latestSession: session,
              sessions: [session]
            };
          } else {
            groupedByPatient[patientName].sessions.push(session);
          }
        });
        
        // Convert the grouped object back to an array
        const groupedHistory = Object.values(groupedByPatient);
        
        setSessionHistory(groupedHistory);
      } catch (err) {
        console.error('[SessionHistory] Error fetching session history:', err);
        setError('Failed to fetch session history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionHistory();
    
    // Set up polling to refresh session history periodically
    const pollInterval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000); // Poll every 30 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [refreshKey]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  // Format date as YYYY-MM-DD
  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-CA');
  };

  // Format time as HH:MM AM/PM
  const getFormattedTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  // Filter the history list based on search and filters
  const filteredHistory = sessionHistory.filter(patientGroup => {
    // Check if any of the patient's sessions match the criteria
    const nameMatch = patientGroup.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If filter is 'all' and name matches, include the whole group
    if (filterOption === 'all' && nameMatch) {
      return true;
    }
    
    // For date filters, check if any session in the group matches
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Check if any session in the group matches the date filter
    const hasMatchingSession = patientGroup.sessions.some(session => {
      const sessionDate = new Date(session.completedAt || session.archivedAt);
      if (isNaN(sessionDate.getTime())) return false; // Invalid date for session
      
      // Apply date filters
      if (filterOption === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return sessionDate >= today && sessionDate < tomorrow;
      } else if (filterOption === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return sessionDate >= yesterday && sessionDate < today;
      } else if (filterOption === 'thisWeek') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return sessionDate >= startOfWeek && sessionDate < endOfWeek;
      } else if (filterOption === 'thisMonth') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
      } else if (filterOption === 'thisYear') {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        endOfYear.setHours(23, 59, 59, 999);
        return sessionDate >= startOfYear && sessionDate <= endOfYear;
      }
      
      return true; // Default case
    });
    
    return nameMatch && hasMatchingSession;
  });

  // Function to delete a session
  const deleteSession = async (historyId, isSimulated) => {
    // Only allow deletion of simulated sessions
    if (!isSimulated) {
      setDeleteMessage('Only simulated sessions can be deleted');
      setTimeout(() => setDeleteMessage(''), 3000);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.delete(`${API_URL}/sessionhistory/${historyId}`);
      
      if (response.status === 200) {
        // Force refresh of session data
        setRefreshKey(old => old + 1);
        setDeleteMessage('Session deleted successfully');
        setTimeout(() => setDeleteMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setDeleteMessage('Failed to delete session');
      setTimeout(() => setDeleteMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container history-loading"><Loader size={48} /> Loading session history...</div>;
  }

  if (error) {
    return <div className="error-container history-error">{error}</div>;
  }

  return (
    <div className="session-history-container">      <div className="session-history-header">
        <h1>Session History</h1>
        {deleteMessage && (
          <div className={`delete-message ${deleteMessage.includes('Failed') || deleteMessage.includes('Only') ? 'error' : ''}`}>
            {deleteMessage}
          </div>
        )}
        <div className="session-history-controls">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-dropdown">
            <Filter size={18} />
            <select value={filterOption} onChange={handleFilterChange}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>      {filteredHistory.length === 0 ? (
        <div className="no-sessions-message">
          <FileText size={48} />
          <p>No session history found that matches your criteria.</p>
        </div>
      ) : (
        <div className="session-history-list">
          {filteredHistory.map(patientGroup => {
            // Use the patient name as the key for expansion
            const isExpanded = expandedItem === patientGroup.patientName;
            // Use the latest session for the card header
            const latestSession = patientGroup.sessions[0]; // The sessions are already sorted newest first
            const sessionDateValue = latestSession.completedAt || latestSession.archivedAt;

            return (
              <div 
                key={patientGroup.patientName} 
                className={`session-history-card ${isExpanded ? 'expanded' : ''}`}
              >
                <div 
                  className="session-history-card-header" 
                  onClick={() => toggleExpand(patientGroup.patientName)}
                >
                  <div className="header-main-info">
                    {isExpanded ? 
                      <ChevronDown size={24} className="expand-icon" /> : 
                      <ChevronRight size={24} className="expand-icon" />
                    }
                    <User size={20} className="patient-icon" />
                    <span className="patient-name">{patientGroup.patientName}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="session-history-card-body">
                    {/* Latest session summary */}
                    <h4 className="session-date-header">Latest Visit: {getFormattedDate(sessionDateValue)}</h4>                    <div className="session-detail-item">
                      <Calendar size={18} className="detail-icon" />
                      <strong>Date:</strong>
                      <span>{getFormattedDate(sessionDateValue)}</span>
                      {latestSession.isSimulated && (
                        <span className="simulated-tag">
                          <AlertCircle size={14} />
                          Simulated
                        </span>
                      )}
                    </div>
                    <div className="session-detail-item">
                      <Clock size={18} className="detail-icon" />
                      <strong>Time:</strong>
                      <span>{getFormattedTime(sessionDateValue)}</span>
                    </div><div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Purpose:</strong>
                      <span>{getDisplayValue(latestSession.purpose)}</span>
                    </div>
                    {latestSession.doctorName && (
                      <div className="session-detail-item">
                        <Stethoscope size={18} className="detail-icon" />
                        <strong>Doctor:</strong>
                        <span>{getDisplayValue(latestSession.doctorName)}</span>
                      </div>
                    )}
                    <div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Notes:</strong>
                      <span>{getDisplayValue(latestSession.notes)}</span>
                    </div>
                    <div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Prescription:</strong>
                      <span>{getDisplayValue(latestSession.prescription)}</span>
                    </div>
                    
                    {/* Show previous sessions if there are more than one */}
                    {patientGroup.sessions.length > 1 && (
                      <div className="previous-sessions-container">
                        <h4 className="previous-sessions-header">Previous Visits</h4>
                        {patientGroup.sessions.slice(1).map((prevSession, index) => {
                          const prevSessionDate = prevSession.completedAt || prevSession.archivedAt;
                          return (
                            <div key={index} className="previous-session-item">
                              <div className="previous-session-header">
                                <Calendar size={16} className="detail-icon" />                                <span className="previous-session-date">
                                  {getFormattedDate(prevSessionDate)} at {getFormattedTime(prevSessionDate)}
                                  {prevSession.isSimulated && (
                                    <span className="simulated-tag small">
                                      <AlertCircle size={12} />
                                      Simulated
                                    </span>
                                  )}
                                </span>
                                {prevSession.isSimulated && (
                                  <button 
                                    className="delete-session-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSession(prevSession.historyId, prevSession.isSimulated);
                                    }}
                                    title="Delete simulated session"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>                              <div className="previous-session-details">
                                <div className="session-detail-item">
                                  <strong>Purpose:</strong> {getDisplayValue(prevSession.purpose)}
                                </div>
                                {prevSession.doctorName && (
                                  <div className="session-detail-item">
                                    <strong>Doctor:</strong> {getDisplayValue(prevSession.doctorName)}
                                  </div>
                                )}
                                {prevSession.notes && (
                                  <div className="session-detail-item">
                                    <strong>Notes:</strong> {getDisplayValue(prevSession.notes)}
                                  </div>
                                )}
                                {prevSession.prescription && (
                                  <div className="session-detail-item">
                                    <strong>Prescription:</strong> {getDisplayValue(prevSession.prescription)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="session-delete-container">
                      <button 
                        className="delete-session-button" 
                        onClick={() => deleteSession(latestSession.historyId, latestSession.isSimulated)}
                      >
                        <Trash2 size={18} />
                        Delete Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {deleteMessage && (
        <div className="delete-message-container">
          <p className="delete-message">{deleteMessage}</p>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;