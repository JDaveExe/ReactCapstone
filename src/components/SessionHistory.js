import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Search, Filter, ChevronDown, User, FileText } from 'lucide-react';
import '../styles/SessionHistory.css';

const SessionHistory = ({ userRole = 'doctor' }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });

  // Fetch sessions on component mount and when date filter changes
  useEffect(() => {
    fetchSessions();
  }, [dateFilter, customDateRange]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // In a real application, this would be an API call
      // const params = getDateFilterParams();
      // const response = await axios.get('/api/sessions/history', { params });
      // setSessions(response.data);
      
      // Temporary mock data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };
      
      const mockData = [
        { 
          id: 1, 
          patientName: 'John Doe', 
          date: formatDate(today), 
          time: '10:00', 
          purpose: 'General Consultation',
          notes: 'Patient reported headaches. Prescribed painkillers and recommended rest.',
          completedAt: new Date(today.setHours(10, 45)).toISOString()
        },
        { 
          id: 2, 
          patientName: 'Jane Smith', 
          date: formatDate(today), 
          time: '14:30', 
          purpose: 'Follow-up',
          notes: 'Recovery is good. No further medication needed.',
          completedAt: new Date(today.setHours(15, 15)).toISOString()
        },
        { 
          id: 3, 
          patientName: 'Mike Johnson', 
          date: formatDate(yesterday), 
          time: '09:00', 
          purpose: 'Vaccination',
          notes: 'Administered flu vaccine. No adverse reactions observed.',
          completedAt: new Date(yesterday.setHours(9, 30)).toISOString()
        },
        { 
          id: 4, 
          patientName: 'Sarah Williams', 
          date: formatDate(yesterday), 
          time: '16:00', 
          purpose: 'Dental Check-Up',
          notes: 'Two cavities found. Scheduled followup for fillings next week.',
          completedAt: new Date(yesterday.setHours(16, 45)).toISOString()
        },
        { 
          id: 5, 
          patientName: 'Robert Brown', 
          date: formatDate(lastWeek), 
          time: '11:30', 
          purpose: 'Eye Exam',
          notes: 'Slight deterioration in right eye. New prescription provided.',
          completedAt: new Date(lastWeek.setHours(12, 15)).toISOString()
        },
        { 
          id: 6, 
          patientName: 'Emily Davis', 
          date: formatDate(lastMonth), 
          time: '13:00', 
          purpose: 'Prenatal Check-Up',
          notes: 'All measurements normal. Baby developing well.',
          completedAt: new Date(lastMonth.setHours(13, 45)).toISOString()
        }
      ];
      
      // Filter based on date range
      let filteredData = [];
      
      const isInDateRange = (sessionDate) => {
        const date = new Date(sessionDate);
        const today = new Date();
        
        switch(dateFilter) {
          case 'today':
            return formatDate(date) === formatDate(today);
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return formatDate(date) === formatDate(yesterday);
          case 'week':
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            return date >= lastWeek;
          case 'month':
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return date >= lastMonth;
          case 'year':
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);
            return date >= lastYear;
          case 'custom':
            if (customDateRange.start && customDateRange.end) {
              const start = new Date(customDateRange.start);
              const end = new Date(customDateRange.end);
              end.setHours(23, 59, 59); // Include the entire end day
              return date >= start && date <= end;
            }
            return true;
          default:
            return true;
        }
      };
      
      filteredData = mockData.filter(session => isInDateRange(session.date));
      setSessions(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching session history:", error);
      setError("Failed to load sessions. Please try again later.");
      setLoading(false);
    }
  };

  const getDateFilterLabel = () => {
    switch(dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'All Time';
    }
  };

  // Filter sessions by search term
  const filteredSessions = sessions.filter(session => 
    session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="history-loading">Loading session history...</div>;
  }

  if (error) {
    return <div className="history-error">{error}</div>;
  }

  return (
    <div className="session-history-container">
      <div className="history-header">
        <h1>Session History</h1>
        <div className="history-actions">
          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <button className="filter-button" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter size={16} />
              <span>{getDateFilterLabel()}</span>
              <ChevronDown size={16} />
            </button>
            
            {filterOpen && (
              <div className="filter-dropdown">
                <div className="filter-options">
                  <button 
                    className={dateFilter === 'today' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('today');
                      setFilterOpen(false);
                    }}
                  >
                    Today
                  </button>
                  <button 
                    className={dateFilter === 'yesterday' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('yesterday');
                      setFilterOpen(false);
                    }}
                  >
                    Yesterday
                  </button>
                  <button 
                    className={dateFilter === 'week' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('week');
                      setFilterOpen(false);
                    }}
                  >
                    Last 7 Days
                  </button>
                  <button 
                    className={dateFilter === 'month' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('month');
                      setFilterOpen(false);
                    }}
                  >
                    Last 30 Days
                  </button>
                  <button 
                    className={dateFilter === 'year' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('year');
                      setFilterOpen(false);
                    }}
                  >
                    Last Year
                  </button>
                  <button 
                    className={dateFilter === 'custom' ? 'active' : ''}
                    onClick={() => {
                      setDateFilter('custom');
                    }}
                  >
                    Custom Range
                  </button>
                </div>
                
                {dateFilter === 'custom' && (
                  <div className="custom-date-range">
                    <div className="date-input">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                      />
                    </div>
                    <div className="date-input">
                      <label>End Date</label>
                      <input 
                        type="date" 
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                      />
                    </div>
                    <button 
                      className="apply-button"
                      onClick={() => setFilterOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="no-sessions">
          <p>No sessions found for the selected time period.</p>
        </div>
      ) : (
        <div className="session-history-list">
          {filteredSessions.map(session => (
            <div className="history-session-card" key={session.id}>
              <div className="session-card-header">
                <div className="patient-info">
                  <User size={18} />
                  <h3>{session.patientName}</h3>
                </div>
                <div className="session-date-time">
                  <div className="session-date">
                    <Calendar size={14} />
                    <span>{session.date}</span>
                  </div>
                  <div className="session-time">
                    <Clock size={14} />
                    <span>{session.time}</span>
                  </div>
                </div>
              </div>
              <div className="session-card-details">
                <div className="session-purpose">
                  <span className="detail-label">Purpose:</span>
                  <span className="purpose-value">{session.purpose}</span>
                </div>
                
                <div className="session-notes-section">
                  <div className="notes-header">
                    <FileText size={14} />
                    <span>Notes</span>
                  </div>
                  <div className="notes-content">
                    {session.notes || <span className="no-notes">No notes recorded</span>}
                  </div>
                </div>
                
                <div className="session-completion">
                  <span>Completed at: {new Date(session.completedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;