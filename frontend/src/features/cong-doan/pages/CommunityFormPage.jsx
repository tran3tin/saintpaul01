import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import DatePicker from "@components/forms/DatePicker";
import "./CommunityDetailPage.css";

const CommunityFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const showToast = (variant, title, message) => {
    setToast({ show: true, variant, title, message });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    established_date: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchCommunityDetail();
    }
  }, [id]);

  const fetchCommunityDetail = async () => {
    try {
      setLoading(true);
      const response = await communityService.getDetail(id);
      if (response && response.community) {
        const community = response.community;
        setFormData({
          name: community.name || "",
          code: community.code || "",
          address: community.address || "",
          phone: community.phone || "",
          email: community.email || "",
          established_date: community.established_date
            ? community.established_date.split("T")[0]
            : "",
          status: community.status || "active",
          description: community.description || "",
        });
      }
    } catch (err) {
      console.error("Error fetching community:", err);
      setError("Không thể tải thông tin cộng đoàn");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên cộng đoàn");
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        await communityService.update(id, formData);
        showToast(
          "success",
          "Cập nhật thành công!",
          `Đã cập nhật thông tin cộng đoàn "${formData.name}".`
        );
      } else {
        await communityService.create(formData);
        showToast(
          "success",
          "Tạo mới thành công!",
          `Đã thêm cộng đoàn "${formData.name}" vào hệ thống.`
        );
      }

      // Delay navigation to show toast
      setTimeout(() => {
        navigate("/cong-doan");
      }, 1500);
    } catch (err) {
      console.error("Error saving community:", err);

      // Extract error message
      let errorMessage = "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map((e) => e.msg || e.message).join(", ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      showToast(
        "danger",
        isEdit ? "Cập nhật thất bại!" : "Tạo mới thất bại!",
        errorMessage
      );
      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
      {/* Toast Notification */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          show={toast.show}
          onClose={hideToast}
          delay={5000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header closeButton>
            <i
              className={`me-2 ${
                toast.variant === "success"
                  ? "fas fa-check-circle text-success"
                  : "fas fa-exclamation-circle text-danger"
              }`}
            ></i>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body
            className={toast.variant === "danger" ? "text-white" : ""}
          >
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Breadcrumb
        title={isEdit ? "Chỉnh sửa Cộng Đoàn" : "Thêm Cộng Đoàn Mới"}
        items={[
          { label: "Quản lý Cộng Đoàn", link: "/cong-doan" },
          { label: isEdit ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="d-flex justify-content-end align-items-center mb-4">
        <Button variant="secondary" onClick={() => navigate("/cong-doan")}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      <Card className="health-info-card">
        <Card.Header>
          <i className="fas fa-building"></i>
          <span>Thông tin Cộng Đoàn</span>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Tên cộng đoàn <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập tên cộng đoàn"
                    required
                  />
                  <Form.Text className="text-muted">
                    Tên đầy đủ của cộng đoàn
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mã cộng đoàn</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="VD: CD001 (Tự động tạo nếu để trống)"
                  />
                  <Form.Text className="text-muted">
                    Để trống để hệ thống tự động tạo mã (CD001, CD002, ...)
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ cộng đoàn"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại liên hệ"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ email"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngày thành lập</Form.Label>
                  <DatePicker
                    name="established_date"
                    value={formData.established_date}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        established_date: date,
                      }))
                    }
                    placeholder="dd/mm/yyyy"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhập mô tả về cộng đoàn (lịch sử, đặc điểm, sứ mạng...)"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/cong-doan")}
                disabled={submitting}
              >
                <i className="fas fa-times me-2"></i>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {isEdit ? "Cập nhật" : "Tạo mới"}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CommunityFormPage;
