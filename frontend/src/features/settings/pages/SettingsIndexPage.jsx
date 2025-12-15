// src/features/settings/pages/SettingsIndexPage.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCog,
  FaServer,
  FaUserCog,
  FaDatabase,
  FaShieldAlt,
  FaBell,
  FaHistory,
} from "react-icons/fa";
import { settingService } from "@services";
import "./SettingsIndexPage.css";

const settingsItems = [
  {
    title: "Cài đặt chung",
    description: "Tên hệ thống, ngôn ngữ, múi giờ và định dạng ngày",
    icon: FaCog,
    path: "/settings/general",
    color: "primary",
  },
  {
    title: "Cài đặt hệ thống",
    description: "Email, bảo mật, cache và các cấu hình kỹ thuật",
    icon: FaServer,
    path: "/settings/system",
    color: "info",
  },
  {
    title: "Tùy chọn cá nhân",
    description: "Giao diện, thông báo và các tùy chọn người dùng",
    icon: FaUserCog,
    path: "/settings/preferences",
    color: "success",
  },
  {
    title: "Sao lưu & Khôi phục",
    description: "Quản lý sao lưu dữ liệu và khôi phục hệ thống",
    icon: FaDatabase,
    path: "/settings/backup",
    color: "warning",
  },
  {
    title: "Nhật ký hoạt động",
    description: "Theo dõi lịch sử hoạt động trong hệ thống",
    icon: FaHistory,
    path: "/settings/audit-logs",
    color: "secondary",
  },
];

const SettingsIndexPage = () => {
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({});
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [systemResult, prefResult] = await Promise.all([
        settingService.getSystem(),
        settingService.getPreferences(),
      ]);

      if (systemResult.success) {
        setSystemSettings(systemResult.data || {});
      }
      if (prefResult.success) {
        setPreferences(prefResult.data || {});
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="settings-index-page py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">
            <FaCog className="me-2" />
            Cài Đặt Hệ Thống
          </h2>
          <p className="text-muted">Quản lý cài đặt và cấu hình hệ thống</p>
        </Col>
      </Row>

      <Row>
        {settingsItems.map((item, index) => (
          <Col md={6} lg={4} xl={3} key={index} className="mb-4">
            <Link to={item.path} className="text-decoration-none">
              <Card className={`settings-card h-100 border-${item.color}`}>
                <Card.Body className="text-center py-4">
                  <div className={`settings-icon bg-${item.color} mb-3`}>
                    <item.icon size={32} />
                  </div>
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text text-muted small">
                    {item.description}
                  </p>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaShieldAlt className="me-2" />
              Thông tin bảo mật
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>Phiên đăng nhập:</strong> Hết hạn sau{" "}
                    {systemSettings.sessionTimeout || 60} phút
                  </li>
                  <li className="mb-2">
                    <strong>Xác thực 2 yếu tố:</strong>{" "}
                    {systemSettings.enableTwoFactor ? "Đã bật" : "Chưa bật"}
                  </li>
                  <li className="mb-2">
                    <strong>Độ dài mật khẩu tối thiểu:</strong>{" "}
                    {systemSettings.minPasswordLength || 8} ký tự
                  </li>
                  <li>
                    <strong>Yêu cầu mật khẩu mạnh:</strong>{" "}
                    {systemSettings.requireStrongPassword ? "Có" : "Không"}
                  </li>
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <FaBell className="me-2" />
              Tùy chọn thông báo
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <strong>Email thông báo:</strong>{" "}
                    {preferences.emailNotifications ? "Đã bật" : "Đã tắt"}
                  </li>
                  <li className="mb-2">
                    <strong>Nhắc nhở sinh nhật:</strong>{" "}
                    {preferences.birthdayReminder ? "Đã bật" : "Đã tắt"}
                  </li>
                  <li className="mb-2">
                    <strong>Nhắc nhở ngày khấn:</strong>{" "}
                    {preferences.anniversaryReminder ? "Đã bật" : "Đã tắt"}
                  </li>
                  <li>
                    <strong>Nhắc nhở đánh giá:</strong>{" "}
                    {preferences.evaluationReminder ? "Đã bật" : "Đã tắt"}
                  </li>
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsIndexPage;
