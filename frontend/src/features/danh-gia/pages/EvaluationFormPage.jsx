// src/features/danh-gia/pages/EvaluationFormPage.jsx

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
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { evaluationService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import SearchableSelect from "@components/forms/SearchableSelect";
import DatePicker from "@components/forms/DatePicker";
import MultiFileUpload from "@components/forms/MultiFileUpload";
import "./EvaluationDetailPage.css";

const validationSchema = Yup.object({
  sister_id: Yup.number().required("Vui lòng chọn Nữ Tu"),
  evaluation_type: Yup.string().required("Vui lòng chọn loại đánh giá"),
  period: Yup.string().required("Vui lòng nhập kỳ đánh giá"),
  evaluation_date: Yup.date().required("Vui lòng chọn ngày đánh giá"),
  evaluator: Yup.number().required("Vui lòng chọn người đánh giá"),
});

const EvaluationFormPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [sisters, setSisters] = useState([]);
  const [documents, setDocuments] = useState([]);

  const formik = useFormik({
    initialValues: {
      sister_id: sisterId || "",
      evaluation_type: "",
      period: "",
      evaluation_date: new Date().toISOString().split("T")[0],
      evaluator: "",
      spiritual_life: "",
      community_life: "",
      apostolic_work: "",
      personal_development: "",
      overall_rating: "",
      strengths: "",
      weaknesses: "",
      recommendations: "",
      notes: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    fetchSisters();
    if (isEdit) {
      fetchEvaluation();
    }
  }, [id]);

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ page_size: 1000 });
      if (response.success) {
        setSisters(response.data.items || response.data);
      }
    } catch (error) {
      console.error("Error fetching sisters:", error);
    }
  };

  const fetchEvaluation = async () => {
    try {
      setInitialLoading(true);
      const response = await evaluationService.getById(id);
      if (response.success) {
        const evaluation = response.data;

        // Convert evaluator to number if it's a numeric string
        let evaluatorValue = evaluation.evaluator || "";
        if (evaluatorValue && !isNaN(evaluatorValue)) {
          evaluatorValue = Number(evaluatorValue);
        }

        formik.setValues({
          sister_id: evaluation.sister_id || "",
          evaluation_type: evaluation.type || evaluation.evaluation_type || "",
          period: evaluation.period || "",
          evaluation_date: evaluation.evaluation_date
            ? evaluation.evaluation_date.split("T")[0]
            : "",
          evaluator: evaluatorValue,
          spiritual_life: evaluation.spiritual_life || "",
          community_life: evaluation.community_life || "",
          apostolic_work: evaluation.apostolic_work || "",
          personal_development: evaluation.personal_development || "",
          overall_rating: evaluation.overall_rating || "",
          strengths: evaluation.strengths || "",
          weaknesses: evaluation.weaknesses || "",
          recommendations: evaluation.recommendations || "",
          notes: evaluation.notes || "",
        });

        // Load documents if available
        if (evaluation.documents) {
          try {
            const docs =
              typeof evaluation.documents === "string"
                ? JSON.parse(evaluation.documents)
                : evaluation.documents;
            setDocuments(Array.isArray(docs) ? docs : []);
          } catch {
            setDocuments([]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching evaluation:", error);
      setError("Không thể tải thông tin đánh giá");
    } finally {
      setInitialLoading(false);
    }
  };

  async function handleSubmit(values) {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        sister_id: values.sister_id,
        evaluation_type: values.evaluation_type,
        period: values.period,
        evaluation_date: values.evaluation_date,
        evaluator: values.evaluator ? Number(values.evaluator) : null,
        spiritual_life: values.spiritual_life
          ? Number(values.spiritual_life)
          : null,
        community_life: values.community_life
          ? Number(values.community_life)
          : null,
        apostolic_work: values.apostolic_work
          ? Number(values.apostolic_work)
          : null,
        personal_development: values.personal_development
          ? Number(values.personal_development)
          : null,
        overall_rating: values.overall_rating
          ? Number(values.overall_rating)
          : null,
        strengths: values.strengths,
        weaknesses: values.weaknesses,
        recommendations: values.recommendations,
        notes: values.notes,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
      };

      let response;
      if (isEdit) {
        response = await evaluationService.update(id, payload);
      } else {
        response = await evaluationService.create(payload);
      }

      if (response.success) {
        const successMsg = isEdit
          ? "Đã cập nhật đánh giá thành công!"
          : "Đã thêm đánh giá thành công!";
        toast.success(successMsg);
        setTimeout(() => {
          navigate(sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia");
        }, 1500);
      } else {
        const errorMsg = response.error || "Có lỗi xảy ra";
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      const errorMsg =
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu đánh giá";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
      )
    ) {
      toast.info("Đã hủy thao tác");
      navigate(sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia");
    }
  };

  // Calculate overall rating automatically
  useEffect(() => {
    const {
      spiritual_life,
      community_life,
      apostolic_work,
      personal_development,
    } = formik.values;
    const values = [
      spiritual_life,
      community_life,
      apostolic_work,
      personal_development,
    ]
      .filter((v) => v !== "" && v !== null)
      .map(Number);

    if (values.length > 0) {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      if (avg !== Number(formik.values.overall_rating)) {
        formik.setFieldValue("overall_rating", avg);
      }
    }
  }, [
    formik.values.spiritual_life,
    formik.values.community_life,
    formik.values.apostolic_work,
    formik.values.personal_development,
  ]);

  if (initialLoading) {
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
        title={isEdit ? "Chỉnh sửa Đánh giá" : "Thêm Đánh giá"}
        items={[
          {
            label: "Đánh giá",
            link: sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia",
          },
          { label: isEdit ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={formik.handleSubmit}>
        <Row className="g-4">
          {/* Basic Info */}
          <Col lg={8}>
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-info-circle"></i>
                <span>Thông tin cơ bản</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <SearchableSelect
                      label="Nữ Tu"
                      name="sister_id"
                      value={formik.values.sister_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={Boolean(sisterId)}
                      required
                      placeholder="Nhập tên để tìm..."
                      maxDisplayItems={5}
                      isInvalid={
                        formik.touched.sister_id && formik.errors.sister_id
                      }
                      options={(sisters || []).map((sister) => ({
                        value: sister.id,
                        label:
                          `${sister.saint_name ? `${sister.saint_name} ` : ""}${
                            sister.birth_name || ""
                          }${sister.code ? ` (${sister.code})` : ""}`.trim() ||
                          `Nữ tu #${sister.id}`,
                      }))}
                    />
                    {formik.touched.sister_id && formik.errors.sister_id && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.sister_id}
                      </div>
                    )}
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Loại đánh giá <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="evaluation_type"
                        value={formik.values.evaluation_type}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.evaluation_type &&
                          formik.errors.evaluation_type
                        }
                      >
                        <option value="">-- Chọn loại đánh giá --</option>
                        <option value="annual">Đánh giá năm</option>
                        <option value="semi_annual">Đánh giá 6 tháng</option>
                        <option value="quarterly">Đánh giá quý</option>
                        <option value="monthly">Đánh giá tháng</option>
                        <option value="special">Đánh giá đặc biệt</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.evaluation_type}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Kỳ đánh giá <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="period"
                        placeholder="VD: Năm 2024, Quý 1/2024..."
                        value={formik.values.period}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.period && formik.errors.period
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.period}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <DatePicker
                      label="Ngày đánh giá"
                      name="evaluation_date"
                      value={formik.values.evaluation_date}
                      onChange={(isoDate) =>
                        formik.setFieldValue("evaluation_date", isoDate)
                      }
                      onBlur={formik.handleBlur}
                      required
                      placeholder="dd/mm/yyyy"
                    />
                    {formik.touched.evaluation_date &&
                      formik.errors.evaluation_date && (
                        <div className="invalid-feedback d-block">
                          {formik.errors.evaluation_date}
                        </div>
                      )}
                  </Col>

                  <Col md={6}>
                    <SearchableSelect
                      label="Người đánh giá"
                      name="evaluator"
                      value={formik.values.evaluator}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      placeholder="Nhập tên để tìm..."
                      maxDisplayItems={5}
                      isInvalid={
                        formik.touched.evaluator && formik.errors.evaluator
                      }
                      options={(sisters || []).map((sister) => ({
                        value: sister.id,
                        label:
                          `${sister.saint_name ? `${sister.saint_name} ` : ""}${
                            sister.birth_name || ""
                          }${sister.code ? ` (${sister.code})` : ""}`.trim() ||
                          `Nữ tu #${sister.id}`,
                      }))}
                    />
                    {formik.touched.evaluator && formik.errors.evaluator && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.evaluator}
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Ratings */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-star"></i>
                <span>Điểm đánh giá (0-100)</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Đời sống thiêng liêng</Form.Label>
                      <Form.Control
                        type="number"
                        name="spiritual_life"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={formik.values.spiritual_life}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Đời sống cộng đoàn</Form.Label>
                      <Form.Control
                        type="number"
                        name="community_life"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={formik.values.community_life}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Công tác tông đồ</Form.Label>
                      <Form.Control
                        type="number"
                        name="apostolic_work"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={formik.values.apostolic_work}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phát triển cá nhân</Form.Label>
                      <Form.Control
                        type="number"
                        name="personal_development"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={formik.values.personal_development}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Tổng điểm (tự động tính)</Form.Label>
                      <Form.Control
                        type="number"
                        name="overall_rating"
                        min="0"
                        max="100"
                        value={formik.values.overall_rating}
                        onChange={formik.handleChange}
                        className="fw-bold"
                      />
                      <Form.Text className="text-muted">
                        Điểm trung bình của các tiêu chí
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Comments */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-comment-alt"></i>
                <span>Nhận xét</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Điểm mạnh</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="strengths"
                        placeholder="Các điểm mạnh nổi bật..."
                        value={formik.values.strengths}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Điểm yếu</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="weaknesses"
                        placeholder="Các điểm cần cải thiện..."
                        value={formik.values.weaknesses}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Khuyến nghị</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="recommendations"
                        placeholder="Các khuyến nghị cho tương lai..."
                        value={formik.values.recommendations}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Ghi chú</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="notes"
                        placeholder="Ghi chú thêm..."
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <MultiFileUpload
                      label="Tài liệu đính kèm"
                      files={documents}
                      onChange={setDocuments}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      maxFiles={10}
                      hint="Hỗ trợ PDF, Word, ảnh (tối đa 10 file)"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card
              className="health-info-card sticky-top"
              style={{ top: "1rem" }}
            >
              <Card.Header className="system-header">
                <i className="fas fa-save"></i>
                <span>Hành động</span>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {isEdit ? "Cập nhật" : "Lưu đánh giá"}
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    <i className="fas fa-times me-2"></i>
                    Hủy
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Tips */}
            <Card className="health-info-card">
              <Card.Header className="system-header">
                <i className="fas fa-lightbulb"></i>
                <span>Hướng dẫn</span>
              </Card.Header>
              <Card.Body>
                <ul className="mb-0 ps-3">
                  <li className="mb-2">Điểm đánh giá từ 0-100</li>
                  <li className="mb-2">Tổng điểm được tính tự động</li>
                  <li className="mb-2">90-100: Xuất sắc</li>
                  <li className="mb-2">75-89: Tốt</li>
                  <li className="mb-2">60-74: Khá</li>
                  <li>Dưới 60: Cần cải thiện</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EvaluationFormPage;
