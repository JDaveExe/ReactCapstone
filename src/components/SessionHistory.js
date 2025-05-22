import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SessionHistory.css'; 
import { Search, Filter, Calendar, Clock, User, FileText, Loader, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // Default filter to "all"
  const [refreshKey, setRefreshKey] = useState(0); // Added to force refresh
  const [expandedItem, setExpandedItem] = useState(null); // Track only ONE expanded item

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
        
        setSessionHistory(sortedHistory);
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
  const filteredHistory = sessionHistory.filter(session => {
    // Handle different field names for patient name
    const patientName = session.patientName || session.name || '';
    const nameMatch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let dateMatch = true;
    const sessionDate = new Date(session.completedAt || session.archivedAt);
    if (isNaN(sessionDate.getTime())) return false; // Invalid date for session

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Apply date filters
    if (filterOption === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); 
      dateMatch = sessionDate >= today && sessionDate < tomorrow;
    } else if (filterOption === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      dateMatch = sessionDate >= yesterday && sessionDate < today;
    } else if (filterOption === 'thisWeek') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      dateMatch = sessionDate >= startOfWeek && sessionDate < endOfWeek;
    } else if (filterOption === 'thisMonth') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      dateMatch = sessionDate >= startOfMonth && sessionDate <= endOfMonth;
    } else if (filterOption === 'thisYear') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      dateMatch = sessionDate >= startOfYear && sessionDate <= endOfYear;
    }
    // 'all' option implies dateMatch remains true

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
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="no-sessions-message">
          <FileText size={48} />
          <p>No session history found that matches your criteria.</p>
        </div>
      ) : (
        <div className="session-history-list">
          {filteredHistory.map(session => {
            // Check if this item is the expanded one
            const isExpanded = expandedItem === session.historyId;
            const sessionDateValue = session.completedAt || session.archivedAt;

            return (
              <div 
                key={session.historyId} 
                className={`session-history-card ${isExpanded ? 'expanded' : ''}`}
              >
                <div 
                  className="session-history-card-header" 
                  onClick={() => toggleExpand(session.historyId)}
                >
                  <div className="header-main-info">
                    {isExpanded ? 
                      <ChevronDown size={24} className="expand-icon" /> : 
                      <ChevronRight size={24} className="expand-icon" />
                    }
                    <User size={20} className="patient-icon" />
                    <span className="patient-name">{session.patientName || 'Unknown Patient'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="session-history-card-body">
                    <div className="session-detail-item">
                      <Calendar size={18} className="detail-icon" />
                      <strong>Date:</strong>
                      <span>{getFormattedDate(sessionDateValue)}</span>
                    </div>
                    <div className="session-detail-item">
                      <Clock size={18} className="detail-icon" />
                      <strong>Time:</strong>
                      <span>{getFormattedTime(sessionDateValue)}</span>
                    </div>
                    <div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Purpose:</strong>
                      <span>{getDisplayValue(session.purpose)}</span>
                    </div>
                    <div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Notes:</strong>
                      <span>{getDisplayValue(session.notes)}</span>
                    </div>
                    <div className="session-detail-item">
                      <FileText size={18} className="detail-icon" />
                      <strong>Prescription:</strong>
                      <span>{getDisplayValue(session.prescription)}</span>
                    </div>
                    {session.familyMembers && session.familyMembers.length > 0 && (
                      <div className="session-detail-item">
                        <strong>Family Members:</strong> 
                        <span>{session.familyMembers.map(fm => fm.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;