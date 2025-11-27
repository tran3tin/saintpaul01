// src/components/common/Footer/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section footer-left">
          <div className="footer-brand">
            <i className="fas fa-church me-2"></i>
            <span>Hệ Thống Quản Lý Hội Dòng</span>
          </div>
          <p className="footer-description">
            Hệ thống quản lý thông tin nữ tu, hành trình ơn gọi và các hoạt động
            của Hội Dòng
          </p>
        </div>

        <div className="footer-section footer-links">
          <h6 className="footer-title">Liên kết nhanh</h6>
          <ul className="footer-menu">
            <li>
              <Link to="/dashboard">
                <i className="fas fa-home me-2"></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/nu-tu">
                <i className="fas fa-users me-2"></i>
                Quản lý Nữ Tu
              </Link>
            </li>
            <li>
              <Link to="/bao-cao">
                <i className="fas fa-chart-bar me-2"></i>
                Báo cáo
              </Link>
            </li>
            <li>
              <Link to="/help">
                <i className="fas fa-question-circle me-2"></i>
                Trợ giúp
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section footer-support">
          <h6 className="footer-title">Hỗ trợ</h6>
          <ul className="footer-menu">
            <li>
              <Link to="/help/guide">
                <i className="fas fa-book me-2"></i>
                Hướng dẫn sử dụng
              </Link>
            </li>
            <li>
              <Link to="/help/faq">
                <i className="fas fa-question me-2"></i>
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="/contact">
                <i className="fas fa-envelope me-2"></i>
                Liên hệ
              </Link>
            </li>
            <li>
              <Link to="/about">
                <i className="fas fa-info-circle me-2"></i>
                Về chúng tôi
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section footer-contact">
          <h6 className="footer-title">Thông tin liên hệ</h6>
          <ul className="footer-contact-list">
            <li>
              <i className="fas fa-map-marker-alt me-2"></i>
              <span>Hà Nội, Việt Nam</span>
            </li>
            <li>
              <i className="fas fa-phone me-2"></i>
              <a href="tel:+84123456789">+84 123 456 789</a>
            </li>
            <li>
              <i className="fas fa-envelope me-2"></i>
              <a href="mailto:info@hoidong.vn">info@hoidong.vn</a>
            </li>
          </ul>
          <div className="footer-social">
            <a href="#" className="social-link" title="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-link" title="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="social-link" title="Email">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            <i className="far fa-copyright me-1"></i>
            {currentYear} Hội Dòng. All rights reserved.
          </div>
          <div className="footer-version">
            <i className="fas fa-code-branch me-1"></i>
            Version 1.0.0
          </div>
          <div className="footer-bottom-links">
            <Link to="/privacy">Chính sách bảo mật</Link>
            <span className="separator">•</span>
            <Link to="/terms">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
