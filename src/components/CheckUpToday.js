import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CheckUpToday.css';
import { Clock, Calendar, User, Check } from 'lucide-react';

export default function CheckUpToday({ showDateTimePerPatient }) {
  // State for checkups and user interactions
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Purpose options for dropdown
  const purposeOptions = [
    'General Consultation',
    'Follow-up',
    'Vaccination',
    'Pediatric Check-Up',
    'Dental Check-Up',
    'Eye Exam',
    'Laboratory Test',
    'Prescription Refill',
    'Other'
  ];

  // Fetch checkup data on component mount
  useEffect(() => {
    fetchCheckups();
  }, []);

  const fetchCheckups = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from your backend
      // const response = await axios.get('http://localhost:5000/api/checkup-today');
      // setCheckups(response.data);
      
      // For now using mock data
      const mockData = [
        { id: 1, queueNumber: 1, name: 'John Doe', time: '09:00 AM', purpose: 'General Consultation', date: todayDate, status: 'Waiting' },
        { id: 2, queueNumber: 2, name: 'Jane Smith', time: '10:30 AM', purpose: 'Dental Check-Up', date: todayDate, status: 'Waiting' },
        { id: 3, queueNumber: 3, name: 'Carlos Reyes', time: '01:00 PM', purpose: 'Eye Exam', date: todayDate, status: 'Waiting' },
        { id: 4, queueNumber: 4, name: 'Maria Garcia', time: '03:15 PM', purpose: 'Pediatric Check-Up', date: todayDate, status: 'Waiting' },
      ];
      setCheckups(mockData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching checkups:", err);
      setError("Failed to load checkups. Please try again later.");
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

  const handlePurposeChange = (id, purpose) => {
    setCheckups(checkups.map(c => 
      c.id === id ? { ...c, purpose } : c
    ));
  };

  const handleStartSession = async (checkup) => {
    try {
      // In production, this would update the backend
      // await axios.patch(`http://localhost:5000/api/checkup/${checkup.id}/status`, { 
      //   status: 'In Session',
      //   doctorId: localStorage.getItem('userId') // Assign the session to the doctor 
      // });
      
      // Update local state
      setCheckups(checkups.map(c => 
        c.id === checkup.id ? { ...c, status: 'In Session' } : c
      ));
      
      // Notify that the patient is ready for the doctor
      console.log(`Patient ${checkup.name} is now in session`);
      
      // In a real application, this would trigger a notification to the doctor
    } catch (err) {
      console.error("Error starting session:", err);
      alert("Failed to start session. Please try again.");
    }
  };

  const handleCustomPurpose = (id) => {
    const customPurpose = prompt("Enter specific purpose:");
    if (customPurpose && customPurpose.trim() !== "") {
      handlePurposeChange(id, customPurpose);
    }
  };

  if (loading) {
    return <div className="loading">Loading today's checkups...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="checkup-today-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ marginBottom: 0 }}>Check-Ups Scheduled for Today</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 6, background: '#172136', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: 14, minWidth: 180 }}
        />
      </div>
      <table className="checkup-table">
        <thead>
          <tr>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('queueNumber')}>
              # {sortField === 'queueNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Name</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
              Date {sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('time')}>
              Time {sortField === 'time' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.id}>
              <td>{c.queueNumber}</td>
              <td>{c.name}</td>
              <td>{c.date}</td>
              <td>{c.time}</td>
              <td>
                <select 
                  value={c.purpose} 
                  onChange={(e) => e.target.value === 'Other' 
                    ? handleCustomPurpose(c.id) 
                    : handlePurposeChange(c.id, e.target.value)
                  }
                  style={{ 
                    padding: '6px', 
                    borderRadius: '4px', 
                    background: '#1e293b', 
                    color: '#e5e7eb',
                    border: '1px solid #334155'
                  }}
                >
                  {purposeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other...</option>
                </select>
              </td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  backgroundColor: 
                    c.status === 'Waiting' ? '#0c4a6e' : 
                    c.status === 'In Session' ? '#854d0e' : 
                    c.status === 'Finished' ? '#064e3b' : '#334155',
                  color:
                    c.status === 'Waiting' ? '#38bdf8' : 
                    c.status === 'In Session' ? '#fbbf24' : 
                    c.status === 'Finished' ? '#34d399' : '#94a3b8',
                }}>
                  {c.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleStartSession(c)}
                  disabled={c.status !== 'Waiting'}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: c.status !== 'Waiting' ? '#334155' : '#0e7490',
                    color: c.status !== 'Waiting' ? '#64748b' : '#fff',
                    border: 'none',
                    cursor: c.status !== 'Waiting' ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {c.status === 'Waiting' ? 'In Session' : 
                   c.status === 'In Session' ? 'Currently In Session' : 'Completed'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}