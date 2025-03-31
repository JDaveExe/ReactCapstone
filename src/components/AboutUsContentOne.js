import React from "react";
import "../styles/AboutUsContentOne.css";

const AboutUsContentOne = () => {
  const solutions = [
    {
      icon: "🩺",
      title: "Patient Engagement Tools",
      description:
        "Improve patient experience with online scheduling, reminders, and secure messaging.",
    },
    {
      icon: "📄",
      title: "Electronic Health Records (EHR)",
      description:
        "Simplified and secure EHR system to manage patient data efficiently.",
    },
    {
      icon: "👨‍⚕️",
      title: "Consultation & Telehealth",
      description:
        "Offer virtual consultations and telehealth services for better accessibility.",
    },
  ];

  return (
    <section className="about-us-content-one">
      <h2>User-friendly, integrated healthcare technology solutions</h2>
      <p>
        Keep your patients healthy, your providers happy, and your practice
        successful with simplified solutions for EHR, practice management,
        billing, and beyond.
      </p>

      <div className="solutions-container">
        {solutions.map((item, index) => (
          <div className="solution-card" key={index}>
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUsContentOne;
