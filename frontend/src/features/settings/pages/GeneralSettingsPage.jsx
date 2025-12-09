// src/features/settings/pages/GeneralSettingsPage.jsx
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
import { FaCog, FaArrowLeft, FaSave } from "react-icons/fa";
import { settingService } from "@services";
import "./settings-common.css";

const GeneralSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [settings, setSettings] = useState({
    siteName: "Hệ Thống Quản Lý Hội Dòng OSP",
    siteDescription: "Quản lý thông tin nữ tu và hoạt động của Hội Dòng",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "DD/MM/YYYY",
    language: "vi",
    congregationName: "Dòng Nữ Tu OSP",
    foundingDate: "",
    mainAddress: "",
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const result = await settingService.getGeneral();
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
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await settingService.updateGeneral(settings);
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
            <FaCog className="me-2" />
            Cài Đặt Chung
          </h2>
          <p className="text-muted">Cấu hình thông tin cơ bản của hệ thống</p>
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
            <Card className="health-info-card">
              <Card.Header>
                <FaCog className="me-2" />
                <span>Thông tin hệ thống</span>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Tên hệ thống</Form.Label>
                  <Form.Control
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngôn ngữ</Form.Label>
                      <Form.Select
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Múi giờ</Form.Label>
                      <Form.Select
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleChange}
                      >
                        <option value="Asia/Ho_Chi_Minh">
                          Việt Nam (GMT+7)
                        </option>
                        <option value="America/New_York">
                          New York (GMT-5)
                        </option>
                        <option value="Europe/London">London (GMT+0)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Định dạng ngày</Form.Label>
                  <Form.Select
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <FaCog className="me-2" />
                <span>Thông tin Hội Dòng</span>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Tên Hội Dòng</Form.Label>
                  <Form.Control
                    type="text"
                    name="congregationName"
                    value={settings.congregationName}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ngày thành lập</Form.Label>
                  <Form.Control
                    type="date"
                    name="foundingDate"
                    value={settings.foundingDate}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="mainAddress"
                    value={settings.mainAddress}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Điện thoại</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={settings.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={settings.website}
                    onChange={handleChange}
                    placeholder="https://"
                  />
                </Form.Group>
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

export default GeneralSettingsPage;
