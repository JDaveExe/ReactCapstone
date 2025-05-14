import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Assuming your backend runs on port 3001

// Fetch all registered patients (excluding unsorted and admins)
export const getPatients = () => {
  return axios.get(`${API_URL}/patients`);
};

// Fetch all unique family names
export const getFamilies = () => {
  return axios.get(`${API_URL}/families`);
};

// Assign an unsorted member to a family
export const assignFamilyToUnsortedMember = (memberId, familyName) => {
  return axios.patch(`${API_URL}/unsorted/${memberId}/assign-family`, { familyName });
};

// Admin: Add a new patient directly to a family
export const addPatientAsAdmin = (patientData) => {
  return axios.post(`${API_URL}/admin/add-patient`, patientData);
};

// Fetch all unsorted members
export const getUnsortedMembers = () => {
  return axios.get(`${API_URL}/unsorted`); // Assuming an endpoint like /api/unsorted exists
};
