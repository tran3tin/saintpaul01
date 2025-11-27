// src/components/forms/Input/Input.jsx

import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import "./Input.css";

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      onBlur,
      placeholder,
      error,
      touched,
      required = false,
      disabled = false,
      readOnly = false,
      helpText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = "",
      inputClassName = "",
      size = "md",
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    return (
      <Form.Group className={`input-group-custom ${className}`}>
        {label && (
          <Form.Label className="input-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}

        <div className={`input-wrapper ${hasError ? "has-error" : ""}`}>
          {leftIcon && (
            <span className="input-icon input-icon-left">
              <i className={leftIcon}></i>
            </span>
          )}

          <Form.Control
            ref={ref}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            isInvalid={hasError}
            size={size}
            className={`
            ${inputClassName}
            ${leftIcon ? "has-left-icon" : ""}
            ${rightIcon ? "has-right-icon" : ""}
          `}
            {...props}
          />

          {rightIcon && (
            <span
              className={`input-icon input-icon-right ${
                onRightIconClick ? "clickable" : ""
              }`}
              onClick={onRightIconClick}
            >
              <i className={rightIcon}></i>
            </span>
          )}
        </div>

        {helpText && !hasError && (
          <Form.Text className="input-help-text">
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

Input.displayName = "Input";

export default Input;
