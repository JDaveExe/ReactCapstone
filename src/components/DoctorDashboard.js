import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/DocDashboard.css";
 
const DocDashboard = () => {
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
 
  // Sample data structure for families
  const families = [
    {
      id: 1,
      name: 'Smith Family',
      members: [
        {
          id: 1,
          name: 'John Smith',
          age: '45 years',
          gender: 'Male',
          lastCheckup: '2025-04-12',
          phone: '(555) 123-4567',
          email: 'john@example.com',
          address: '123 Main St, Cityville'
        },
        {
          id: 2,
          name: 'Mary Smith',
          age: '42 years',
          gender: 'Female',
          lastCheckup: '2025-04-10',
          phone: '(555) 123-4567',
          email: 'mary@example.com',
          address: '123 Main St, Cityville'
        },
        {
          id: 3,
          name: 'James Smith',
          age: '15 years',
          gender: 'Male',
          lastCheckup: '2025-04-08',
          phone: '(555) 123-4567',
          email: 'james@example.com',
          address: '123 Main St, Cityville'
        }
      ]
    },
    {
      id: 2,
      name: 'Johnson Family',
      members: [
        {
          id: 4,
          name: 'Mike Johnson',
          age: '45 years',
          gender: 'Male',
          lastCheckup: '2025-03-22',
          phone: '(555) 234-5678',
          email: 'mike@example.com',
          address: '456 Oak Ave, Townsville'
        },
        {
          id: 5,
          name: 'Sarah Johnson',
          age: '42 years',
          gender: 'Female',
          lastCheckup: '2025-03-25',
          phone: '(555) 234-5678',
          email: 'sarah@example.com',
          address: '456 Oak Ave, Townsville'
        }
      ]
    },
    {
      id: 3,
      name: 'Williams Family',
      members: [
        {
          id: 6,
          name: 'Robert Williams',
          age: '38 years',
          gender: 'Male',
          lastCheckup: '2025-02-15',
          phone: '(555) 345-6789',
          email: 'robert@example.com',
          address: '789 Pine Rd, Villageton'
        }
      ]
    },
    {
      id: 4,
      name: 'Brown Family',
      members: [
        {
          id: 7,
          name: 'David Brown',
          age: '50 years',
          gender: 'Male',
          lastCheckup: '2025-04-01',
          phone: '(555) 456-7890',
          email: 'david@example.com',
          address: '101 Maple Dr, Hamletville'
        },
        {
          id: 8,
          name: 'Lisa Brown',
          age: '48 years',
          gender: 'Female',
          lastCheckup: '2025-04-03',
          phone: '(555) 456-7890',
          email: 'lisa@example.com',
          address: '101 Maple Dr, Hamletville'
        }
      ]
    }
  ];
 
  const handleFamilyClick = (familyId) => {
    if (selectedFamily?.id === familyId) {
      setSelectedFamily(null);
    } else {
      setSelectedFamily(families.find(f => f.id === familyId));
    }
    setSelectedPatient(null);
  };
 
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };
 
  const toggleView = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };
 
  const filteredFamilies = families.filter(family =>
    family.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const renderPatientDetails = (patient) => {
    if (!patient) return null;
 
    return (
      <div className="patient-details">
        <div className="patient-header">
          <h2>{patient.name}</h2>
          <span className="family-tag">{selectedFamily?.name}</span>
        </div>
 
        <div className="personal-info mb-4">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div>
              <label>Age:</label>
              <span>{patient.age}</span>
            </div>
            <div>
              <label>Gender:</label>
              <span>{patient.gender}</span>
            </div>
            <div>
              <label>Last Checkup:</label>
              <span>{patient.lastCheckup}</span>
            </div>
          </div>
        </div>
 
        <div className="contact-info mb-4">
          <h3>Contact Information</h3>
          <div className="info-grid">
            <div>
              <label>Phone:</label>
              <span>{patient.phone}</span>
            </div>
            <div>
              <label>Email:</label>
              <span>{patient.email}</span>
            </div>
            <div>
              <label>Address:</label>
              <span>{patient.address}</span>
            </div>
          </div>
        </div>
 
        <div className="action-cards">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="action-card checkup-profile" onClick={() => navigate(`/doctor/patient/${patient.id}`)}>
                <div className="icon">👤</div>
                <div className="content">
                  <h4>CHECK-UP PROFILE</h4>
                  <p>View full medical profile</p>
                </div>
              </div>
            </div>
 
            <div className="col-md-6">
              <div className="action-card immunisation" onClick={() => navigate(`/doctor/patient/${patient.id}/immunisation`)}>
                <div className="icon">💉</div>
                <div className="content">
                  <h4>IMMUNISATION HISTORY</h4>
                  <p>View vaccination records</p>
                </div>
              </div>
            </div>
 
            <div className="col-md-6">
              <div className="action-card admitting" onClick={() => navigate(`/doctor/patient/${patient.id}/admitting`)}>
                <div className="icon">🏥</div>
                <div className="content">
                  <h4>ADMITTING DATA</h4>
                  <p>View hospital admissions</p>
                </div>
              </div>
            </div>
 
            <div className="col-md-6">
              <div className="action-card checkup" onClick={() => navigate(`/doctor/patient/${patient.id}/checkup`)}>
                <div className="icon">📋</div>
                <div className="content">
                  <h4>RECENT CHECKUP</h4>
                  <p>View latest examination data</p>
                </div>
              </div>
            </div>
 
            <div className="col-md-6">
              <div className="action-card referral" onClick={() => navigate(`/doctor/patient/${patient.id}/referral`)}>
                <div className="icon">📨</div>
                <div className="content">
                  <h4>REFERRAL</h4>
                  <p>Create specialist referrals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  return (
    <div className="doctor-dashboard">
      <div className="dashboard-content">
        <div className="sidebar">
          <div className="sidebar-menu">
            <div className="sidebar-title">Menu</div>
            <div className="sidebar-tabs">
              <div className="sidebar-tab active">
                <i className="bi bi-people"></i>
                <span>Patient Database</span>
              </div>
              <div className="sidebar-tab">
                <i className="bi bi-clipboard-check"></i>
                <span>Checkup</span>
              </div>
            </div>
          </div>
 
          <div className="search-box mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="view-toggle mb-3">
            <span style={{color:'#b0b0b0', fontSize:'0.95em', marginRight:'0.5em'}}>View:</span>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={toggleView}
            >
              <i className="bi bi-list"></i>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={toggleView}
            >
              <i className="bi bi-grid"></i>
            </button>
          </div>
 
          <div className="families-list">
            {filteredFamilies.map(family => (
              <div
                key={family.id}
                className={`family-item ${selectedFamily?.id === family.id ? 'active' : ''}`}
              >
                <div
                  className="family-header"
                  onClick={() => handleFamilyClick(family.id)}
                >
                  <i className="bi bi-people"></i>
                  <span className="family-name">{family.name}</span>
                  <i className={`bi ${selectedFamily?.id === family.id ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`}></i>
                </div>
                {selectedFamily?.id === family.id && (
                  <div className="family-members">
                    {family.members.map(member => (
                      <div
                        key={member.id}
                        className={`family-member ${selectedPatient?.id === member.id ? 'active' : ''}`}
                        onClick={() => handlePatientClick(member)}
                      >
                        <i className="bi bi-person"></i>
                        <span>{member.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
 
        <div className="main-content">
          {selectedPatient ? (
            <div className="center-container">
              {renderPatientDetails(selectedPatient)}
            </div>
          ) : (
            <div className="no-selection">
              <div className="icon">👥</div>
              <h3>Patient Database</h3>
              <p>Select a family from the sidebar to view patient information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default DocDashboard;