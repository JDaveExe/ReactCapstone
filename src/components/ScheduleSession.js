import React, { useState, useContext, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, FileText, CheckCircle, Trash2 } from 'lucide-react';
import '../styles/ScheduleSession.css';
import CheckUpContext from '../contexts/CheckUpContext';
import { getAvailableServices } from '../utils/serviceScheduleUtils';

export default function ScheduleSession() {
  // Use context instead of mock data
  const { 
    allScheduledAppointments, 
    addScheduledAppointmentToList, 
    deleteScheduledAppointment 
  } = useContext(CheckUpContext);
    // State for new appointment form
  const [showForm, setShowForm] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    familyName: '',
    date: '',
    time: '',
    purpose: 'General Consultation'
  });
    // Function to update available services based on date and time
  const updateAvailableServices = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return; // Invalid date
      
      const services = getAvailableServices(date, timeStr);
      setAvailableServices(services);
      
      // Check if it's a weekend
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        alert('Note: Weekend appointments have limited or no services available. Consider scheduling on a weekday.');
      }
      
      // If current purpose is not available, select the first available service
      if (services.length > 0 && !services.includes(newAppointment.purpose)) {
        setNewAppointment(prev => ({
          ...prev,
          purpose: services[0]
        }));
      }
    } catch (error) {
      console.error('Error updating available services:', error);
    }
  };
  
  // Update available services when date or time changes
  useEffect(() => {
    if (newAppointment.date && newAppointment.time) {
      updateAvailableServices(newAppointment.date, newAppointment.time);
    }  }, [newAppointment.date, newAppointment.time]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If date or time changes, update available services
    if (name === 'date' || name === 'time') {
      const dateToUse = name === 'date' ? value : newAppointment.date;
      const timeToUse = name === 'time' ? value : newAppointment.time;
      
      // Only update if both date and time are available
      if (dateToUse && timeToUse) {
        // Validate that time is within business hours (8am-5pm)
        const [hours, minutes] = timeToUse.split(':').map(num => parseInt(num, 10));
        if (hours >= 8 && hours < 17) {
          updateAvailableServices(dateToUse, timeToUse);
        } else {
          // If time is outside business hours, show a warning
          alert('Please select a time between 8:00 AM and 5:00 PM');
          // Reset to a valid time
          setNewAppointment(prev => ({
            ...prev,
            time: '09:00' // Default to 9 AM
          }));
          updateAvailableServices(dateToUse, '09:00');
        }
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create appointment with unique ID
      const appointment = {
        ...newAppointment,
        id: Date.now().toString(),
        status: 'upcoming'
      };
      
      await addScheduledAppointmentToList(appointment);
      
      // Reset form
      setNewAppointment({
        patientName: '',
        familyName: '',
        date: '',
        time: '',
        purpose: 'General Consultation'
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    }
  };
    // Handle appointment deletion
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteScheduledAppointment(id);
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }  };
  
  // Purpose options
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

  return (
    <div className="schedule-session-container">
      <div className="session-header">
        <h2 className="schedule-session-title">Schedule New Session</h2>
        <button 
          className="new-session-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          New Session
        </button>
      </div>
      
      {showForm && (
        <div className="appointment-form-container">
          <form className="appointment-form" onSubmit={handleSubmit}>
            <h3>Schedule New Appointment</h3>
            
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={newAppointment.patientName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Family Name</label>
              <input
                type="text"
                name="familyName"
                value={newAppointment.familyName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newAppointment.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={newAppointment.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>              <div className="form-group">
              <label>Purpose</label>
              <select
                name="purpose"
                value={newAppointment.purpose}
                onChange={handleInputChange}
              >                {availableServices.length > 0 ? (
                  availableServices.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))
                ) : (
                  purposeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))
                )}
                <option value="Other">Other</option>
              </select>
              {availableServices.length > 0 && (
                <div style={{ fontSize: '12px', color: availableServices.length <= 2 ? '#ef4444' : '#94a3b8', marginTop: '4px' }}>
                  {availableServices.length <= 2 ? 
                    'Limited services available at this time slot. Consider selecting a different time.' : 
                    'Services shown are based on selected date and time'}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit">Schedule</button>
            </div>
          </form>
        </div>
      )}

      <div className="sessions-list">
        {allScheduledAppointments.length === 0 ? (
          <div className="no-sessions">No appointments scheduled yet.</div>
        ) : (
          allScheduledAppointments.map(appointment => (
            <div key={appointment.id} className={`session-card ${appointment.status}`}>
              <div className="session-info">
                <div className="session-patient">
                  <Users size={20} className="icon" />
                  <h3>{appointment.patientName}</h3>
                  {appointment.familyName && (
                    <span className="family-name">Family: {appointment.familyName}</span>
                  )}
                </div>
                
                <div className="session-details">
                  <div className="detail">
                    <Calendar size={16} className="icon" />
                    <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="detail">
                    <Clock size={16} className="icon" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="detail">
                    <FileText size={16} className="icon" />
                    <span>{appointment.purpose}</span>
                  </div>
                </div>
              </div>
              
              <div className="session-actions">
                <div className="session-status">
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status === 'completed' ? <CheckCircle size={16} /> : null}
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteAppointment(appointment.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
