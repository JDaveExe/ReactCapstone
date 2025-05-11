import React, { useState, useEffect } from 'react';
import '../styles/Manage.css';

const Manage = () => {
  // Sample patient data
  const [patients, setPatients] = useState([
    { id: 1, name: 'John Doe', dob: '1985-05-15', gender: 'Male', diagnosis: 'Hypertension' },
    { id: 2, name: 'Jane Smith', dob: '1990-08-22', gender: 'Female', diagnosis: 'Type 2 Diabetes' },
    { id: 3, name: 'Robert Johnson', dob: '1978-03-10', gender: 'Male', diagnosis: 'Asthma' },
    { id: 4, name: 'Emily Davis', dob: '1995-11-30', gender: 'Female', diagnosis: 'Migraine' },
    { id: 5, name: 'Michael Brown', dob: '1982-07-18', gender: 'Male', diagnosis: 'Hyperlipidemia' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({
    id: null,
    name: '',
    dob: '',
    gender: 'Male',
    diagnosis: ''
  });

  // Filter patients based on search term and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || patient.gender === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!showModal) {
      setCurrentPatient({
        id: null,
        name: '',
        dob: '',
        gender: 'Male',
        diagnosis: ''
      });
      setIsEditing(false);
    }
  }, [showModal]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing patient
      setPatients(patients.map(patient => 
        patient.id === currentPatient.id ? currentPatient : patient
      ));
    } else {
      // Add new patient
      const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
      const patientToAdd = {
        id: newId,
        name: currentPatient.name || `New Patient ${newId}`,
        dob: currentPatient.dob || new Date().toISOString().split('T')[0],
        gender: currentPatient.gender,
        diagnosis: currentPatient.diagnosis || 'Pending diagnosis'
      };
      setPatients([...patients, patientToAdd]);
    }
    
    setShowModal(false);
  };

  const handleEdit = (patient) => {
    setCurrentPatient({
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      diagnosis: patient.diagnosis
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleExportPDF = (id) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      alert(`Exporting PDF for: ${patient.name}\nDOB: ${patient.dob}\nDiagnosis: ${patient.diagnosis}`);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter(patient => patient.id !== id));
    }
  };

  // Add the missing handleCloseModal function
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="manage-container" style={{ color: '#f1f5f9' }}>
      <div className="header">
        <h1 style={{ color: '#38bdf8', fontWeight: 700 }}>Manage Patient Data</h1>
        <button 
          className="new-patient-btn" 
          onClick={() => setShowModal(true)}
          aria-label="Add new patient"
        >
          + New Patient
        </button>
      </div>
      
      <div className="search-filter">
        <input 
          type="text"
          placeholder="Search by patient name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search patients"
          style={{ color: '#f1f5f9', background: '#172136', border: '1px solid #334155' }}
        />
        <select 
          value={statusFilter} 
          onChange={handleStatusChange}
          className="filter-dropdown"
          aria-label="Filter by gender"
          style={{ color: '#f1f5f9', background: '#172136', border: '1px solid #334155' }}
        >
          <option value="All">All Patients</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      
      <div className="patients-grid">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div key={patient.id} className="patient-card" style={{ background: '#172136', color: '#f1f5f9', border: '1px solid #334155' }}>
              <div className="patient-info">
                <h3 style={{ color: '#38bdf8', fontWeight: 600 }}>{patient.name}</h3>
                <div className="patient-details">
                  <p><span className="icon">📅</span> <span style={{ color: '#a5b4fc' }}>DOB:</span> {patient.dob || 'Not specified'}</p>
                  <p><span className="icon">👤</span> <span style={{ color: '#a5b4fc' }}>Gender:</span> {patient.gender}</p>
                  <p><span className="icon">🩺</span> <span style={{ color: '#a5b4fc' }}>Diagnosis:</span> {patient.diagnosis || 'None'}</p>
                </div>
              </div>
              <div className="patient-actions">
                <button 
                  onClick={() => handleEdit(patient)} 
                  className="edit-btn"
                  aria-label={`Edit ${patient.name}`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(patient.id)}
                  className="delete-btn"
                  aria-label={`Delete ${patient.name}`}
                >
                  Delete
                </button>
                <button 
                  onClick={() => handleExportPDF(patient.id)} 
                  className="export-btn"
                  aria-label={`Export PDF for ${patient.name}`}
                >
                  Export PDF
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p style={{ color: '#f87171' }}>No patients found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#172136', color: '#f1f5f9' }}>
            <button 
              className="close-modal" 
              onClick={handleCloseModal}
              aria-label="Close modal"
              style={{ color: '#f87171' }}
            >
              &times;
            </button>
            <h2 style={{ color: '#38bdf8', fontWeight: 700 }}>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="patient-name" style={{ color: '#a5b4fc' }}>Full Name:</label>
                <input
                  id="patient-name"
                  type="text"
                  name="name"
                  value={currentPatient.name}
                  onChange={handleInputChange}
                  placeholder="Enter patient's full name"
                  required
                  autoFocus
                  style={{ color: '#f1f5f9', background: '#111827', border: '1px solid #334155' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="patient-dob" style={{ color: '#a5b4fc' }}>Date of Birth:</label>
                <input
                  id="patient-dob"
                  type="date"
                  name="dob"
                  value={currentPatient.dob}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  style={{ color: '#f1f5f9', background: '#111827', border: '1px solid #334155' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="patient-gender" style={{ color: '#a5b4fc' }}>Gender:</label>
                <select
                  id="patient-gender"
                  name="gender"
                  value={currentPatient.gender}
                  onChange={handleInputChange}
                  style={{ color: '#f1f5f9', background: '#111827', border: '1px solid #334155' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="patient-diagnosis" style={{ color: '#a5b4fc' }}>Diagnosis:</label>
                <input
                  id="patient-diagnosis"
                  type="text"
                  name="diagnosis"
                  value={currentPatient.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Enter primary diagnosis"
                  style={{ color: '#f1f5f9', background: '#111827', border: '1px solid #334155' }}
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="cancel-btn"
                  style={{ color: '#f87171', background: 'transparent', border: '1px solid #f87171' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  style={{ color: '#fff', background: '#38bdf8', border: 'none' }}
                >
                  {isEditing ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage;