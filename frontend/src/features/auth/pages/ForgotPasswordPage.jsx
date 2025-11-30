// src/features/auth/pages/ForgotPasswordPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
  return (
    <div className="forgot-password-form">
      {/* Icon */}
      <div className="text-center mb-4">
        <div className="forgot-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h3 className="forgot-title mt-3">Quên mật khẩu?</h3>
        <p className="forgot-subtitle text-muted">
          Vui lòng liên hệ quản trị viên để được cấp lại mật khẩu
        </p>
      </div>

      {/* Contact Info */}
      <div className="contact-info">
        <div className="contact-item">
          <i className="fas fa-envelope"></i>
          <div>
            <span className="contact-label">Email</span>
            <a href="mailto:clarakimsoa@gmail.com" className="contact-value">
              clarakimsoa@gmail.com
            </a>
          </div>
        </div>

        <div className="contact-item">
          <i className="fas fa-phone"></i>
          <div>
            <span className="contact-label">Điện thoại</span>
            <a href="tel:0979454576" className="contact-value">
              0979 454 576
            </a>
          </div>
        </div>
      </div>

      {/* Back to login */}
      <div className="text-center mt-4">
        <Link to="/login" className="btn btn-primary w-100 btn-back">
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-muted small mb-0">
          © 2025 Hệ Thống Quản Lý Hội Dòng
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
