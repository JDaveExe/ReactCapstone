import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { MessageCircle, Send } from 'lucide-react';

const SMSNotification = ({ show, onHide, patient }) => {
  const [smsData, setSmsData] = useState({
    recipient: '',
    message: '',
    urgency: 'normal'
  });  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [smsServiceStatus, setSmsServiceStatus] = useState(null);

  // Define styles similar to VitalSignsCheck and VaccinationCheck
  const labelStyle = { 
    color: '#38bdf8', 
    fontSize: '14px', 
    marginBottom: '4px', 
    display: 'block' 
  };
  
  const inputBaseStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    borderColor: '#334155',
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    boxSizing: 'border-box',
  };
  
  const inputStyle = { ...inputBaseStyle };
  const textAreaStyle = { ...inputBaseStyle, minHeight: '120px', resize: 'vertical' };

  // Custom popup styles
  const popupOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1040,
  };

  const popupContentStyle = {
    background: '#0f172a',
    color: '#e5e7eb',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    zIndex: 1050,
  };

  const popupHeaderStyle = {
    padding: '15px 20px',
    color: '#e5e7eb',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const popupTitleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 500,
  };

  const popupBodyStyle = {
    padding: '20px',
    overflowY: 'auto',
    flexGrow: 1,
  };

  const popupFooterStyle = {
    padding: '15px 20px',
    borderTop: '1px solid #334155',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  };
  
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#e5e7eb',
    fontSize: '1.5rem',
    lineHeight: 1,
    opacity: 0.75,
    cursor: 'pointer',  };

  // Predefined message templates
  const messageTemplates = [
    {
      label: 'Appointment Reminder',
      message: `Hello, this is a reminder for your upcoming appointment at Maybunga Health Center. Please arrive 15 minutes early. Thank you.`
    },
    {
      label: 'Medication Reminder',
      message: `This is a reminder to take your prescribed medication as instructed by your doctor. Please follow the dosage schedule provided.`
    },
    {
      label: 'Follow-up Required',
      message: `Please schedule a follow-up appointment at Maybunga Health Center. Contact us at your earliest convenience.`
    },
    {
      label: 'Health Check Reminder',
      message: `It's time for your regular health check-up. Please schedule an appointment with Maybunga Health Center.`
    },
    {
      label: 'Emergency Contact',
      message: `This is an urgent message from Maybunga Health Center. Please contact us immediately regarding your health matter.`
    }
  ];

  // Initialize recipient phone number and check SMS service status when patient is selected
  React.useEffect(() => {
    if (show && patient) {
      setSmsData(prev => ({
        ...prev,
        recipient: patient.phoneNumber || '',
      }));
      setError(null);
      setSuccess(false);
      
      // Check SMS service status
      checkSMSServiceStatus();
    }
  }, [show, patient]);

  const checkSMSServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sms-status');
      if (response.ok) {
        const data = await response.json();
        setSmsServiceStatus(data.status);
      }
    } catch (err) {
      console.log('Could not check SMS service status:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTemplateSelect = (template) => {
    setSmsData(prev => ({
      ...prev,
      message: template.message
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!smsData.recipient || !smsData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^(\+63|0)?[89]\d{9}$/;
      if (!phoneRegex.test(smsData.recipient.replace(/\s+/g, ''))) {
        throw new Error('Please enter a valid Philippine phone number');
      }

      const notificationData = {
        ...smsData,
        patientId: patient.id,
        patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
        sentAt: new Date().toISOString(),
        type: 'sms'
      };

      // Call API to send SMS
      const response = await fetch('http://localhost:5000/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send SMS notification');
      }

      console.log('SMS notification sent:', notificationData);
      setSuccess(true);
      
      setTimeout(() => {
        onHide();
      }, 2000);
      
    } catch (err) {
      console.error('Error sending SMS notification:', err);
      setError(err.message || 'Failed to send SMS notification');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={popupContentStyle}>        <div style={popupHeaderStyle}>
          <h5 style={popupTitleStyle}>
            <MessageCircle size={18} style={{ marginRight: '8px' }} />
            Send SMS Notification: {patient?.name || `${patient?.firstName} ${patient?.lastName}`}
            {smsServiceStatus && (
              <span style={{ 
                fontSize: '12px', 
                marginLeft: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                backgroundColor: smsServiceStatus.provider === 'twilio' && smsServiceStatus.twilioConfigured ? '#16a34a' : '#f59e0b',
                color: 'white'
              }}>
                {smsServiceStatus.provider === 'twilio' && smsServiceStatus.twilioConfigured ? 'Real SMS' : 'Mock Mode'}
              </span>
            )}
          </h5>
          <button type="button" style={closeButtonStyle} onClick={onHide} aria-label="Close">
            &times;
          </button>
        </div>
        <div style={popupBodyStyle}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" style={{backgroundColor: '#dc3545', color: 'white'}}>
              <div>{error}</div>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4" style={{backgroundColor: '#198754', color: 'white'}}>
              <div>SMS notification sent successfully!</div>
            </div>
          )}
          
          <Form onSubmit={handleSubmit} style={{background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155'}}>
            
            {/* Recipient Field */}
            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Recipient Phone Number:</Form.Label>
              <Form.Control 
                type="tel" 
                name="recipient"
                value={smsData.recipient}
                onChange={handleChange}
                placeholder="e.g., 09171234567 or +639171234567"
                style={inputStyle}
                required
              />
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Enter a valid Philippine mobile number
              </div>
            </Form.Group>

            {/* Urgency Level */}
            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Urgency Level:</Form.Label>
              <Form.Select
                name="urgency"
                value={smsData.urgency}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </Form.Select>
            </Form.Group>

            {/* Message Templates */}
            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Quick Templates:</Form.Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {messageTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      background: '#334155',
                      color: '#e5e7eb',
                      border: '1px solid #475569',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#334155'}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </Form.Group>

            {/* Message Field */}
            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Message:</Form.Label>
              <Form.Control 
                as="textarea"
                name="message"
                value={smsData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                style={textAreaStyle}
                required
              />
              <div style={{ 
                fontSize: '12px', 
                color: smsData.message.length > 160 ? '#ef4444' : '#94a3b8', 
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {smsData.message.length}/160 characters
                {smsData.message.length > 160 && ' (Message will be split into multiple SMS)'}
              </div>
            </Form.Group>

            {/* Patient Info Display */}
            <div style={{
              background: '#0f172a',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #334155',
              marginBottom: '15px'
            }}>
              <div style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '8px' }}>
                Patient Information:
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                <div>Name: {patient?.name || `${patient?.firstName} ${patient?.lastName}`}</div>
                <div>Phone: {patient?.phoneNumber || 'No phone number on record'}</div>
                {patient?.email && <div>Email: {patient.email}</div>}
              </div>
            </div>

          </Form>
        </div>
        <div style={popupFooterStyle}>
          <Button variant="secondary" onClick={onHide} disabled={loading} style={{backgroundColor: '#6c757d', borderColor: '#6c757d'}}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || success || !smsData.recipient || !smsData.message}
            style={{backgroundColor: '#38bdf8', borderColor: '#38bdf8'}}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} style={{ marginRight: '6px' }} />
                Send SMS
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SMSNotification;
