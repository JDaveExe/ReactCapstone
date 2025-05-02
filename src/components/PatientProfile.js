import React, { useState, useEffect } from "react";
import { Container, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import axios from "axios";
import "../styles/PatientProfile.css";

const PatientProfile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    houseNo: '',
    street: '',
    barangay: '',
    city: 'Pasig',
    region: 'Metro Manila',
    contactNumber: '',
    philHealthNumber: '',
    membershipStatus: '',
    dateOfBirth: null,
    age: '',
    gender: '',
    civilStatus: '',
    formattedDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // MySQL returns dates in YYYY-MM-DD format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return '';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return '';
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("User data from localStorage:", user);
        
        if (!user || !user.email) {
          setError("Please log in to view your profile");
          setLoading(false);
          return;
        }
        
        const response = await axios.post("http://localhost:5000/api/get-user-details", { 
          email: user.email 
        });
        
        if (response.data?.user) {
          const userData = response.data.user;
          setUserData({
            ...userData,
            formattedDate: formatDate(userData.dateOfBirth)
          });
          setSuccess("Profile loaded successfully");
        }
        
      } catch (error) {
        console.error("Error:", error);
        setError(error.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 mb-5 d-flex justify-content-center">
        <Card className="registration-card p-4">
          <h3>Loading profile data...</h3>
        </Card>
      </Container>
    );
  }

  return (
    <Container 
      className="mt-5 mb-5"
      style={{
        backgroundImage: 'url(/images/homepage.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '20px',
        borderRadius: '10px'
      }}
    >
      <Card
        className="registration-card"
        style={{
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <Card.Body>
          <h2 
            className="text-center mb-4"
            style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#333' }}
          >
            Patient Profile
          </h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.firstName || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="middleName">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.middleName || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.lastName || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="suffix">
                  <Form.Label>Suffix</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.suffix || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userData.email || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contactNumber">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.contactNumber || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={2}>
                <Form.Group controlId="houseNo">
                  <Form.Label>House No.</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.houseNo || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="street">
                  <Form.Label>Street</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.street || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="barangay">
                  <Form.Label>Barangay</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.barangay || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.city || "Pasig"}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="region">
                  <Form.Label>Region</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.region || "Metro Manila"}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="philHealthNumber">
                  <Form.Label>PhilHealth Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.philHealthNumber || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="membershipStatus">
                  <Form.Label>Membership Status</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.membershipStatus || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="dateOfBirth">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.formattedDate || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="age">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.age || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.gender || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="civilStatus">
                  <Form.Label>Civil Status</Form.Label>
                  <Form.Control
                    type="text"
                    value={userData.civilStatus || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PatientProfile;