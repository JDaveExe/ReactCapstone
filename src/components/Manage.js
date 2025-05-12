import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Manage.css';

const Manage = () => {
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);
    // Fetch sorted members grouped by family
    const res = await axios.get('http://localhost:5000/api/sorted-families');
    setFamilies(res.data);
    setLoading(false);
  };

  const handleFamilyClick = (family) => {
    setSelectedFamily(family);
  };

  const handleBack = () => {
    setSelectedFamily(null);
  };

  return (
    <div className="manage-container">
      <h2>Patient Database</h2>
      {loading ? <p>Loading...</p> : (
        selectedFamily ? (
          <div>
            <button onClick={handleBack}>Back to Families</button>
            <h3>Family: {selectedFamily.familyName}</h3>
            <ul>
              {selectedFamily.members.map(m => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h3>Families</h3>
            <ul>
              {families.map(fam => (
                <li key={fam.familyName}>
                  <button onClick={() => handleFamilyClick(fam)}>{fam.familyName} ({fam.members.length})</button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default Manage;