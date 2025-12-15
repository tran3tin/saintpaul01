// src/pages/errors/ForbiddenPage.jsx

import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./ErrorPages.css";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/thong-tin");
  };

  return (
    <div className="error-page">
      <Container>
        <div className="error-content">
          <div className="error-illustration">
            <div className="error-icon-wrapper forbidden">
              <i className="fas fa-ban"></i>
            </div>
          </div>

          <div className="error-details">
            <h1 className="error-code">403</h1>
            <h2 className="error-title">Truy cập bị từ chối</h2>
            <p className="error-description">
              Xin lỗi, bạn không có quyền truy cập vào trang này.
              <br />
              Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.
            </p>

            <div className="error-actions">
              <Button
                variant="outline-primary"
                size="lg"
                onClick={handleGoBack}
                className="me-3"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại
              </Button>
              <Button variant="primary" size="lg" onClick={handleGoHome}>
                <i className="fas fa-home me-2"></i>
                Về trang chủ
              </Button>
            </div>
          </div>

          <div className="error-info">
            <div className="info-card">
              <i className="fas fa-shield-alt text-danger"></i>
              <div>
                <h6>Quyền truy cập</h6>
                <p>Bạn cần có quyền phù hợp để xem nội dung này</p>
              </div>
            </div>
            <div className="info-card">
              <i className="fas fa-user-lock text-warning"></i>
              <div>
                <h6>Tài khoản</h6>
                <p>Kiểm tra xem tài khoản của bạn đã được cấp quyền chưa</p>
              </div>
            </div>
            <div className="info-card">
              <i className="fas fa-headset text-info"></i>
              <div>
                <h6>Hỗ trợ</h6>
                <p>Liên hệ quản trị viên để được hỗ trợ</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ForbiddenPage;
