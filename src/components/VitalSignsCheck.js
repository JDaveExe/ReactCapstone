import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap'; // Removed Modal
import axios from 'axios';
import VitalSignsHistory from './VitalSignsHistory';

const VitalSignsCheck = ({ show, onHide, patient, onComplete }) => {
  const [vitalSigns, setVitalSigns] = useState({
    date: new Date().toISOString().split('T')[0],
    age: '',
    cc: '', // Chief Complaint
    temp: '', // Temperature
    o2sat: '', // O2 Saturation
    pulse: '', // Pulse Rate
    ht: '', // Height    
    respiration: '', // Respiratory Rate
    wt: '30', // Weight - Default to 30kg
    bp: '', // Blood Pressure
  });  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' for centimeters, 'ft' for feet
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' for kilograms, 'lbs' for pounds
  const [showHistory, setShowHistory] = useState(false);
  const [previousVitalSigns, setPreviousVitalSigns] = useState(null);
  const [isCheckupCompleted, setIsCheckupCompleted] = useState(false);

  // Define styles similar to TreatmentRecord
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
  
  // Function to format height in feet and inches
  const formatHeightInFeet = (heightInCm) => {
    if (!heightInCm) return '';
    
    // Convert centimeters to inches (1cm = 0.393701 inches)
    const totalInches = heightInCm * 0.393701;
    
    // Calculate feet and remaining inches
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    
    // Handle edge case where inches is 12 (should become an additional foot)
    if (inches === 12) {
      return `${feet + 1}'0"`;
    }
    
    return `${feet}'${inches}"`;
  };

  // Function to fetch previous vital signs
  const fetchPreviousVitalSigns = async (patientId) => {
    if (!patientId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/vital-signs/patient/${patientId}`);
      // Sort vital signs by date, newest first
      const sortedVitalSigns = response.data.sort((a, b) => 
        new Date(b.recordedAt) - new Date(a.recordedAt)
      );
      
      if (sortedVitalSigns.length > 0) {
        // Get the most recent vital signs
        const latestVitalSigns = sortedVitalSigns[0];
        
        // Check if we need to convert height from meters to centimeters for older records
        // (Assuming older records might have height stored in meters)
        if (latestVitalSigns.ht && latestVitalSigns.ht < 3) {
          // If height is less than 3, it's probably in meters, so convert to cm
          latestVitalSigns.ht = latestVitalSigns.ht * 100;
        }
        
        setPreviousVitalSigns(latestVitalSigns);
        
        // Update height and weight from previous record if they exist
        setVitalSigns(prev => ({
          ...prev,
          ht: latestVitalSigns.ht || prev.ht,
          wt: latestVitalSigns.wt || prev.wt
        }));
      }
    } catch (err) {
      console.error('Error fetching previous vital signs:', err);
    }
  };
  
  // Reset form when modal is opened with new patient
  useEffect(() => {
    if (show && patient) {
      // Debug logging
      console.log("Patient data received:", patient);
      
      // Check if checkup is already completed
      if (patient.status === 'Completed' || patient.checkupCompleted || patient.vitalSignsChecked) {
        setIsCheckupCompleted(true);
        console.log("Checkup is already completed - setting form to read-only mode");
      } else {
        setIsCheckupCompleted(false);
      }
      
      // Create a local augmented patient object with defaults if needed
      const augmentedPatient = {
        ...patient,
        // If age is missing, provide a default
        age: patient.age || '30',
        // If dateOfBirth is missing, create a date 30 years ago
        dateOfBirth: patient.dateOfBirth || (new Date(new Date().setFullYear(new Date().getFullYear() - 30))).toISOString().split('T')[0]
      };
      
      console.log("Augmented patient:", augmentedPatient);
      console.log("Patient dateOfBirth:", augmentedPatient.dateOfBirth);
      console.log("Patient age property:", augmentedPatient.age);
      
      let calculatedAge = '';
      if (augmentedPatient.dateOfBirth) {
        try {
          const birthDate = new Date(augmentedPatient.dateOfBirth);
          console.log("Parsed birthDate:", birthDate);
          
          const today = new Date();
          let ageNum = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            ageNum--;
          }
          calculatedAge = ageNum >= 0 ? ageNum.toString() : '';
          console.log("Calculated age:", calculatedAge);
        } catch (e) {
          console.error("Error calculating age from dateOfBirth:", e);
          // Fallback to patient.age if calculation fails or dateOfBirth is invalid
          calculatedAge = augmentedPatient.age ? augmentedPatient.age.toString() : ''; 
          console.log("Falling back to patient.age:", calculatedAge);
        }
      } else if (augmentedPatient.age) {
        // Use patient.age if dateOfBirth is not available
        calculatedAge = augmentedPatient.age.toString();
        console.log("Using patient.age directly:", calculatedAge);
      } else {
        console.log("No age or dateOfBirth found in patient object");
      }

      // Force a specific age value for testing if nothing else works
      if (!calculatedAge && augmentedPatient && augmentedPatient.name) {
        // Use a hardcoded test value just to see if display works
        calculatedAge = "30";
        console.log("Using hardcoded test age:", calculatedAge);
      }

      setVitalSigns(prev => {
        const newState = {
          date: new Date().toISOString().split('T')[0],
          age: calculatedAge,
          cc: '', 
          temp: '',
          o2sat: '',
          pulse: '',
          ht: prev.ht || '',
          respiration: '',
          wt: prev.wt || '30',  // Default to 30kg if no previous value
          bp: '',
        };
        console.log("Setting vitalSigns state:", newState);
        return newState;
      });
      
      // Fetch previous vital signs if patient has ID
      if (patient.id || patient._id) {
        fetchPreviousVitalSigns(patient.id || patient._id);
      }
      
      setError(null);
      setSuccess(false);
    }
  }, [show, patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitalSigns(prev => ({
      ...prev,
      [name]: value
    }));
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create a copy of the vital signs data
      const vitalSignsData = {
        ...vitalSigns,
        // Height is already stored in centimeters in the state
        ht: vitalSigns.ht,
        wt: vitalSigns.wt,
        patientId: Number(patient.id), // Ensure patientId is stored as a number
        patientName: patient.name || `${patient.firstName} ${patient.lastName}`,
        checkupId: patient.checkupId || patient.id, // Assuming checkupId might be passed or fallback to patient.id
        recordedAt: new Date().toISOString()
      };
      const response = await axios.post('http://localhost:5000/api/vital-signs', vitalSignsData);
      
      console.log('Vital signs recorded:', response.data);
      setSuccess(true);
      
      if (onComplete) {
        onComplete({
          ...patient,
          vitalSigns: vitalSignsData,
          vitalSignsChecked: true
        });
      }
      
      setTimeout(() => {
        onHide(); // This will set show to false, hiding the popup
        // setSuccess(false); // Reset success after hiding, or before showing next time
      }, 1500);
      
    } catch (err) {
      console.error('Error recording vital signs:', err);
      setError(err.response?.data?.message || 'Failed to record vital signs');
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
            <i className="bi bi-activity me-2"></i>
            Vital Signs Check: {patient?.name || `${patient?.firstName} ${patient?.lastName}`}
          </h5>
          <button type="button" style={closeButtonStyle} onClick={onHide} aria-label="Close">
            &times;
          </button>
        </div>
        <div style={popupBodyStyle}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" style={{backgroundColor: '#dc3545', color: 'white'}}>
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4" style={{backgroundColor: '#198754', color: 'white'}}>
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div>Vital signs recorded successfully!</div>
            </div>
          )}
          
          {isCheckupCompleted && !error && !success && (
            <div className="alert d-flex align-items-center mb-4" style={{backgroundColor: '#0d6efd', color: 'white'}}>
              <i className="bi bi-info-circle-fill me-2 fs-5"></i>
              <div>This vital signs check is in read-only mode because the checkup has been completed.</div>
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
                    value={vitalSigns.date}
                    onChange={handleChange}
                    style={inputStyle}
                    readOnly // Make date field read-only
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Age:</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="age"
                    value={vitalSigns.age || '30'} 
                    onChange={handleChange}
                    placeholder="Age"
                    style={{
                      ...inputStyle,
                      // Make the text bolder and slightly larger for better visibility
                      fontWeight: '600',
                      fontSize: '16px',
                    }}
                    readOnly
                  />
                  {/* Always show age debug info */}
                  <div style={{
                    fontSize: '12px',
                    color: '#38bdf8',
                    marginTop: '4px'
                  }}>
                    {vitalSigns.age ? `Age: ${vitalSigns.age}` : 'Default age: 30'}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label style={labelStyle}>Chief Complaint:</Form.Label>
              <Form.Control 
                as="textarea"
                name="cc"
                value={vitalSigns.cc}
                onChange={handleChange}
                placeholder="Chief Complaint"
                style={textAreaStyle}
                readOnly={isCheckupCompleted}
                disabled={isCheckupCompleted}
              />
            </Form.Group>
            
            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Temperature:</Form.Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Form.Control 
                      type="number" 
                      name="temp"
                      value={vitalSigns.temp}
                      onChange={handleChange}
                      placeholder="36.5-37.5"
                      style={{ 
                        ...inputStyle, 
                        paddingRight: '60px',
                        opacity: isCheckupCompleted ? 0.7 : 1
                      }}
                      step="0.2"
                      min="35"
                      max="42"
                      readOnly={isCheckupCompleted}
                      disabled={isCheckupCompleted}
                    />
                    <span style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}>°C</span>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>O2 Saturation:</Form.Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Form.Control 
                      type="number" 
                      name="o2sat"
                      value={vitalSigns.o2sat}
                      onChange={handleChange}
                      placeholder="95-100"
                      style={{ ...inputStyle, paddingRight: '40px' }}
                      step="2"
                      min="80"
                      max="100"
                      readOnly={isCheckupCompleted}
                      disabled={isCheckupCompleted}
                    />
                    <span style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}>%</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Pulse Rate:</Form.Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Form.Control 
                      type="number" 
                      name="pulse"
                      value={vitalSigns.pulse}
                      onChange={handleChange}
                      placeholder="60-100"
                      style={{ ...inputStyle, paddingRight: '50px' }}
                      step="2"
                      min="40"
                      max="200"
                      readOnly={isCheckupCompleted}
                      disabled={isCheckupCompleted}
                    />
                    <span style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      color: '#94a3b8',
                      pointerEvents: 'none'
                    }}>BPM</span>
                  </div>
                </Form.Group>
              </Col>              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Height:</Form.Label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant={heightUnit === 'ft' ? 'primary' : 'outline-secondary'}
                      onClick={() => !isCheckupCompleted && setHeightUnit('ft')}
                      style={{
                        background: heightUnit === 'ft' ? '#1d4ed8' : '#1e293b',
                        borderColor: heightUnit === 'ft' ? '#1d4ed8' : '#334155',
                        color: '#ffffff',
                        flex: '0 0 50px',
                        borderRadius: '6px 0 0 6px',
                        fontWeight: heightUnit === 'ft' ? 'bold' : 'normal',
                        opacity: isCheckupCompleted ? 0.7 : 1
                      }}
                      disabled={isCheckupCompleted}
                    >
                      ft
                    </Button>                    <div style={{ position: 'relative', flex: 1 }}>
                      {heightUnit === 'cm' ? (
                        <Form.Control 
                          type="number" 
                          name="ht"
                          value={vitalSigns.ht || ''}
                          onChange={(e) => {
                            if (isCheckupCompleted) return;
                            const value = e.target.value;
                            setVitalSigns(prev => ({
                              ...prev,
                              ht: value
                            }));
                          }}
                          placeholder="Height in centimeters"
                          style={{
                            ...inputStyle, 
                            borderRadius: '0',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#ffffff',
                            textAlign: 'center',
                            background: '#131e31',
                            opacity: isCheckupCompleted ? 0.7 : 1
                          }}
                          step="1"
                          min="0"
                          max="300"
                          readOnly={isCheckupCompleted}
                          disabled={isCheckupCompleted}
                        />
                      ) : (
                        <div 
                          onClick={() => {
                            if (isCheckupCompleted) return;
                            // Show a custom input dialog for feet/inches
                            const currentHeight = vitalSigns.ht ? vitalSigns.ht * 0.393701 : 0;
                            const currentFeet = Math.floor(currentHeight / 12);
                            const currentInches = Math.round(currentHeight % 12);
                            
                            // This is simplified - in a real app you'd use a modal dialog
                            const feet = prompt("Enter feet:", currentFeet || "5");
                            if (feet !== null) {
                              const inches = prompt("Enter inches:", currentInches || "0");
                              if (inches !== null) {
                                // Convert to centimeters
                                const totalInches = (parseInt(feet) * 12) + parseInt(inches);
                                const heightInCentimeters = totalInches / 0.393701;
                                
                                setVitalSigns(prev => ({
                                  ...prev,
                                  ht: heightInCentimeters.toFixed(0)
                                }));
                              }
                            }
                          }}
                          style={{
                            ...inputStyle, 
                            borderRadius: '0',
                            fontSize: '16px',
                            fontWeight: '500',
                            color: '#ffffff',
                            textAlign: 'center',
                            background: '#1e293b',
                            cursor: isCheckupCompleted ? 'default' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '38px', // Same height as Form.Control
                            opacity: isCheckupCompleted ? 0.7 : 1
                          }}
                        >
                          {vitalSigns.ht ? formatHeightInFeet(vitalSigns.ht) : isCheckupCompleted ? "No height entered" : "Click to enter height"}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant={heightUnit === 'cm' ? 'primary' : 'outline-secondary'}
                      onClick={() => !isCheckupCompleted && setHeightUnit('cm')}
                      style={{
                        background: heightUnit === 'cm' ? '#1d4ed8' : '#1e293b',
                        borderColor: heightUnit === 'cm' ? '#1d4ed8' : '#334155',
                        color: '#ffffff',
                        flex: '0 0 50px',
                        borderRadius: '0 6px 6px 0',
                        fontWeight: heightUnit === 'cm' ? 'bold' : 'normal',
                        opacity: isCheckupCompleted ? 0.7 : 1
                      }}
                      disabled={isCheckupCompleted}
                    >
                      cm
                    </Button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'center' }}>
                    {heightUnit === 'cm' ? '1 cm = 0.3937 inches' : '1 ft = 30.48 cm'}
                  </div>
                  {previousVitalSigns && previousVitalSigns.ht && (
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px', textAlign: 'center' }}>
                      Previous: {heightUnit === 'cm' ? 
                        `${previousVitalSigns.ht} cm` : 
                        formatHeightInFeet(previousVitalSigns.ht)}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Respiratory Rate:</Form.Label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Form.Select 
                      name="respiration"
                      value={vitalSigns.respiration}
                      onChange={handleChange}
                      style={inputStyle}
                      disabled={isCheckupCompleted}
                    >
                      <option value="">Select respiratory rate</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i+10} value={i+10}>{i+10} breaths/min</option>
                      ))}
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Weight:</Form.Label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                      variant={weightUnit === 'kg' ? 'primary' : 'outline-secondary'}
                      onClick={() => !isCheckupCompleted && setWeightUnit('kg')}
                      style={{
                        background: weightUnit === 'kg' ? '#1d4ed8' : '#1e293b',
                        borderColor: weightUnit === 'kg' ? '#1d4ed8' : '#334155',
                        color: '#ffffff',
                        flex: '0 0 50px',
                        borderRadius: '6px 0 0 6px',
                        fontWeight: weightUnit === 'kg' ? 'bold' : 'normal',
                        opacity: isCheckupCompleted ? 0.7 : 1
                      }}
                      disabled={isCheckupCompleted}
                    >
                      kg
                    </Button>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Form.Control 
                        type="number" 
                        name="wt"
                        value={weightUnit === 'kg' ? 
                          (vitalSigns.wt || '30') : 
                          ((vitalSigns.wt || '30') * 2.20462).toFixed(1)}
                        onChange={(e) => {
                          if (isCheckupCompleted) return;
                          const value = e.target.value;
                          const weightValue = weightUnit === 'kg' ? value : value / 2.20462;
                          setVitalSigns(prev => ({
                            ...prev,
                            wt: value ? weightValue : '30' // Default to 30kg if cleared
                          }));
                        }}
                        placeholder={weightUnit === 'kg' ? "Weight in kg" : "Weight in lbs"}
                        style={{
                          ...inputStyle, 
                          borderRadius: '0',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: '#ffffff',
                          textAlign: 'center',
                          background: weightUnit === 'kg' ? '#131e31' : '#1e293b',
                          opacity: isCheckupCompleted ? 0.7 : 1
                        }}
                        step={weightUnit === 'kg' ? "0.2" : "1.0"}
                        min="0"
                        max={weightUnit === 'kg' ? "500" : "1100"}
                        readOnly={isCheckupCompleted}
                        disabled={isCheckupCompleted}
                      />
                    </div>
                    <Button 
                      variant={weightUnit === 'lbs' ? 'primary' : 'outline-secondary'}
                      onClick={() => !isCheckupCompleted && setWeightUnit('lbs')}
                      style={{
                        background: weightUnit === 'lbs' ? '#1d4ed8' : '#1e293b',
                        borderColor: weightUnit === 'lbs' ? '#1d4ed8' : '#334155',
                        color: '#ffffff',
                        flex: '0 0 50px',
                        borderRadius: '0 6px 6px 0',
                        fontWeight: weightUnit === 'lbs' ? 'bold' : 'normal',
                        opacity: isCheckupCompleted ? 0.7 : 1
                      }}
                      disabled={isCheckupCompleted}
                    >
                      lbs
                    </Button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'center' }}>
                    {weightUnit === 'kg' ? '1 kg = 2.2 lbs' : '1 lb = 0.454 kg'}
                  </div>
                  {previousVitalSigns && previousVitalSigns.wt && (
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px', textAlign: 'center' }}>
                      Previous: {weightUnit === 'kg' ? 
                        `${previousVitalSigns.wt} kg` : 
                        `${(previousVitalSigns.wt * 2.20462).toFixed(1)} lbs`}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3 g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={labelStyle}>Blood Pressure:</Form.Label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Form.Control 
                        type="number" 
                        name="bp"
                        value={vitalSigns.bp.split('/')[0] || ''}
                        onChange={(e) => {
                          if (isCheckupCompleted) return;
                          const systolic = e.target.value;
                          const diastolic = vitalSigns.bp.split('/')[1] || '';
                          setVitalSigns(prev => ({
                            ...prev,
                            bp: `${systolic}${diastolic ? '/' + diastolic : ''}`
                          }));
                        }}
                        placeholder="120"
                        style={{
                          ...inputStyle,
                          opacity: isCheckupCompleted ? 0.7 : 1
                        }}
                        min="70"
                        max="200"
                        step="5"
                        readOnly={isCheckupCompleted}
                        disabled={isCheckupCompleted}
                      />
                    </div>
                    <span style={{ color: '#94a3b8' }}>/</span>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Form.Control 
                        type="number" 
                        value={vitalSigns.bp.split('/')[1] || ''}
                        onChange={(e) => {
                          if (isCheckupCompleted) return;
                          const systolic = vitalSigns.bp.split('/')[0] || '';
                          const diastolic = e.target.value;
                          setVitalSigns(prev => ({
                            ...prev,
                            bp: `${systolic}/${diastolic}`
                          }));
                        }}
                        placeholder="80"
                        style={{
                          ...inputStyle,
                          opacity: isCheckupCompleted ? 0.7 : 1
                        }}
                        min="40"
                        max="120"
                        step="5"
                        readOnly={isCheckupCompleted}
                        disabled={isCheckupCompleted}
                      />
                    </div>
                    <span style={{ 
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>mmHg</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </div>
        <div style={popupFooterStyle}>
          <Button 
            variant="secondary" 
            onClick={() => setShowHistory(true)} 
            style={{
              backgroundColor: '#4b5563', 
              borderColor: '#4b5563',
              marginRight: 'auto' // This pushes it to the left
            }}
          >
            <i className="bi bi-clock-history me-2"></i>
            Vital Signs History
          </Button>
          <Button variant="secondary" onClick={onHide} disabled={loading} style={{backgroundColor: '#6c757d', borderColor: '#6c757d'}}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || success || isCheckupCompleted}
            style={{backgroundColor: '#38bdf8', borderColor: '#38bdf8'}}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Vital Signs'
            )}
          </Button>
            {/* Vital Signs History Modal */}
          <VitalSignsHistory 
            show={showHistory} 
            onHide={() => setShowHistory(false)} 
            patientId={Number(patient?.id)} // Ensure passing as number
          />
        </div>
      </div>
    </div>
  );
};

export default VitalSignsCheck;
