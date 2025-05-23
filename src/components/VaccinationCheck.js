import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { Shield } from 'lucide-react';

const VaccinationCheck = ({ show, onHide, patient, onComplete }) => {
  const [vaccination, setVaccination] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '', // Vaccination name
    notes: '' // Additional notes
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [immunizationHistory, setImmunizationHistory] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Define vaccine options based on the requirements
  const vaccineOptions = [
    { id: 1, name: "BCG (Bacillus Calmette-Guérin)", description: "Administered at birth to prevent tuberculosis." },
    { id: 2, name: "Hepatitis B Vaccine", description: "Given at birth and as part of the Pentavalent vaccine series." },
    { id: 3, name: "Pentavalent Vaccine (DTP-HepB-Hib)", description: "Protects against diphtheria, tetanus, pertussis, hepatitis B, and Haemophilus influenzae type B; administered at 6, 10, and 14 weeks." },
    { id: 4, name: "Oral Polio Vaccine (OPV) & Inactivated Polio Vaccine (IPV)", description: "Given at 6, 10, and 14 weeks, with boosters at 9 months and 4–6 years." },
    { id: 5, name: "Pneumococcal Conjugate Vaccine (PCV)", description: "Administered at 6, 10, and 14 weeks, with a booster at 12–15 months." },
    { id: 6, name: "Measles, Mumps, and Rubella (MMR) Vaccine", description: "First dose at 9 months, second at 12–15 months, and a third at 4–6 years." },
    { id: 7, name: "Japanese Encephalitis (JE) Vaccine", description: "Given at 12 months." },
    { id: 8, name: "Influenza Vaccine", description: "First dose at 6 months, with annual boosters." },
    { id: 9, name: "Rotavirus Vaccine", description: "Administered orally starting at 6 weeks, depending on the vaccine type." },
    { id: 10, name: "Rabies Vaccine", description: "Recently included in the routine immunization schedule." }
  ];

  // Define styles similar to VitalSignsCheck
  const labelStyle = { color: '#38bdf8', fontSize: '14px', marginBottom: '4px', display: 'block' };
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
  const textAreaStyle = { ...inputBaseStyle, minHeight: '80px', resize: 'vertical' };

  // Custom pop-up styles
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
    maxWidth: '1140px', // Equivalent to Bootstrap's XL
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

  // Function to fetch immunization history
  const fetchImmunizationHistory = async (patientId) => {
    if (!patientId) return;
    
    try {
      // This would be replaced with an actual API call in your implementation
      // For now, we'll use a mock response
      const mockData = [
        { id: 1, name: "BCG", dateReceived: "2022-05-15", given: "Yes" },
        { id: 2, name: "Hepatitis B", dateReceived: "2022-06-20", given: "Yes" },
        { id: 3, name: "Polio (OPV)", dateReceived: "2022-07-10", given: "Yes" },
        { id: 4, name: "DTaP", dateReceived: "2022-08-05", given: "Yes" },
        { id: 5, name: "MMR", dateReceived: "", given: "No" },
      ];
      
      setImmunizationHistory(mockData);
    } catch (err) {
      console.error('Error fetching immunization history:', err);
    }
  };
  
  // Reset form when modal is opened with new patient
  useEffect(() => {
    if (show && patient) {
      console.log("Patient data received in VaccinationCheck:", patient);
      
      // Check if vaccination is already completed
      if (patient.status === 'Completed' || patient.vaccinationCompleted) {
        setIsCompleted(true);
        console.log("Vaccination is already completed - setting form to read-only mode");
      } else {
        setIsCompleted(false);
      }
      
      setVaccination({
        date: new Date().toISOString().split('T')[0],
        name: '',
        notes: ''
      });
      
      // Fetch immunization history if patient has ID
      if (patient.id || patient._id) {
        fetchImmunizationHistory(patient.id || patient._id);
      }
      
      setError(null);
      setSuccess(false);
    }
  }, [show, patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVaccination(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create a copy of the vaccination data
      const vaccinationData = {
        ...vaccination,
        patientId: Number(patient.id), // Ensure patientId is stored as a number
        patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
        checkupId: patient.checkupId || patient.id, // Assuming checkupId might be passed or fallback to patient.id
        recordedAt: new Date().toISOString()
      };

      // This would be an actual API call in your implementation
      // For now, we'll simulate a successful response
      console.log('Vaccination recorded:', vaccinationData);
      setSuccess(true);
      
      if (onComplete) {
        onComplete({
          ...patient,
          vaccination: vaccinationData,
          vaccinationCompleted: true
        });
      }
      
      setTimeout(() => {
        onHide(); // This will set show to false, hiding the popup
      }, 1500);
      
    } catch (err) {
      console.error('Error recording vaccination:', err);
      setError(err.response?.data?.message || 'Failed to record vaccination');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div style={popupOverlayStyle}>
      <div style={popupContentStyle}>
        <div style={popupHeaderStyle}>
          <h5 style={popupTitleStyle}>
            <Shield size={18} style={{ marginRight: '8px' }} />
            Vaccination: {patient?.name || `${patient?.firstName} ${patient?.lastName}`}
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
              <div>Vaccination recorded successfully!</div>
            </div>
          )}
          
          {isCompleted && !error && !success && (
            <div className="alert d-flex align-items-center mb-4" style={{backgroundColor: '#0d6efd', color: 'white'}}>
              <div>This vaccination record is in read-only mode because the checkup has been completed.</div>
            </div>
          )}
          
          <Form onSubmit={handleSubmit} style={{background: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155'}}>
            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Date:</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="date"
                    value={vaccination.date}
                    onChange={handleChange}
                    style={inputStyle}
                    readOnly={isCompleted}
                    disabled={isCompleted}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Vaccine:</Form.Label>
                  <Form.Select
                    name="name"
                    value={vaccination.name}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isCompleted}
                  >
                    <option value="">Select a vaccine</option>
                    {vaccineOptions.map(vaccine => (
                      <option key={vaccine.id} value={vaccine.name}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {vaccination.name && (
              <div className="mb-3" style={{
                padding: '10px',
                backgroundColor: '#0c4a6e',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {vaccineOptions.find(v => v.name === vaccination.name)?.description}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Notes:</Form.Label>
              <Form.Control 
                as="textarea"
                name="notes"
                value={vaccination.notes}
                onChange={handleChange}
                placeholder="Additional notes"
                style={textAreaStyle}
                disabled={isCompleted}
              />
            </Form.Group>

            <div className="mb-4">
              <h5 style={{ fontSize: '16px', color: '#38bdf8', marginBottom: '12px' }}>Immunization History</h5>
              {immunizationHistory.length > 0 ? (
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  background: '#0f172a', 
                  borderRadius: '6px', 
                  padding: '10px',
                  border: '1px solid #334155'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#94a3b8' }}>Vaccination</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#94a3b8' }}>Date</th>
                        <th style={{ padding: '8px', textAlign: 'left', color: '#94a3b8' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {immunizationHistory.map((record, index) => (
                        <tr key={index} style={{ borderBottom: index < immunizationHistory.length - 1 ? '1px solid #1e293b' : 'none' }}>
                          <td style={{ padding: '8px', color: '#e5e7eb' }}>{record.name}</td>
                          <td style={{ padding: '8px', color: '#e5e7eb' }}>
                            {record.dateReceived ? new Date(record.dateReceived).toLocaleDateString() : 'Not received'}
                          </td>
                          <td style={{ padding: '8px', color: record.given === 'Yes' ? '#10b981' : '#ef4444' }}>
                            {record.given}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', padding: '10px', textAlign: 'center' }}>
                  No vaccination history available
                </div>
              )}
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
            disabled={loading || success || isCompleted || !vaccination.name}
            style={{backgroundColor: '#38bdf8', borderColor: '#38bdf8'}}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Record Vaccination'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VaccinationCheck;
