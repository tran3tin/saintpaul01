// src/features/settings/pages/PreferencesPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaUserCog,
  FaArrowLeft,
  FaSave,
  FaBell,
  FaPalette,
  FaUndo,
} from "react-icons/fa";
import { settingService } from "@services";
import "./settings-common.css";

const PreferencesPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [preferences, setPreferences] = useState({
    // Display preferences
    theme: "light",
    sidebarCollapsed: false,
    itemsPerPage: 10,
    showWelcomeMessage: true,

    // Notification preferences
    emailNotifications: true,
    systemNotifications: true,
    birthdayReminder: true,
    anniversaryReminder: true,
    evaluationReminder: true,

    // Dashboard preferences
    showStatistics: true,
    showRecentActivities: true,
    showUpcomingEvents: true,
    showBirthdayWidget: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const result = await settingService.getPreferences();
      if (result.success && result.data) {
        setPreferences((prev) => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await settingService.updatePreferences(preferences);
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu tùy chọn thành công!" });
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi lưu tùy chọn!" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Bạn có chắc muốn khôi phục tùy chọn về mặc định?")) {
      return;
    }

    setResetting(true);
    try {
      const result = await settingService.resetPreferences();
      if (result.success) {
        setMessage({
          type: "success",
          text: "Đã khôi phục tùy chọn mặc định!",
        });
        fetchPreferences();
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi khôi phục tùy chọn!" });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="settings-page py-4">
      <Row className="mb-4">
        <Col>
          <Link to="/settings" className="btn btn-outline-secondary mb-3">
            <FaArrowLeft className="me-2" />
            Quay lại
          </Link>
          <h2 className="page-title">
            <FaUserCog className="me-2" />
            Tùy Chọn Cá Nhân
          </h2>
          <p className="text-muted">
            Cấu hình giao diện và thông báo theo sở thích của bạn
          </p>
        </Col>
      </Row>

      {message.text && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={6}>
            {/* Display Preferences */}
            <Card className="health-info-card">
              <Card.Header>
                <FaPalette className="me-2" />
                <span>Giao diện</span>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Chủ đề</Form.Label>
                  <Form.Select
                    name="theme"
                    value={preferences.theme}
                    onChange={handleChange}
                  >
                    <option value="light">Sáng</option>
                    <option value="dark">Tối</option>
                    <option value="auto">Tự động (theo hệ thống)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số mục hiển thị mỗi trang</Form.Label>
                  <Form.Select
                    name="itemsPerPage"
                    value={preferences.itemsPerPage}
                    onChange={handleChange}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </Form.Group>

                <Form.Check
                  type="switch"
                  id="sidebarCollapsed"
                  name="sidebarCollapsed"
                  label="Thu gọn sidebar mặc định"
                  checked={preferences.sidebarCollapsed}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="showWelcomeMessage"
                  name="showWelcomeMessage"
                  label="Hiển thị lời chào khi đăng nhập"
                  checked={preferences.showWelcomeMessage}
                  onChange={handleChange}
                  className="mb-3"
                />
              </Card.Body>
            </Card>

            {/* Dashboard Preferences */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <FaUserCog className="me-2" />
                <span>Trang chủ (Dashboard)</span>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="showStatistics"
                  name="showStatistics"
                  label="Hiển thị thống kê tổng quan"
                  checked={preferences.showStatistics}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="showRecentActivities"
                  name="showRecentActivities"
                  label="Hiển thị hoạt động gần đây"
                  checked={preferences.showRecentActivities}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="showUpcomingEvents"
                  name="showUpcomingEvents"
                  label="Hiển thị sự kiện sắp tới"
                  checked={preferences.showUpcomingEvents}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="showBirthdayWidget"
                  name="showBirthdayWidget"
                  label="Hiển thị widget sinh nhật"
                  checked={preferences.showBirthdayWidget}
                  onChange={handleChange}
                  className="mb-3"
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            {/* Notification Preferences */}
            <Card className="health-info-card">
              <Card.Header className="system-header">
                <FaBell className="me-2" />
                <span>Thông báo</span>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="emailNotifications"
                  name="emailNotifications"
                  label="Nhận thông báo qua email"
                  checked={preferences.emailNotifications}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="systemNotifications"
                  name="systemNotifications"
                  label="Hiển thị thông báo hệ thống"
                  checked={preferences.systemNotifications}
                  onChange={handleChange}
                  className="mb-3"
                />

                <hr />
                <h6 className="mb-3">Nhắc nhở</h6>

                <Form.Check
                  type="switch"
                  id="birthdayReminder"
                  name="birthdayReminder"
                  label="Nhắc nhở sinh nhật nữ tu"
                  checked={preferences.birthdayReminder}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="anniversaryReminder"
                  name="anniversaryReminder"
                  label="Nhắc nhở ngày khấn"
                  checked={preferences.anniversaryReminder}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Check
                  type="switch"
                  id="evaluationReminder"
                  name="evaluationReminder"
                  label="Nhắc nhở đánh giá định kỳ"
                  checked={preferences.evaluationReminder}
                  onChange={handleChange}
                  className="mb-3"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang khôi phục...
              </>
            ) : (
              <>
                <FaUndo className="me-2" />
                Khôi phục mặc định
              </>
            )}
          </Button>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Lưu tùy chọn
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default PreferencesPage;
