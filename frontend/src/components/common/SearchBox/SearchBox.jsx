// src/components/common/SearchBox/SearchBox.jsx

import React, { useState, useEffect } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import "./SearchBox.css";

const SearchBox = ({
  placeholder = "Tìm kiếm...",
  value = "",
  onChange,
  onSearch,
  onClear,
  debounceDelay = 500,
  showSearchButton = false,
  showClearButton = true,
  size = "md",
  className = "",
  icon = "fas fa-search",
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [debouncedTerm, setDebouncedTerm] = useState(value);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Call onChange when debounced term changes
  useEffect(() => {
    if (onChange) {
      onChange(debouncedTerm);
    }
  }, [debouncedTerm]);

  // Update local state when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedTerm("");
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`search-box ${className}`}>
      <InputGroup size={size} className="search-input-group">
        <InputGroup.Text className="search-icon">
          <i className={icon}></i>
        </InputGroup.Text>

        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />

        {showClearButton && searchTerm && (
          <Button
            variant="link"
            className="btn-clear"
            onClick={handleClear}
            title="Xóa"
          >
            <i className="fas fa-times"></i>
          </Button>
        )}

        {showSearchButton && (
          <Button
            variant="primary"
            onClick={handleSearch}
            className="btn-search"
          >
            <i className="fas fa-search me-2"></i>
            Tìm kiếm
          </Button>
        )}
      </InputGroup>
    </div>
  );
};

export default SearchBox;
