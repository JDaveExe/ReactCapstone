import React, { useState } from 'react';
import '../styles/ScheduleVisit.css';

export default function ScheduleVisit({ member }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the data to the backend
    setSuccess(true);
  };

  return (
    <div className="schedule-visit-root">
      <div className="schedule-visit-header">
        <h2>Schedule Visit for {member.name}</h2>
      </div>
      {success ? (
        <div className="schedule-visit-success">
          <h3>Appointment Scheduled!</h3>
          <p>Date: {date}</p>
          <p>Time: {time}</p>
          <p>Reason: {reason}</p>
        </div>
      ) : (
        <form className="schedule-visit-form" onSubmit={handleSubmit}>
          <div className="schedule-visit-field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="schedule-visit-field">
            <label>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
          <div className="schedule-visit-field">
            <label>Reason for Visit</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} required placeholder="Describe the reason for the visit..." />
          </div>
          <button className="schedule-visit-submit" type="submit">Schedule</button>
        </form>
      )}
    </div>
  );
}
