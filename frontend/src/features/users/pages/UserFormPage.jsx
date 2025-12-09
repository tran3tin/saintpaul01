// src/features/users/pages/UserFormPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { userService, lookupService } from "@services";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import SearchableSelect from "@components/forms/SearchableSelect";
import FileUpload from "@components/forms/FileUpload/FileUpload";
import { isValidEmail, isValidPhone } from "@utils/validators";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./UserDetailPage.css";

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [userStatuses, setUserStatuses] = useState([
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Đã khóa" },
  ]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  } = useForm({
    username: "",
    password: "",
    confirm_password: "",
    full_name: "",
    email: "",
    phone: "",
    role: "",
    status: "active",
    avatar: "",
  });

  useEffect(() => {
    console.log("UserFormPage mounted, userStatuses:", userStatuses);
    fetchRoles();
    if (isEditMode) {
      fetchUserData();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const response = await lookupService.getUserRoles();
      if (response && response.success && response.data) {
        setRoles(response.data);
        console.log("Roles loaded:", response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Fallback to default roles if API fails
      setRoles([
        { value: "admin", label: "Quản trị viên" },
        { value: "superior_general", label: "Bề trên Tổng Quyền" },
        { value: "superior_provincial", label: "Bề trên Tỉnh Dòng" },
        { value: "superior_community", label: "Bề trên Cộng đoàn" },
        { value: "secretary", label: "Thư ký" },
        { value: "viewer", label: "Người xem" },
      ]);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getById(id);
      if (response.success) {
        const userData = { ...response.data };
        // Map is_active từ backend (0/1) sang status cho frontend ('active'/'inactive')
        if (userData.is_active !== undefined) {
          userData.status =
            userData.is_active === 1 || userData.is_active === true
              ? "active"
              : "inactive";
        }
        console.log("User data loaded:", userData);
        setValues(userData);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Không thể tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!values.username || !values.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (values.username.trim().length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!isEditMode) {
      if (!values.password) {
        newErrors.password = "Mật khẩu là bắt buộc";
      } else if (values.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!values.confirm_password) {
        newErrors.confirm_password = "Vui lòng xác nhận mật khẩu";
      } else if (values.password !== values.confirm_password) {
        newErrors.confirm_password = "Mật khẩu không khớp";
      }
    }

    if (!values.full_name || !values.full_name.trim()) {
      newErrors.full_name = "Họ tên là bắt buộc";
    }

    if (!values.email || !values.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!isValidEmail(values.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (values.phone && !isValidPhone(values.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!values.role) {
      newErrors.role = "Vai trò là bắt buộc";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setError("");

    console.log("Form submitted with values:", values);

    // Client-side validation
    const validationErrors = validate();
    console.log("Validation errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Set errors vào state để hiển thị
      Object.keys(validationErrors).forEach((fieldName) => {
        setFieldError(fieldName, validationErrors[fieldName]);
        setFieldTouched(fieldName, true);
      });

      // Hiển thị thông báo lỗi chung
      setError("Vui lòng kiểm tra lại thông tin đã nhập");

      // Scroll to top để thấy thông báo lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data for submission
      const submitData = { ...values };

      // If avatar is a File object, we need to handle it differently
      // For now, skip avatar file upload and just send the data
      if (
        submitData.avatar &&
        typeof submitData.avatar === "object" &&
        submitData.avatar instanceof File
      ) {
        // TODO: Implement file upload to server
        // For now, remove avatar from submission
        delete submitData.avatar;
      }

      console.log("Sending data to API:", submitData);

      let response;
      if (isEditMode) {
        response = await userService.update(id, submitData);
      } else {
        response = await userService.create(submitData);
      }

      console.log("API response:", response);

      if (response.success) {
        setSuccessMessage(
          isEditMode
            ? "Cập nhật người dùng thành công!"
            : "Tạo người dùng thành công!"
        );

        // Navigate sau 1 giây để user thấy thông báo
        setTimeout(() => {
          navigate(`/users/${response.data.id}`);
        }, 1000);
      } else {
        setError(response.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving user:", error);

      // Xử lý lỗi từ backend
      if (error.response) {
        const { data } = error.response;

        // Nếu backend trả về field-specific errors
        if (data.errors) {
          Object.keys(data.errors).forEach((fieldName) => {
            setFieldError(fieldName, data.errors[fieldName]);
            setFieldTouched(fieldName, true);
          });
        }

        // Hiển thị message chung
        if (data.message) {
          setError(data.message);
        } else {
          setError("Có lỗi xảy ra khi lưu người dùng");
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!"
        );
      } else {
        // Lỗi khác
        setError(error.message || "Có lỗi xảy ra khi lưu người dùng");
      }

      // Scroll to top để thấy thông báo lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
      )
    ) {
      navigate(isEditMode ? `/users/${id}` : "/users");
    }
  };

  if (loading) {
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
        title={isEditMode ? "Chỉnh sửa Người dùng" : "Thêm Người dùng Mới"}
        items={[
          { label: "Người dùng", link: "/users" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
        >
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            {/* Account Info */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-user-circle"></i>
                <span>Thông tin tài khoản</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Input
                      label="Tên đăng nhập"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.username}
                      touched={touched.username}
                      placeholder="Nhập tên đăng nhập"
                      disabled={isEditMode}
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <SearchableSelect
                      label="Vai trò"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.role}
                      touched={touched.role}
                      placeholder="Nhập để tìm vai trò..."
                      maxDisplayItems={5}
                      options={roles}
                      required
                    />
                  </Col>

                  {!isEditMode && (
                    <>
                      <Col md={6}>
                        <div className="position-relative">
                          <Input
                            label="Mật khẩu"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password}
                            touched={touched.password}
                            placeholder="Nhập mật khẩu"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-link position-absolute"
                            style={{ right: "10px", top: "35px" }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i
                              className={`fas fa-eye${
                                showPassword ? "-slash" : ""
                              }`}
                            ></i>
                          </button>
                        </div>
                      </Col>

                      <Col md={6}>
                        <Input
                          label="Xác nhận mật khẩu"
                          name="confirm_password"
                          type={showPassword ? "text" : "password"}
                          value={values.confirm_password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.confirm_password}
                          touched={touched.confirm_password}
                          placeholder="Nhập lại mật khẩu"
                          required
                        />
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Personal Info */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-id-card"></i>
                <span>Thông tin cá nhân</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={12}>
                    <Input
                      label="Họ và tên"
                      name="full_name"
                      value={values.full_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.full_name}
                      touched={touched.full_name}
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      touched={touched.email}
                      placeholder="example@email.com"
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Input
                      label="Số điện thoại"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.phone}
                      touched={touched.phone}
                      placeholder="0123456789"
                    />
                  </Col>

                  <Col md={12}>
                    <FileUpload
                      label="Ảnh đại diện"
                      name="avatar"
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          setFieldValue("avatar", files[0]);
                        }
                      }}
                      error={errors.avatar}
                      touched={touched.avatar}
                      accept="image/*"
                      maxSize={5242880}
                      showPreview={true}
                      helpText="Chọn ảnh đại diện (tối đa 5MB, định dạng: JPG, PNG, GIF)"
                    />
                    {values.avatar && typeof values.avatar === "string" && (
                      <div className="mt-2">
                        <img
                          src={values.avatar}
                          alt="Avatar hiện tại"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Actions */}
            <Card
              className="health-info-card sticky-top"
              style={{ top: "20px" }}
            >
              <Card.Header className="system-header">
                <i className="fas fa-cog"></i>
                <span>Thao tác</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12}>
                    <Select
                      label="Trạng thái"
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      options={userStatuses}
                      placeholder="Chọn trạng thái"
                    />
                  </Col>

                  <Col xs={12}>
                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
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
                            {isEditMode ? "Cập nhật" : "Tạo mới"}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleCancel}
                        disabled={submitting}
                      >
                        <i className="fas fa-times me-2"></i>
                        Hủy
                      </Button>
                    </div>
                  </Col>
                </Row>

                <hr />

                <div className="text-muted small">
                  <p className="mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Lưu ý:</strong>
                  </p>
                  <ul className="ps-3 mb-0">
                    <li>Các trường có dấu (*) là bắt buộc</li>
                    <li>Tên đăng nhập không thể thay đổi sau khi tạo</li>
                    <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                    {!isEditMode && (
                      <li>Email sẽ được dùng để gửi thông tin đăng nhập</li>
                    )}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default UserFormPage;
