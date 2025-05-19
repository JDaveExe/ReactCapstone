import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, User, ChevronLeft, Search, Plus, AlertCircle } from 'lucide-react';
import { Button, Modal, Form } from 'react-bootstrap';
import '../styles/ScheduledSession.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import CheckUpContext from '../contexts/CheckUpContext';

const ScheduledSession = ({ userRole = 'admin', familiesWithMembers = [] }) => {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);  
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentPurpose, setAppointmentPurpose] = useState('Regular Check-up');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointments, setAppointments] = useState([]);
  
  // Get the context for appointment management
  const { setTodaysCheckUps, addScheduledAppointmentToList } = useContext(CheckUpContext);

  // Filter families based on search term
  const filteredFamilies = familiesWithMembers.filter(family => 
    family && family.familyName && 
    family.familyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFamilyClick = (family) => {
    setSelectedFamily(family);
    setSelectedMember(null);
    setSearchTerm('');
  };

  const handleBackToFamilies = () => {
    setSelectedFamily(null);
    setSelectedMember(null);
  };

  const handleScheduleAppointment = (member) => {
    setSelectedMember(member);
    setShowCalendarModal(true);
  };

  const handleSaveAppointment = async () => {
    // Format the time to ensure it's in the correct format
    const appointmentDateTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    // Create a new appointment object
    const newAppointment = {
      id: Date.now(), // Simple ID for now, should be from backend in production
      patientId: selectedMember.id,      
      patientName: selectedMember.name || `${selectedMember.firstName} ${selectedMember.lastName}`,
      familyName: selectedFamily.familyName,
      date: appointmentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: appointmentTime,
      purpose: appointmentPurpose,
      notes: appointmentNotes,
      status: 'scheduled'
    };

    // Add to the appointments array (local state management)
    setAppointments([...appointments, newAppointment]);
    addScheduledAppointmentToList(newAppointment); // Add to global scheduled appointments
    
    // Send to backend API (when connected to backend)
    try {
      // Commented until backend API is ready
      // const response = await axios.post('http://localhost:5000/api/appointments', newAppointment);
      // console.log('Appointment saved successfully:', response.data);
      
      // This code simulates what would happen if we had a backend
      // In a real application, remove this simulation and uncomment the axios post above
      console.log('Appointment scheduled (simulated):', newAppointment);
      
      // If appointment is for today, add it to today's checkups
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      if (newAppointment.date === todayStr) {
        // Add to today's checkups
        setTodaysCheckUps(prev => [...prev, {
          id: newAppointment.id,
          name: newAppointment.patientName,
          familyName: newAppointment.familyName,
          purpose: newAppointment.purpose,
          loggedInAt: new Date().toISOString(),
          queueNumber: prev.length + 1,
          status: 'Waiting'
        }]);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      // Handle error (show message to user)
    }

    // Close the modal and reset fields
    setShowCalendarModal(false);
    setAppointmentNotes('');

    // Show a success message
    alert(`Appointment scheduled for ${selectedMember.name || `${selectedMember.firstName} ${selectedMember.lastName}`} on ${appointmentDate.toLocaleDateString()} at ${appointmentTime}`);
  };

  const timeOptions = [];
  for (let hour = 8; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return (
    <div className="scheduled-session-container">
      <div className="current-date" style={{ textAlign: 'right', color: '#94a3b8', marginBottom: '10px', fontSize: '14px' }}>
        <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div className="session-header">
        {selectedFamily ? (
          <div className="back-navigation">
            <button className="back-button" onClick={handleBackToFamilies}>
              <ChevronLeft size={20} />
              <span>Back to Families</span>
            </button>
            <h1>{`Family: ${selectedFamily.familyName}`}</h1>
          </div>
        ) : (
          <h1>Schedule New Session</h1>
        )}
      </div>

      <div className="search-container">
        <div className="search-input">
          <Search size={18} />
          <input 
            type="text"
            placeholder={selectedFamily ? "Search family members..." : "Search families..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-container">
        {selectedFamily ? (
          <div className="family-members-container">
            {selectedFamily.members && selectedFamily.members.length > 0 ? (
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFamily.members
                    .filter(member => 
                      !searchTerm || 
                      (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      ((member.firstName + ' ' + member.lastName).toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(member => (
                    <tr key={member.id}>
                      <td>{member.name || `${member.firstName} ${member.lastName}`}</td>
                      <td>
                        <button 
                          className="schedule-button"
                          onClick={() => handleScheduleAppointment(member)}
                        >
                          Schedule Appointment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-members">No members found in this family.</div>
            )}
          </div>
        ) : (
          <div className="families-container">
            {filteredFamilies.length > 0 ? (
              <ul className="families-list">
                {filteredFamilies.map((family) => (
                  <li key={family.id || family.familyName} onClick={() => handleFamilyClick(family)}>
                    <div className="family-name">{family.familyName}</div>
                    <div className="members-count">
                      {family.members ? `${family.members.length} members` : '0 members'}
                    </div>
                    <div className="view-family">View Family →</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-families">
                {searchTerm ? 'No families match your search.' : 'No families found.'}
              </div>
            )}
          </div>
        )}

        {appointments.length > 0 && (
          <div className="recent-appointments">
            <h2>Recent Scheduled Appointments</h2>
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="appointment-patient">
                      <User size={16} />
                      <span>{appointment.patientName}</span>
                    </div>
                    <div className="appointment-family">
                      Family: {appointment.familyName}
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-date">
                      <Calendar size={16} />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div className="appointment-purpose">
                    Purpose: {appointment.purpose}
                  </div>
                  {appointment.notes && (
                    <div className="appointment-notes">
                      Notes: {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Modal for Scheduling */}
      <Modal 
        show={showCalendarModal} 
        onHide={() => setShowCalendarModal(false)}
        centered
        className="calendar-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMember && (
            <div className="patient-info">
              <h4>{selectedMember.name || `${selectedMember.firstName} ${selectedMember.lastName}`}</h4>
              <p>Family: {selectedFamily?.familyName}</p>
            </div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <div className="date-picker-container">
                <DatePicker
                  selected={appointmentDate}
                  onChange={(date) => setAppointmentDate(date)}
                  minDate={new Date()}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Select 
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </Form.Select>
            </Form.Group>            
            <Form.Group className="mb-3">
              <Form.Label>Appointment Purpose</Form.Label>
              <Form.Select 
                value={appointmentPurpose}
                onChange={(e) => setAppointmentPurpose(e.target.value)}
              >
                <option value="Regular Check-up">Regular Check-up</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Vaccination">Vaccination</option>
                <option value="General Consultation">General Consultation</option>
                <option value="Pediatric Check-Up">Pediatric Check-Up</option>
                <option value="Dental Check-Up">Dental Check-Up</option>
                <option value="Eye Exam">Eye Exam</option>
                <option value="Laboratory Test">Laboratory Test</option>
                <option value="Prescription Refill">Prescription Refill</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Add any additional notes here"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCalendarModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAppointment}>
            Schedule Appointment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduledSession;
