// src/components/forms/TextArea/TextArea.jsx

import React, { forwardRef, useState } from "react";
import { Form } from "react-bootstrap";
import "./TextArea.css";

const TextArea = forwardRef(
  (
    {
      label,
      name,
      value = "",
      onChange,
      onBlur,
      placeholder,
      error,
      touched,
      required = false,
      disabled = false,
      readOnly = false,
      helpText,
      rows = 4,
      maxLength,
      showCharCount = false,
      resize = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;
    const [charCount, setCharCount] = useState(value?.length || 0);

    const handleChange = (e) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Form.Group className={`textarea-group-custom ${className}`}>
        {label && (
          <Form.Label className="textarea-label">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}

        <div className={`textarea-wrapper ${hasError ? "has-error" : ""}`}>
          <Form.Control
            ref={ref}
            as="textarea"
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            maxLength={maxLength}
            isInvalid={hasError}
            className={`textarea-control ${!resize ? "no-resize" : ""}`}
            {...props}
          />

          {showCharCount && maxLength && (
            <div className="char-count">
              <span className={charCount >= maxLength ? "text-danger" : ""}>
                {charCount}
              </span>
              /{maxLength}
            </div>
          )}
        </div>

        {helpText && !hasError && (
          <Form.Text className="textarea-help-text">
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

TextArea.displayName = "TextArea";

export default TextArea;
