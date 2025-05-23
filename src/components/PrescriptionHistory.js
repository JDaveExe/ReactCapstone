import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Loader, Check, AlertCircle, Clock, Calendar } from 'lucide-react';
import '../styles/Prescriptions.css';

const API_URL = 'http://localhost:5000/api';

const PrescriptionHistory = () => {
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // Default filter

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
    const fetchPrescriptionHistory = async () => {
      if (!patientId && !patientName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[PrescriptionHistory] Fetching session history for prescriptions...');
        const response = await axios.get(`${API_URL}/sessionhistory`);
        
        if (!Array.isArray(response.data)) {
          console.error('[PrescriptionHistory] Expected array but got:', typeof response.data);
          setError('Invalid data format received from server');
          setPrescriptionHistory([]);
          return;
        }
        
        // Filter sessions for the current patient and extract prescriptions
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
              
              prescriptionsData.push({
                id: `${session.historyId}_${prescriptionsData.length}`,
                sessionId: session.historyId,
                medicationName,
                dosage,
                prescribedDate: new Date(session.completedAt || session.archivedAt),
                purpose: session.purpose || 'Consultation',
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
        
        setPrescriptionHistory(sortedPrescriptions);
      } catch (err) {
        console.error('[PrescriptionHistory] Error fetching prescriptions:', err);
        setError('Failed to fetch prescription history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptionHistory();
  }, [patientId, patientName]);

  // Filter the prescriptions based on time period
  const filteredPrescriptions = prescriptionHistory.filter(prescription => {
    const prescriptionDate = prescription.prescribedDate;
    if (isNaN(prescriptionDate.getTime())) return false; // Invalid date
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    if (filterOption === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return prescriptionDate >= today && prescriptionDate < tomorrow;
    } else if (filterOption === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return prescriptionDate >= startOfWeek;
    } else if (filterOption === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return prescriptionDate >= startOfMonth;
    } else if (filterOption === 'year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return prescriptionDate >= startOfYear;
    }
    // 'all' option - return all prescriptions
    return true;
  });

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="prescriptions-loading">
        <Loader size={48} className="spinner" />
        <p>Loading your prescription history...</p>
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

  if (prescriptionHistory.length === 0) {
    return (
      <div className="prescriptions-empty">
        <FileText size={48} />
        <p>You have no prescription history at this time.</p>
      </div>
    );
  }

  return (
    <div className="prescriptions-container">
      <div className="prescriptions-header">
        <h1>Prescription History</h1>
        <div className="filter-controls">
          <label htmlFor="filter-select">Show:</label>
          <select 
            id="filter-select" 
            value={filterOption} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      {filteredPrescriptions.length === 0 ? (
        <div className="prescriptions-empty">
          <FileText size={48} />
          <p>No prescriptions found for the selected time period.</p>
        </div>
      ) : (
        <div className="prescriptions-list history-list">
          {filteredPrescriptions.map(prescription => (
            <div key={prescription.id} className="prescription-card history-card">
              <div className="prescription-header">
                <h2>{prescription.medicationName}</h2>
                <span className="prescription-date">
                  <Calendar size={16} />
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
              
              <div className="prescription-purpose">
                <strong>Purpose:</strong> {prescription.purpose}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionHistory;
