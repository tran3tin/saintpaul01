// src/components/forms/SearchableSelect/SearchableSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import "./SearchableSelect.css";

/**
 * SearchableSelect - A select component with search functionality
 * Shows max 5 items with scrollbar for more
 */
const SearchableSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Nhập để tìm kiếm...",
  error,
  touched,
  required = false,
  disabled = false,
  hint,
  maxDisplayItems = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Update display value when value changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(value)
      );
      if (selectedOption) {
        setDisplayValue(selectedOption.label);
        setSearchTerm("");
      }
    } else {
      setDisplayValue("");
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectOption = (option) => {
    // Create synthetic event for onChange
    const syntheticEvent = {
      target: {
        name,
        value: option.value,
      },
    };
    onChange(syntheticEvent);
    setDisplayValue(option.label);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: {
        name,
        value: "",
      },
    };
    onChange(syntheticEvent);
    setDisplayValue("");
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const isInvalid = touched && error;
  const itemHeight = 42; // height of each item in pixels
  const maxHeight = maxDisplayItems * itemHeight;

  return (
    <Form.Group className="searchable-select-wrapper mb-3" ref={wrapperRef}>
      {label && (
        <Form.Label className="searchable-select-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <div
        className={`searchable-select-container ${
          isInvalid ? "is-invalid" : ""
        } ${disabled ? "disabled" : ""}`}
      >
        <div className="searchable-select-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="searchable-select-input"
            placeholder={displayValue || placeholder}
            value={isOpen ? searchTerm : displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            name={name}
            autoComplete="off"
          />

          {value && !disabled && (
            <button
              type="button"
              className="searchable-select-clear"
              onClick={handleClear}
              tabIndex={-1}
            >
              <i className="fas fa-times"></i>
            </button>
          )}

          <span className="searchable-select-icon">
            <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
          </span>
        </div>

        {isOpen && !disabled && (
          <div
            className="searchable-select-dropdown"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className={`searchable-select-option ${
                    String(value) === String(option.value) ? "selected" : ""
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="searchable-select-no-results">
                <i className="fas fa-search me-2"></i>
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        )}
      </div>

      {hint && !isInvalid && (
        <Form.Text className="text-muted">{hint}</Form.Text>
      )}

      {isInvalid && (
        <Form.Control.Feedback type="invalid" className="d-block">
          <i className="fas fa-exclamation-circle me-1"></i>
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default SearchableSelect;
