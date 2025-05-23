import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import axios from 'axios';
import '../styles/Sessions.css';
import '../styles/PrescriptionSection.css'; // Import prescription styles
import { Clock, Calendar, User, Check, Edit, ArrowRight, FileText, Loader, Plus, X, ChevronDown, Pill, Activity } from 'lucide-react'; // Added Activity icon
import CheckUpContext from '../contexts/CheckUpContext'; // Import CheckUpContext
import VitalSignsCheck from './VitalSignsCheck'; // Import VitalSignsCheck

const Sessions = ({ userRole = 'doctor' }) => {
  const { 
    todaysCheckUps, 
    isLoading: contextIsLoading, 
    error: contextError, 
    updateCheckUpItem, 
    archiveSession // Destructure archiveSession from context
  } = useContext(CheckUpContext); // Consume context

  const today = new Date();
  const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("queueNumber"); // Or a relevant field from context data
  const [sortOrder, setSortOrder] = useState("asc");  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [editingPrescription, setEditingPrescription] = useState(null); // New state for prescription editing
  const [prescriptionText, setPrescriptionText] = useState(""); // New state for prescription text
  const [activeFilter, setActiveFilter] = useState("ongoing"); // Default to ongoing
  
  // New state for vital signs modal
  const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
    // New states for prescription dropdown system
  const [selectedMedications, setSelectedMedications] = useState({});
  const [dosages, setDosages] = useState({});
  const [medicationDropdownOpen, setMedicationDropdownOpen] = useState({});
  const [customMedications, setCustomMedications] = useState({});
  const [medicationSearch, setMedicationSearch] = useState({});
  
  // List of standard medications
  const medicationsList = [
    "Folic Acid 5mg tablet",
    "Hydrocortisone 100mg/mL inj",
    "Hydrite (ORS)",
    "Iron + Folic Acid (IFA) tablet",
    "Lagundi 300mg tablet",
    "Lagundi 600mg tablet",
    "Mefenamic Acid 500mg tablet",
    "Metoprolol 50mg tablet",
    "Metronidazole 500mg tablet",
    "Multivitamins drops",
    "Multivitamins syrup",
    "Multivitamins + Iron drops",
    "Multivitamins + Iron syrup",
    "Paracetamol 250mg/5mL syrup",
    "Paracetamol 500mg tablet",
    "Paracetamol 100mg/mL drops",
    "Salbutamol 2mg/5mL syrup",
    "Vitamin A 100,000 IU",
    "Vitamin A 200,000 IU",
    "Vitamin C 100mg chewable tablet",
    "Vitamin C drops",
    "Vitamin C syrup",
    "Ascorbic Acid 100mg chewable tablet",
    "Ascorbic Acid 250mg/5mL syrup",
    "Aluminum Magnesium (Antacid) 200mg/200mg/20mg per 5mL",
    "Amoxicillin Trihydrate 500mg capsule",
    "Amoxicillin Trihydrate 250mg/5mL suspension",
    "Amoxicillin Trihydrate 500mg/5mL suspension",
    "Amoxicillin + Clavulanic Acid 228mg/5mL suspension",
    "Ambroxol 30mg/5mL syrup",
    "Ambroxol 500mg tablet",
    "Cetirizine 10mg tablet",
    "Cetirizine 5mg/5mL syrup",
    "Chlorphenamine maleate 2mg/5mL syrup",
    "Chlorphenamine maleate 4mg tablet",
    "Co-amoxiclav 625mg tablet",
    "Co-trimoxazole 400mg/80mg tablet",
    "Co-trimoxazole 200mg/40mg suspension",
    "Ferrous Sulfate 60mg + Folic Acid 400mcg tablet",
    "Ferrous Sulfate 15mg drops",
    "Ferrous Sulfate + Vitamin C 325mg/100mg tablet",
    "Ferrous Sulfate 60mg/mL drops",
    "Carbocisteine 100mg/5mL syrup",
    "Carbocisteine 500mg capsule",
    "Cefalexin 250mg/5mL suspension",
    "Cefalexin 500mg capsule",
    "Cefalexin 500mg/5mL suspension",
    "Ciprofloxacin 500mg tablet",
    "Cloxacillin 500mg capsule",
    "Cloxacillin 250mg/5mL suspension",
    "Dicycloverine HCl 10mg tablet",
    "Dicycloverine HCl 5mg/5mL syrup",
    "Diphenhydramine HCl 12.5mg/5mL syrup",
    "Diphenhydramine HCl 25mg capsule",
    "Erythromycin 500mg tablet",
    "Erythromycin 250mg/5mL suspension",
    "Ibuprofen 100mg/5mL syrup",
    "Ibuprofen 200mg tablet",
    "Lagundi 300mg/5mL syrup",
    "Loperamide 2mg capsule",
    "Loratadine 5mg/5mL syrup",
    "Loratadine 10mg tablet",
    "Mefenamic Acid 250mg/5mL suspension",
    "Mefenamic Acid 250mg capsule",
    "Montelukast 4mg chewable tablet",
    "Montelukast 5mg chewable tablet",
    "Salbutamol 2mg tablet",
    "Salbutamol 2mg/5mL syrup",
    "Salbutamol 5mg/mL nebule",
    "Simvastatin 20mg tablet"
  ];

  // Removed local sessions, loading, error states and fetchSessions function

  // Filter by patient name and status from context
  const filtered = todaysCheckUps.filter(session => {
    const nameMatch = session.name && session.name.toLowerCase().includes(search.toLowerCase()); // Use session.name
    
    if (!nameMatch) return false;

    if (activeFilter === "ongoing") {
      return session.status === 'Ongoing';
    } else if (activeFilter === "completed") {
      return session.status === 'Completed';
    } else if (activeFilter === "all") {
      // Show all relevant session statuses for this page (e.g., Ongoing, Completed)
      return session.status === 'Ongoing' || session.status === 'Completed';
    }
    return false;
  });

  // Sort by selected field
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'queueNumber') {
      return sortOrder === 'asc' ? (a.queueNumber || 0) - (b.queueNumber || 0) : (b.queueNumber || 0) - (a.queueNumber || 0);
    }
    // Assuming loggedInAt is the primary timestamp for sorting by date/time
    const timeA = new Date(a.loggedInAt).getTime();
    const timeB = new Date(b.loggedInAt).getTime();

    if (sortField === 'date' || sortField === 'time') { // Simplified sorting for time
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };  const handleCompleteSession = async (session) => {
    try {
      // Check if prescription is filled but not saved
      const hasUnsavedPrescription = (editingPrescription === session.id) &&
        ((selectedMedications[session.id]?.length > 0) || 
         (customMedications[session.id]?.length > 0));
         
      if (hasUnsavedPrescription) {
        const saveFirst = window.confirm("You have unsaved prescription changes. Would you like to save the prescription before completing the session?");
        if (saveFirst) {
          await handleSavePrescription(session.id);
        }
      }
      
      // Check if session has no prescription but one wasn't explicitly declined
      if (!session.prescription && !session.prescriptionDeclined) {
        const addPrescription = window.confirm(`This session for ${session.name} doesn't have a prescription. Would you like to add one before completing?`);
        if (addPrescription) {
          startEditPrescription(session);
          return; // Stop completing the session until prescription is saved
        } else {
          // Mark that prescription was explicitly declined
          await updateCheckUpItem({ 
            ...session, 
            prescription: "N/A",
            prescriptionDeclined: true
          });
          // Refresh session data
          session = todaysCheckUps.find(s => s.id === session.id);
        }
      }
      
      console.log(`[Sessions] Completing session for ${session.name}`);
      // Update status to 'Completed' in today's check-ups
      await updateCheckUpItem({ ...session, status: 'Completed' });
      
      // Archive the session to permanent history
      // Ensure all necessary session data is passed for archiving
      const sessionToArchive = {
        ...session, // Spread existing session data
        status: 'Completed', // Ensure status is set to Completed
        completedAt: new Date().toISOString(), // Add a completion timestamp
        patientName: session.name, // Explicitly map name to patientName for clarity
        // Add any other fields required by the session history schema
      };
      await archiveSession(sessionToArchive);

      alert(`Session for ${session.name} marked as Completed and archived.`);
    } catch (err) {
      console.error("[Sessions] Error completing session:", err);
      alert("Failed to complete session. Please try again.");
    }
  };

  const handleSaveNotes = async (sessionId) => {
    const sessionToUpdate = todaysCheckUps.find(s => s.id === sessionId);
    if (!sessionToUpdate) return;

    try {
      console.log(`[Sessions] Saving notes for session ${sessionId}`);
      await updateCheckUpItem({ ...sessionToUpdate, notes: noteText });
      setEditingNotes(null);
      alert('Notes saved.');
    } catch (err) {
      console.error("[Sessions] Error saving notes:", err);
      alert("Failed to save notes. Please try again.");
    }
  };  const handleSavePrescription = async (sessionId) => {
    const sessionToUpdate = todaysCheckUps.find(s => s.id === sessionId);
    if (!sessionToUpdate) return;

    try {
      // Generate formatted prescription text from selected medications
      const medsForSession = selectedMedications[sessionId] || [];
      const customMedsForSession = customMedications[sessionId] || [];
      const dosagesForSession = dosages[sessionId] || {};
      
      let prescriptionLines = [];
      
      // Add selected standard medications
      medsForSession.forEach(med => {
        const dosage = dosagesForSession[med] || '';
        prescriptionLines.push(`${med}${dosage ? ` - ${dosage}` : ''}`);
      });
      
      // Add custom medications
      customMedsForSession.forEach(custom => {
        prescriptionLines.push(custom);
      });
      
      // If there are no prescriptions, set "N/A" to distinguish from empty string
      const finalPrescription = prescriptionLines.length > 0 
        ? prescriptionLines.join('\\n') 
        : "N/A";
      
      console.log(`[Sessions] Saving prescription for session ${sessionId}`);
      await updateCheckUpItem({ 
        ...sessionToUpdate, 
        prescription: finalPrescription,
        prescriptionLastUpdated: new Date().toISOString() // Add timestamp for prescription update
      });
      
      setEditingPrescription(null);
      alert('Prescription saved.');
    } catch (err) {
      console.error("[Sessions] Error saving prescription:", err);
      alert("Failed to save prescription. Please try again.");
    }
  };
    // Function to toggle medication dropdown
  const toggleMedicationDropdown = (sessionId) => {
    // Initialize empty search text when opening the dropdown
    if (!medicationDropdownOpen[sessionId]) {
      setMedicationSearch(prev => ({
        ...prev,
        [sessionId]: ""
      }));
    }
    
    setMedicationDropdownOpen(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };
  
  // Function to handle medication search
  const handleMedicationSearch = (sessionId, searchText) => {
    setMedicationSearch(prev => ({
      ...prev,
      [sessionId]: searchText
    }));
  };
  
  // Function to add medication to a session
  const addMedication = (sessionId, medication) => {
    setSelectedMedications(prev => {
      const current = prev[sessionId] || [];
      // Only add if not already in the list
      if (!current.includes(medication)) {
        return {
          ...prev,
          [sessionId]: [...current, medication]
        };
      }
      return prev;
    });
    // Close dropdown after selection
    setMedicationDropdownOpen(prev => ({
      ...prev,
      [sessionId]: false
    }));
  };
  
  // Function to remove a medication
  const removeMedication = (sessionId, medication) => {
    setSelectedMedications(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || []).filter(med => med !== medication)
    }));
    
    // Also remove any associated dosage
    setDosages(prev => {
      const updatedDosages = {...prev};
      if (updatedDosages[sessionId] && updatedDosages[sessionId][medication]) {
        delete updatedDosages[sessionId][medication];
      }
      return updatedDosages;
    });
  };
  
  // Function to handle dosage change
  const handleDosageChange = (sessionId, medication, value) => {
    setDosages(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [medication]: value
      }
    }));
  };
  
  // Function to add a custom medication
  const addCustomMedication = (sessionId) => {
    const custom = prompt("Enter custom medication:");
    if (custom && custom.trim()) {
      setCustomMedications(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), custom.trim()]
      }));
    }
  };
  
  // Function to remove a custom medication
  const removeCustomMedication = (sessionId, index) => {
    setCustomMedications(prev => ({
      ...prev,
      [sessionId]: (prev[sessionId] || []).filter((_, i) => i !== index)
    }));
  };

  // Function to handle vital signs check
  const handleVitalSignsCheck = (session) => {
    setSelectedPatient(session);
    setShowVitalSignsModal(true);
  };
  
  // Function to handle vital signs completion
  const handleVitalSignsComplete = (updatedCheckup) => {
    updateCheckUpItem(updatedCheckup);
  };

  const startEditNotes = (session) => {
    setEditingNotes(session.id);
    setNoteText(session.notes || '');
  };
  const startEditPrescription = (session) => {
    setEditingPrescription(session.id);
    setPrescriptionText(session.prescription || '');
    
    // Initialize medication selections if existing prescription
    if (session.prescription) {
      const prescriptionLines = session.prescription.split('\\n').filter(line => line.trim());
      
      // Initialize selected medications and dosages
      const selectedMeds = [];
      const sessionDosages = {};
      const customMeds = [];
      
      prescriptionLines.forEach(line => {
        // Check if it's a standard medication with dosage
        const dosageSplit = line.split(' - ');
        const medication = dosageSplit[0].trim();
        
        // If medication is in our standard list
        if (medicationsList.includes(medication)) {
          selectedMeds.push(medication);
          // If has dosage information
          if (dosageSplit.length > 1) {
            sessionDosages[medication] = dosageSplit[1].trim();
          }
        } else {
          // If not in standard list, treat as custom
          customMeds.push(line);
        }
      });
      
      // Update state with existing medications
      if (selectedMeds.length > 0) {
        setSelectedMedications(prev => ({
          ...prev,
          [session.id]: selectedMeds
        }));
      }
      
      // Update dosages if any exist
      if (Object.keys(sessionDosages).length > 0) {
        setDosages(prev => ({
          ...prev,
          [session.id]: sessionDosages
        }));
      }
      
      // Update custom medications if any exist
      if (customMeds.length > 0) {
        setCustomMedications(prev => ({
          ...prev,
          [session.id]: customMeds
        }));
      }
    }
  };

  if (contextIsLoading) {
    return <div className="loading"><Loader size={48} /> Loading sessions...</div>;
  }

  if (contextError) {
    return <div className="error">{contextError}</div>;
  }  
  
  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h1>Sessions</h1>
        <div className="filter-toggle">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ongoing')}
          >
            Ongoing
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>
      <div className="search-bar-container" style={{ marginBottom: '20px', marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sessions-search-input"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="no-sessions-message">
          No sessions match the current filter.
        </div>
      ) : (
        <div className="sessions-grid">
          {sorted.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-card-header">
                <div className="session-header-left">
                  <span className="session-queue-number">#{session.queueNumber || session.id}</span>
                  <span className="session-patient-name">{session.name}</span>
                </div>
                <div className="session-header-right">
                  <span className={`session-status-badge status-${session.status ? session.status.toLowerCase().replace(' ', '-') : 'unknown'}`}>
                    {session.status}
                  </span>
                </div>
              </div>
              <div className="session-card-body">
                <div className="session-detail-item">
                  <Calendar size={16} /> {new Date(session.loggedInAt).toLocaleDateString()}
                </div>
                <div className="session-detail-item">
                  <Clock size={16} /> {new Date(session.loggedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                </div>
                <div className="session-detail-item purpose">
                  <strong>Purpose:</strong> {session.purpose || 'Not specified'}
                </div>
                
                {editingNotes === session.id ? (
                  <div className="notes-editor">
                    <textarea 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)} 
                      rows={3}
                      placeholder="Enter session notes..."
                    />
                    <div className="notes-actions">
                      <button onClick={() => handleSaveNotes(session.id)} className="save-notes-btn">Save Notes</button>
                      <button onClick={() => setEditingNotes(null)} className="cancel-notes-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="session-notes-view">
                    <div className="notes-header">
                      <strong><FileText size={16} />Session Notes:</strong>
                      <button onClick={() => startEditNotes(session)} className="edit-notes-btn"><Edit size={14} /></button>
                    </div>
                    <p>{session.notes || 'No notes yet.'}</p>
                  </div>
                )}                {/* Prescription Section - Only for Doctors */}
                {userRole === 'doctor' && (
                  <div className="prescription-section">
                    <h3 className="prescription-section-title">
                      <Pill size={18} /> 
                      Patient Prescription
                    </h3>
                    
                    {editingPrescription === session.id ? (
                      <div className="prescription-editor notes-editor"> {/* Reusing notes-editor styles */}
                        <div className="prescription-dropdown-container">
                          {/* Selected medications display */}
                          <div className="selected-medications">
                            {(selectedMedications[session.id] || []).map(med => (
                              <div key={med} className="medication-item">
                                <span>{med}</span>
                                
                                {/* Dosage dropdown for medications that might need it */}
                                {med.toLowerCase().includes('mg') || med.toLowerCase().includes('ml') ? (
                                  <select 
                                    value={dosages[session.id]?.[med] || ''} 
                                    onChange={(e) => handleDosageChange(session.id, med, e.target.value)}
                                    className="dosage-select"
                                  >
                                    <option value="">Select dosage</option>
                                    <option value="Once daily">Once daily</option>
                                    <option value="Twice daily">Twice daily</option>
                                    <option value="Three times daily">Three times daily</option>
                                    <option value="Four times daily">Four times daily</option>
                                    <option value="As needed">As needed</option>
                                    <option value="Before meals">Before meals</option>
                                    <option value="After meals">After meals</option>
                                    <option value="At bedtime">At bedtime</option>
                                  </select>
                                ) : null}
                                
                                <button 
                                  className="remove-medication-btn" 
                                  onClick={() => removeMedication(session.id, med)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            
                            {/* Custom medications */}
                            {(customMedications[session.id] || []).map((customMed, index) => (
                              <div key={`custom-${index}`} className="medication-item custom">
                                <span>{customMed}</span>
                                <button 
                                  className="remove-medication-btn" 
                                  onClick={() => removeCustomMedication(session.id, index)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Medication selection dropdown button */}
                          <div className="add-medication-container">
                            <button 
                              className="add-medication-btn" 
                              onClick={() => toggleMedicationDropdown(session.id)}
                            >
                              <Plus size={16} /> Add Medication
                              <ChevronDown size={14} className={medicationDropdownOpen[session.id] ? 'chevron-up' : ''} />
                            </button>
                            
                            {/* Add custom medication button */}
                            <button 
                              className="add-custom-btn"
                              onClick={() => addCustomMedication(session.id)} 
                            >
                              <Plus size={16} /> Add Other
                            </button>
                            
                            {/* Dropdown medications list */}
                            {medicationDropdownOpen[session.id] && (
                              <div className="medications-dropdown">
                                <div className="medication-search">
                                  <input
                                    type="text"
                                    placeholder="Search medications..."
                                    value={medicationSearch[session.id] || ""}
                                    onChange={(e) => handleMedicationSearch(session.id, e.target.value)}
                                    className="medication-search-input"
                                  />
                                </div>
                                {medicationsList
                                  .filter(med => 
                                    !medicationSearch[session.id] || 
                                    med.toLowerCase().includes((medicationSearch[session.id] || "").toLowerCase())
                                  )
                                  .map(med => (
                                    <div 
                                      key={med}
                                      className="medication-dropdown-item"
                                      onClick={() => addMedication(session.id, med)}
                                    >
                                      {med}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="notes-actions"> {/* Reusing notes-actions styles */}
                          <button onClick={() => handleSavePrescription(session.id)} className="save-notes-btn">Save Prescription</button>
                          <button onClick={() => setEditingPrescription(null)} className="cancel-notes-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="session-prescription-view session-notes-view"> {/* Reusing session-notes-view styles */}
                        <div className="notes-header"> {/* Reusing notes-header styles */}
                          <strong><FileText size={16} />Prescription:</strong>
                          <button onClick={() => startEditPrescription(session)} className="edit-notes-btn edit-prescription-btn">
                            <Edit size={14} /> Edit Prescription
                          </button>
                        </div>
                        {session.prescription && session.prescription !== "N/A" ? (
                          <div className="prescription-list">
                            {session.prescription.split('\\n').filter(line => line.trim()).map((medication, index) => (
                              <div key={index} className="prescription-item">
                                <Pill size={14} className="prescription-pill-icon" />
                                {medication}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>{session.prescription === "N/A" ? "No prescription required for this session." : "No prescription yet."}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {session.status === 'Ongoing' && userRole === 'doctor' && (
                <div className="session-card-footer">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    {/* Review Vital Signs button */}
                    <button 
                      className="review-vital-signs-btn" 
                      onClick={() => handleVitalSignsCheck(session)}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        backgroundColor: session.vitalSignsChecked ? '#064e3b' : '#0f766e',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Activity size={16} /> Review Vital Signs
                    </button>

                    <button 
                      className="complete-session-btn" 
                      onClick={() => handleCompleteSession(session)}
                    >
                      Complete Session <Check size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}      {/* Vital Signs Check Modal - Always render but control visibility with state */}
      {showVitalSignsModal && (
        <VitalSignsCheck
          show={showVitalSignsModal}
          onHide={() => setShowVitalSignsModal(false)}
          patient={selectedPatient}
          onComplete={(updatedCheckup) => {
            handleVitalSignsComplete(updatedCheckup);
            setShowVitalSignsModal(false);
          }}
        />
      )}
    </div>
  );
}; 

export default Sessions;