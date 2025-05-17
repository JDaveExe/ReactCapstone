import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import '../styles/AddNewPatientForm.css'; // Reusing the same styles
import { ArrowLeftCircle, AlertTriangle, Loader2 } from 'lucide-react'; // Added icons

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
      // If we have a patient ID, fetch directly from the single patient endpoint
      if (patient && patient.id) {
        try {
          console.log(`Fetching patient data for ID: ${patient.id}`);
          const response = await axios.get(`${API_URL}/patients/${patient.id}`);
          
          if (response.data) {
            console.log("Patient data retrieved successfully:", response.data);
            setPatientData(response.data);
          } else {
            setError(`No data returned for patient ID ${patient.id}.`);
          }
        } catch (apiErr) {
          console.error("API error:", apiErr);
          if (apiErr.response && apiErr.response.status === 404) {
            setError(`Patient with ID ${patient.id} not found.`);
          } else {
            setError(`Failed to retrieve data for patient ID ${patient.id}. ${apiErr.message}`);
          }
        }
      } 
      // If we already have complete patient data
      else if (patient && patient.firstName && patient.lastName) {
        console.log("Using provided patient data:", patient);
        setPatientData(patient);
      } 
      // No valid patient data provided
      else {
        setError('Patient data not provided or is incomplete.');
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Failed to load patient data: ${err.message}`);
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
        <div style={{ textAlign: 'center', color: '#38bdf8', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Loader2 size={48} className="mb-3 animate-spin" color="#38bdf8" />
          <p style={{fontSize: '1.2rem'}}>Loading patient data...</p>
        </div>
      </Container>
    );
  }
  // If error, show error message
  if (error) {
    return (
      <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
        <Alert variant="danger" className="d-flex flex-column align-items-center text-center p-4">
          <AlertTriangle size={48} className="mb-3" />
          <Alert.Heading style={{fontSize: '1.5rem', color: '#dc3545'}}>Error Loading Profile</Alert.Heading>
          <p style={{fontSize: '1rem', color: '#f8d7da', marginTop: '10px', marginBottom: '20px'}}>
            {error}
          </p>
          {onBack && (
            <>
              <hr style={{width: '80%', borderColor: 'rgba(255,255,255,0.3)'}}/>
              <Button variant="danger" onClick={onBack} className="mt-3">
                <ArrowLeftCircle size={18} className="me-2" />
                Go Back
              </Button>
            </>
          )}
        </Alert>
      </Container>
    );
  }
  // If no patient data, show an error
  if (!patientData) {
    return (
      <Container fluid className="add-new-patient-form-container" style={{ background: '#0f172a', padding: '30px', borderRadius: '8px', maxWidth: '1200px', margin: '20px auto' }}>
        <Alert variant="warning" className="d-flex flex-column align-items-center text-center p-4">
          <AlertTriangle size={48} className="mb-3" />
          <Alert.Heading style={{fontSize: '1.5rem', color: '#ffc107'}}>Data Not Available</Alert.Heading>
          <p style={{fontSize: '1rem', color: '#212529', marginTop: '10px', marginBottom: '20px'}}>
            No patient data could be displayed at this time. This might indicate an issue with the record or a delay in data synchronization.
          </p>
          {onBack && (
            <>
              <hr style={{width: '80%', borderColor: 'rgba(0,0,0,0.2)'}}/>
              <Button variant="warning" onClick={onBack} className="mt-3 text-dark">
                 <ArrowLeftCircle size={18} className="me-2" />
                Go Back
              </Button>
            </>
          )}
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