import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Loader, Check, AlertCircle, Clock } from 'lucide-react';
import '../styles/Prescriptions.css';

const API_URL = 'http://localhost:5000/api';

const ActivePrescriptions = () => {
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    const loadPatientData = () => {
      try {
        // Get patient info from localStorage
        const storedPatientId = localStorage.getItem('patientId');
        const storedPatientName = localStorage.getItem('patientName') || 
                                localStorage.getItem('userName') ||
                                localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
        
        setPatientId(storedPatientId || '');
        setPatientName(storedPatientName || 'Patient');
        
      } catch (error) {
        console.error("Error loading patient data from localStorage:", error);
        setPatientId('');
        setPatientName('Patient');
      }
    };

    loadPatientData();
  }, []);

  useEffect(() => {
    const fetchActivePrescriptions = async () => {
      if (!patientId && !patientName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[ActivePrescriptions] Fetching session history for prescriptions...');
        const response = await axios.get(`${API_URL}/sessionhistory`);
        
        if (!Array.isArray(response.data)) {
          console.error('[ActivePrescriptions] Expected array but got:', typeof response.data);
          setError('Invalid data format received from server');
          setActivePrescriptions([]);
          return;
        }
        
        // Filter sessions for the current patient and extract prescriptions
        // that aren't marked as completed
        const patientSessions = response.data.filter(session => 
          (session.patientName === patientName || session.originalData?.name === patientName) &&
          session.prescription && 
          session.prescription !== "" && 
          session.prescription !== "N/A"
        );
        
        // Process prescriptions from patient sessions
        const prescriptionsData = [];
        
        patientSessions.forEach(session => {
          const prescriptionLines = session.prescription.split('\\n');
          
          prescriptionLines.forEach(line => {
            if (line.trim()) {
              // Parse medication details
              const dosageSplit = line.split(' - ');
              const medicationName = dosageSplit[0].trim();
              const dosage = dosageSplit.length > 1 ? dosageSplit[1].trim() : '';
              
              // Add to active prescriptions if not already completed
              // In the future, this will check against a completedPrescriptions collection
              prescriptionsData.push({
                id: `${session.historyId}_${prescriptionsData.length}`,
                sessionId: session.historyId,
                medicationName,
                dosage,
                prescribedDate: new Date(session.completedAt || session.archivedAt),
                isActive: true, // Default to active
                doctor: session.doctorName || 'Your Doctor',
                original: line
              });
            }
          });
        });
        
        // Sort by most recent first
        const sortedPrescriptions = prescriptionsData.sort((a, b) => 
          b.prescribedDate.getTime() - a.prescribedDate.getTime()
        );
        
        setActivePrescriptions(sortedPrescriptions);
      } catch (err) {
        console.error('[ActivePrescriptions] Error fetching prescriptions:', err);
        setError('Failed to fetch prescriptions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePrescriptions();
  }, [patientId, patientName]);

  const handleMarkAsDone = async (prescriptionId) => {
    try {
      // In a real implementation, this would send a request to mark the prescription as complete
      // For now, we'll just update the UI
      setActivePrescriptions(prev => 
        prev.map(prescription => 
          prescription.id === prescriptionId 
            ? { ...prescription, isActive: false } 
            : prescription
        ).filter(prescription => prescription.isActive)
      );
      
      alert('Prescription marked as completed.');
      
      // In the real implementation, you would save this to the backend
      // await axios.post(`${API_URL}/prescriptions/${prescriptionId}/complete`);
    } catch (error) {
      console.error('Error marking prescription as done:', error);
      alert('Failed to mark prescription as completed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="prescriptions-loading">
        <Loader size={48} className="spinner" />
        <p>Loading your active prescriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="prescriptions-error">
        <AlertCircle size={48} />
        <p>{error}</p>
      </div>
    );
  }

  if (activePrescriptions.length === 0) {
    return (
      <div className="prescriptions-empty">
        <FileText size={48} />
        <p>You have no active prescriptions at this time.</p>
      </div>
    );
  }

  return (
    <div className="prescriptions-container">
      <h1>Active Prescriptions</h1>
      <div className="prescriptions-list">
        {activePrescriptions.map(prescription => (
          <div key={prescription.id} className="prescription-card">
            <div className="prescription-header">
              <h2>{prescription.medicationName}</h2>
              <span className="prescription-date">
                <Clock size={16} />
                {prescription.prescribedDate.toLocaleDateString()}
              </span>
            </div>
            
            {prescription.dosage && (
              <div className="prescription-dosage">
                <strong>Dosage:</strong> {prescription.dosage}
              </div>
            )}
            
            <div className="prescription-doctor">
              <strong>Prescribed by:</strong> {prescription.doctor}
            </div>
            
            <div className="prescription-actions">
              <button 
                className="complete-button"
                onClick={() => handleMarkAsDone(prescription.id)}
              >
                <Check size={16} />
                Mark as Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivePrescriptions;
