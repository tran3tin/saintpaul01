// src/features/settings/pages/SystemSettingsPage.jsx
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
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaServer,
  FaArrowLeft,
  FaSave,
  FaEnvelope,
  FaShieldAlt,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { settingService } from "@services";
import "./settings-common.css";

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    // Email settings
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: "tls",
    emailFromName: "Hệ Thống Quản Lý Hội Dòng",
    emailFromAddress: "",

    // Security settings
    sessionTimeout: 60,
    minPasswordLength: 8,
    requireStrongPassword: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    enableTwoFactor: false,

    // Cache settings
    enableCache: true,
    cacheExpiry: 3600,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await settingService.getSystem();
      if (result.success && result.data) {
        setSettings((prev) => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await settingService.updateSystem(settings);
      if (result.success) {
        setMessage({ type: "success", text: "Đã lưu cài đặt thành công!" });
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi lưu cài đặt!" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    try {
      const result = await settingService.testEmail();
      if (result.success) {
        setMessage({
          type: "success",
          text: "Email test đã được gửi thành công!",
        });
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi gửi email test!" });
    } finally {
      setTesting(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const result = await settingService.clearCache();
      if (result.success) {
        setMessage({ type: "success", text: "Đã xóa cache thành công!" });
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi xóa cache!" });
    } finally {
      setClearing(false);
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
            <FaServer className="me-2" />
            Cài Đặt Hệ Thống
          </h2>
          <p className="text-muted">
            Cấu hình email, bảo mật và các cài đặt kỹ thuật
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
            {/* Email Settings */}
            <Card className="health-info-card">
              <Card.Header>
                <FaEnvelope className="me-2" />
                <span>Cấu hình Email (SMTP)</span>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Host</Form.Label>
                      <Form.Control
                        type="text"
                        name="smtpHost"
                        value={settings.smtpHost}
                        onChange={handleChange}
                        placeholder="smtp.gmail.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Port</Form.Label>
                      <Form.Control
                        type="number"
                        name="smtpPort"
                        value={settings.smtpPort}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="smtpUser"
                    value={settings.smtpUser}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bảo mật</Form.Label>
                  <Form.Select
                    name="smtpSecure"
                    value={settings.smtpSecure}
                    onChange={handleChange}
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">Không</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên người gửi</Form.Label>
                      <Form.Control
                        type="text"
                        name="emailFromName"
                        value={settings.emailFromName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email người gửi</Form.Label>
                      <Form.Control
                        type="email"
                        name="emailFromAddress"
                        value={settings.emailFromAddress}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="outline-primary"
                  onClick={handleTestEmail}
                  disabled={testing}
                >
                  {testing ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="me-2" />
                      Gửi email test
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>

            {/* Cache Settings */}
            <Card className="health-info-card">
              <Card.Header className="system-header">
                <FaTrash className="me-2" />
                <span>Cache</span>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="enableCache"
                  name="enableCache"
                  label="Bật cache"
                  checked={settings.enableCache}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Form.Group className="mb-3">
                  <Form.Label>Thời gian hết hạn cache (giây)</Form.Label>
                  <Form.Control
                    type="number"
                    name="cacheExpiry"
                    value={settings.cacheExpiry}
                    onChange={handleChange}
                    disabled={!settings.enableCache}
                  />
                </Form.Group>

                <Button
                  variant="outline-danger"
                  onClick={handleClearCache}
                  disabled={clearing}
                >
                  {clearing ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <FaTrash className="me-2" />
                      Xóa cache
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            {/* Security Settings */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <FaShieldAlt className="me-2" />
                <span>Bảo mật</span>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Thời gian hết hạn phiên đăng nhập (phút)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Độ dài mật khẩu tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    name="minPasswordLength"
                    value={settings.minPasswordLength}
                    onChange={handleChange}
                    min={6}
                    max={32}
                  />
                </Form.Group>

                <Form.Check
                  type="switch"
                  id="requireStrongPassword"
                  name="requireStrongPassword"
                  label="Yêu cầu mật khẩu mạnh (chữ hoa, chữ thường, số, ký tự đặc biệt)"
                  checked={settings.requireStrongPassword}
                  onChange={handleChange}
                  className="mb-3"
                />

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số lần đăng nhập thất bại tối đa</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxLoginAttempts"
                        value={settings.maxLoginAttempts}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Thời gian khóa tài khoản (phút)</Form.Label>
                      <Form.Control
                        type="number"
                        name="lockoutDuration"
                        value={settings.lockoutDuration}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Check
                  type="switch"
                  id="enableTwoFactor"
                  name="enableTwoFactor"
                  label={
                    <>
                      Bật xác thực hai yếu tố (2FA)
                      <Badge bg="warning" className="ms-2">
                        Beta
                      </Badge>
                    </>
                  }
                  checked={settings.enableTwoFactor}
                  onChange={handleChange}
                  className="mb-3"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Lưu cài đặt
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default SystemSettingsPage;
