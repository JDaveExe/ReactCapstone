import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/CheckUpToday.css';
import { Clock, Calendar, User, Check, Loader } from 'lucide-react';
import CheckUpContext from '../contexts/CheckUpContext';

export default function CheckUpToday({ showDateTimePerPatient }) {
  const { todaysCheckUps, updateCheckUpItem, setTodaysCheckUps, isLoading, error } = useContext(CheckUpContext);
  console.log('[CheckUpToday] Received todaysCheckUps from context:', todaysCheckUps);
  console.log('[CheckUpToday] todaysCheckUps is Array?', Array.isArray(todaysCheckUps), 'Length:', todaysCheckUps?.length);
  console.log('[CheckUpToday] Context states - isLoading:', isLoading, 'error:', error);
  
  useEffect(() => {
    console.log('[CheckUpToday] todaysCheckUps changed in component:', todaysCheckUps);
    // Force a check of localStorage directly as well to compare
    try {
      const directFromStorage = localStorage.getItem('todaysCheckUpsList');
      console.log('[CheckUpToday] Direct localStorage check:', directFromStorage);
      if (directFromStorage) {
        console.log('[CheckUpToday] Parsed from localStorage:', JSON.parse(directFromStorage));
      }
    } catch (e) {
      console.error('[CheckUpToday] Error checking localStorage directly:', e);
    }
  }, [todaysCheckUps]);

  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber");
  const [sortOrder, setSortOrder] = useState("asc");
  
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

  const filtered = todaysCheckUps.filter(c => c.name && c.name.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'queueNumber') {
      return sortOrder === 'asc' ? a.queueNumber - b.queueNumber : b.queueNumber - a.queueNumber;
    } else if (sortField === 'loggedInAt') {
      const dA = new Date(a.loggedInAt);
      const dB = new Date(b.loggedInAt);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    } else if (sortField === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
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

  const handlePurposeChange = (id, newPurpose) => {
    const itemToUpdate = todaysCheckUps.find(c => c.id === id);
    if (itemToUpdate) {
      updateCheckUpItem({ ...itemToUpdate, purpose: newPurpose });
    }
  };

  const handleStartSession = async (checkup) => {
    try {
      console.log(`Attempting to start session for ${checkup.name}`);
      updateCheckUpItem({ ...checkup, status: 'In Session' });
      console.log(`Patient ${checkup.name} is now in session`);
    } catch (err) {
      console.error("Error starting session:", err);
      alert("Failed to start session. Please try again.");
    }
  };

  const handleCustomPurpose = (id) => {
    const customPurpose = prompt("Enter specific purpose:");
    if (customPurpose && customPurpose.trim() !== "") {
      handlePurposeChange(id, customPurpose.trim());
    }
  };

  // Replace the localStorage-based date check with API-based solution
  useEffect(() => {
    // We'll rely on the backend to manage daily reset of check-ups
    console.log("[CheckUpToday] Component mounted - date check will be handled by the backend");
    // No need for interval as the polling in CheckUpContext will handle updates
  }, []);

  if (isLoading) {
    return <div className="loading"><Loader /> Loading today's checkups...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="checkup-today-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ marginBottom: 0 }}>{showDateTimePerPatient ? 'Your Check Ups Today' : 'Check Ups Today'}</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 14px', borderRadius: 6, background: '#172136', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: 14, minWidth: 180 }}
        />
      </div>
      {sorted.length === 0 ? (
        <div className="no-sessions" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
            No patients have logged in for check-up yet today.
        </div>
      ) : (
        <table className="checkup-table">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('queueNumber')}>
                # {sortField === 'queueNumber' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              {showDateTimePerPatient && (
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('loggedInAt')}>
                  Logged In At {sortField === 'loggedInAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
              )}
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
                {showDateTimePerPatient && (
                  <td>{new Date(c.loggedInAt).toLocaleTimeString()}</td>
                )}
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
                      border: '1px solid #334155',
                      minWidth: '150px'
                    }}
                  >
                    {purposeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
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
                    {c.status === 'Waiting' ? 'Enter Session' : 'Currently In Session'} 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}