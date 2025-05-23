// List of services that require vaccination check
const servicesRequiringVaccination = [
  "Vaccination",
  "Immunization",
  "Vaccine Administration"
];

/**
 * Determines if a service requires vaccination check
 * @param {string} service - The service name
 * @returns {boolean} - True if vaccination check is required, false otherwise
 */
export const requiresVaccination = (service) => {
  if (!service) return false;
  
  // Check if service explicitly requires vaccination
  return servicesRequiringVaccination.some(item => 
    service.toLowerCase().includes(item.toLowerCase())
  );
};

/**
 * Get the list of services requiring vaccination
 * @returns {Array} - List of services requiring vaccination
 */
export const getServicesRequiringVaccination = () => {
  return [...servicesRequiringVaccination];
};

/**
 * Get list of standard vaccinations with descriptions
 * @returns {Array} - List of vaccination objects with name and description
 */
export const getStandardVaccinations = () => {
  return [
    {
      id: 1,
      name: "BCG (Bacillus Calmette-Guérin)",
      description: "Protects against tuberculosis"
    },
    {
      id: 2,
      name: "Hepatitis B",
      description: "Protects against hepatitis B virus"
    },
    {
      id: 3,
      name: "Polio (OPV/IPV)",
      description: "Protects against poliomyelitis"
    },
    {
      id: 4,
      name: "DTaP/DTP",
      description: "Protects against diphtheria, tetanus, and pertussis"
    },
    {
      id: 5,
      name: "MMR",
      description: "Protects against measles, mumps, and rubella"
    },
    {
      id: 6,
      name: "Varicella",
      description: "Protects against chickenpox"
    },
    {
      id: 7,
      name: "Pneumococcal",
      description: "Protects against pneumococcal disease"
    },
    {
      id: 8,
      name: "Hepatitis A",
      description: "Protects against hepatitis A virus"
    },
    {
      id: 9,
      name: "Influenza",
      description: "Protects against seasonal flu"
    },
    {
      id: 10,
      name: "Rabies Vaccine",
      description: "Protects against rabies infection"
    }
  ];
};
