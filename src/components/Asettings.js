import React, { useState, useContext, useEffect } from 'react';
import { Card, Accordion, Button, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import DateTimeContext from '../contexts/DateTimeContext';
import CheckUpContext from '../contexts/CheckUpContext';
import axios from 'axios';
import '../styles/Asettings.css';

const Asettings = () => {
  const { simulatedDate, setSimulationDate, isSimulated } = useContext(DateTimeContext);
  const { resetTodaysCheckUps } = useContext(CheckUpContext);  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  
  // Vaccine Management States
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineFormData, setVaccineFormData] = useState({
    name: '',
    description: '',
    ageGroup: '',
    dosage: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stock: 0
  });
  const [vaccineLoading, setVaccineLoading] = useState(false);
  const [vaccineSuccess, setVaccineSuccess] = useState(null);
  
  // Medication Management States
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationFormData, setMedicationFormData] = useState({
    name: '',
    type: '',
    strength: '',
    form: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stock: 0,
    description: ''
  });
  const [medicationLoading, setMedicationLoading] = useState(false);
  const [medicationSuccess, setMedicationSuccess] = useState(null);

  // Vaccine options from VaccinationCheck.js
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

  // Medication options from Sessions.js
  const medicationOptions = [
    "Folic Acid 5mg tablet", "Hydrocortisone 100mg/mL inj", "Hydrite (ORS)",
    "Iron + Folic Acid (IFA) tablet", "Lagundi 300mg tablet", "Lagundi 600mg tablet",
    "Mefenamic Acid 500mg tablet", "Metoprolol 50mg tablet", "Metronidazole 500mg tablet",
    "Multivitamins drops", "Multivitamins syrup", "Multivitamins + Iron drops",
    "Multivitamins + Iron syrup", "Paracetamol 250mg/5mL syrup", "Paracetamol 500mg tablet",
    "Paracetamol 100mg/mL drops", "Salbutamol 2mg/5mL syrup", "Vitamin A 100,000 IU",
    "Vitamin A 200,000 IU", "Vitamin C 100mg chewable tablet", "Vitamin C drops",
    "Vitamin C syrup", "Ascorbic Acid 100mg chewable tablet", "Ascorbic Acid 250mg/5mL syrup",
    "Aluminum Magnesium (Antacid) 200mg/200mg/20mg per 5mL", "Amoxicillin Trihydrate 500mg capsule",
    "Amoxicillin Trihydrate 250mg/5mL suspension", "Amoxicillin Trihydrate 500mg/5mL suspension",
    "Amoxicillin + Clavulanic Acid 228mg/5mL suspension", "Ambroxol 30mg/5mL syrup",    "Ambroxol 500mg tablet", "Cetirizine 10mg tablet", "Cetirizine 5mg/5mL syrup"  ];

  // Custom modal styles for dark theme
  const modalLabelStyle = { 
    color: '#38bdf8', 
    fontSize: '14px', 
    marginBottom: '4px', 
    display: 'block',
    fontWeight: '500'
  };
  
  const modalInputStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const modalSelectStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  };
  
  const modalTextAreaStyle = {
    background: '#1e293b',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box'
  };

  const requiredStyle = {
    color: '#ef4444',
    marginLeft: '2px',
    fontSize: '14px'
  };

  // Vaccine Management Handlers
  const handleVaccineFormChange = (e) => {
    const { name, value, type } = e.target;
    setVaccineFormData({
      ...vaccineFormData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleAddVaccine = async () => {
    setVaccineLoading(true);
    setVaccineSuccess(null);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              id: Date.now(),
              ...vaccineFormData,
              dateAdded: new Date().toISOString()
            }
          });
        }, 1000);
      });

      setVaccineSuccess({
        status: 'success',
        message: 'Vaccine added successfully!',
        details: `${vaccineFormData.name} has been added to the vaccine inventory.`
      });

      // Reset form
      setVaccineFormData({
        name: '',
        description: '',
        ageGroup: '',
        dosage: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        stock: 0
      });

      // Close modal after 2 seconds
      setTimeout(() => setShowVaccineModal(false), 2000);
    } catch (error) {
      console.error('Error adding vaccine:', error);
      setVaccineSuccess({
        status: 'error',
        message: 'Failed to add vaccine',
        details: error.message
      });
    } finally {
      setVaccineLoading(false);
    }
  };

  // Medication Management Handlers
  const handleMedicationFormChange = (e) => {
    const { name, value, type } = e.target;
    setMedicationFormData({
      ...medicationFormData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleAddMedication = async () => {
    setMedicationLoading(true);
    setMedicationSuccess(null);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              id: Date.now(),
              ...medicationFormData,
              dateAdded: new Date().toISOString()
            }
          });
        }, 1000);
      });

      setMedicationSuccess({
        status: 'success',
        message: 'Medication added successfully!',
        details: `${medicationFormData.name} has been added to the medication inventory.`
      });

      // Reset form
      setMedicationFormData({
        name: '',
        type: '',
        strength: '',
        form: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        stock: 0,
        description: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => setShowMedicationModal(false), 2000);
    } catch (error) {
      console.error('Error adding medication:', error);
      setMedicationSuccess({
        status: 'error',
        message: 'Failed to add medication',
        details: error.message
      });
    } finally {
      setMedicationLoading(false);
    }
  };
  const [dateTimeConfig, setDateTimeConfig] = useState({
    date: simulatedDate ? simulatedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: simulatedDate ? 
      `${String(simulatedDate.getHours()).padStart(2, '0')}:${String(simulatedDate.getMinutes()).padStart(2, '0')}` : 
      `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
    useSimulation: isSimulated
  });

  // Update the dateTimeConfig when simulatedDate changes
  useEffect(() => {
    if (simulatedDate) {
      setDateTimeConfig({
        date: simulatedDate.toISOString().split('T')[0],
        time: `${String(simulatedDate.getHours()).padStart(2, '0')}:${String(simulatedDate.getMinutes()).padStart(2, '0')}`,
        useSimulation: true
      });
    }
  }, [simulatedDate]);

  // Handle saving the date and time configuration
  const handleSaveDateTimeConfig = () => {
    if (dateTimeConfig.useSimulation) {
      const [hours, minutes] = dateTimeConfig.time.split(':').map(Number);
      const simulatedDate = new Date(dateTimeConfig.date);
      simulatedDate.setHours(hours, minutes, 0, 0);
      setSimulationDate(simulatedDate);
    } else {
      setSimulationDate(null); // Disable simulation
    }
    setShowDateTimeModal(false);
  };

  // Handle input changes
  const handleDateTimeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDateTimeConfig({
      ...dateTimeConfig,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle reset checkups data
  const resetCheckUps = async () => {
    setResetLoading(true);
    setResetSuccess(null);
    
    try {
      // Use the context function to reset checkups
      const response = await resetTodaysCheckUps();
      console.log('Reset checkups response:', response);
      
      setResetSuccess({
        status: 'success',
        message: 'Check-ups data has been successfully reset',
        details: `${response.checkUps.length} entries in the new list`
      });
      
      // Close the modal after 3 seconds
      setTimeout(() => setShowResetConfirmModal(false), 3000);
    } catch (error) {
      console.error('Error resetting checkups data:', error);
      setResetSuccess({
        status: 'error',
        message: 'Failed to reset check-ups data',
        details: error.message
      });
    } finally {
      setResetLoading(false);
    }
  };
    
  return (
    <React.Fragment>
      <Container fluid className="py-4 fade-in">        <Accordion defaultActiveKey="0" className="dashboard-card settings-accordion">
        {/* User Management Section */}
        <Accordion.Item eventKey="0" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-people-fill me-2"></i> User Management
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-person-plus me-2"></i> Add User
              </Button>
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-pencil-square me-2"></i> View/Edit User
              </Button>
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-shield-lock me-2"></i> Role & Permission
              </Button>
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-key me-2"></i> Reset Password
              </Button>
            </div>
          </Accordion.Body></Accordion.Item>

        {/* Vaccine & Prescription Management Section */}
        <Accordion.Item eventKey="1" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-capsule me-2"></i> Vaccine & Prescription Management
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <h5 className="mb-3 settings-section-title">
              <i className="bi bi-shield-plus me-2"></i> Vaccine Management
            </h5>            <div className="d-grid gap-2 mb-4">
              <Button 
                variant="outline-success" 
                className="text-start settings-btn"
                onClick={() => setShowVaccineModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Add New Vaccine
              </Button>
              <Button variant="outline-success" className="text-start settings-btn">
                <i className="bi bi-list-ul me-2"></i> View Vaccine Inventory
              </Button>
              <Button variant="outline-success" className="text-start settings-btn">
                <i className="bi bi-calendar-check me-2"></i> Vaccination Schedule
              </Button>
              <Button variant="outline-success" className="text-start settings-btn">
                <i className="bi bi-graph-up me-2"></i> Vaccination Reports
              </Button>
            </div>
            
            <h5 className="mb-3 settings-section-title">
              <i className="bi bi-prescription2 me-2"></i> Prescription Management
            </h5>            <div className="d-grid gap-2">
              <Button 
                variant="outline-info" 
                className="text-start settings-btn"
                onClick={() => setShowMedicationModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i> Add New Medication
              </Button>
              <Button variant="outline-info" className="text-start settings-btn">
                <i className="bi bi-clipboard-data me-2"></i> Prescription Templates
              </Button>
              <Button variant="outline-info" className="text-start settings-btn">
                <i className="bi bi-archive me-2"></i> Medication Inventory
              </Button>
              <Button variant="outline-info" className="text-start settings-btn">
                <i className="bi bi-exclamation-triangle me-2"></i> Expiry Alerts
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>        {/* System Configuration Section */}
        <Accordion.Item eventKey="2" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-gear-fill me-2"></i> System Configuration
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <h5 className="mb-3 settings-section-title"><i className="bi bi-hospital me-2"></i> Clinic & Information</h5>
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                className="text-start settings-btn"
                onClick={() => setShowDateTimeModal(true)}
              >
                <i className="bi bi-calendar-date me-2"></i> Date & Time
                {isSimulated && (
                  <span className="ms-2 badge bg-info">
                    <i className="bi bi-clock-history me-1"></i>
                    Simulated: {simulatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </Button>
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-database me-2"></i> Data Retention
              </Button>
              <Button 
                variant="outline-danger" 
                className="text-start settings-btn"
                onClick={() => setShowResetConfirmModal(true)}
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Check-Ups Data
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Access Control Section */}
        <Accordion.Item eventKey="3" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-shield-fill me-2"></i> Access Control
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <h5 className="mb-3 settings-section-title"><i className="bi bi-person-badge me-2"></i> Role Management</h5>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start settings-btn">
                <i className="bi bi-lock-fill me-2"></i> Access Right
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Backup and Restore Section */}
        <Accordion.Item eventKey="4" className="settings-accordion-item">
          <Accordion.Header className="settings-accordion-header">
            <i className="bi bi-cloud-arrow-up-fill me-2"></i> Backup and Restore
          </Accordion.Header>
          <Accordion.Body className="settings-accordion-body">
            <div className="form-check form-switch">
              <input 
                className="form-check-input backup-switch" 
                type="checkbox" 
                id="backupSwitch" 
                style={{ transform: 'scale(1.5)' }}
              />
              <label className="form-check-label ms-3 fs-5 backup-label" htmlFor="backupSwitch">
                Enable Backup System
              </label>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      </Container>

      {/* Date & Time Configuration Modal */}
      <Modal 
        show={showDateTimeModal} 
        onHide={() => setShowDateTimeModal(false)}
        backdrop="static"
        centered
        className="date-time-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>
            <i className="bi bi-calendar-date me-2"></i>
            Date & Time Configuration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="mb-3 pb-3 border-bottom">
          <Form.Check 
            type="switch"
            id="simulation-switch"
            name="useSimulation"
            label="Enable Date & Time Simulation"
            checked={dateTimeConfig.useSimulation}
            onChange={handleDateTimeChange}
            className="fs-5"
          />
          <div className="text-muted mt-2 fs-6">
            {dateTimeConfig.useSimulation 
              ? "Simulation is active. All system features will use the date and time set below." 
              : "System will use your actual system date and time."}
          </div>
        </div>

        {dateTimeConfig.useSimulation && (
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={dateTimeConfig.date}
                  onChange={handleDateTimeChange}
                  className="date-input"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={dateTimeConfig.time}
                  onChange={handleDateTimeChange}
                  className="time-input"
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        {dateTimeConfig.useSimulation && (
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
            <div>
              <strong>Simulation Mode:</strong> The simulated date and time will be displayed throughout the application. This affects all date-dependent features.
            </div>
          </div>
        )}
        </Modal.Body>
        <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={() => setShowDateTimeModal(false)}>
          Cancel
        </Button>
        {dateTimeConfig.useSimulation && (
          <Button 
            variant="outline-info" 
            onClick={() => {
              const now = new Date();
              setDateTimeConfig({
                date: now.toISOString().split('T')[0],
                time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                useSimulation: true
              });
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reset to Current Date/Time
          </Button>
        )}
        <Button variant="primary" onClick={handleSaveDateTimeConfig}>
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Reset Check-Ups Confirmation Modal */}
    <Modal
      show={showResetConfirmModal}
      onHide={() => !resetLoading && setShowResetConfirmModal(false)}
      backdrop="static"
      centered
      className="date-time-modal"
    >
      <Modal.Header closeButton={!resetLoading} className="border-0 pb-0">
        <Modal.Title>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Reset Check-Ups Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resetSuccess ? (
          <div className={`alert alert-${resetSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${resetSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{resetSuccess.message}</strong>
              <p className="mb-0 mt-1">{resetSuccess.details}</p>
            </div>
          </div>
        ) : (
          <>
            <p>Are you sure you want to reset the "Check-Ups Today" data?</p>
            <div className="alert alert-warning d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>
                <strong>Warning:</strong> This will clear all current check-ups data and reload appointments scheduled for today. This action cannot be undone.
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        {!resetSuccess && (
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowResetConfirmModal(false)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={resetCheckUps}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting...
                </>
              ) : (
                'Reset Check-Ups'
              )}
            </Button>
          </>
        )}
        {resetSuccess && resetSuccess.status === 'success' && (
          <Button 
            variant="success" 
            onClick={() => setShowResetConfirmModal(false)}
          >
            Close
          </Button>
        )}
        {resetSuccess && resetSuccess.status === 'error' && (
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowResetConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={resetCheckUps}
            >
              Try Again
            </Button>
          </>        )}
      </Modal.Footer>
    </Modal>    {/* Add New Vaccine Modal */}
    {showVaccineModal && (
      <div style={{
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
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-shield-plus me-2"></i>
              Add New Vaccine
            </h4>
            {!vaccineLoading && (
              <button
                onClick={() => setShowVaccineModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
        {vaccineSuccess ? (
          <div className={`alert alert-${vaccineSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${vaccineSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{vaccineSuccess.message}</strong>
              <p className="mb-0 mt-1">{vaccineSuccess.details}</p>
            </div>
          </div>
        ) : (          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Vaccine Name <span style={requiredStyle}>*</span></label>
                  <Form.Select
                    name="name"
                    value={vaccineFormData.name}
                    onChange={handleVaccineFormChange}
                    required
                    style={modalSelectStyle}
                  >
                    <option value="">Select a vaccine...</option>
                    {vaccineOptions.map((vaccine) => (
                      <option key={vaccine.id} value={vaccine.name}>
                        {vaccine.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Age Group</label>
                  <Form.Select
                    name="ageGroup"
                    value={vaccineFormData.ageGroup}
                    onChange={handleVaccineFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select age group...</option>
                    <option value="Newborn (0-1 month)">Newborn (0-1 month)</option>
                    <option value="Infant (1-12 months)">Infant (1-12 months)</option>
                    <option value="Toddler (1-3 years)">Toddler (1-3 years)</option>
                    <option value="Child (4-12 years)">Child (4-12 years)</option>
                    <option value="Adolescent (13-18 years)">Adolescent (13-18 years)</option>
                    <option value="Adult (18+ years)">Adult (18+ years)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Dosage</label>
                  <Form.Control
                    type="text"
                    name="dosage"
                    value={vaccineFormData.dosage}
                    onChange={handleVaccineFormChange}
                    placeholder="e.g., 0.5mL"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Manufacturer</label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={vaccineFormData.manufacturer}
                    onChange={handleVaccineFormChange}
                    placeholder="Enter manufacturer name"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Batch Number</label>
                  <Form.Control
                    type="text"
                    name="batchNumber"
                    value={vaccineFormData.batchNumber}
                    onChange={handleVaccineFormChange}
                    placeholder="Enter batch number"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Expiry Date</label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={vaccineFormData.expiryDate}
                    onChange={handleVaccineFormChange}
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Stock Quantity</label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={vaccineFormData.stock}
                    onChange={handleVaccineFormChange}
                    min="0"
                    placeholder="0"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <label style={modalLabelStyle}>Description</label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={vaccineFormData.description}
                onChange={handleVaccineFormChange}
                placeholder="Enter vaccine description or notes..."
                style={modalTextAreaStyle}
              />
            </Form.Group>
          </Form>)}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!vaccineSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowVaccineModal(false)}
                  disabled={vaccineLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleAddVaccine}
                  disabled={vaccineLoading || !vaccineFormData.name}
                >
                  {vaccineLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding Vaccine...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Vaccine
                    </>
                  )}
                </Button>
              </>
            )}
            {vaccineSuccess && vaccineSuccess.status === 'success' && (
              <Button 
                variant="success" 
                onClick={() => setShowVaccineModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {vaccineSuccess && vaccineSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowVaccineModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleAddVaccine}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )}    {/* Add New Medication Modal */}
    {showMedicationModal && (
      <div style={{
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
      }}>
        <div style={{
          background: '#0f172a',
          color: '#e5e7eb',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 1050,
        }}>
          <div style={{
            padding: '15px 20px',
            color: '#38bdf8',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              <i className="bi bi-capsule me-2"></i>
              Add New Medication
            </h4>
            {!medicationLoading && (
              <button
                onClick={() => setShowMedicationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                ×
              </button>
            )}
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
        {medicationSuccess ? (
          <div className={`alert alert-${medicationSuccess.status === 'success' ? 'success' : 'danger'} d-flex align-items-center`}>
            <i className={`bi me-2 fs-4 ${medicationSuccess.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <div>
              <strong>{medicationSuccess.message}</strong>
              <p className="mb-0 mt-1">{medicationSuccess.details}</p>
            </div>
          </div>
        ) : (          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Medication Name <span style={requiredStyle}>*</span></label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={medicationFormData.name}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter medication name"
                    required
                    style={modalInputStyle}
                  />
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Or select from existing: 
                    <Form.Select
                      className="mt-1"
                      onChange={(e) => setMedicationFormData({...medicationFormData, name: e.target.value})}
                      value=""
                      style={{...modalSelectStyle, fontSize: '12px'}}
                    >
                      <option value="">Choose from existing...</option>
                      {medicationOptions.map((med, index) => (
                        <option key={index} value={med}>{med}</option>
                      ))}
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Medication Type</label>
                  <Form.Select
                    name="type"
                    value={medicationFormData.type}
                    onChange={handleMedicationFormChange}
                    style={modalSelectStyle}
                  >
                    <option value="">Select type...</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Drops">Drops</option>
                    <option value="Injection">Injection</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Inhaler">Inhaler</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Strength</label>
                  <Form.Control
                    type="text"
                    name="strength"
                    value={medicationFormData.strength}
                    onChange={handleMedicationFormChange}
                    placeholder="e.g., 500mg, 5mg/5mL"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Form</label>
                  <Form.Control
                    type="text"
                    name="form"
                    value={medicationFormData.form}
                    onChange={handleMedicationFormChange}
                    placeholder="e.g., tablet, capsule"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Manufacturer</label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={medicationFormData.manufacturer}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter manufacturer"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Batch Number</label>
                  <Form.Control
                    type="text"
                    name="batchNumber"
                    value={medicationFormData.batchNumber}
                    onChange={handleMedicationFormChange}
                    placeholder="Enter batch number"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Expiry Date</label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={medicationFormData.expiryDate}
                    onChange={handleMedicationFormChange}
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <label style={modalLabelStyle}>Stock Quantity</label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={medicationFormData.stock}
                    onChange={handleMedicationFormChange}
                    min="0"
                    placeholder="0"
                    style={modalInputStyle}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <label style={modalLabelStyle}>Description</label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={medicationFormData.description}
                onChange={handleMedicationFormChange}
                placeholder="Enter medication description, usage instructions, or notes..."
                style={modalTextAreaStyle}
              />
            </Form.Group>
          </Form>
        )}
          </div>
          <div style={{
            padding: '15px 20px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            {!medicationSuccess && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowMedicationModal(false)}
                  disabled={medicationLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="info" 
                  onClick={handleAddMedication}
                  disabled={medicationLoading || !medicationFormData.name}
                >
                  {medicationLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding Medication...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Medication
                    </>
                  )}
                </Button>
              </>
            )}
            {medicationSuccess && medicationSuccess.status === 'success' && (
              <Button 
                variant="info" 
                onClick={() => setShowMedicationModal(false)}
              >
                <i className="bi bi-check-circle me-1"></i>
                Close
              </Button>
            )}
            {medicationSuccess && medicationSuccess.status === 'error' && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowMedicationModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="info" 
                  onClick={handleAddMedication}
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </React.Fragment>
  );
};

export default Asettings;