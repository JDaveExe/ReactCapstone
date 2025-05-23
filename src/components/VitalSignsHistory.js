import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Spinner } from 'react-bootstrap';

const VitalSignsHistory = ({ show, onHide, patientId }) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define styles similar to VitalSignsCheck
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
    maxWidth: '1140px',
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
    cursor: 'pointer',
  };

  const cardStyle = {
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
    marginBottom: '15px',
    padding: '15px',
  };

  const cardHeaderStyle = {
    borderBottom: '1px solid #334155',
    paddingBottom: '10px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const cardBodyStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
  };

  const vitalItemStyle = {
    marginBottom: '10px',
  };

  const labelStyle = {
    color: '#38bdf8',
    fontSize: '14px',
    marginBottom: '4px',
    display: 'block',
  };

  const valueStyle = {
    color: '#e5e7eb',
    fontSize: '16px',
    fontWeight: 500,
  };

  // Convert metric to imperial or use original values as needed
  const formatVitalSign = (key, value, useMetric = true) => {
    if (!value && value !== 0) return 'Not recorded';
    
    switch (key) {
      case 'ht':
        return useMetric 
          ? `${parseFloat(value).toFixed(2)} m`
          : `${(parseFloat(value) * 3.28084).toFixed(2)} ft`;
      case 'wt':
        return useMetric
          ? `${parseFloat(value).toFixed(1)} kg`
          : `${(parseFloat(value) * 2.20462).toFixed(1)} lbs`;
      case 'temp':
        return `${value} °C`;
      case 'pulse':
        return `${value} BPM`;
      case 'respiration':
        return `${value} breaths/min`;
      case 'o2sat':
        return `${value} %`;
      case 'bp':
        return value; // Already properly formatted like "120/80"
      default:
        return value;
    }
  };

  // Format date for human readability
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  useEffect(() => {
    const fetchVitalSigns = async () => {
      if (!show || !patientId) return;
      
      console.log('Fetching vital signs for patientId:', patientId, 'type:', typeof patientId);
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/vital-signs/patient/${patientId}`);
        console.log('Response data:', response.data);
        // Sort vital signs by date, newest first
        const sortedVitalSigns = response.data.sort((a, b) => 
          new Date(b.recordedAt) - new Date(a.recordedAt)
        );
        setVitalSigns(sortedVitalSigns);
        setError(null);
      } catch (err) {
        console.error('Error fetching vital signs history:', err);
        setError('Failed to load vital signs history');
      } finally {
        setLoading(false);
      }
    };

    fetchVitalSigns();
  }, [show, patientId]);

  if (!show) {
    return null;
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={popupContentStyle}>
        <div style={popupHeaderStyle}>
          <h5 style={popupTitleStyle}>
            <i className="bi bi-clock-history me-2"></i>
            Vital Signs History
          </h5>
          <button type="button" style={closeButtonStyle} onClick={onHide} aria-label="Close">
            &times;
          </button>
        </div>
        <div style={popupBodyStyle}>
          {error && (
            <div style={{backgroundColor: '#dc3545', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          
          {loading ? (
            <div style={{display: 'flex', justifyContent: 'center', padding: '30px'}}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : vitalSigns.length === 0 ? (
            <div style={{background: '#1e293b', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
              No vital signs records found for this patient
            </div>
          ) : (
            vitalSigns.map((record, index) => (
              <div key={index} style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{...valueStyle, fontSize: '18px'}}>
                    <i className="bi bi-calendar-check me-2"></i>
                    {formatDate(record.recordedAt)}
                  </div>
                </div>
                <div style={cardBodyStyle}>
                  {record.temp && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Temperature</span>
                      <div style={valueStyle}>{formatVitalSign('temp', record.temp)}</div>
                    </div>
                  )}
                  {record.o2sat && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>O2 Saturation</span>
                      <div style={valueStyle}>{formatVitalSign('o2sat', record.o2sat)}</div>
                    </div>
                  )}
                  {record.pulse && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Pulse Rate</span>
                      <div style={valueStyle}>{formatVitalSign('pulse', record.pulse)}</div>
                    </div>
                  )}
                  {record.respiration && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Respiratory Rate</span>
                      <div style={valueStyle}>{formatVitalSign('respiration', record.respiration)}</div>
                    </div>
                  )}
                  {record.ht && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Height</span>
                      <div style={valueStyle}>{formatVitalSign('ht', record.ht, true)}</div>
                    </div>
                  )}
                  {record.wt && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Weight</span>
                      <div style={valueStyle}>{formatVitalSign('wt', record.wt, true)}</div>
                    </div>
                  )}
                  {record.bp && (
                    <div style={vitalItemStyle}>
                      <span style={labelStyle}>Blood Pressure</span>
                      <div style={valueStyle}>{formatVitalSign('bp', record.bp)}</div>
                    </div>
                  )}
                </div>
                {record.cc && (
                  <div style={{marginTop: '15px', borderTop: '1px solid #334155', paddingTop: '15px'}}>
                    <span style={labelStyle}>Chief Complaint</span>
                    <div style={{...valueStyle, whiteSpace: 'pre-wrap'}}>{record.cc}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={popupFooterStyle}>
          <Button 
            variant="primary" 
            onClick={onHide}
            style={{backgroundColor: '#38bdf8', borderColor: '#38bdf8'}}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsHistory;
