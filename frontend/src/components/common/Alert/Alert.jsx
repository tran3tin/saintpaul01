// src/components/common/Alert/Alert.jsx

import React, { useState, useEffect } from "react";
import { Alert as BootstrapAlert } from "react-bootstrap";
import "./Alert.css";

const Alert = ({
  variant = "info",
  message,
  title,
  dismissible = true,
  show = true,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  icon = true,
  className = "",
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, visible]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const getIcon = () => {
    const icons = {
      success: "fas fa-check-circle",
      danger: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
      primary: "fas fa-bell",
      secondary: "fas fa-info",
    };
    return icons[variant] || icons.info;
  };

  if (!visible) return null;

  return (
    <BootstrapAlert
      variant={variant}
      dismissible={dismissible}
      onClose={handleClose}
      className={`app-alert ${className}`}
    >
      <div className="alert-content">
        {icon && (
          <div className="alert-icon">
            <i className={getIcon()}></i>
          </div>
        )}
        <div className="alert-body">
          {title && <BootstrapAlert.Heading>{title}</BootstrapAlert.Heading>}
          <div className="alert-message">{message}</div>
        </div>
      </div>
    </BootstrapAlert>
  );
};

export default Alert;
