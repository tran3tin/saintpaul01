// src/components/common/Loading/Loading.jsx

import React from "react";
import "./Loading.css";

const Loading = ({
  size = "medium",
  text = "Đang tải...",
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClass = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  }[size];

  const content = (
    <div className={`loading-container ${sizeClass}`}>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  if (overlay) {
    return <div className="loading-overlay">{content}</div>;
  }

  return content;
};

export default Loading;
