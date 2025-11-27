// src/pages/NotFound/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} className="text-center">
            <div className="not-found-content">
              <div className="not-found-icon">⚠️</div>
              <h1 className="not-found-code">404</h1>
              <h2 className="not-found-title">Không tìm thấy trang</h2>
              <p className="not-found-message">
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
              </p>
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="not-found-btn">
                  🏠 Về trang chủ
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFoundPage;
