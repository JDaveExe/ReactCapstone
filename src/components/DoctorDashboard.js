import { useState } from 'react';
import { Search, User, Calendar, FileText, Beaker, CheckSquare, ChevronRight, Grid, List, Shield, Activity, AlarmClock } from 'lucide-react';
import '../styles/SidebarDoc.css';
import '../styles/DoctorDashboard.css';

export default function DoctorDashboard() {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const families = [
    { id: 1, name: 'Smith Family' },
    { id: 2, name: 'Johnson Family' },
    { id: 3, name: 'Williams Family' },
    { id: 4, name: 'Davis Family' },
    { id: 5, name: 'Brown Family' },
  ];

  const familyMembers = {
    1: [
      { id: 1, name: 'James Smith', age: 15, gender: 'Male', lastCheckup: '2025-04-08', phone: '(555) 123-4567', email: 'james@example.com', address: '123 Main St, Cityville' },
      { id: 2, name: 'Sarah Smith', age: 42, gender: 'Female', lastCheckup: '2025-03-15', phone: '(555) 234-5678', email: 'sarah@example.com', address: '123 Main St, Cityville' },
      { id: 3, name: 'Michael Smith', age: 45, gender: 'Male', lastCheckup: '2025-02-22', phone: '(555) 345-6789', email: 'michael@example.com', address: '123 Main St, Cityville' }
    ],
    2: [
      { id: 4, name: 'Emma Johnson', age: 38, gender: 'Female', lastCheckup: '2025-04-01', phone: '(555) 456-7890', email: 'emma@example.com', address: '456 Oak Ave, Townsville' },
      { id: 5, name: 'Robert Johnson', age: 40, gender: 'Male', lastCheckup: '2025-03-20', phone: '(555) 567-8901', email: 'robert@example.com', address: '456 Oak Ave, Townsville' }
    ],
    3: [
      { id: 6, name: 'Linda Williams', age: 35, gender: 'Female', lastCheckup: '2025-04-05', phone: '(555) 678-9012', email: 'linda@example.com', address: '789 Pine Dr, Villagetown' }
    ],
    4: [
      { id: 7, name: 'Thomas Davis', age: 52, gender: 'Male', lastCheckup: '2025-03-25', phone: '(555) 789-0123', email: 'thomas@example.com', address: '101 Elm St, Hamletville' },
      { id: 8, name: 'Patricia Davis', age: 50, gender: 'Female', lastCheckup: '2025-03-26', phone: '(555) 890-1234', email: 'patricia@example.com', address: '101 Elm St, Hamletville' },
      { id: 9, name: 'Christopher Davis', age: 22, gender: 'Male', lastCheckup: '2025-04-02', phone: '(555) 901-2345', email: 'chris@example.com', address: '101 Elm St, Hamletville' }
    ],
    5: [
      { id: 10, name: 'Jessica Brown', age: 45, gender: 'Female', lastCheckup: '2025-03-18', phone: '(555) 012-3456', email: 'jessica@example.com', address: '202 Cedar Ln, Boroughburg' },
      { id: 11, name: 'Daniel Brown', age: 47, gender: 'Male', lastCheckup: '2025-03-19', phone: '(555) 123-4567', email: 'daniel@example.com', address: '202 Cedar Ln, Boroughburg' }
    ]
  };

  const handleFamilyClick = (familyId) => {
    setSelectedFamily(familyId);
    setSelectedMember(null);
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const handleBackClick = () => {
    if (selectedMember) {
      setSelectedMember(null);
    } else if (selectedFamily) {
      setSelectedFamily(null);
    }
  };

  return (
    <div className="docdash-root">
      {/* Header */}
      <header className="docdash-header">
        <div className="docdash-header-left">
          <div className="docdash-logo"></div>
          <h1 className="docdash-title">Maybunga Healthcare Center</h1>
        </div>
        <div className="docdash-header-right">
          <div className="docdash-avatar"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="docdash-main">
        {/* Sidebar */}
        <aside className="docdash-sidebar">
          <div className="docdash-menu-title">Menu</div>
          <nav className="docdash-menu">
            <ul>
              <li className="docdash-menuitem">
                <a href="#" className="docdash-menu-link">
                  <CheckSquare size={20} className="docdash-menu-icon" />
                  <span>Check Ups</span>
                </a>
              </li>
              <li className="docdash-menuitem docdash-menuitem-active">
                <a href="#" className="docdash-menu-link">
                  <User size={20} className="docdash-menu-icon" />
                  <span>Patient Database</span>
                </a>
              </li>
              <li className="docdash-menuitem">
                <a href="#" className="docdash-menu-link">
                  <Calendar size={20} className="docdash-menu-icon" />
                  <span>Appointment</span>
                </a>
              </li>
              <li className="docdash-menuitem">
                <a href="#" className="docdash-menu-link">
                  <FileText size={20} className="docdash-menu-icon" />
                  <span>Medical Records</span>
                </a>
              </li>
              <li className="docdash-menuitem">
                <a href="#" className="docdash-menu-link">
                  <Beaker size={20} className="docdash-menu-icon" />
                  <span>Lab Results</span>
                </a>
              </li>
            </ul>
          </nav>

          <div className="docdash-sidebar-bottom">
            <div className="docdash-searchbar">
              <Search size={16} className="docdash-search-icon" />
              <input 
                type="text" 
                placeholder="Search Families" 
                className="docdash-search-input"
              />
            </div>

            <div className="docdash-views-row">
              <span className="docdash-views-label">Views:</span>
              <button 
                className={`docdash-viewbtn${viewMode === 'list' ? ' docdash-viewbtn-active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
              <button 
                className={`docdash-viewbtn${viewMode === 'grid' ? ' docdash-viewbtn-active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </button>
            </div>

            <div className="docdash-family-list">
              {families.map(family => (
                <div 
                  key={family.id} 
                  className={`docdash-family-item${selectedFamily === family.id ? ' docdash-family-item-active' : ''}`}
                  onClick={() => handleFamilyClick(family.id)}
                >
                  <span>{family.name}</span>
                  <ChevronRight size={16} />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="docdash-content">
          <div className="docdash-content-header">
            <h2 className="docdash-content-title">DOCTOR DASHBOARD</h2>
            {(selectedFamily || selectedMember) && (
              <button 
                onClick={handleBackClick}
                className="docdash-backbtn"
              >
                Back
              </button>
            )}
          </div>

          {!selectedFamily && (
            <div className="docdash-empty-state">
              <p>Select a family to view members</p>
            </div>
          )}

          {selectedFamily && !selectedMember && (
            <div>
              <h3 className="docdash-section-title">{families.find(f => f.id === selectedFamily)?.name} Members</h3>
              <div className={viewMode === 'grid' ? 'docdash-members-grid' : 'docdash-members-list'}>
                {familyMembers[selectedFamily]?.map(member => (
                  <div 
                    key={member.id}
                    className={`docdash-member-card${viewMode === 'list' ? ' docdash-member-card-list' : ''}`}
                    onClick={() => handleMemberClick(member)}
                  >
                    <div className="docdash-member-avatar"><User size={20} /></div>
                    <div className="docdash-member-info">
                      <p className="docdash-member-name">{member.name}</p>
                      <p className="docdash-member-last">Last checkup: {member.lastCheckup}</p>
                    </div>
                    <ChevronRight size={16} className="docdash-member-chevron" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMember && (
            <div>
              <div className="docdash-member-header">
                <h3 className="docdash-member-detail-title">{selectedMember.name}</h3>
                <button className="docdash-emailbtn">Email Family</button>
              </div>

              <div className="docdash-info-card">
                <h4 className="docdash-info-title">Personal Information</h4>
                <div className="docdash-info-grid">
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Age</p>
                    <p>{selectedMember.age} years</p>
                  </div>
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Gender</p>
                    <p>{selectedMember.gender}</p>
                  </div>
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Last Checkup</p>
                    <p>{selectedMember.lastCheckup}</p>
                  </div>
                </div>
              </div>

              <div className="docdash-info-card">
                <h4 className="docdash-info-title">Contact Information</h4>
                <div className="docdash-info-grid">
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Phone</p>
                    <p>{selectedMember.phone}</p>
                  </div>
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Email</p>
                    <p>{selectedMember.email}</p>
                  </div>
                  <div className="docdash-info-item">
                    <p className="docdash-info-label">Address</p>
                    <p>{selectedMember.address}</p>
                  </div>
                </div>
              </div>

              <div className="docdash-actions-grid">
                <div className="docdash-action-card">
                  <div className="docdash-action-avatar"><User size={20} /></div>
                  <div>
                    <h5 className="docdash-action-title">Check-up Profile</h5>
                    <p className="docdash-action-desc">Full examination details</p>
                  </div>
                </div>
                <div className="docdash-action-card">
                  <div className="docdash-action-avatar"><Activity size={20} /></div>
                  <div>
                    <h5 className="docdash-action-title">Medical History</h5>
                    <p className="docdash-action-desc">Previous medical records</p>
                  </div>
                </div>
                <div className="docdash-action-card">
                  <div className="docdash-action-avatar"><AlarmClock size={20} /></div>
                  <div>
                    <h5 className="docdash-action-title">Schedule Visit</h5>
                    <p className="docdash-action-desc">Set up new appointment</p>
                  </div>
                </div>
              </div>

              <div className="docdash-info-card docdash-labresults-card">
                <h4 className="docdash-info-title">Recent Lab Results</h4>
                <div className="docdash-labresults-list">
                  <div className="docdash-labresult-row">
                    <div>
                      <p className="docdash-labresult-name">Blood Test</p>
                      <p className="docdash-labresult-date">04/01/2025</p>
                    </div>
                    <span className="docdash-labresult-status docdash-status-normal">Normal</span>
                  </div>
                  <div className="docdash-labresult-row">
                    <div>
                      <p className="docdash-labresult-name">Cholesterol Panel</p>
                      <p className="docdash-labresult-date">03/15/2025</p>
                    </div>
                    <span className="docdash-labresult-status docdash-status-review">Review</span>
                  </div>
                  <div className="docdash-labresult-row">
                    <div>
                      <p className="docdash-labresult-name">Urinalysis</p>
                      <p className="docdash-labresult-date">03/15/2025</p>
                    </div>
                    <span className="docdash-labresult-status docdash-status-normal">Normal</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
