import React from "react";
import "../styles/AboutUs.css";
import AboutUsHeader from "./AboutUsHeader";
import AboutUsContentOne from "./AboutUsContentOne";
import AboutUsContentTwo from "./AboutUsContentTwo";
import AboutUsHistory from "./AboutUsHistory";
import AboutUsLast from "./AboutUsLast";

const AboutUs = () => {
  return (
    <div className="about-us">
      <AboutUsHeader />
      <AboutUsContentOne />
      <AboutUsContentTwo />
      <AboutUsHistory />
      <AboutUsLast />
    </div>
  );
};

export default AboutUs;
