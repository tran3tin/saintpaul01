// src/components/forms/DatePicker/DatePicker.jsx

import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import "./DatePicker.css";

const DatePicker = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      error,
      touched,
      required = false,
      disabled = false,
      readOnly = false,
      helpText,
      min,
      max,
      className = "",
      size = "md",
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    return (
      <Form.Group className={`datepicker-group-custom ${className}`}>
        {label && (
          <Form.Label className="datepicker-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}

        <div className={`datepicker-wrapper ${hasError ? "has-error" : ""}`}>
          <span className="datepicker-icon">
            <i className="fas fa-calendar-alt"></i>
          </span>

          <Form.Control
            ref={ref}
            type="date"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            min={min}
            max={max}
            isInvalid={hasError}
            size={size}
            className="datepicker-control"
            {...props}
          />
        </div>

        {helpText && !hasError && (
          <Form.Text className="datepicker-help-text">
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

DatePicker.displayName = "DatePicker";

export default DatePicker;
