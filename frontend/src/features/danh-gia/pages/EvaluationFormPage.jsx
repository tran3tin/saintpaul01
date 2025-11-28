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
import { useFormik } from "formik";
import * as Yup from "yup";
import { evaluationService, sisterService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const validationSchema = Yup.object({
  sister_id: Yup.number().required("Vui lòng chọn Nữ Tu"),
  evaluation_type: Yup.string().required("Vui lòng chọn loại đánh giá"),
  period: Yup.string().required("Vui lòng nhập kỳ đánh giá"),
  evaluation_date: Yup.date().required("Vui lòng chọn ngày đánh giá"),
  evaluator: Yup.string().required("Vui lòng nhập tên người đánh giá"),
});

const EvaluationFormPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [sisters, setSisters] = useState([]);

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
        formik.setValues({
          sister_id: evaluation.sister_id || "",
          evaluation_type: evaluation.type || evaluation.evaluation_type || "",
          period: evaluation.period || "",
          evaluation_date: evaluation.evaluation_date
            ? evaluation.evaluation_date.split("T")[0]
            : "",
          evaluator: evaluation.evaluator || "",
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
        ...values,
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
      };

      let response;
      if (isEdit) {
        response = await evaluationService.update(id, payload);
      } else {
        response = await evaluationService.create(payload);
      }

      if (response.success) {
        navigate(sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia");
      } else {
        setError(response.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      setError("Có lỗi xảy ra khi lưu đánh giá");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    navigate(sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia");
  };

  // Calculate overall rating automatically
  useEffect(() => {
    const { spiritual_life, community_life, apostolic_work, personal_development } = formik.values;
    const values = [spiritual_life, community_life, apostolic_work, personal_development]
      .filter(v => v !== "" && v !== null)
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
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Đánh giá", link: sisterId ? `/nu-tu/${sisterId}/danh-gia` : "/danh-gia" },
          { label: isEdit ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEdit ? "Chỉnh sửa Đánh giá" : "Thêm Đánh giá"}
          </h2>
          <p className="text-muted mb-0">
            {isEdit
              ? "Cập nhật thông tin đánh giá"
              : "Tạo đánh giá mới cho Nữ Tu"}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Form onSubmit={formik.handleSubmit}>
        <Row className="g-4">
          {/* Basic Info */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Thông tin cơ bản
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Nữ Tu <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="sister_id"
                        value={formik.values.sister_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.sister_id && formik.errors.sister_id
                        }
                        disabled={Boolean(sisterId)}
                      >
                        <option value="">-- Chọn Nữ Tu --</option>
                        {sisters.map((sister) => (
                          <option key={sister.id} value={sister.id}>
                            {sister.religious_name || sister.full_name} (
                            {sister.code})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.sister_id}
                      </Form.Control.Feedback>
                    </Form.Group>
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
                    <Form.Group>
                      <Form.Label>
                        Ngày đánh giá <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="evaluation_date"
                        value={formik.values.evaluation_date}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.evaluation_date &&
                          formik.errors.evaluation_date
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.evaluation_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Người đánh giá <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="evaluator"
                        placeholder="Tên người đánh giá"
                        value={formik.values.evaluator}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                          formik.touched.evaluator && formik.errors.evaluator
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.evaluator}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Ratings */}
            <Card className="mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Điểm đánh giá (0-100)
                </h5>
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
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-comment-alt me-2"></i>
                  Nhận xét
                </h5>
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
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="sticky-top" style={{ top: "1rem" }}>
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-save me-2"></i>
                  Hành động
                </h5>
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
            <Card className="mt-3">
              <Card.Header className="bg-white">
                <h6 className="mb-0">
                  <i className="fas fa-lightbulb me-2 text-warning"></i>
                  Hướng dẫn
                </h6>
              </Card.Header>
              <Card.Body>
                <ul className="mb-0 ps-3">
                  <li className="mb-2">
                    Điểm đánh giá từ 0-100
                  </li>
                  <li className="mb-2">
                    Tổng điểm được tính tự động
                  </li>
                  <li className="mb-2">
                    90-100: Xuất sắc
                  </li>
                  <li className="mb-2">
                    75-89: Tốt
                  </li>
                  <li className="mb-2">
                    60-74: Khá
                  </li>
                  <li>
                    Dưới 60: Cần cải thiện
                  </li>
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
