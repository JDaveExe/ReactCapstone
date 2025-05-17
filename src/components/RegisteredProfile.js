import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import '../styles/AddNewPatientForm.css'; // Reusing the same styles

const API_URL = 'http://localhost:5000/api';

// Reusing the same address data from AddNewPatientForm
const pasigStreets = [
  'Amang Rodriguez Avenue', 'C. Raymundo Avenue', 'Ortigas Avenue', 'Shaw Boulevard',
  'E. Rodriguez Jr. Avenue (C-5)', 'Marcos Highway', 'Julia Vargas Avenue',
  'F. Legaspi Bridge', 'San Guillermo Street', 'Dr. Sixto Antonio Avenue', 'Other'
];
const streetToBarangay = {
  'Amang Rodriguez Avenue': ['Manggahan', 'Rosario', 'Dela Paz'],
  'C. Raymundo Avenue': ['Caniogan', 'Pineda', 'Rosario'],
  'Ortigas Avenue': ['San Antonio', 'Ugong', 'Kapitolyo'],
  'Shaw Boulevard': ['Kapitolyo', 'Oranbo', 'Bagong Ilog'],
  'E. Rodriguez Jr. Avenue (C-5)': ['Ugong', 'Bagong Ilog', 'Pinagbuhatan'],
  'Marcos Highway': ['Maybunga', 'Manggahan', 'Santolan'],
  'Julia Vargas Avenue': ['San Antonio', 'Oranbo', 'Ugong'],
  'F. Legaspi Bridge': ['San Joaquin', 'Kalawaan', 'Malinao'],
  'San Guillermo Street': ['San Jose', 'Pineda', 'Palatiw'],
  'Dr. Sixto Antonio Avenue': ['Kapasigan', 'Bagong Ilog', 'Caniogan'],
  'Other': ['Bagong Katipunan', 'Bagong Ilog', 'Bambang', 'Buting', 'Caniogan', 'Dela Paz', 'Kalawaan', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga', 'Oranbo', 'Palatiw', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad', 'San Antonio', 'San Joaquin', 'San Jose', 'San Miguel', 'San Nicolas', 'Santa Cruz', 'Santa Lucia', 'Santa Rosa', 'Santo Tomas', 'Santolan', 'Sumilang', 'Ugong']
};

export default function RegisteredProfile({ patient, onBack }) {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [families, setFamilies] = useState([]);

  // Function to fetch the user's profile data
  const fetchPatientData = async () => {
    setLoading(true);
    setError('');
    try {
      if (patient && patient.id) {
        // If critical details like firstName and email are missing, fetch the full record.
        if (typeof patient.firstName === 'undefined' && typeof patient.email === 'undefined') {
          try {
            const response = await axios.get(`${API_URL}/patients`);
            const fullPatientDetails = response.data.find(p => p.id === patient.id);
            if (fullPatientDetails) {
              setPatientData(fullPatientDetails);
            } else {
              setError(`Could not load full details for patient ${patient.name || `ID ${patient.id}`}.`);
            }
          } catch (apiErr) {
            setError(`Failed to retrieve complete data for patient ${patient.name || `ID ${patient.id}`}. Ensure /api/patients is working.`);
          }
        } else {
          // Patient prop seems to have detailed fields already.
          setPatientData(patient);
        }
      } else if (patient && Object.keys(patient).length > 0 && typeof patient.firstName !== 'undefined') {
          // Fallback: Patient prop exists, has no ID, but has firstName (less common scenario)
          setPatientData(patient);
      } else {
        setError('Patient data not provided or is incomplete.');
      }
    } catch (err) { // Catch errors from the main try block
      setError('Failed to load patient data. An unexpected error occurred.');
    }
    setLoading(false);
  };

  // Fetch families for reference
  const fetchFamilies = async () => {
    try {
      const response = await axios.get(`${API_URL}/families`);
      setFamilies(response.data);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchFamilies();
  }, [patient]);

  const getAvailableBarangays = (street) => {
    if (street) {
      return streetToBarangay[street] || [];
    }
    return streetToBarangay['Other'] || [];
  };
  // If loading, show a loading message
  if (loading) {
    return (
      <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
        <div style={{ textAlign: 'center', color: '#38bdf8', padding: '50px' }}>
          Loading patient data...
        </div>
      </Container>
    );
  }
  // If error, show error message
  if (error) {
    return (
      <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }
  // If no patient data, show an error
  if (!patientData) {
    return (
      <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
        <Alert variant="warning">
          No patient data available.
        </Alert>
      </Container>
    );
  }

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (err) {
      return 'Invalid date';
    }
  };
  return (
    <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#38bdf8', fontWeight: 700, fontSize: 28, margin: 0 }}>Registered Profile</h2>
      </div>
      
      <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px' }}>
        <Form>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">First Name</Form.Label>
                <Form.Control type="text" value={patientData.firstName || ''} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Middle Name</Form.Label>
                <Form.Control type="text" value={patientData.middleName || ''} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Last Name</Form.Label>
                <Form.Control type="text" value={patientData.lastName || ''} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Suffix</Form.Label>
                <Form.Control type="text" value={patientData.suffix || ''} readOnly />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-light">Email</Form.Label>
                <Form.Control type="email" value={patientData.email || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-light">Phone Number</Form.Label>
                <Form.Control type="text" value={patientData.phoneNumber || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-light">Membership Status</Form.Label>
                <Form.Control type="text" value={patientData.membershipStatus || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-light">PhilHealth Number</Form.Label>
                <Form.Control type="text" value={patientData.philHealthNumber || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">House No./Bldg No.</Form.Label>
                <Form.Control type="text" value={patientData.houseNo || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Street</Form.Label>
                <Form.Control type="text" value={patientData.street || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-light">Barangay</Form.Label>
                <Form.Control type="text" value={patientData.barangay || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-light">City</Form.Label>
                <Form.Control type="text" value={patientData.city || 'Pasig'} readOnly />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-light">Region</Form.Label>
                <Form.Control type="text" value={patientData.region || 'Metro Manila'} readOnly />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Date of Birth</Form.Label>
                <Form.Control type="text" value={formatDate(patientData.dateOfBirth)} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Age</Form.Label>
                <Form.Control type="text" value={patientData.age || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Gender</Form.Label>
                <Form.Control type="text" value={patientData.gender || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="text-light">Civil Status</Form.Label>
                <Form.Control type="text" value={patientData.civilStatus || 'Not provided'} readOnly />
              </Form.Group>
            </Col>
          </Row>        </Form>
      </div>
    </Container>
  );
}