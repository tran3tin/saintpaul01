// src/features/hanh-trinh/pages/VocationJourneyFormPage.jsx

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
import { journeyService, sisterService } from "@services";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";
import FileUpload from "@components/forms/FileUpload";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { JOURNEY_STAGES, JOURNEY_STAGE_LABELS } from "@utils/constants";

const VocationJourneyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sisters, setSisters] = useState([]);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
    setFieldValue,
    validateForm,
  } = useForm({
    sister_id: "",
    stage: "",
    start_date: "",
    end_date: "",
    location: "",
    superior: "",
    formation_director: "",
    notes: "",
    documents: [],
  });

  useEffect(() => {
    fetchSisters();
    if (isEditMode) {
      fetchJourneyData();
    }
  }, [id]);

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ page_size: 1000 });
      // Handle different response formats
      if (response.success && response.data) {
        // If response.data is an array
        if (Array.isArray(response.data)) {
          setSisters(response.data);
        }
        // If response.data has items property
        else if (response.data.items) {
          setSisters(response.data.items);
        }
        // Default to empty array
        else {
          setSisters([]);
        }
      } else if (Array.isArray(response.data)) {
        setSisters(response.data);
      } else {
        setSisters([]);
      }
    } catch (error) {
      console.error("Error fetching sisters:", error);
      setSisters([]);
    }
  };

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      const response = await journeyService.getById(id);
      if (response.success) {
        setValues(response.data);
      }
    } catch (error) {
      console.error("Error fetching journey data:", error);
      setError("Không thể tải dữ liệu hành trình");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!values.sister_id) newErrors.sister_id = "Vui lòng chọn nữ tu";
    if (!values.stage) newErrors.stage = "Giai đoạn là bắt buộc";
    if (!values.start_date) newErrors.start_date = "Ngày bắt đầu là bắt buộc";
    if (!values.location) newErrors.location = "Địa điểm là bắt buộc";

    // Validate end_date > start_date
    if (values.end_date && values.start_date) {
      const start = new Date(values.start_date);
      const end = new Date(values.end_date);
      if (end < start) {
        newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      validateForm(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let response;
      if (isEditMode) {
        response = await journeyService.update(id, values);
      } else {
        response = await journeyService.create(values);
      }

      if (response.success) {
        navigate(`/hanh-trinh/${response.data.id}`);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error saving journey:", error);
      setError("Có lỗi xảy ra khi lưu hành trình");
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
      navigate(isEditMode ? `/hanh-trinh/${id}` : "/hanh-trinh");
    }
  };

  const handleAddDocument = (url) => {
    setFieldValue("documents", [
      ...values.documents,
      { url, name: "Document" },
    ]);
  };

  const handleRemoveDocument = (index) => {
    const newDocuments = values.documents.filter((_, i) => i !== index);
    setFieldValue("documents", newDocuments);
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
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Hành trình Ơn Gọi", link: "/hanh-trinh" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">
          {isEditMode ? "Chỉnh sửa Hành trình" : "Thêm Hành trình Mới"}
        </h2>
        <p className="text-muted mb-0">
          {isEditMode
            ? "Cập nhật thông tin hành trình"
            : "Nhập thông tin hành trình mới"}
        </p>
      </div>

      {/* Error Alert */}
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
                  <i className="fas fa-info-circle me-2"></i>
                  Thông tin hành trình
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {/* Sister Selection */}
                  <Col md={12}>
                    <Select
                      label="Nữ Tu"
                      name="sister_id"
                      value={values.sister_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.sister_id}
                      touched={touched.sister_id}
                      disabled={isEditMode}
                      required
                    >
                      <option value="">Chọn nữ tu</option>
                      {(sisters || []).map((sister) => (
                        <option key={sister.id} value={sister.id}>
                          {sister.religious_name || sister.saint_name
                            ? `${
                                sister.religious_name || sister.saint_name
                              } - ${sister.birth_name}`
                            : sister.birth_name}{" "}
                          ({sister.code})
                        </option>
                      ))}
                    </Select>
                  </Col>

                  {/* Stage */}
                  <Col md={12}>
                    <Select
                      label="Giai đoạn"
                      name="stage"
                      value={values.stage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.stage}
                      touched={touched.stage}
                      required
                    >
                      <option value="">Chọn giai đoạn</option>
                      {Object.entries(JOURNEY_STAGE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        )
                      )}
                    </Select>
                  </Col>

                  {/* Dates */}
                  <Col md={6}>
                    <DatePicker
                      label="Ngày bắt đầu"
                      name="start_date"
                      value={values.start_date}
                      onChange={(date) => setFieldValue("start_date", date)}
                      onBlur={handleBlur}
                      error={errors.start_date}
                      touched={touched.start_date}
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <DatePicker
                      label="Ngày kết thúc"
                      name="end_date"
                      value={values.end_date}
                      onChange={(date) => setFieldValue("end_date", date)}
                      onBlur={handleBlur}
                      error={errors.end_date}
                      touched={touched.end_date}
                      hint="Để trống nếu đang trong giai đoạn này"
                    />
                  </Col>

                  {/* Location */}
                  <Col md={12}>
                    <Input
                      label="Địa điểm"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.location}
                      touched={touched.location}
                      placeholder="Nhà dòng, giáo xứ, địa chỉ..."
                      required
                    />
                  </Col>

                  {/* Superior */}
                  <Col md={6}>
                    <Input
                      label="Bề trên"
                      name="superior"
                      value={values.superior}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tên bề trên phụ trách"
                    />
                  </Col>

                  {/* Formation Director */}
                  <Col md={6}>
                    <Input
                      label="Giám đốc đào tạo"
                      name="formation_director"
                      value={values.formation_director}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tên giám đốc đào tạo"
                    />
                  </Col>

                  {/* Notes */}
                  <Col md={12}>
                    <TextArea
                      label="Ghi chú"
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={4}
                      placeholder="Ghi chú về giai đoạn này..."
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Documents */}
          <Col lg={4}>
            <Card>
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>
                  Tài liệu đính kèm
                </h5>
              </Card.Header>
              <Card.Body>
                <FileUpload
                  label="Tải lên tài liệu"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024}
                  onChange={handleAddDocument}
                  multiple
                />

                {values.documents && values.documents.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Danh sách tài liệu:</h6>
                    <div className="document-list">
                      {values.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <i className="fas fa-file-pdf text-danger me-2"></i>
                          <span className="flex-grow-1">{doc.name}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveDocument(index)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Action Buttons */}
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
                    variant="secondary"
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

export default VocationJourneyFormPage;
