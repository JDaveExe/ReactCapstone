import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Assuming your backend runs on port 3001

// Fetch all registered patients (excluding unsorted and admins)
export const getPatients = () => {
  return axios.get(`${API_URL}/patients`);
};

// Fetch all unique family names
export const getFamilies = () => {
  return axios.get(`${API_URL}/families`);
};

// Fetch members of a specific family
export const getFamilyMembers = (familyId) => {
  // Ensure familyId is treated as a number
  const numericFamilyId = parseInt(familyId, 10);

  if (isNaN(numericFamilyId)) {
    console.error(`Invalid familyId: ${familyId}. Cannot convert to a valid number.`);
    return Promise.reject(new Error(`Invalid family ID: ${familyId}`));
  }

  console.log(`Making API request to fetch members for family ID: ${numericFamilyId} (original: ${familyId})`);
  
  return axios.get(`${API_URL}/families/${numericFamilyId}/members`)
    .then(response => {
      console.log(`API response for family ${numericFamilyId}:`, response);
      
      // Ensure response.data is an array
      if (!response.data || !Array.isArray(response.data)) {
        console.error(`Unexpected API response format for family ${numericFamilyId}:`, response.data);
        return { data: [] };  // Return empty array in the expected format
      }
      
      return response;
    })
    .catch(error => {
      console.error(`Error fetching members for family ${numericFamilyId}:`, error);
      throw error;
    });
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

// Fetch families with their members already sorted and nested
export const getSortedFamilies = () => {
  return axios.get(`${API_URL}/sorted-families`);
};

// Add a new surname (family)
export const addSurname = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/add-surname`, data);
    return response.data; // Return the response directly since it's a number
  } catch (error) {
    console.error('Error adding surname:', error);
    throw error;
  }
};
