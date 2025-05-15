import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function FamilyDebugger() {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDebugData() {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/debug/all-user-family-data`);
        setAllData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching debug data:', err);
        setError(err.message || 'Failed to fetch debug data');
      } finally {
        setLoading(false);
      }
    }

    fetchDebugData();
  }, []);

  const testFamilyMembers = async (familyId) => {
    try {
      console.log(`Testing family ID: ${familyId}`);
      const response = await axios.get(`${API_URL}/families/${familyId}/members`);
      console.log(`Regular API response for family ${familyId}:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Error testing family ${familyId}:`, err);
      return { error: err.message };
    }
  };

  const testDebugEndpoint = async (familyId) => {
    try {
      console.log(`Testing debug endpoint for family ID: ${familyId}`);
      const response = await axios.get(`${API_URL}/debug/family-members/${familyId}`);
      console.log(`Debug API response for family ${familyId}:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Error testing debug endpoint for family ${familyId}:`, err);
      return { error: err.message };
    }
  };

  const runTests = async (familyId) => {
    const regularResult = await testFamilyMembers(familyId);
    const debugResult = await testDebugEndpoint(familyId);

    alert(`
      Test Results for Family ID ${familyId}:
      
      Regular API: Found ${regularResult.length || 0} members
      Debug API: Found ${debugResult.members ? debugResult.members.length : 0} members
      
      See console for details.
    `);
  };

  if (loading) return <div>Loading debug data...</div>;
  if (error) return <div>Error: {error}</div>;

  // Group users by family
  const familyGroups = {};
  if (allData && allData.users) {
    allData.users.forEach(user => {
      const familyId = user.familyId;
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = {
          familyId: familyId,
          familyName: user.familyName,
          members: []
        };
      }
      familyGroups[familyId].members.push(user);
    });
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Family Relationship Debugger</h1>
      
      <p>
        Total users with family assignments: {allData?.userCount || 0}
      </p>

      <h2>Families and Their Members</h2>
      
      {Object.values(familyGroups).map(family => (
        <div 
          key={family.familyId} 
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          <h3>
            Family: {family.familyName} (ID: {family.familyId})
            <button 
              onClick={() => runTests(family.familyId)} 
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                background: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Test API
            </button>
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>User ID</th>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>FamilyId (Type)</th>
                <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ddd' }}>Family Table ID</th>
              </tr>
            </thead>
            <tbody>
              {family.members.map(member => (
                <tr key={member.userId}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{member.userId}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {member.firstName} {member.lastName}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{member.email || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{member.phoneNumber || 'N/A'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {member.familyId} ({typeof member.familyId})
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {member.familyTableId} ({typeof member.familyTableId})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default FamilyDebugger;
