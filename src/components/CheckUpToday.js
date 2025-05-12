import React from 'react';
import '../styles/CheckUpToday.css';

export default function CheckUpToday({ showDateTimePerPatient }) {
  // Example data, in real use this would come from a database
  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState("time");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const checkups = [
    { name: 'John Doe', time: '09:00 AM', type: 'General Consultation', date: todayDate },
    { name: 'Jane Smith', time: '10:30 AM', type: 'Dental Check-Up', date: todayDate },
    { name: 'Carlos Reyes', time: '01:00 PM', type: 'Eye Exam', date: todayDate },
    { name: 'Maria Garcia', time: '03:15 PM', type: 'Pediatric Check-Up', date: todayDate },
  ];

  // Filter by name
  const filtered = checkups.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Sort by date or time
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
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
            <th>Name</th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
              Date {sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('time')}>
              Time {sortField === 'time' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.date}</td>
              <td>{c.time}</td>
              <td>{c.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}