// src/components/forms/Select/Select.jsx

import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import "./Select.css";

const Select = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = "Chọn...",
      error,
      touched,
      required = false,
      disabled = false,
      helpText,
      multiple = false,
      className = "",
      size = "md",
      icon = "fas fa-chevron-down",
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    return (
      <Form.Group className={`select-group-custom ${className}`}>
        {label && (
          <Form.Label className="select-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}

        <div className={`select-wrapper ${hasError ? "has-error" : ""}`}>
          <Form.Select
            ref={ref}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            multiple={multiple}
            isInvalid={hasError}
            size={size}
            className="select-control"
            {...props}
          >
            {!multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={index}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Form.Select>

          {!multiple && (
            <span className="select-icon">
              <i className={icon}></i>
            </span>
          )}
        </div>

        {helpText && !hasError && (
          <Form.Text className="select-help-text">
            <i className="fas fa-info-circle me-1"></i>
            {helpText}
          </Form.Text>
        )}

        {hasError && (
          <Form.Control.Feedback type="invalid" className="d-block">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  }
);

Select.displayName = "Select";

export default Select;
