import React, { useState, useContext, useEffect } from 'react';
import { Card, Accordion, Button, Container, Modal, Form, Row, Col } from 'react-bootstrap';
import DateTimeContext from '../contexts/DateTimeContext';
import CheckUpContext from '../contexts/CheckUpContext';
import axios from 'axios';

const Asettings = () => {
  const { simulatedDate, setSimulationDate, isSimulated } = useContext(DateTimeContext);
  const { resetTodaysCheckUps } = useContext(CheckUpContext);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
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
      <Container fluid className="py-4 fade-in">
        <Accordion defaultActiveKey="0" className="dashboard-card">
        {/* User Management Section */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <i className="bi bi-people-fill me-2"></i> User Management
          </Accordion.Header>
          <Accordion.Body>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-person-plus me-2"></i> Add User
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-pencil-square me-2"></i> View/Edit User
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-shield-lock me-2"></i> Role & Permission
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-key me-2"></i> Reset Password
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* System Configuration Section */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <i className="bi bi-gear-fill me-2"></i> System Configuration
          </Accordion.Header>
          <Accordion.Body>
            <h5 className="mb-3"><i className="bi bi-hospital me-2"></i> Clinic & Information</h5>
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                className="text-start"
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
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-database me-2"></i> Data Retention
              </Button>
              <Button 
                variant="outline-danger" 
                className="text-start"
                onClick={() => setShowResetConfirmModal(true)}
              >
                <i className="bi bi-arrow-clockwise me-2"></i> Reset Check-Ups Data
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Access Control Section */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <i className="bi bi-shield-fill me-2"></i> Access Control
          </Accordion.Header>
          <Accordion.Body>
            <h5 className="mb-3"><i className="bi bi-person-badge me-2"></i> Role Management</h5>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-lock-fill me-2"></i> Access Right
              </Button>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Backup and Restore Section */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <i className="bi bi-cloud-arrow-up-fill me-2"></i> Backup and Restore
          </Accordion.Header>
          <Accordion.Body>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="backupSwitch" 
                style={{ transform: 'scale(1.5)' }}
              />
              <label className="form-check-label ms-3 fs-5" htmlFor="backupSwitch">
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
          </>
        )}
      </Modal.Footer>
    </Modal>
    </React.Fragment>
  );
};

export default Asettings;