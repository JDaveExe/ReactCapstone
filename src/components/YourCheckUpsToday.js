import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/YourCheckUpsToday.css';
import { Clock, Calendar, User, Check, ArrowRight } from 'lucide-react';

export default function YourCheckUpsToday() {
  // State for checkups and user interactions
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch checkup data on component mount
  useEffect(() => {
    fetchCheckups();
  }, []);

  const fetchCheckups = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch data from your backend API
      // const response = await axios.get('http://localhost:5000/api/checkups-for-doctor', {
      //   params: { doctorId: localStorage.getItem('userId') }
      // });
      // setCheckups(response.data);
      
      // For now using mock data for doctors assigned checkups (in session)
      const mockData = [
        { id: 1, queueNumber: 1, name: 'John Doe', time: '09:00 AM', purpose: 'General Consultation', date: todayDate, status: 'In Session' },
        { id: 3, queueNumber: 3, name: 'Carlos Reyes', time: '01:00 PM', purpose: 'Eye Exam', date: todayDate, status: 'In Session' },
      ];
      setCheckups(mockData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching checkups:", err);
      setError("Failed to load your assigned checkups. Please try again later.");
      setLoading(false);
    }
  };

  // Filter by name
  const filtered = checkups.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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

  const handleStartSession = async (checkup) => {
    try {
      // In production, this would update the backend
      // await axios.patch(`http://localhost:5000/api/checkup/${checkup.id}/session`, { 
      //   status: 'Active',
      //   sessionStartTime: new Date().toISOString()
      // });
      
      // Navigate to the session page or update state to show the active session
      // For now, we'll just log it
      console.log(`Session started with ${checkup.name}`);
      
      // Here you would typically navigate to the session component
      // For example: navigate(`/doctor/sessions/${checkup.id}`);
      
      // Update the session status in our local state
      setCheckups(checkups.map(c => 
        c.id === checkup.id ? { ...c, status: 'Active Session' } : c
      ));
    } catch (err) {
      console.error("Error starting session:", err);
      alert("Failed to start session. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading your assigned checkups...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="your-checkups-today-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ marginBottom: 0 }}>Your Check-Ups Today</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 6, background: '#172136', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: 14, minWidth: 180 }}
        />
      </div>
      
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          <p>No patients have been assigned to you yet.</p>
        </div>
      ) : (
        <div className="checkup-cards">
          {sorted.map((checkup) => (
            <div className="checkup-card" key={checkup.id}>
              <div className="card-header">
                <div className="queue-number">#{checkup.queueNumber}</div>
                <div className="patient-name">{checkup.name}</div>
                <div className="status-badge">
                  <span>{checkup.status}</span>
                </div>
              </div>
              
              <div className="card-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{checkup.date}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{checkup.time}</span>
                </div>
                <div className="detail-item purpose">
                  <span>Purpose:</span>
                  <strong>{checkup.purpose}</strong>
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="start-session-btn"
                  onClick={() => handleStartSession(checkup)}
                >
                  Start Session <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}