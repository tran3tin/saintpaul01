// src/components/forms/FormGroup/FormGroup.jsx

import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import "./FormGroup.css";

const FormGroup = ({
  title,
  subtitle,
  icon,
  children,
  columns = 1,
  className = "",
  collapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpand = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const getColumnClass = () => {
    const colMap = {
      1: "col-12",
      2: "col-md-6",
      3: "col-lg-4",
      4: "col-lg-3",
    };
    return colMap[columns] || "col-12";
  };

  return (
    <div className={`form-group-section ${className}`}>
      {(title || subtitle) && (
        <div
          className={`form-group-header ${collapsible ? "collapsible" : ""}`}
          onClick={toggleExpand}
        >
          <div className="form-group-header-content">
            {icon && (
              <div className="form-group-icon">
                <i className={icon}></i>
              </div>
            )}
            <div className="form-group-title-wrapper">
              {title && <h5 className="form-group-title">{title}</h5>}
              {subtitle && <p className="form-group-subtitle">{subtitle}</p>}
            </div>
          </div>
          {collapsible && (
            <div className="form-group-toggle">
              <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="form-group-body">
          <Row>
            {React.Children.map(children, (child) => (
              <Col className={getColumnClass()}>{child}</Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default FormGroup;
