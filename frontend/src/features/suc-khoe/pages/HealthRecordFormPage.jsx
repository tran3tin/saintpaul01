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
import { healthService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const HealthRecordFormPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sisters, setSisters] = useState([]);

  const [formData, setFormData] = useState({
    sister_id: sisterId || "",
    check_date: "",
    facility: "",
    doctor: "",
    health_status: "",
    diagnosis: "",
    treatment: "",
    blood_pressure: "",
    heart_rate: "",
    weight: "",
    height: "",
    notes: "",
    next_check_date: "",
  });

  useEffect(() => {
    fetchSisters();
    if (isEditMode) {
      fetchHealthRecord();
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

  const fetchHealthRecord = async () => {
    try {
      setLoading(true);
      const response = await healthService.getById(id);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching health record:", error);
      setError("Không thể tải thông tin hồ sơ sức khỏe");
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

    if (!formData.check_date) {
      setError("Vui lòng nhập ngày khám");
      return;
    }

    try {
      setSubmitting(true);

      let response;
      if (isEditMode) {
        response = await healthService.update(id, formData);
      } else {
        response = await healthService.create(formData);
      }

      if (response.success) {
        navigate(sisterId ? `/nu-tu/${sisterId}/suc-khoe` : "/suc-khoe");
      } else {
        setError(response.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving health record:", error);
      setError("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(sisterId ? `/nu-tu/${sisterId}/suc-khoe` : "/suc-khoe");
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
          { label: "Hồ sơ Sức khỏe", link: "/suc-khoe" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEditMode ? "Chỉnh sửa Hồ sơ Sức khỏe" : "Thêm Hồ sơ Sức khỏe"}
          </h2>
          <p className="text-muted mb-0">
            {isEditMode
              ? "Cập nhật thông tin khám sức khỏe"
              : "Tạo hồ sơ khám sức khỏe mới"}
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
                  <i className="fas fa-heartbeat me-2 text-danger"></i>
                  Thông tin Khám bệnh
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Nữ tu <span className="text-danger">*</span>
                      </Form.Label>
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
                      <Form.Label>
                        Ngày khám <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="check_date"
                        value={formData.check_date}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Cơ sở y tế</Form.Label>
                      <Form.Control
                        type="text"
                        name="facility"
                        value={formData.facility}
                        onChange={handleChange}
                        placeholder="Nhập tên bệnh viện, phòng khám..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Bác sĩ</Form.Label>
                      <Form.Control
                        type="text"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        placeholder="Tên bác sĩ khám"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tình trạng sức khỏe</Form.Label>
                      <Form.Select
                        name="health_status"
                        value={formData.health_status}
                        onChange={handleChange}
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="excellent">Tốt</option>
                        <option value="good">Khá</option>
                        <option value="fair">Trung bình</option>
                        <option value="poor">Yếu</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Ngày khám tiếp theo</Form.Label>
                      <Form.Control
                        type="date"
                        name="next_check_date"
                        value={formData.next_check_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Chẩn đoán</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        placeholder="Kết quả chẩn đoán..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Phương pháp điều trị</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleChange}
                        placeholder="Phương pháp điều trị, đơn thuốc..."
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
                  <i className="fas fa-chart-line me-2 text-primary"></i>
                  Chỉ số sức khỏe
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Huyết áp</Form.Label>
                      <Form.Control
                        type="text"
                        name="blood_pressure"
                        value={formData.blood_pressure}
                        onChange={handleChange}
                        placeholder="120/80"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Nhịp tim</Form.Label>
                      <Form.Control
                        type="text"
                        name="heart_rate"
                        value={formData.heart_rate}
                        onChange={handleChange}
                        placeholder="72 bpm"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Cân nặng (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="55"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Chiều cao (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="160"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
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
                    rows={4}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mt-4">
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
                        {isEditMode ? "Cập nhật" : "Tạo mới"}
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

export default HealthRecordFormPage;
