// List of services that require vital signs check
const servicesRequiringVitalSigns = [
  "Consultation",
  "Dental Consultation & Procedure",
  "Follow Up Consultation",
  "Out-Patient Consultation",
  "Dental Consultation & Fluoride Varnish Application",
  "Parental Consultation",
  "Vaccination"
];

// List of services that do not require vital signs check
const servicesNotRequiringVitalSigns = [
  "Dental Consultation"
];

/**
 * Determines if a service requires vital signs check
 * @param {string} service - The service name
 * @returns {boolean} - True if vital signs check is required, false otherwise
 */
export const requiresVitalSigns = (service) => {
  if (!service) return false;
  
  // Check if service explicitly requires vital signs
  return servicesRequiringVitalSigns.some(item => 
    service.toLowerCase().includes(item.toLowerCase())
  );
};

/**
 * Get the list of services requiring vital signs
 * @returns {Array} - List of services requiring vital signs
 */
export const getServicesRequiringVitalSigns = () => {
  return [...servicesRequiringVitalSigns];
};

/**
 * Get the list of services not requiring vital signs
 * @returns {Array} - List of services not requiring vital signs
 */
export const getServicesNotRequiringVitalSigns = () => {
  return [...servicesNotRequiringVitalSigns];
};
