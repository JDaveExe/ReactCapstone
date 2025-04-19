import React from 'react';
import { Card, Accordion, Button, Container } from 'react-bootstrap';

const Asettings = () => {
  return (
    <Container fluid className="py-4">
      <Accordion defaultActiveKey="0">
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
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-calendar-date me-2"></i> Date & Time
              </Button>
              <Button variant="outline-primary" className="text-start">
                <i className="bi bi-database me-2"></i> Data Retention
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
  );
};

export default Asettings;