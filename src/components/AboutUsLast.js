import React from "react";
import "../styles/AboutUsLast.css";

const stats = [
  { number: "50+", label: "Years of Service" },
  { number: "10,000+", label: "Patients Served" },
  { number: "100+", label: "Medical Professionals" },
  { number: "5", label: "Healthcare Departments" },
];

const teamMembers = [
  { name: "Dr. John Doe", position: "Chief Medical Officer", image: "doctor1.jpg" },
  { name: "Jane Smith", position: "Head Nurse", image: "nurse1.jpg" },
  { name: "Dr. Alice Brown", position: "Pediatrician", image: "doctor2.jpg" },
  { name: "Mark Wilson", position: "Administrator", image: "admin.jpg" },
];

const AboutUsLast = () => {
  return (
    <section className="about-us-last">
      {/* Stats Section */}
      <div className="stats-section">
        <h2>Maybunga by the Numbers</h2>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meet Our Team Section */}
      <div className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <img src={`/images/${member.image}`} alt={member.name} className="team-image" />
              <h3>{member.name}</h3>
              <p>{member.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsLast;
