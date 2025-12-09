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
import { toast } from "react-toastify";
import { healthService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import SearchableSelect from "@components/forms/SearchableSelect";
import DatePicker from "@components/forms/DatePicker";
import MultiFileUpload from "@components/forms/MultiFileUpload";
import "./HealthRecordDetailPage.css";

const HealthRecordFormPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sisters, setSisters] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [formData, setFormData] = useState({
    sister_id: sisterId || "",
    general_health: "",
    chronic_diseases: "",
    work_limitations: "",
    checkup_date: "",
    checkup_place: "",
    doctor: "",
    blood_pressure: "",
    heart_rate: "",
    weight: "",
    height: "",
    diagnosis: "",
    treatment: "",
    next_check_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchSisters();
    if (isEditMode) {
      fetchHealthRecord();
    }
  }, [id]);

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ limit: 1000 });
      console.log("Sisters API response:", response);
      if (response && response.success && response.data) {
        let sistersData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
        // Remove duplicates by id
        const uniqueSisters = sistersData.filter(
          (sister, index, self) =>
            index === self.findIndex((s) => s.id === sister.id)
        );
        console.log("Sisters data (unique):", uniqueSisters.length);
        setSisters(uniqueSisters);
      } else if (response && Array.isArray(response.data)) {
        setSisters(response.data);
      } else if (Array.isArray(response)) {
        setSisters(response);
      } else {
        console.log("No sisters data found");
        setSisters([]);
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
        const data = response.data;
        // Format dates
        setFormData({
          ...data,
          checkup_date: data.checkup_date
            ? data.checkup_date.split("T")[0]
            : "",
          next_check_date: data.next_check_date
            ? data.next_check_date.split("T")[0]
            : "",
        });
        // Load documents if available
        if (data.documents) {
          try {
            const docs =
              typeof data.documents === "string"
                ? JSON.parse(data.documents)
                : data.documents;
            setDocuments(Array.isArray(docs) ? docs : []);
          } catch {
            setDocuments([]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching health record:", error);
      setError("Không thể tải thông tin hồ sơ sức khỏe");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    // Handle both event object and direct value
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Separate handler for DatePicker (receives value directly)
  const handleDateChange = (name) => (value) => {
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

    if (!formData.general_health) {
      setError("Vui lòng chọn tình trạng sức khỏe chung");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare payload with documents
      const payload = {
        ...formData,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
      };

      let response;
      if (isEditMode) {
        response = await healthService.update(id, payload);
      } else {
        response = await healthService.create(payload);
      }

      if (response.success) {
        const successMsg = isEditMode
          ? "Đã cập nhật hồ sơ sức khỏe thành công!"
          : "Đã thêm hồ sơ sức khỏe thành công!";
        toast.success(successMsg);
        setTimeout(() => {
          navigate(sisterId ? `/nu-tu/${sisterId}/suc-khoe` : "/suc-khoe");
        }, 1500);
      } else {
        const errorMsg = response.error || "Không thể lưu hồ sơ sức khỏe";
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error saving health record:", error);
      const errorMsg =
        error?.response?.data?.message || "Lỗi khi lưu hồ sơ sức khỏe";
      toast.error(errorMsg);
      setError(errorMsg);
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
        title={isEditMode ? "Chỉnh sửa Hồ sơ Sức khỏe" : "Thêm Hồ sơ Sức khỏe"}
        items={[
          { label: "Hồ sơ Sức khỏe", link: "/suc-khoe" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="d-flex justify-content-end align-items-center mb-4">
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
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-heartbeat"></i>
                <span>Thông tin Khám bệnh</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <SearchableSelect
                      label="Nữ Tu"
                      name="sister_id"
                      value={formData.sister_id}
                      onChange={handleChange}
                      disabled={!!sisterId}
                      required
                      placeholder="Nhập tên để tìm..."
                      maxDisplayItems={5}
                      options={(sisters || []).map((sister) => ({
                        value: sister.id,
                        label:
                          `${
                            sister.saint_name ? `${sister.saint_name} - ` : ""
                          }${sister.birth_name || ""}${
                            sister.code ? ` (${sister.code})` : ""
                          }`.trim() || `Nữ tu #${sister.id}`,
                      }))}
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Tình trạng sức khỏe chung{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="general_health"
                        value={formData.general_health}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="good">Tốt</option>
                        <option value="average">Trung bình</option>
                        <option value="weak">Yếu</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <DatePicker
                      label="Ngày khám"
                      name="checkup_date"
                      value={formData.checkup_date}
                      onChange={handleDateChange("checkup_date")}
                      placeholder="dd/mm/yyyy"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nơi khám</Form.Label>
                      <Form.Control
                        type="text"
                        name="checkup_place"
                        value={formData.checkup_place}
                        onChange={handleChange}
                        placeholder="Nhập tên bệnh viện, phòng khám..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Bác sĩ khám</Form.Label>
                      <Form.Control
                        type="text"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        placeholder="Tên bác sĩ..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Bệnh mãn tính</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="chronic_diseases"
                        value={formData.chronic_diseases}
                        onChange={handleChange}
                        placeholder="Liệt kê các bệnh mãn tính (nếu có)..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Hạn chế công việc</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="work_limitations"
                        value={formData.work_limitations}
                        onChange={handleChange}
                        placeholder="Các hạn chế về công việc do sức khỏe..."
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

                  <Col md={6}>
                    <DatePicker
                      label="Ngày tái khám"
                      name="next_check_date"
                      value={formData.next_check_date}
                      onChange={handleDateChange("next_check_date")}
                      placeholder="dd/mm/yyyy"
                    />
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Ghi chú</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-paperclip"></i>
                <span>Tài liệu đính kèm</span>
              </Card.Header>
              <Card.Body>
                <MultiFileUpload
                  files={documents}
                  onChange={setDocuments}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  maxFiles={10}
                  hint="Hỗ trợ PDF, Word, ảnh (tối đa 10 file)"
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="health-info-card">
              <Card.Header className="metrics-header">
                <i className="fas fa-chart-line"></i>
                <span>Chỉ số Sức khỏe</span>
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
                        placeholder="VD: 120/80"
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
                        placeholder="VD: 72"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Cân nặng (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="VD: 55.5"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Chiều cao (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="VD: 160"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="health-info-card">
              <Card.Header className="system-header">
                <i className="fas fa-save"></i>
                <span>Thao tác</span>
              </Card.Header>
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
