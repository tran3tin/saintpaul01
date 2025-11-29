// src/features/auth/components/LoginForm/LoginForm.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import "./LoginForm.css";

const LoginForm = ({ onSubmit, loading, error, onClearError }) => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm({
      username: "",
      password: "",
    });

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
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Tên đăng nhập"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.username}
          touched={touched.username}
          leftIcon="fas fa-user"
          placeholder="Nhập tên đăng nhập"
          disabled={loading}
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          leftIcon="fas fa-lock"
          placeholder="Nhập mật khẩu"
          disabled={loading}
          required
        />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <Form.Check
            type="checkbox"
            label="Ghi nhớ đăng nhập"
            id="remember"
          />
          <Link to="/forgot-password" className="text-primary small">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-100 btn-login"
          disabled={loading}
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
        </Button>
      </Form>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          © 2024 Hệ Thống Quản Lý Hội Dòng
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
