import React from 'react'; // Removed useState, useEffect
// Removed axios import
import '../styles/CKProfile.css';

// Removed API_URL constant

export default function CKProfile({ member, onBack }) {
  // Removed patientDetails, loading, error, isPersonalInfoOpen, isContactInfoOpen states
  // Removed useEffect for fetchPatientDetails

  // Example data, replace with real data as needed
  // This 'visits' array will be the primary data displayed by this component for now.
  // In a real application, this would likely be fetched or passed in.
  const visits = [
    { date: '2025-04-08', time: '09:30 AM', doctor: 'Dr. Santos', notes: 'Routine check-up. All vitals normal.' },
    { date: '2024-12-15', time: '02:00 PM', doctor: 'Dr. Reyes', notes: 'Follow-up for cough. Prescribed medication.' },
    { date: '2024-08-22', time: '10:15 AM', doctor: 'Dr. Santos', notes: 'Annual physical exam.' },
  ];

  // Removed fullAddress calculation as it's no longer needed here

  // Removed loading, error, and !patientDetails conditional returns

  if (!member) {
    return (
      <div className="ckprofile-root" style={{ padding: '20px' }}>
        <div className="alert alert-warning">No member data provided to display check-up history.</div>
        <button className="ckprofile-backbtn" onClick={onBack} style={{ marginTop: '10px' }}>&lt; Back</button>
      </div>
    );
  }

  return (
    <div className="ckprofile-root">
      <div className="ckprofile-header">
        <button className="ckprofile-backbtn" onClick={onBack}>&lt; Back</button>
        <h2 className="ckprofile-title">Check Up History</h2> {/* Updated title slightly */}
      </div>
      <div className="ckprofile-member-info">
        <h3>{member?.name || 'Patient'}</h3> {/* Display member's name */}
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
