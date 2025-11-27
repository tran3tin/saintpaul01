// src/components/common/Loading/LoadingOverlay.jsx

import React from "react";
import Loading from "./Loading";
import "./Loading.css";

const LoadingOverlay = ({ show = false, text = "Đang xử lý...", children }) => {
  return (
    <div className="loading-overlay-wrapper">
      {children}
      {show && (
        <div className="loading-overlay-backdrop">
          <Loading text={text} size="large" />
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
