// src/features/users/pages/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Nav,
  Tab,
} from "react-bootstrap";
import { useAuth } from "@context/AuthContext";
import { userService } from "@services";
import Input from "@components/forms/Input";
import { isValidEmail, isValidPhone } from "@utils/validators";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfile = () => {
    const errors = {};

    if (!profileData.full_name) {
      errors.full_name = "Họ tên là bắt buộc";
    }

    if (!profileData.email) {
      errors.email = "Email là bắt buộc";
    } else if (!isValidEmail(profileData.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (profileData.phone && !isValidPhone(profileData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    return errors;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!passwordData.new_password) {
      errors.new_password = "Mật khẩu mới là bắt buộc";
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!passwordData.confirm_password) {
      errors.confirm_password = "Vui lòng xác nhận mật khẩu";
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Mật khẩu không khớp";
    }

    return errors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    try {
      setSubmitting(true);
      const response = await userService.updateProfile(profileData);

      if (response.success) {
        updateUser(response.data);
        setSuccess("Cập nhật thông tin thành công!");
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    try {
      setSubmitting(true);
      const response = await userService.changePassword(passwordData);

      if (response.success) {
        setSuccess("Đổi mật khẩu thành công!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Hồ sơ cá nhân" },
        ]}
      />

      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">Hồ sơ cá nhân</h2>
        <p className="text-muted mb-0">
          Quản lý thông tin và bảo mật tài khoản
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Row className="g-4">
        {/* Left Column - User Info */}
        <Col lg={4}>
          <Card className="profile-card">
            <Card.Body className="text-center">
              <div className="profile-avatar-large mx-auto mb-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>

              <h4 className="mb-1">{user.full_name}</h4>
              <p className="text-muted mb-3">@{user.username}</p>

              <div className="profile-info">
                <div className="info-item">
                  <i className="fas fa-envelope text-primary me-2"></i>
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="info-item">
                    <i className="fas fa-phone text-success me-2"></i>
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="info-item">
                  <i className="fas fa-user-tag text-info me-2"></i>
                  <span>{user.role_label}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Forms */}
        <Col lg={8}>
          <Tab.Container defaultActiveKey="profile">
            <Card>
              <Card.Header className="bg-white">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <i className="fas fa-user me-2"></i>
                      Thông tin cá nhân
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">
                      <i className="fas fa-lock me-2"></i>
                      Đổi mật khẩu
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {/* Profile Tab */}
                  <Tab.Pane eventKey="profile">
                    <Form onSubmit={handleUpdateProfile}>
                      <Row className="g-3">
                        <Col md={12}>
                          <Input
                            label="Họ và tên"
                            name="full_name"
                            value={profileData.full_name}
                            onChange={handleProfileChange}
                            placeholder="Nhập họ và tên đầy đủ"
                            required
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            placeholder="example@email.com"
                            required
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Số điện thoại"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="0123456789"
                          />
                        </Col>

                        <Col md={12}>
                          <Input
                            label="URL Avatar"
                            name="avatar"
                            value={profileData.avatar}
                            onChange={handleProfileChange}
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </Col>

                        <Col md={12}>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Cập nhật thông tin
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Tab.Pane>

                  {/* Password Tab */}
                  <Tab.Pane eventKey="password">
                    <Form onSubmit={handleChangePassword}>
                      <Row className="g-3">
                        <Col md={12}>
                          <div className="position-relative">
                            <Input
                              label="Mật khẩu hiện tại"
                              name="current_password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.current_password}
                              onChange={handlePasswordChange}
                              placeholder="Nhập mật khẩu hiện tại"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-link position-absolute"
                              style={{ right: "10px", top: "35px" }}
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  current: !prev.current,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-eye${
                                  showPasswords.current ? "-slash" : ""
                                }`}
                              ></i>
                            </button>
                          </div>
                        </Col>

                        <Col md={12}>
                          <div className="position-relative">
                            <Input
                              label="Mật khẩu mới"
                              name="new_password"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              placeholder="Nhập mật khẩu mới"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-link position-absolute"
                              style={{ right: "10px", top: "35px" }}
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-eye${
                                  showPasswords.new ? "-slash" : ""
                                }`}
                              ></i>
                            </button>
                          </div>
                        </Col>

                        <Col md={12}>
                          <div className="position-relative">
                            <Input
                              label="Xác nhận mật khẩu mới"
                              name="confirm_password"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              placeholder="Nhập lại mật khẩu mới"
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-link position-absolute"
                              style={{ right: "10px", top: "35px" }}
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }
                            >
                              <i
                                className={`fas fa-eye${
                                  showPasswords.confirm ? "-slash" : ""
                                }`}
                              ></i>
                            </button>
                          </div>
                        </Col>

                        <Col md={12}>
                          <Alert variant="info">
                            <i className="fas fa-info-circle me-2"></i>
                            Mật khẩu phải có ít nhất 6 ký tự
                          </Alert>
                        </Col>

                        <Col md={12}>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-key me-2"></i>
                                Đổi mật khẩu
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
