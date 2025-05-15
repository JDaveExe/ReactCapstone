import React, { useEffect, useState } from 'react';
import '../styles/UnsortedMembers.css';
import { getUnsortedMembers, assignFamilyToUnsortedMember, getFamilies } from '../services/api';

export default function UnsortedMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');
  const [existingFamilies, setExistingFamilies] = useState([]);
  const [showNewFamilyInput, setShowNewFamilyInput] = useState(false);

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
    if (!familyName.trim()) {
        setMessage('Family name cannot be empty.');
        return;
    }
    setAssigning(true);
    setMessage('');
    try {
      await assignFamilyToUnsortedMember(id, familyName.trim());
      setMessage('Family assigned successfully!');
      setFamilyName('');
      setSelectedId(null);
      setShowNewFamilyInput(false);
      fetchMembers();
      fetchFamilies();
    } catch (error) {
      console.error("Error assigning family:", error);
      setMessage('Error assigning family. Please try again.');
    }
    setAssigning(false);
  };

  const handleSelectMemberToAssign = (memberId) => {
    setSelectedId(memberId);
    setFamilyName('');
    setShowNewFamilyInput(false);
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
          <tbody>
            {members.map(m => (
              <tr key={m.unsorted_member_id}>
                <td>{m.firstName} {m.lastName}</td>
                <td>{m.email}</td>
                <td>{m.phoneNumber}</td>
                <td>{new Date(m.registrationTime).toLocaleString()}</td>
                <td>
                  {selectedId === m.unsorted_member_id ? (
                    <div className="assign-controls">
                      <select 
                        value={familyName}
                        onChange={e => {
                            setFamilyName(e.target.value);
                            setShowNewFamilyInput(e.target.value === '__NEW__');
                        }}
                        disabled={assigning}
                      >
                        <option value="">Select Existing Family</option>
                        {existingFamilies.map(fam => <option key={fam} value={fam}>{fam}</option>)}
                        <option value="__NEW__">Create New Family</option>
                      </select>
                      {showNewFamilyInput && (
                        <input 
                          type="text"
                          value={familyName === '__NEW__' ? '' : familyName}
                          onChange={e => setFamilyName(e.target.value)} 
                          placeholder="Enter New Family Name" 
                          disabled={assigning}
                        />
                      )}
                      <button onClick={() => handleAssignFamily(m.unsorted_member_id)} disabled={assigning || !familyName || familyName === '__NEW__'}>
                        {assigning ? 'Assigning...' : 'Save'}
                      </button>
                      <button onClick={() => {setSelectedId(null); setMessage(''); setFamilyName(''); setShowNewFamilyInput(false);}} disabled={assigning}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => handleSelectMemberToAssign(m.unsorted_member_id)} className="assign-button">
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
