import React, { useEffect, useState } from 'react';
import '../styles/UnsortedMembers.css';
import axios from 'axios';

export default function UnsortedMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/api/unsorted');
    setMembers(res.data);
    setLoading(false);
  };

  const handleAssignFamily = async (id) => {
    if (!familyName) return;
    await axios.patch(`http://localhost:5000/api/unsorted/${id}/assign-family`, { assignedFamily: familyName });
    setMessage('Family assigned!');
    setFamilyName('');
    setSelectedId(null);
    fetchMembers();
  };

  return (
    <div className="unsorted-members-container">
      <div className="unsorted-title">Unsorted Members</div>
      <div className="unsorted-desc">These are newly registered users. Assign them to a family to move them to the Patient Database.</div>
      {message && <div className="alert alert-success">{message}</div>}
      {loading ? <p>Loading...</p> : (
        <table className="unsorted-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Registration Time</th>
              <th>Assign Family</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{new Date(m.registrationTime).toLocaleString()}</td>
                <td>
                  {selectedId === m.id ? (
                    <>
                      <input value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Family Name" />
                      <button onClick={() => handleAssignFamily(m.id)}>Save</button>
                      <button onClick={() => setSelectedId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setSelectedId(m.id)}>Assign</button>
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
