// src/features/nu-tu/pages/SisterFormPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Nav,
  Tab,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { sisterService, communityService } from "@services";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import SelectWithAdd from "@components/forms/SelectWithAdd";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";
import FileUpload from "@components/forms/FileUpload";
import MultiFileUpload from "@components/forms/MultiFileUpload";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { isValidEmail, isValidPhone } from "@utils/validators";

const SisterFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [communities, setCommunities] = useState([]);

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

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    updateValues,
    setFieldValue,
    setFieldError,
    validateForm,
  } = useForm({
    // Basic Info - mapped to database columns
    birth_name: "", // Họ tên khai sinh
    saint_name: "", // Tên thánh
    code: "", // Mã số
    date_of_birth: "",
    place_of_birth: "",
    nationality: "Việt Nam",
    id_card: "",
    id_card_date: "",
    id_card_place: "",
    phone: "",
    email: "",
    permanent_address: "",
    current_address: "",

    // Family Info
    father_name: "",
    father_occupation: "",
    mother_name: "",
    mother_occupation: "",
    siblings_count: "",
    family_address: "",
    family_religion: "", // Tôn giáo gia đình

    // Sacraments - Bí tích
    baptism_date: "",
    baptism_place: "",
    confirmation_date: "",
    first_communion_date: "",

    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_phone: "",

    // Documents - Tài liệu
    documents: [],

    // Notes - Ghi chú
    notes: "",

    // Avatar
    photo_url: "",
    photo_file: null,
  });

  useEffect(() => {
    fetchLookupData();
    if (isEditMode) {
      fetchSisterData();
    }
  }, [id]);

  const fetchLookupData = async () => {
    try {
      const communitiesRes = await communityService.getList({ page_size: 100 });

      if (communitiesRes.success) {
        setCommunities(communitiesRes.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    }
  };

  const fetchSisterData = async () => {
    try {
      setLoading(true);
      const response = await sisterService.getById(id);
      if (response.success) {
        // Convert null values to empty strings for form inputs
        const data = response.data;
        const sanitizedData = {};
        Object.keys(data).forEach((key) => {
          if (key === "documents") {
            // Parse documents - could be array, JSON string, or null
            if (Array.isArray(data[key])) {
              sanitizedData[key] = data[key];
            } else if (typeof data[key] === "string" && data[key]) {
              try {
                sanitizedData[key] = JSON.parse(data[key]);
              } catch (e) {
                sanitizedData[key] = [];
              }
            } else {
              sanitizedData[key] = [];
            }
          } else {
            sanitizedData[key] = data[key] === null ? "" : data[key];
          }
        });
        sanitizedData.photo_file = null;
        updateValues(sanitizedData);
      }
    } catch (error) {
      console.error("Error fetching sister data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    // Required fields - using database column names
    if (!values.birth_name)
      newErrors.birth_name = "Họ tên khai sinh là bắt buộc";
    if (!values.date_of_birth)
      newErrors.date_of_birth = "Ngày sinh là bắt buộc";

    // Email validation
    if (values.email && !isValidEmail(values.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Phone validation
    if (values.phone && !isValidPhone(values.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // Set each error using setFieldError
      Object.entries(validationErrors).forEach(([field, error]) => {
        setFieldError(field, error);
      });
      return;
    }

    try {
      setSubmitting(true);
      const excludedFields = [
        "id",
        "created_at",
        "created_by",
        "updated_at",
        "vocationJourney",
        "communityAssignments",
        "missions",
        "education",
        "educations",
        "trainingCourses",
        "healthRecords",
        "health_records",
        "evaluations",
        "departureRecords",
        "current_community_name",
        "currentCommunity",
        "target",
        "photo_file",
      ];

      const submitData = {};
      Object.entries(values).forEach(([key, value]) => {
        if (excludedFields.includes(key)) {
          return;
        }

        if (key === "photo_url" && value && typeof value === "object") {
          // Defensive guard: skip accidental event objects
          return;
        }

        if (value !== "" && value !== null && value !== undefined) {
          submitData[key] = value;
        } else if (["birth_name", "date_of_birth"].includes(key)) {
          submitData[key] = value;
        }
      });

      if (
        Array.isArray(submitData.documents) &&
        submitData.documents.length === 0
      ) {
        delete submitData.documents;
      }

      console.log("Submitting data:", submitData);

      let response;
      if (isEditMode) {
        response = await sisterService.update(id, submitData);

        if (response.success && values.photo_file) {
          try {
            await sisterService.uploadAvatar(id, values.photo_file);
          } catch (uploadError) {
            console.error("Avatar upload failed:", uploadError);
            showToast(
              "warning",
              "Ảnh đại diện chưa được cập nhật",
              "Thông tin đã lưu nhưng tải ảnh thất bại."
            );
          }
        }
      } else {
        response = await sisterService.create(submitData);

        if (response.success && values.photo_file) {
          try {
            await sisterService.uploadAvatar(
              response.data.id,
              values.photo_file
            );
          } catch (uploadError) {
            console.error("Avatar upload failed:", uploadError);
            showToast(
              "warning",
              "Ảnh đại diện chưa được tải lên",
              "Nữ tu đã được tạo nhưng ảnh chưa được lưu."
            );
          }
        }
      }

      if (response.success) {
        showToast(
          "success",
          isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!",
          isEditMode
            ? `Đã cập nhật thông tin nữ tu "${submitData.birth_name}".`
            : `Đã thêm nữ tu "${submitData.birth_name}" vào hệ thống.`
        );
        setTimeout(() => {
          navigate(`/nu-tu/${response.data.id}`);
        }, 1500);
      } else {
        showToast(
          "danger",
          isEditMode ? "Cập nhật thất bại!" : "Tạo mới thất bại!",
          response.message || "Đã xảy ra lỗi. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Error saving sister:", error);

      // Extract error message from response
      let errorMessage = "Đã xảy ra lỗi không xác định. Vui lòng thử lại.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Validation errors from backend
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors.map((e) => e.msg || e.message).join(", ");
        } else if (typeof errors === "object") {
          errorMessage = Object.values(errors).join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(
        "danger",
        isEditMode ? "Cập nhật thất bại!" : "Tạo mới thất bại!",
        errorMessage
      );
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
      navigate(isEditMode ? `/nu-tu/${id}` : "/nu-tu");
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

      {/* Breadcrumb */}
      <Breadcrumb
        title={isEditMode ? "Chỉnh sửa Nữ Tu" : "Thêm Nữ Tu Mới"}
        items={[
          { label: "Quản lý Nữ Tu", link: "/nu-tu" },
          { label: isEditMode ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left Column - Avatar */}
          <Col lg={3}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Ảnh đại diện</h5>
                <FileUpload
                  onChange={(event) => {
                    const selectedFiles = event?.target?.value || [];
                    const file =
                      Array.isArray(selectedFiles) && selectedFiles.length > 0
                        ? selectedFiles[0]
                        : null;
                    setFieldValue("photo_file", file);
                  }}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  preview
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Form */}
          <Col lg={9}>
            <Tab.Container defaultActiveKey="basic">
              <Card>
                <Card.Header className="bg-white">
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="basic">
                        <i className="fas fa-user me-2"></i>
                        Thông tin cơ bản
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="family">
                        <i className="fas fa-users me-2"></i>
                        Thông tin gia đình
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="sacraments">
                        <i className="fas fa-church me-2"></i>
                        Bí tích
                      </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                      <Nav.Link eventKey="documents">
                        <i className="fas fa-folder-open me-2"></i>
                        Tài liệu
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="notes">
                        <i className="fas fa-sticky-note me-2"></i>
                        Ghi chú
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>

                <Card.Body>
                  <Tab.Content>
                    {/* Basic Info Tab */}
                    <Tab.Pane eventKey="basic">
                      <Row className="g-3">
                        <Col md={6}>
                          <Input
                            label="Họ và tên khai sinh"
                            name="birth_name"
                            value={values.birth_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.birth_name}
                            touched={touched.birth_name}
                            required
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Tên thánh"
                            name="saint_name"
                            value={values.saint_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Mã số"
                            name="code"
                            value={values.code}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Tự động tạo nếu để trống"
                          />
                        </Col>

                        <Col md={6}>
                          <DatePicker
                            label="Ngày sinh"
                            name="date_of_birth"
                            value={values.date_of_birth}
                            onChange={(date) =>
                              setFieldValue("date_of_birth", date)
                            }
                            onBlur={handleBlur}
                            error={errors.date_of_birth}
                            touched={touched.date_of_birth}
                            required
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Nơi sinh"
                            name="place_of_birth"
                            value={values.place_of_birth}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Quốc tịch"
                            name="nationality"
                            value={values.nationality}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={4}>
                          <Input
                            label="CMND/CCCD"
                            name="id_card"
                            value={values.id_card}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={4}>
                          <DatePicker
                            label="Ngày cấp"
                            name="id_card_date"
                            value={values.id_card_date}
                            onChange={(date) =>
                              setFieldValue("id_card_date", date)
                            }
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={4}>
                          <Input
                            label="Nơi cấp"
                            name="id_card_place"
                            value={values.id_card_place}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Điện thoại"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.phone}
                            touched={touched.phone}
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
                          />
                        </Col>

                        <Col md={12}>
                          <TextArea
                            label="Địa chỉ thường trú"
                            name="permanent_address"
                            value={values.permanent_address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={2}
                          />
                        </Col>

                        <Col md={12}>
                          <TextArea
                            label="Địa chỉ hiện tại"
                            name="current_address"
                            value={values.current_address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={2}
                          />
                        </Col>
                      </Row>
                    </Tab.Pane>

                    {/* Family Info Tab */}
                    <Tab.Pane eventKey="family">
                      <Row className="g-3">
                        <Col md={6}>
                          <Input
                            label="Tên cha"
                            name="father_name"
                            value={values.father_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Nghề nghiệp cha"
                            name="father_occupation"
                            value={values.father_occupation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Tên mẹ"
                            name="mother_name"
                            value={values.mother_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Nghề nghiệp mẹ"
                            name="mother_occupation"
                            value={values.mother_occupation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Số anh chị em"
                            name="siblings_count"
                            type="number"
                            value={values.siblings_count}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Tôn giáo gia đình"
                            name="family_religion"
                            value={values.family_religion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={12}>
                          <TextArea
                            label="Địa chỉ gia đình"
                            name="family_address"
                            value={values.family_address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={3}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Tên người liên hệ khẩn cấp"
                            name="emergency_contact_name"
                            value={values.emergency_contact_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="SĐT liên hệ khẩn cấp"
                            name="emergency_contact_phone"
                            value={values.emergency_contact_phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>
                      </Row>
                    </Tab.Pane>

                    {/* Sacraments Tab - Bí tích */}
                    <Tab.Pane eventKey="sacraments">
                      <Row className="g-3">
                        <Col md={6}>
                          <DatePicker
                            label="Ngày rửa tội"
                            name="baptism_date"
                            value={values.baptism_date}
                            onChange={(date) =>
                              setFieldValue("baptism_date", date)
                            }
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <Input
                            label="Nơi rửa tội"
                            name="baptism_place"
                            value={values.baptism_place}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <DatePicker
                            label="Ngày thêm sức"
                            name="confirmation_date"
                            value={values.confirmation_date}
                            onChange={(date) =>
                              setFieldValue("confirmation_date", date)
                            }
                            onBlur={handleBlur}
                          />
                        </Col>

                        <Col md={6}>
                          <DatePicker
                            label="Ngày rước lễ lần đầu"
                            name="first_communion_date"
                            value={values.first_communion_date}
                            onChange={(date) =>
                              setFieldValue("first_communion_date", date)
                            }
                            onBlur={handleBlur}
                          />
                        </Col>
                      </Row>
                    </Tab.Pane>

                    {/* Documents Tab - Tài liệu */}
                    <Tab.Pane eventKey="documents">
                      <div className="mb-3">
                        <h5 className="mb-3">
                          <i className="fas fa-file-alt me-2"></i>
                          Tài liệu đính kèm
                        </h5>
                        <p className="text-muted mb-4">
                          Upload các tài liệu liên quan như: giấy khai sinh,
                          chứng minh nhân dân, bằng cấp, chứng chỉ, giấy giới
                          thiệu, và các tài liệu khác.
                        </p>
                        <MultiFileUpload
                          value={values.documents}
                          onChange={(files) =>
                            setFieldValue("documents", files)
                          }
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          maxSize={10 * 1024 * 1024}
                          maxFiles={20}
                        />
                      </div>
                    </Tab.Pane>

                    {/* Notes Tab - Ghi chú */}
                    <Tab.Pane eventKey="notes">
                      <div className="mb-3">
                        <h5 className="mb-3">
                          <i className="fas fa-sticky-note me-2"></i>
                          Ghi chú
                        </h5>
                        <p className="text-muted mb-4">
                          Thêm các ghi chú, nhận xét hoặc thông tin bổ sung về
                          nữ tu.
                        </p>
                        <TextArea
                          name="notes"
                          value={values.notes}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          rows={10}
                          placeholder="Nhập ghi chú tại đây..."
                        />
                      </div>
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>

                <Card.Footer className="bg-white border-top">
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      <i className="fas fa-times me-2"></i>
                      Hủy
                    </Button>
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
                          {isEditMode ? "Cập nhật" : "Tạo mới"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Tab.Container>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default SisterFormPage;
