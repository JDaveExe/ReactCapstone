import React, { useState } from "react";
import "../styles/CheckupRecords.css";

const today = new Date();
const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const initialCheckups = [
  { name: 'John Doe', time: '09:00 AM', type: 'General Consultation', date: todayDate, status: '' },
  { name: 'Jane Smith', time: '10:30 AM', type: 'Dental Check-Up', date: todayDate, status: '' },
  { name: 'Carlos Reyes', time: '01:00 PM', type: 'Eye Exam', date: todayDate, status: '' },
  { name: 'Maria Garcia', time: '03:15 PM', type: 'Pediatric Check-Up', date: todayDate, status: '' },
];

const CheckupRecords = () => {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("time");
  const [sortOrder, setSortOrder] = useState("asc");
  const [checkups, setCheckups] = useState(initialCheckups);

  // Filter by name
  const filtered = checkups.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Sort by date or time
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      const dA = new Date(a.date + ' ' + a.time);
      const dB = new Date(b.date + ' ' + b.time);
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    } else if (sortField === 'time') {
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

  const handleStatusChange = (idx, value) => {
    setCheckups(prev => prev.map((c, i) => i === idx ? { ...c, status: value } : c));
  };

  return (
    <div className="checkup-container">
      <h2>Today's Check-Up Records</h2>
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-bar"
        style={{ marginBottom: 18 }}
      />
      <div className="table-container">
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.date}</td>
                <td>{c.time}</td>
                <td>{c.type}</td>
                <td>
                  <select value={c.status} onChange={e => handleStatusChange(i, e.target.value)}>
                    <option value="">Select</option>
                    <option value="done">Done</option>
                    <option value="not-done">Not Done</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckupRecords;
