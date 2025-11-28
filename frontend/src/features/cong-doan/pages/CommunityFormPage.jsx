import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const CommunityFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
      if (response) {
        setFormData({
          name: response.name || "",
          code: response.code || "",
          address: response.address || "",
          phone: response.phone || "",
          email: response.email || "",
          established_date: response.established_date || "",
          status: response.status || "active",
          description: response.description || "",
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

    if (!formData.code.trim()) {
      setError("Vui lòng nhập mã cộng đoàn");
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        await communityService.update(id, formData);
      } else {
        await communityService.create(formData);
      }

      navigate("/cong-doan");
    } catch (err) {
      console.error("Error saving community:", err);
      setError("Có lỗi xảy ra khi lưu thông tin");
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
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Cộng Đoàn", link: "/cong-doan" },
          { label: isEdit ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEdit ? "Chỉnh sửa Cộng Đoàn" : "Thêm Cộng Đoàn Mới"}
          </h2>
          <p className="text-muted mb-0">
            {isEdit
              ? "Cập nhật thông tin cộng đoàn"
              : "Tạo cộng đoàn mới trong hệ thống"}
          </p>
        </div>
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

      <Card>
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">
            <i className="fas fa-building me-2 text-primary"></i>
            Thông tin Cộng Đoàn
          </h5>
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
                  <Form.Label>
                    Mã cộng đoàn <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Nhập mã cộng đoàn (VD: CD001)"
                    required
                  />
                  <Form.Text className="text-muted">
                    Mã định danh duy nhất cho cộng đoàn
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
                  <Form.Control
                    type="date"
                    name="established_date"
                    value={formData.established_date}
                    onChange={handleChange}
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
