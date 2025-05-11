import React from 'react';
import '../styles/CKProfile.css';

export default function CKProfile({ member, onBack }) {
  // Example data, replace with real data as needed
  const visits = [
    { date: '2025-04-08', time: '09:30 AM', doctor: 'Dr. Santos', notes: 'Routine check-up. All vitals normal.' },
    { date: '2024-12-15', time: '02:00 PM', doctor: 'Dr. Reyes', notes: 'Follow-up for cough. Prescribed medication.' },
    { date: '2024-08-22', time: '10:15 AM', doctor: 'Dr. Santos', notes: 'Annual physical exam.' },
  ];

  return (
    <div className="ckprofile-root">
      <div className="ckprofile-header">
        <button className="ckprofile-backbtn" onClick={onBack}>&lt; Back</button>
        <h2 className="ckprofile-title">Check-Up Profile</h2>
      </div>
      <div className="ckprofile-member-info">
        <h3>{member?.name}</h3>
        <p>Age: {member?.age} | Gender: {member?.gender}</p>
      </div>
      <div className="ckprofile-visits">
        <h4>Visit History</h4>
        <table className="ckprofile-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Doctor</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit, idx) => (
              <tr key={idx}>
                <td>{visit.date}</td>
                <td>{visit.time}</td>
                <td>{visit.doctor}</td>
                <td>{visit.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
