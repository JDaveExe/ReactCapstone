/**
 * Analytics Backup Utility
 * 
 * This script handles automatic backup and restoration of analytics data
 * stored in localStorage to prevent data loss on app restarts or when
 * test data is reset.
 */

// Keys for localStorage
const BACKUP_KEYS = {
  VACCINES: 'medicalAnalytics_vaccines_backup',
  PRESCRIPTIONS: 'medicalAnalytics_prescriptions_backup',
  CHECKUPS: 'checkupAnalytics_data_backup',
  SETTINGS: 'checkupAnalytics_settings_backup'
};

/**
 * Backs up current analytics data
 */
export const backupAnalyticsData = () => {
  try {
    // Medical Analytics data
    const vaccines = localStorage.getItem('medicalAnalytics_vaccines');
    const prescriptions = localStorage.getItem('medicalAnalytics_prescriptions');
    
    // Checkup Analytics data
    const checkupData = localStorage.getItem('checkupAnalytics_data');
    const checkupSettings = localStorage.getItem('checkupAnalytics_settings');
    
    // Backup Medical Analytics data
    if (vaccines) {
      localStorage.setItem(BACKUP_KEYS.VACCINES, vaccines);
    }
    
    if (prescriptions) {
      localStorage.setItem(BACKUP_KEYS.PRESCRIPTIONS, prescriptions);
    }
    
    // Backup Checkup Analytics data
    if (checkupData) {
      localStorage.setItem(BACKUP_KEYS.CHECKUPS, checkupData);
    }
    
    if (checkupSettings) {
      localStorage.setItem(BACKUP_KEYS.SETTINGS, checkupSettings);
    }
    
    console.log('Analytics data backed up successfully');
  } catch (error) {
    console.error('Error backing up analytics data:', error);
  }
};

/**
 * Restores analytics data from backup if current data is missing
 * @returns {boolean} True if restoration was performed
 */
export const restoreAnalyticsData = () => {
  try {
    let restored = false;
    
    // Check Medical Analytics data
    const currentVaccines = localStorage.getItem('medicalAnalytics_vaccines');
    const currentPrescriptions = localStorage.getItem('medicalAnalytics_prescriptions');
    
    // Check Checkup Analytics data
    const currentCheckupData = localStorage.getItem('checkupAnalytics_data');
    const currentCheckupSettings = localStorage.getItem('checkupAnalytics_settings');
    
    // Check if we need to restore vaccine data
    if (!currentVaccines || currentVaccines === '[]') {
      const backupVaccines = localStorage.getItem(BACKUP_KEYS.VACCINES);
      if (backupVaccines) {
        localStorage.setItem('medicalAnalytics_vaccines', backupVaccines);
        restored = true;
        console.log('Restored vaccine data from backup');
      }
    }
    
    // Check if we need to restore prescription data
    if (!currentPrescriptions || currentPrescriptions === '[]') {
      const backupPrescriptions = localStorage.getItem(BACKUP_KEYS.PRESCRIPTIONS);
      if (backupPrescriptions) {
        localStorage.setItem('medicalAnalytics_prescriptions', backupPrescriptions);
        restored = true;
        console.log('Restored prescription data from backup');
      }
    }
    
    // Check if we need to restore checkup data
    if (!currentCheckupData || currentCheckupData === '{}') {
      const backupCheckupData = localStorage.getItem(BACKUP_KEYS.CHECKUPS);
      if (backupCheckupData) {
        localStorage.setItem('checkupAnalytics_data', backupCheckupData);
        restored = true;
        console.log('Restored checkup data from backup');
      }
    }
    
    // Check if we need to restore checkup settings
    if (!currentCheckupSettings || currentCheckupSettings === '{}') {
      const backupCheckupSettings = localStorage.getItem(BACKUP_KEYS.SETTINGS);
      if (backupCheckupSettings) {
        localStorage.setItem('checkupAnalytics_settings', backupCheckupSettings);
        restored = true;
        console.log('Restored checkup settings from backup');
      }
    }
    
    return restored;
  } catch (error) {
    console.error('Error restoring analytics data:', error);
    return false;
  }
};
