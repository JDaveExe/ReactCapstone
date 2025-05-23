/**
 * Utility functions for managing service schedules based on time and day
 */

/**
 * Returns available services based on day of the week and time
 * 
 * Monday:
 * 8-12nn: Consultation, Dental Consultation & Procedure, Vaccination
 * 1-5pm: Follow Up Consultation, Dental Consultation, Vaccination
 * 
 * Tuesday:
 * 8-12nn: Out-Patient Consultation, Vaccination
 * 1-5pm: Follow Up Consultation, Dental Consultation, Vaccination
 * 
 * Wednesday:
 * 8-12nn: Dental Consultation & Fluoride Varnish Application, Vaccination
 * 1-5pm: Follow Up Consultation, Dental Consultation, Vaccination
 * 
 * Thursday:
 * 8-12pm: Out-Patient Consultation, Dental Consultation & Procedure, Vaccination
 * 1-5pm: Follow Up Consultation, Dental Consultation, Vaccination
 * 
 * Friday:
 * 8-12nn: Parental Consultation, Vaccination
 * 1-5pm: Follow Up Consultation, Dental Consultation, Vaccination
 */

/**
 * Check if a time is in the morning session (8-12 noon)
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {boolean}
 */
function isMorningTime(timeString) {
  const [hour, minute] = timeString.split(':').map(num => parseInt(num, 10));
  return (hour >= 8 && hour < 12);
}

/**
 * Check if a time is in the afternoon session (1-5 PM)
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {boolean}
 */
function isAfternoonTime(timeString) {
  const [hour, minute] = timeString.split(':').map(num => parseInt(num, 10));
  return (hour >= 13 && hour < 17);
}

/**
 * Gets the available services based on the day of the week and time
 * @param {Date} date - The appointment date
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {Array<string>} - Array of available services
 */
export function getAvailableServices(date, timeString) {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    // Common afternoon services across all weekdays
  const afternoonServices = [
    'Follow Up Consultation',
    'Dental Consultation',
    'Vaccination'
  ];
  
  // Morning services based on day of week
  let morningServices = [];
    switch (day) {    case 1: // Monday
      morningServices = [
        'Consultation',
        'Dental Consultation & Procedure',
        'Vaccination'
      ];
      break;    case 2: // Tuesday
      morningServices = [
        'Out-Patient Consultation',
        'Vaccination'
      ];
      break;
    case 3: // Wednesday
      morningServices = [
        'Dental Consultation & Fluoride Varnish Application',
        'Vaccination'
      ];      break;    case 4: // Thursday
      morningServices = [
        'Out-Patient Consultation',
        'Dental Consultation & Procedure',
        'Vaccination'
      ];
      break;
    case 5: // Friday
      morningServices = [
        'Parental Consultation',
        'Vaccination'
      ];
      break;
    default: // Weekend or invalid day
      return ['No services available on this day', 'Other'];
  }
    // Return services based on time of day
  if (isMorningTime(timeString)) {
    return morningServices;
  } else if (isAfternoonTime(timeString)) {
    return afternoonServices;
  } else {
    return ['No services available at this time', 'Other'];
  }
}

/**
 * Get all services for display, organization, etc.
 * @returns {Array<string>} - Array of all possible services
 */
export function getAllServices() {  return [
    'Consultation',
    'Dental Consultation & Procedure',
    'Follow Up Consultation',
    'Dental Consultation',
    'Out-Patient Consultation',
    'Dental Consultation & Fluoride Varnish Application',
    'Parental Consultation',
    'Vaccination',
    'Other'
  ];
}
