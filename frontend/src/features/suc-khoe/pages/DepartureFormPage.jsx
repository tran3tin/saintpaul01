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
import { departureService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const DepartureFormPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sisters, setSisters] = useState([]);

  const [formData, setFormData] = useState({
    sister_id: sisterId || "",
    type: "",
    departure_date: "",
    expected_return_date: "",
    return_date: "",
    destination: "",
    reason: "",
    contact_phone: "",
    contact_address: "",
    approved_by: "",
    notes: "",
  });

  useEffect(() => {
    fetchSisters();
    if (isEditMode) {
      fetchDeparture();
    }
  }, [id]);

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ page_size: 1000 });
      if (response.success) {
        setSisters(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching sisters:", error);
    }
  };

  const fetchDeparture = async () => {
    try {
      setLoading(true);
      const response = await departureService.getById(id);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching departure:", error);
      setError("Không thể tải thông tin phiếu đi vắng");
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

    if (!formData.sister_id) {
      setError("Vui lòng chọn nữ tu");
      return;
    }

    if (!formData.type) {
      setError("Vui lòng chọn loại đi vắng");
      return;
    }

    if (!formData.departure_date) {
      setError("Vui lòng nhập ngày đi");
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (isEditMode) {
        response = await departureService.update(id, formData);
      } else {
        response = await departureService.create(formData);
      }

      if (response.success) {
        navigate(sisterId ? `/nu-tu/${sisterId}/di-vang` : "/di-vang");
      } else {
        setError(response.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving departure:", error);
      setError("Có lỗi xảy ra khi lưu phiếu đi vắng");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(sisterId ? `/nu-tu/${sisterId}/di-vang` : "/di-vang");
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
          { label: "Đi vắng", link: "/di-vang" },
          { label: isEditMode ? "Chỉnh sửa" : "Đăng ký mới" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEditMode ? "Chỉnh sửa Phiếu Đi vắng" : "Đăng ký Đi vắng"}
          </h2>
          <p className="text-muted mb-0">
            {isEditMode ? "Cập nhật thông tin đi vắng" : "Tạo phiếu đăng ký đi vắng mới"}
          </p>
        </div>
        <Button variant="secondary" onClick={handleCancel}>
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

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card>
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-plane-departure me-2 text-primary"></i>
                  Thông tin Đi vắng
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nữ tu <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="sister_id"
                        value={formData.sister_id}
                        onChange={handleChange}
                        disabled={!!sisterId}
                        required
                      >
                        <option value="">Chọn nữ tu</option>
                        {sisters.map((sister) => (
                          <option key={sister.id} value={sister.id}>
                            {sister.religious_name
                              ? `${sister.religious_name} - ${sister.full_name}`
                              : sister.full_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Loại đi vắng <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn loại</option>
                        <option value="temporary">Tạm thời</option>
                        <option value="medical">Khám chữa bệnh</option>
                        <option value="study">Học tập</option>
                        <option value="mission">Sứ vụ</option>
                        <option value="other">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Ngày đi <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="departure_date"
                        value={formData.departure_date}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Dự kiến về</Form.Label>
                      <Form.Control
                        type="date"
                        name="expected_return_date"
                        value={formData.expected_return_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Ngày về thực tế</Form.Label>
                      <Form.Control
                        type="date"
                        name="return_date"
                        value={formData.return_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Địa điểm</Form.Label>
                      <Form.Control
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder="Địa điểm đi vắng"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Lý do</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Lý do đi vắng..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Người phê duyệt</Form.Label>
                      <Form.Control
                        type="text"
                        name="approved_by"
                        value={formData.approved_by}
                        onChange={handleChange}
                        placeholder="Tên người phê duyệt"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-phone me-2 text-success"></i>
                  Thông tin Liên lạc
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control
                        type="text"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="Số điện thoại liên hệ"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Địa chỉ liên hệ</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="contact_address"
                        value={formData.contact_address}
                        onChange={handleChange}
                        placeholder="Địa chỉ nơi ở trong thời gian đi vắng"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-sticky-note me-2 text-warning"></i>
                  Ghi chú
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
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
                        {isEditMode ? "Cập nhật" : "Đăng ký"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="lg"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    <i className="fas fa-times me-2"></i>
                    Hủy
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default DepartureFormPage;
