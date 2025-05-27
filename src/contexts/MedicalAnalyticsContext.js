import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backupAnalyticsData, restoreAnalyticsData } from '../utils/analyticsBackup';

const MedicalAnalyticsContext = createContext();

export const useMedicalAnalytics = () => {
  const context = useContext(MedicalAnalyticsContext);
  if (!context) {
    throw new Error('useMedicalAnalytics must be used within a MedicalAnalyticsProvider');
  }
  return context;
};

export const MedicalAnalyticsProvider = ({ children }) => {
  const [vaccineUsage, setVaccineUsage] = useState(new Map());
  const [prescriptionUsage, setPrescriptionUsage] = useState(new Map());
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Add event listener to back up data when app is closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      backupAnalyticsData();
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Load data from localStorage on initialization
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        // First try to restore data from backup if needed
        const wasRestored = restoreAnalyticsData();
        
        const savedVaccines = localStorage.getItem('medicalAnalytics_vaccines');
        const savedPrescriptions = localStorage.getItem('medicalAnalytics_prescriptions');
        
        if (savedVaccines) {
          const parsedVaccines = JSON.parse(savedVaccines);
          const vaccinesMap = new Map(parsedVaccines);
          setVaccineUsage(vaccinesMap);
        } else {
          initializeVaccineData();
        }
        
        if (savedPrescriptions) {
          const parsedPrescriptions = JSON.parse(savedPrescriptions);
          const prescriptionsMap = new Map(parsedPrescriptions);
          setPrescriptionUsage(prescriptionsMap);
        } else {
          initializePrescriptionData();
        }
        
        if (wasRestored) {
          console.log('Analytics data was restored from backup');
        }
      } catch (error) {
        console.error('Error loading medical analytics from localStorage:', error);
        initializeVaccineData();
        initializePrescriptionData();
      }
    };

    const initializeVaccineData = () => {
      const initialVaccines = new Map();
      const vaccineTypes = [
        'BCG (Bacillus Calmette-Guérin)',
        'Hepatitis B Vaccine',
        'Pentavalent Vaccine (DTP-HepB-Hib)',
        'Oral Polio Vaccine (OPV)',
        'Pneumococcal Conjugate Vaccine (PCV)',
        'Measles, Mumps, and Rubella (MMR)',
        'Japanese Encephalitis (JE)',
        'Influenza Vaccine',
        'Rotavirus Vaccine',
        'Rabies Vaccine'
      ];
      
      vaccineTypes.forEach(vaccine => {
        initialVaccines.set(vaccine, 0);
      });
      
      setVaccineUsage(initialVaccines);
    };

    const initializePrescriptionData = () => {
      const initialPrescriptions = new Map();
      const commonMedications = [
        'Paracetamol 500mg tablet',
        'Amoxicillin 500mg capsule',
        'Ibuprofen 200mg tablet',
        'Cetirizine 10mg tablet',
        'Vitamin C 100mg tablet',
        'Iron + Folic Acid tablet',
        'Multivitamins tablet',
        'Mefenamic Acid 500mg tablet',
        'Co-trimoxazole 400mg/80mg tablet',
        'Lagundi 300mg tablet'
      ];
      
      commonMedications.forEach(medication => {
        initialPrescriptions.set(medication, 0);
      });
      
      setPrescriptionUsage(initialPrescriptions);
    };

    loadFromLocalStorage();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('medicalAnalytics_vaccines', JSON.stringify([...vaccineUsage]));
    } catch (error) {
      console.error('Error saving vaccine usage to localStorage:', error);
    }
  }, [vaccineUsage]);

  useEffect(() => {
    try {
      localStorage.setItem('medicalAnalytics_prescriptions', JSON.stringify([...prescriptionUsage]));
    } catch (error) {
      console.error('Error saving prescription usage to localStorage:', error);
    }
  }, [prescriptionUsage]);

  // Function to increment vaccine usage
  const incrementVaccineUsage = useCallback((vaccineName) => {
    setVaccineUsage(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(vaccineName) || 0;
      newMap.set(vaccineName, currentCount + 1);
      return newMap;
    });
    setLastUpdate(Date.now());
  }, []);

  // Function to increment prescription usage
  const incrementPrescriptionUsage = useCallback((medicationName) => {
    setPrescriptionUsage(prev => {
      const newMap = new Map(prev);
      const currentCount = newMap.get(medicationName) || 0;
      newMap.set(medicationName, currentCount + 1);
      return newMap;
    });
    setLastUpdate(Date.now());
  }, []);

  // Function to get vaccine data for charts
  const getVaccineChartData = useCallback(() => {
    const data = Array.from(vaccineUsage.entries())
      .filter(([_, count]) => count > 0) // Only show vaccines that have been used
      .map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value: count,
        color: getRandomColor()
      }));
    
    return data.length > 0 ? data : [{ name: 'No data', fullName: 'No vaccines administered yet', value: 1, color: '#6b7280' }];
  }, [vaccineUsage]);

  // Function to get prescription data for charts
  const getPrescriptionChartData = useCallback(() => {
    const data = Array.from(prescriptionUsage.entries())
      .filter(([_, count]) => count > 0) // Only show medications that have been prescribed
      .map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        fullName: name,
        value: count,
        color: getRandomColor()
      }));
    
    return data.length > 0 ? data : [{ name: 'No data', fullName: 'No prescriptions given yet', value: 1, color: '#6b7280' }];
  }, [prescriptionUsage]);
  // Function to reset vaccine data
  const resetVaccineData = useCallback(() => {
    // Backup the current data before resetting
    backupAnalyticsData();
    
    const resetMap = new Map();
    const vaccineTypes = [
      'BCG (Bacillus Calmette-Guérin)',
      'Hepatitis B Vaccine',
      'Pentavalent Vaccine (DTP-HepB-Hib)',
      'Oral Polio Vaccine (OPV)',
      'Pneumococcal Conjugate Vaccine (PCV)',
      'Measles, Mumps, and Rubella (MMR)',
      'Japanese Encephalitis (JE)',
      'Influenza Vaccine',
      'Rotavirus Vaccine',
      'Rabies Vaccine'
    ];
    
    vaccineTypes.forEach(vaccine => {
      resetMap.set(vaccine, 0);
    });
    
    setVaccineUsage(resetMap);
    setLastUpdate(Date.now());
  }, []);  // Function to reset prescription data
  const resetPrescriptionData = useCallback(() => {
    // Backup the current data before resetting
    backupAnalyticsData();
    
    const resetMap = new Map();
    const commonMedications = [
      'Paracetamol 500mg tablet',
      'Amoxicillin 500mg capsule',
      'Ibuprofen 200mg tablet',
      'Cetirizine 10mg tablet',
      'Vitamin C 100mg tablet',
      'Iron + Folic Acid tablet',
      'Multivitamins tablet',
      'Mefenamic Acid 500mg tablet',
      'Co-trimoxazole 400mg/80mg tablet',
      'Lagundi 300mg tablet'
    ];
    
    commonMedications.forEach(medication => {
      resetMap.set(medication, 0);
    });
    
    setPrescriptionUsage(resetMap);
    setLastUpdate(Date.now());
  }, []);
  // Function to generate test vaccine data
  const generateTestVaccineData = useCallback(() => {
    // Backup the current data before generating test data
    backupAnalyticsData();
    
    const testMap = new Map();
    const vaccineTypes = [
      'BCG (Bacillus Calmette-Guérin)',
      'Hepatitis B Vaccine',
      'Pentavalent Vaccine (DTP-HepB-Hib)',
      'Oral Polio Vaccine (OPV)',
      'Pneumococcal Conjugate Vaccine (PCV)',
      'Measles, Mumps, and Rubella (MMR)',
      'Japanese Encephalitis (JE)',
      'Influenza Vaccine',
      'Rotavirus Vaccine',
      'Rabies Vaccine'
    ];
    
    vaccineTypes.forEach(vaccine => {
      // Generate random usage count between 1 and 50
      const randomCount = Math.floor(Math.random() * 50) + 1;
      testMap.set(vaccine, randomCount);
    });
    
    setVaccineUsage(testMap);
    setLastUpdate(Date.now());
  }, []);
  // Function to generate test prescription data
  const generateTestPrescriptionData = useCallback(() => {
    // Backup the current data before generating test data
    backupAnalyticsData();
    
    const testMap = new Map();
    const commonMedications = [
      'Paracetamol 500mg tablet',
      'Amoxicillin 500mg capsule',
      'Ibuprofen 200mg tablet',
      'Cetirizine 10mg tablet',
      'Vitamin C 100mg tablet',
      'Iron + Folic Acid tablet',
      'Multivitamins tablet',
      'Mefenamic Acid 500mg tablet',
      'Co-trimoxazole 400mg/80mg tablet',
      'Lagundi 300mg tablet'
    ];
    
    commonMedications.forEach(medication => {
      // Generate random usage count between 1 and 100
      const randomCount = Math.floor(Math.random() * 100) + 1;
      testMap.set(medication, randomCount);
    });
    
    setPrescriptionUsage(testMap);
    setLastUpdate(Date.now());
  }, []);

  // Helper function to generate random colors for pie chart segments
  const getRandomColor = () => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const value = {
    vaccineUsage,
    prescriptionUsage,
    incrementVaccineUsage,
    incrementPrescriptionUsage,
    getVaccineChartData,
    getPrescriptionChartData,
    resetVaccineData,
    resetPrescriptionData,
    generateTestVaccineData,
    generateTestPrescriptionData,
    lastUpdate
  };

  return (
    <MedicalAnalyticsContext.Provider value={value}>
      {children}
    </MedicalAnalyticsContext.Provider>
  );
};

export default MedicalAnalyticsContext;
