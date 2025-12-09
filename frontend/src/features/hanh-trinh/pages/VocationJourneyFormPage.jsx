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
import {
  journeyService,
  sisterService,
  lookupService,
  communityService,
} from "@services";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import SearchableSelect from "@components/forms/SearchableSelect";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";
import FileUpload from "@components/forms/FileUpload";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./VocationJourneyDetailPage.css";

const VocationJourneyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sisters, setSisters] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [stages, setStages] = useState([]);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newStageCode, setNewStageCode] = useState("");
  const [newStageColor, setNewStageColor] = useState("#17a2b8");
  const [addingStage, setAddingStage] = useState(false);

  // Predefined colors for stages
  const stageColors = [
    { value: "#17a2b8", label: "Xanh dương" },
    { value: "#28a745", label: "Xanh lá" },
    { value: "#ffc107", label: "Vàng" },
    { value: "#fd7e14", label: "Cam" },
    { value: "#dc3545", label: "Đỏ" },
    { value: "#6f42c1", label: "Tím" },
    { value: "#e83e8c", label: "Hồng" },
    { value: "#6c757d", label: "Xám" },
    { value: "#007bff", label: "Xanh đậm" },
    { value: "#20c997", label: "Ngọc" },
  ];

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    updateValues,
    setFieldValue,
    validateForm,
  } = useForm({
    sister_id: "",
    stage: "",
    start_date: "",
    end_date: "",
    community_id: "",
    location: "",
    superior: "",
    formation_director: "",
    notes: "",
    documents: [],
  });

  useEffect(() => {
    fetchSisters();
    fetchCommunities();
    fetchStages();
    if (isEditMode) {
      fetchJourneyData();
    }
  }, [id]);

  const fetchStages = async () => {
    try {
      const response = await lookupService.getJourneyStages();
      if (response && response.data) {
        setStages(response.data);
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };

  const fetchCommunities = async () => {
    try {
      const response = await communityService.getList({ limit: 1000 });
      if (response && response.success && response.data) {
        const communitiesData = Array.isArray(response.data)
          ? response.data
          : [];
        setCommunities(communitiesData);
      } else if (response && Array.isArray(response.data)) {
        setCommunities(response.data);
      } else if (Array.isArray(response)) {
        setCommunities(response);
      } else {
        setCommunities([]);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    }
  };

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ limit: 1000 });
      console.log("Sisters response:", response);
      // API returns { success: true, data: [...], meta: {...} } after axios interceptor
      if (response && response.success && response.data) {
        const sistersData = Array.isArray(response.data) ? response.data : [];
        setSisters(sistersData);
        console.log("Sisters loaded:", sistersData.length);
      } else if (response && Array.isArray(response.data)) {
        setSisters(response.data);
      } else if (Array.isArray(response)) {
        setSisters(response);
      } else {
        console.log("No sisters data found in response");
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
      console.log("Journey data response:", response);
      if (response.success && response.data) {
        // Format dates for DatePicker if needed
        const journeyData = {
          ...response.data,
          start_date: response.data.start_date
            ? response.data.start_date.split("T")[0]
            : "",
          end_date: response.data.end_date
            ? response.data.end_date.split("T")[0]
            : "",
        };
        console.log("Setting values:", journeyData);
        updateValues(journeyData);
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

      // Only send allowed fields to backend
      const allowedFields = [
        "sister_id",
        "stage",
        "start_date",
        "end_date",
        "location",
        "superior",
        "formation_director",
        "community_id",
        "supervisor_id",
        "notes",
      ];

      const payload = {};
      allowedFields.forEach((field) => {
        if (values[field] !== undefined) {
          payload[field] = values[field];
        }
      });

      let response;
      if (isEditMode) {
        response = await journeyService.update(id, payload);
      } else {
        response = await journeyService.create(payload);
      }

      if (response.success) {
        navigate(`/hanh-trinh/${response.data?.id || id}`);
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

  const handleAddStage = async () => {
    if (!newStageName.trim() || !newStageCode.trim()) {
      setError("Vui lòng nhập mã và tên giai đoạn");
      return;
    }

    try {
      setAddingStage(true);
      const response = await lookupService.createJourneyStage({
        code: newStageCode.trim().toLowerCase().replace(/\s+/g, "_"),
        name: newStageName.trim(),
        display_order: stages.length + 1,
        color: newStageColor,
      });

      if (response && response.data) {
        await fetchStages();
        setNewStageName("");
        setNewStageCode("");
        setNewStageColor("#17a2b8");
        setShowAddStageModal(false);
      }
    } catch (error) {
      console.error("Error adding stage:", error);
      setError("Không thể thêm giai đoạn mới");
    } finally {
      setAddingStage(false);
    }
  };

  const handleDeleteStage = async (stageId) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;

    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa giai đoạn "${stage.name}"?`)
    ) {
      return;
    }

    try {
      const response = await lookupService.deleteJourneyStage(stageId);
      if (response && response.success) {
        await fetchStages();
        // Reset stage selection if deleted stage was selected
        if (values.stage === stage.code) {
          setFieldValue("stage", "");
        }
      }
    } catch (error) {
      console.error("Error deleting stage:", error);
      // Error message is shown by API interceptor
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
        title={isEditMode ? "Chỉnh sửa Hành trình" : "Thêm Hành trình Mới"}
        items={[
          { label: "Hành trình Ơn Gọi", link: "/hanh-trinh" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

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
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-info-circle"></i>
                <span>Thông tin hành trình</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {/* Sister Selection & Stage - Same row */}
                  <Col md={6}>
                    <SearchableSelect
                      label="Nữ Tu"
                      name="sister_id"
                      value={values.sister_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.sister_id}
                      touched={touched.sister_id}
                      disabled={isEditMode}
                      required
                      placeholder="Nhập tên để tìm..."
                      maxDisplayItems={5}
                      options={(sisters || []).map((sister) => ({
                        value: sister.id,
                        label: `${
                          sister.saint_name ? `${sister.saint_name} - ` : ""
                        }${sister.birth_name} (${sister.code})`,
                      }))}
                    />
                  </Col>

                  {/* Stage - Same row with Sister */}
                  <Col md={6}>
                    <Form.Label className="fw-medium">
                      Giai đoạn <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="d-flex align-items-center gap-2">
                      <div className="flex-grow-1">
                        <Select
                          name="stage"
                          value={values.stage}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.stage}
                          touched={touched.stage}
                          placeholder="Chọn giai đoạn"
                          options={stages.map((stage) => ({
                            value: stage.code,
                            label: stage.name,
                          }))}
                        />
                      </div>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => setShowAddStageModal(true)}
                        title="Thêm giai đoạn mới"
                        style={{ height: "38px", minWidth: "38px" }}
                      >
                        <i className="fas fa-plus"></i>
                      </Button>
                      {values.stage && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            const selectedStage = stages.find(
                              (s) => s.code === values.stage
                            );
                            if (selectedStage) {
                              handleDeleteStage(selectedStage.id);
                            }
                          }}
                          title="Xóa giai đoạn đã chọn"
                          style={{ height: "38px", minWidth: "38px" }}
                        >
                          <i className="fas fa-minus"></i>
                        </Button>
                      )}
                    </div>
                    {touched.stage && errors.stage && (
                      <div className="text-danger small mt-1">
                        {errors.stage}
                      </div>
                    )}
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

                  {/* Community */}
                  <Col md={6}>
                    <SearchableSelect
                      label="Cộng đoàn"
                      name="community_id"
                      value={values.community_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nhập tên để tìm cộng đoàn..."
                      maxDisplayItems={5}
                      options={(communities || []).map((community) => ({
                        value: community.id,
                        label: community.name,
                      }))}
                    />
                  </Col>

                  {/* Location */}
                  <Col md={6}>
                    <Input
                      label="Địa điểm"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.location}
                      touched={touched.location}
                      placeholder="Nhà dòng, giáo xứ, địa chỉ..."
                    />
                  </Col>

                  {/* Superior */}
                  <Col md={6}>
                    <SearchableSelect
                      label="Bề trên"
                      name="superior"
                      value={values.superior}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nhập tên để tìm bề trên..."
                      maxDisplayItems={5}
                      options={(sisters || []).map((sister) => {
                        const displayName = sister.saint_name
                          ? `${sister.saint_name} ${sister.birth_name}`
                          : sister.birth_name;
                        return {
                          value: `${sister.id}_${displayName}`,
                          label: `${displayName} (${sister.code})`,
                        };
                      })}
                    />
                  </Col>

                  {/* Formation Director - renamed to Chị giáo */}
                  <Col md={6}>
                    <SearchableSelect
                      label="Chị giáo"
                      name="formation_director"
                      value={values.formation_director}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Nhập tên để tìm chị giáo..."
                      maxDisplayItems={5}
                      options={(sisters || []).map((sister) => {
                        const displayName = sister.saint_name
                          ? `${sister.saint_name} ${sister.birth_name}`
                          : sister.birth_name;
                        return {
                          value: `${sister.id}_${displayName}`,
                          label: `${displayName} (${sister.code})`,
                        };
                      })}
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
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-file-alt"></i>
                <span>Tài liệu đính kèm</span>
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
            <Card className="health-info-card mt-4">
              <Card.Header className="system-header">
                <i className="fas fa-check-circle"></i>
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

      {/* Add Stage Modal */}
      {showAddStageModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2"></i>
                  Thêm giai đoạn mới
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddStageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Mã giai đoạn <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: pre_aspirant"
                    value={newStageCode}
                    onChange={(e) => setNewStageCode(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Mã sẽ được tự động chuyển sang chữ thường và thay khoảng
                    trắng bằng dấu gạch dưới
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tên giai đoạn <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: Tiền ứng sinh"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Màu giai đoạn <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {stageColors.map((color) => (
                      <div
                        key={color.value}
                        onClick={() => setNewStageColor(color.value)}
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: color.value,
                          borderRadius: "6px",
                          cursor: "pointer",
                          border:
                            newStageColor === color.value
                              ? "3px solid #000"
                              : "2px solid #dee2e6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={color.label}
                      >
                        {newStageColor === color.value && (
                          <i className="fas fa-check text-white"></i>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Xem trước: </small>
                    <Badge
                      style={{ backgroundColor: newStageColor, color: "#fff" }}
                    >
                      {newStageName || "Tên giai đoạn"}
                    </Badge>
                  </div>
                </Form.Group>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddStageModal(false)}
                  disabled={addingStage}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddStage}
                  disabled={
                    addingStage || !newStageName.trim() || !newStageCode.trim()
                  }
                >
                  {addingStage ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Thêm giai đoạn
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default VocationJourneyFormPage;
