import React, { useState } from "react";
import "../styles/CheckupRecords.css";

const CheckupRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [checkupData, setCheckupData] = useState([
    { id: 1, date: "2025-03-20", diagnosis: "Flu", doctor: "Dr. Smith", symptoms: "Fever, Cough", medication: "Paracetamol", nextAppointment: "2025-04-05", notes: "Rest and hydrate well." },
    { id: 2, date: "2025-03-18", diagnosis: "Migraine", doctor: "Dr. Johnson", symptoms: "Headache, Nausea", medication: "Ibuprofen", nextAppointment: "2025-04-01", notes: "Avoid bright lights and stress." },
  ]);

  // Filter records based on search term
  const filteredData = checkupData.filter(
    (record) =>
      record.date.includes(searchTerm) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const addNotes = (id) => {
    const newNote = prompt("Enter additional notes:");
    if (newNote !== null) {
      setCheckupData((prevData) =>
        prevData.map((record) =>
          record.id === id ? { ...record, notes: newNote } : record
        )
      );
    }
  };

  return (
    <div className="checkup-container">
      <h2>Recent Checkup Records</h2>
      
      <input
        type="text"
        placeholder="Search by date, diagnosis, or doctor"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      
      <div className="table-container">
        <table className="checkup-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Diagnosis</th>
              <th>Doctor</th>
              <th>Symptoms</th>
              <th>Medication</th>
              <th>Next Appointment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <React.Fragment key={record.id}>
                  <tr>
                    <td>{record.date}</td>
                    <td>{record.diagnosis}</td>
                    <td>{record.doctor}</td>
                    <td>{record.symptoms}</td>
                    <td>{record.medication}</td>
                    <td>{record.nextAppointment}</td>
                    <td>
                      <button className="view-more" onClick={() => toggleDetails(record.id)}>
                        {expandedRow === record.id ? "Hide Details" : "View More"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === record.id && (
                    <tr className="expanded-row">
                      <td colSpan="7">
                        <div className="details-box">
                          <p><strong>Additional Notes:</strong> {record.notes || "No additional details available"}</p>
                          <button className="add-notes" onClick={() => addNotes(record.id)}>Add Notes</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckupRecords;
