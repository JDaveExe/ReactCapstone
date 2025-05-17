import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/SessionHistory.css'; // We will create this file next
import { Search, Filter, Calendar, Clock, User, FileText, Loader } from 'lucide-react';
import CheckUpContext from '../contexts/CheckUpContext'; // To potentially access API_URL or other shared logic if needed

const API_URL = 'http://localhost:5000/api'; // Assuming this is your backend API

const SessionHistory = () => {
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // Default filter to "all"

  useEffect(() => {
    const fetchSessionHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('[SessionHistory] Fetching session history...');
        const response = await axios.get(`${API_URL}/sessionhistory`);
        console.log('[SessionHistory] API response for session history:', response.data);
        // Sort by archivedAt or completedAt in descending order (newest first)
        const sortedHistory = response.data.sort((a, b) => {
          const dateA = new Date(a.archivedAt || a.completedAt || 0);
          const dateB = new Date(b.archivedAt || b.completedAt || 0);
          return dateB - dateA;
        });
        setSessionHistory(sortedHistory);
      } catch (err) {
        console.error('[SessionHistory] Error fetching session history:', err);
        setError('Failed to fetch session history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionHistory();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const getFormattedTime = (dateString, includeSeconds = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    if (includeSeconds) {
      options.second = '2-digit';
    }
    return date.toLocaleTimeString('en-US', options);
  };

  const filteredHistory = sessionHistory.filter(session => {
    const nameMatch = session.name && session.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let dateMatch = true;
    if (filterOption === 'today') {
      const todayStr = getFormattedDate(new Date().toISOString());
      const sessionDateStr = getFormattedDate(session.completedAt || session.archivedAt);
      dateMatch = sessionDateStr === todayStr;
    }
    // Add more filter options here (e.g., last7days, specificMonth)

    return nameMatch && dateMatch;
  });

  if (isLoading) {
    return <div className="loading-container history-loading"><Loader size={48} /> Loading session history...</div>;
  }

  if (error) {
    return <div className="error-container history-error">{error}</div>;
  }

  return (
    <div className="session-history-container">
      <div className="session-history-header">
        <h1>Session History</h1>
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
              {/* Add more options like "Last 7 Days", "This Month" etc. */}
            </select>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-history-message">
          No session history records found matching your criteria.
        </div>
      ) : (
        <div className="session-history-grid">
          {filteredHistory.map((session) => (
            <div key={session.historyId || session.id} className="history-card">
              <div className="history-card-header">
                <div className="patient-info">
                  <User size={20} /> 
                  <span>{session.name || 'N/A'}</span>
                </div>
                <div className="session-datetime">
                  <div className="session-date">
                    <Calendar size={16} /> {getFormattedDate(session.loggedInAt || session.completedAt)}
                  </div>
                  <div className="session-time">
                    <Clock size={16} /> {getFormattedTime(session.loggedInAt || session.completedAt)}
                  </div>
                </div>
              </div>
              <div className="history-card-body">
                <div className="session-purpose">
                  <strong>Purpose:</strong> {session.purpose || 'Not specified'}
                </div>
                <div className="session-notes-history">
                  <div className="notes-history-header">
                    <FileText size={16} />
                    <strong>Notes</strong>
                  </div>
                  <p>{session.notes || 'No notes recorded.'}</p>
                </div>
              </div>
              <div className="history-card-footer">
                {/* Use archivedAt for the footer timestamp as it's more specific to history entry */}
                <span>Completed at: {getFormattedTime(session.completedAt || session.archivedAt, true)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;