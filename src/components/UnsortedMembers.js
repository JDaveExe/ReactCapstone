import React, { useEffect, useState } from 'react';
import '../styles/UnsortedMembers.css';
import { getUnsortedMembers, assignFamilyToUnsortedMember, getFamilies } from '../services/api';

export default function UnsortedMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningMap, setAssigningMap] = useState({});
  const [memberStates, setMemberStates] = useState({});
  const [message, setMessage] = useState('');
  const [existingFamilies, setExistingFamilies] = useState([]);

  useEffect(() => {
    fetchMembers();
    fetchFamilies();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await getUnsortedMembers();
      setMembers(res.data);
    } catch (error) {
      console.error("Error fetching unsorted members:", error);
      setMessage('Error fetching unsorted members. Please try again.');
    }
    setLoading(false);
  };

  const fetchFamilies = async () => {
    try {
      const res = await getFamilies();
      setExistingFamilies(res.data.map(f => f.familyName));
    } catch (error) {
      console.error("Error fetching families:", error);
    }
  };
  const handleAssignFamily = async (id) => {
    const memberState = memberStates[id] || {};
    const familyName = memberState.familyName || '';
    
    if (!familyName.trim()) {
        setMessage('Family name cannot be empty.');
        return;
    }
    
    // Set assigning state for this specific member
    setAssigningMap(prev => ({ ...prev, [id]: true }));
    setMessage('');
    
    try {
      await assignFamilyToUnsortedMember(id, familyName.trim());
      setMessage('Family assigned successfully!');
      
      // Reset state for this member
      setMemberStates(prev => {
        const newStates = { ...prev };
        delete newStates[id]; // Remove this member's state
        return newStates;
      });
      
      fetchMembers();
      fetchFamilies();
    } catch (error) {
      console.error("Error assigning family:", error);
      setMessage('Error assigning family. Please try again.');
    }
    
    setAssigningMap(prev => ({ ...prev, [id]: false }));
  };

  const handleSelectMemberToAssign = (memberId) => {
    // Initialize state for this member if not already set
    setMemberStates(prev => ({
      ...prev,
      [memberId]: { 
        familyName: '', 
        showNewFamilyInput: false 
      }
    }));
    
    setMessage('');
  }

  if (loading) {
    return <div className="unsorted-loading">Loading unsorted members...</div>;
  }

  return (
    <div className="unsorted-members-container">
      <div className="unsorted-title">Unsorted Members</div>
      <div className="unsorted-desc">These are newly registered users. Assign them to a family to move them to the Patient Database.</div>
      {message && <div className={`alert ${message.startsWith('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}
      
      {members.length === 0 && !loading && (
        <div className="unsorted-empty">No unsorted members found.</div>
      )}

      {members.length > 0 && (
        <table className="unsorted-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Registration Time</th>
              <th>Assign Family</th>
            </tr>
          </thead>
          <tbody>            {members.map(m => (
              <tr key={m.id}>
                <td>{m.firstName} {m.lastName}</td>
                <td>{m.email}</td>
                <td>{m.phoneNumber}</td>
                <td>{new Date(m.registrationTime || Date.now()).toLocaleString()}</td>                <td>
                  {memberStates[m.id] ? (
                    <div className="assign-controls">                      <select 
                        value={memberStates[m.id]?.familyName || ''}
                        onChange={e => {
                            const newValue = e.target.value;
                            setMemberStates(prev => ({
                                ...prev,
                                [m.id]: {
                                    ...prev[m.id],
                                    familyName: newValue,
                                    showNewFamilyInput: newValue === '__NEW__'
                                }
                            }));
                        }}
                        disabled={assigningMap[m.id]}
                      >
                        <option value="">Select Existing Family</option>
                        {existingFamilies.map(fam => <option key={fam} value={fam}>{fam}</option>)}
                        <option value="__NEW__">Create New Family</option>
                      </select>                      {memberStates[m.id]?.showNewFamilyInput && (
                        <input 
                          type="text"
                          value={memberStates[m.id]?.familyName === '__NEW__' ? '' : 
                                 memberStates[m.id]?.familyName || ''}
                          onChange={e => {
                              const newValue = e.target.value;
                              setMemberStates(prev => ({
                                  ...prev,
                                  [m.id]: {
                                      ...prev[m.id],
                                      familyName: newValue
                                  }
                              }));
                          }}
                          placeholder="Enter New Family Name" 
                          disabled={assigningMap[m.id]}
                        />
                      )}                      <button 
                        onClick={() => handleAssignFamily(m.id)} 
                        disabled={assigningMap[m.id] || 
                                 !memberStates[m.id]?.familyName || 
                                 memberStates[m.id]?.familyName === '__NEW__'}
                      >
                        {assigningMap[m.id] ? 'Assigning...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => {
                            // Remove this member's state entirely
                            setMemberStates(prev => {
                                const newStates = { ...prev };
                                delete newStates[m.id];
                                return newStates;
                            });
                            setMessage('');
                        }} 
                        disabled={assigningMap[m.id]}
                      >
                        Cancel
                      </button>
                    </div>                  ) : (
                    <button onClick={() => handleSelectMemberToAssign(m.id)} className="assign-button">
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
