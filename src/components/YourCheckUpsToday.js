import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/YourCheckUpsToday.css'; // Styles for the container and specific elements like the button
import '../styles/CheckUpToday.css'; // Styles for the table (imported from Admin section)
import { Clock, Calendar, User, Check, ArrowRight, Loader } from 'lucide-react';
import CheckUpContext from '../contexts/CheckUpContext';

export default function YourCheckUpsToday() {
  const { todaysCheckUps, isLoading: contextIsLoading, error: contextError, updateCheckUpItem } = useContext(CheckUpContext);
  
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter for checkups that are "In Session"
  const inSessionCheckUps = todaysCheckUps.filter(c => c.status === 'In Session');

  // Filter by name - now operates on inSessionCheckUps
  const filtered = inSessionCheckUps.filter(c => c.name && c.name.toLowerCase().includes(search.toLowerCase()));

  // Sort by selected field
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'queueNumber') {
      return sortOrder === 'asc' ? a.queueNumber - b.queueNumber : b.queueNumber - a.queueNumber;
    } else if (sortField === 'date') {
      const dA = new Date(a.date + ' ' + a.time);
      const dB = new Date(b.date + ' ' + b.time);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    } else if (sortField === 'time') {
      const dA = new Date(a.loggedInAt);
      const dB = new Date(b.loggedInAt);
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

  const handleStartDoctorSession = async (checkup) => {
    try {
      console.log(`[YourCheckUpsToday] Doctor starting session with ${checkup.name}, changing status to Ongoing.`);
      await updateCheckUpItem({ ...checkup, status: 'Ongoing' }); 
    } catch (err) {
      console.error("[YourCheckUpsToday] Error updating checkup status to Ongoing:", err);
      alert("Failed to move session to Ongoing. Please try again.");
    }
  };

  if (contextIsLoading) {
    return <div className="loading"><Loader size={48} /> Loading your assigned checkups...</div>;
  }

  if (contextError) {
    return <div className="error">{contextError}</div>;
  }

  return (
    <div className="your-checkups-today-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ marginBottom: 0 }}>Your Check Ups Today</h1>
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: 6, background: '#2a3a5a', border: '1px solid #4a5a7a', color: '#fff', outline: 'none' }}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="no-sessions" style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
            No patients currently in session.
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
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('time')}>
                Logged In At {sortField === 'time' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((checkup) => (
              <tr key={checkup.id}>
                <td>{checkup.queueNumber || checkup.id}</td>
                <td>{checkup.name}</td>
                <td>{new Date(checkup.loggedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{checkup.purpose || 'Not Specified'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    backgroundColor: '#854d0e',
                    color: '#fbbf24',
                  }}>
                    {checkup.status}
                  </span>
                </td>
                <td>
                  <button className="start-session-btn" onClick={() => handleStartDoctorSession(checkup)}>
                    Start Session <ArrowRight size={16} style={{ marginLeft: 8 }} />
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