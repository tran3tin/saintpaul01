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
import { departureService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import SearchableSelect from "@components/forms/SearchableSelect";
import DatePicker from "@components/forms/DatePicker";
import MultiFileUpload from "@components/forms/MultiFileUpload";

const DepartureFormPage = () => {
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
        setSisters(uniqueSisters);
      } else if (response && Array.isArray(response.data)) {
        setSisters(response.data);
      } else if (Array.isArray(response)) {
        setSisters(response);
      } else {
        setSisters([]);
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
        const data = response.data;
        setFormData({
          ...data,
          departure_date: data.departure_date
            ? data.departure_date.split("T")[0]
            : "",
          expected_return_date: data.expected_return_date
            ? data.expected_return_date.split("T")[0]
            : "",
          return_date: data.return_date ? data.return_date.split("T")[0] : "",
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
      console.error("Error fetching departure:", error);
      setError("Không thể tải thông tin phiếu đi vắng");
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

      // Prepare payload with documents
      const payload = {
        ...formData,
        // Backend still validates stage_at_departure; use a safe default
        stage_at_departure: "temporary_vows",
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
      };

      let response;
      if (isEditMode) {
        response = await departureService.update(id, payload);
      } else {
        response = await departureService.create(payload);
      }

      if (response.success) {
        const successMsg = isEditMode
          ? "Đã cập nhật phiếu đi vắng thành công!"
          : "Đã đăng ký đi vắng thành công!";
        toast.success(successMsg);
        setTimeout(() => {
          navigate(sisterId ? `/nu-tu/${sisterId}/di-vang` : "/di-vang");
        }, 1500);
      } else {
        const errorMsg = response.error || "Không thể lưu phiếu đi vắng";
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error saving departure:", error);
      const errorMsg =
        error?.response?.data?.message || "Lỗi khi lưu phiếu đi vắng";
      toast.error(errorMsg);
      setError(errorMsg);
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
        title={isEditMode ? "Chỉnh sửa Phiếu Đi vắng" : "Đăng ký Đi vắng"}
        items={[
          { label: "Đi vắng", link: "/di-vang" },
          { label: isEditMode ? "Chỉnh sửa" : "Đăng ký mới" },
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
                    <SearchableSelect
                      label="Nữ tu"
                      name="sister_id"
                      value={formData.sister_id}
                      onChange={handleChange}
                      disabled={!!sisterId}
                      required
                      placeholder="Nhập tên để tìm nữ tu..."
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
                        Loại đi vắng <span className="text-danger">*</span>
                      </Form.Label>
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
                    <DatePicker
                      label="Ngày đi"
                      name="departure_date"
                      value={formData.departure_date}
                      onChange={handleDateChange("departure_date")}
                      required
                      placeholder="dd/mm/yyyy"
                    />
                  </Col>

                  <Col md={4}>
                    <DatePicker
                      label="Dự kiến về"
                      name="expected_return_date"
                      value={formData.expected_return_date}
                      onChange={handleDateChange("expected_return_date")}
                      placeholder="dd/mm/yyyy"
                    />
                  </Col>

                  <Col md={4}>
                    <DatePicker
                      label="Ngày về thực tế"
                      name="return_date"
                      value={formData.return_date}
                      onChange={handleDateChange("return_date")}
                      placeholder="dd/mm/yyyy"
                    />
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
                    <SearchableSelect
                      label="Người phê duyệt"
                      name="approved_by"
                      value={formData.approved_by}
                      onChange={handleChange}
                      placeholder="Nhập tên để tìm người phê duyệt..."
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
                  <i className="fas fa-paperclip me-2 text-info"></i>
                  Tài liệu đính kèm
                </h5>
              </Card.Header>
              <Card.Body>
                <MultiFileUpload
                  label=""
                  files={documents}
                  onChange={setDocuments}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  maxFiles={10}
                  hint="Hỗ trợ PDF, Word, ảnh (tối đa 10 file)"
                />
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
