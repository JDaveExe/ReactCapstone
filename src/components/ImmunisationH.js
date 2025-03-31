import React, { useState } from "react";
import "../styles/ImmunisationH.css";

function ImmunisationH() {
    // Sample data - replace with your actual data or API call
    const [immunisations, setImmunisations] = useState([
        { id: 1, name: "BCG", dateReceived: "2022-05-15", given: "Yes" },
        { id: 2, name: "Hepatitis B", dateReceived: "2022-06-20", given: "Yes" },
        { id: 3, name: "Polio (OPV)", dateReceived: "2022-07-10", given: "Yes" },
        { id: 4, name: "DTaP", dateReceived: "2022-08-05", given: "Yes" },
        { id: 5, name: "MMR", dateReceived: "", given: "No" },
    ]);

    // Format date to display in a more readable format
    const formatDate = (dateString) => {
        if (!dateString) return "Not received";

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="immunisation-history-container">
            <h1>Immunisation History</h1>

            <div className="immunisation-table">
                <div className="table-header">
                    <div className="header-cell">IMMUNIZATION</div>
                    <div className="header-cell">DATE RECIEVED</div>
                    <div className="header-cell">GIVEN</div>
                </div>

                {immunisations.map((vaccine) => (
                    <div key={vaccine.id} className="table-row">
                        <div className="row-cell">{vaccine.name}</div>
                        <div className="row-cell">{formatDate(vaccine.dateReceived)}</div>
                        <div className="row-cell">{vaccine.given}</div>
                    </div>
                ))}

                {/* Empty rows to match the UI in the image */}
                {[...Array(5 - immunisations.length)].map((_, index) => (
                    <div key={`empty-${index}`} className="table-row empty-row">
                        <div className="row-cell"></div>
                        <div className="row-cell"></div>
                        <div className="row-cell"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImmunisationH;