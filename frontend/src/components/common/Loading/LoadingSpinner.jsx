// src/components/common/Loading/LoadingSpinner.jsx

import React from "react";
import "./Loading.css";

const LoadingSpinner = ({ size = "medium", color = "primary" }) => {
  const sizeClass = {
    small: "spinner-sm",
    medium: "spinner-md",
    large: "spinner-lg",
  }[size];

  const colorClass = `spinner-${color}`;

  return (
    <div className={`simple-spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
