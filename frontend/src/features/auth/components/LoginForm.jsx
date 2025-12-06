// src/features/auth/components/LoginForm/LoginForm.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Alert, InputGroup } from "react-bootstrap";
import { useForm } from "@hooks";
import "./LoginForm.css";

const LoginForm = ({
  onSubmit,
  loading,
  error,
  fieldErrors = {},
  onClearError,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldError,
    setFieldTouched,
  } = useForm({
    username: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Custom handleChange để clear errors khi user gõ
  const handleInputChange = (e) => {
    handleChange(e);
    
    // Clear field error khi user bắt đầu gõ
    const fieldName = e.target.name;
    if (errors[fieldName]) {
      setFieldError(fieldName, undefined);
    }
    
    // Clear general error khi user bắt đầu gõ
    if (onClearError) {
      onClearError();
    }
  };

  // Merge backend errors with local errors
  React.useEffect(() => {
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      Object.keys(fieldErrors).forEach((fieldName) => {
        setFieldError(fieldName, fieldErrors[fieldName]);
        setFieldTouched(fieldName, true);
      });
    }
  }, [fieldErrors, setFieldError, setFieldTouched]);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!values.username || !values.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    }

    if (!values.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    return newErrors;
  };

  // Handle form submission with validation
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      // Set errors to display
      Object.keys(validationErrors).forEach((fieldName) => {
        setFieldError(fieldName, validationErrors[fieldName]);
        setFieldTouched(fieldName, true);
      });
      return;
    }

    // Submit if validation passes
    await onSubmit(values);
  };

  return (
    <div className="login-form">
      {/* Logo */}
      <div className="text-center mb-4">
        <div className="login-logo">
          <i className="fas fa-church"></i>
        </div>
        <h3 className="login-title mt-3">Đăng nhập</h3>
        <p className="login-subtitle text-muted">
          Nhập thông tin tài khoản của bạn
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={onClearError}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            Tên đăng nhập <span className="text-danger">*</span>
          </Form.Label>
          <InputGroup>
            <InputGroup.Text className="input-icon">
              <i className="fas fa-user"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="username"
              value={values.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              isInvalid={touched.username && errors.username}
              autoComplete="username"
            />
          </InputGroup>
          {touched.username && errors.username && (
            <Form.Control.Feedback type="invalid" className="d-block">
              <i className="fas fa-exclamation-circle me-1"></i>
              {errors.username}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            Mật khẩu <span className="text-danger">*</span>
          </Form.Label>
          <InputGroup>
            <InputGroup.Text className="input-icon">
              <i className="fas fa-lock"></i>
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              isInvalid={touched.password && errors.password}
              autoComplete="current-password"
            />
            <InputGroup.Text
              className="password-toggle"
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              <i
                className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              ></i>
            </InputGroup.Text>
          </InputGroup>
          {touched.password && errors.password && (
            <Form.Control.Feedback type="invalid" className="d-block">
              <i className="fas fa-exclamation-circle me-1"></i>
              {errors.password}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <Form.Check type="checkbox" label="Ghi nhớ đăng nhập" id="remember" />
          <Link to="/forgot-password" className="text-primary small">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 btn-login"
          disabled={loading}
          style={{
            padding: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px'
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt me-2"></i>
              Đăng nhập
            </>
          )}
        </button>
      </Form>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          © 2025 Hệ Thống Quản Lý Hội Dòng
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
