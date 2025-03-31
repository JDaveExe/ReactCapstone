import React from "react";
import "../styles/AboutUsContentTwo.css";

const AboutUsContentTwo = () => {
  const features = [
    {
      title: "Electronic Health Records (EHR)",
      description: "A secure and efficient system for managing patient records.",
      icon: "📑",
    },
    {
      title: "Revenue Cycle Management",
      description: "Optimize billing and payment processes for better financial health.",
      icon: "💰",
    },
    {
      title: "Claims Processing & Insurance Handling",
      description: "Streamline claims submission and insurance workflows.",
      icon: "✅",
    },
    {
      title: "Maybunga Patient Portal",
      description: "Enable patients to access health records and book appointments online.",
      icon: "🖥️",
    },
    {
      title: "Maybunga Public Health",
      description: "Support community health programs with technology-driven solutions.",
      icon: "🏥",
    },
  ];

  return (
    <section className="about-us-content-two">
      <div className="container">
        <div className="section-heading">
          <h2>Our Healthcare Solutions</h2>
          <p>Comprehensive tools designed for modern healthcare providers</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUsContentTwo;