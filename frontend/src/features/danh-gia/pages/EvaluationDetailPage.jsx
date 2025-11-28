// src/features/danh-gia/pages/EvaluationDetailPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Table,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { evaluationService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const EvaluationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    fetchEvaluationDetail();
  }, [id]);

  const fetchEvaluationDetail = async () => {
    try {
      setLoading(true);
      const response = await evaluationService.getById(id);
      if (response.success) {
        setEvaluation(response.data);
      }
    } catch (error) {
      console.error("Error fetching evaluation detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/danh-gia/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await evaluationService.delete(id);
        navigate("/danh-gia");
      } catch (error) {
        console.error("Error deleting evaluation:", error);
      }
    }
  };

  const handleViewSister = () => {
    navigate(`/nu-tu/${evaluation.sister_id}`);
  };

  const getRatingColor = (rating) => {
    if (rating >= 90) return "success";
    if (rating >= 75) return "info";
    if (rating >= 60) return "warning";
    return "danger";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 90) return "Xuất sắc";
    if (rating >= 75) return "Tốt";
    if (rating >= 60) return "Khá";
    return "Cần cải thiện";
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

  if (!evaluation) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Không tìm thấy thông tin đánh giá</h3>
          <Button variant="primary" onClick={() => navigate("/danh-gia")}>
            Quay lại danh sách
          </Button>
        </div>
      </Container>
    );
  }

  const categories = [
    {
      key: "spiritual_life",
      label: "Đời sống thiêng liêng",
      value: evaluation.spiritual_life,
    },
    {
      key: "community_life",
      label: "Đời sống cộng đoàn",
      value: evaluation.community_life,
    },
    {
      key: "apostolic_work",
      label: "Công tác tông đồ",
      value: evaluation.apostolic_work,
    },
    {
      key: "personal_development",
      label: "Phát triển cá nhân",
      value: evaluation.personal_development,
    },
  ];

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Đánh giá", link: "/danh-gia" },
          { label: "Chi tiết" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Chi tiết Đánh giá</h2>
          <p className="text-muted mb-0">Thông tin chi tiết về đánh giá</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleEdit}>
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>
            Xóa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/danh-gia")}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Basic Info */}
          <Card className="mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Thông tin đánh giá
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="info-item">
                    <small className="text-muted d-block mb-1">Loại đánh giá</small>
                    <div className="fw-semibold">{evaluation.type_label || "-"}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <small className="text-muted d-block mb-1">Kỳ đánh giá</small>
                    <div className="fw-semibold">{evaluation.period || "-"}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <small className="text-muted d-block mb-1">Ngày đánh giá</small>
                    <div className="fw-semibold">{formatDate(evaluation.evaluation_date) || "-"}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <small className="text-muted d-block mb-1">Người đánh giá</small>
                    <div className="fw-semibold">{evaluation.evaluator || "-"}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Overall Rating */}
          {evaluation.overall_rating && (
            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Tổng điểm
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="d-flex align-items-baseline justify-content-center mb-2">
                    <span className="display-4 fw-bold">{evaluation.overall_rating}</span>
                    <span className="text-muted ms-1">/100</span>
                  </div>
                  <Badge
                    bg={getRatingColor(evaluation.overall_rating)}
                    className="fs-6 px-3 py-2"
                  >
                    {getRatingLabel(evaluation.overall_rating)}
                  </Badge>
                  <ProgressBar
                    now={evaluation.overall_rating}
                    variant={getRatingColor(evaluation.overall_rating)}
                    className="mt-3"
                    style={{ height: "12px" }}
                  />
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Category Ratings */}
          <Card className="mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Điểm theo tiêu chí
              </h5>
            </Card.Header>
            <Card.Body>
              <Table responsive borderless>
                <tbody>
                  {categories.map(
                    (category) =>
                      category.value && (
                        <tr key={category.key}>
                          <td style={{ width: "40%" }}>{category.label}</td>
                          <td style={{ width: "45%" }}>
                            <ProgressBar
                              now={category.value}
                              variant={getRatingColor(category.value)}
                              style={{ height: "10px" }}
                            />
                          </td>
                          <td style={{ width: "15%" }} className="text-end">
                            <Badge bg={getRatingColor(category.value)}>
                              {category.value}
                            </Badge>
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Comments */}
          <Card>
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-comment-alt me-2"></i>
                Nhận xét
              </h5>
            </Card.Header>
            <Card.Body>
              {evaluation.strengths && (
                <div className="mb-3">
                  <h6>
                    <i className="fas fa-plus-circle text-success me-2"></i>
                    Điểm mạnh
                  </h6>
                  <p className="text-muted">{evaluation.strengths}</p>
                </div>
              )}

              {evaluation.weaknesses && (
                <div className="mb-3">
                  <h6>
                    <i className="fas fa-minus-circle text-warning me-2"></i>
                    Điểm yếu
                  </h6>
                  <p className="text-muted">{evaluation.weaknesses}</p>
                </div>
              )}

              {evaluation.recommendations && (
                <div className="mb-3">
                  <h6>
                    <i className="fas fa-lightbulb text-info me-2"></i>
                    Khuyến nghị
                  </h6>
                  <p className="text-muted">{evaluation.recommendations}</p>
                </div>
              )}

              {evaluation.notes && (
                <div>
                  <h6>
                    <i className="fas fa-sticky-note text-secondary me-2"></i>
                    Ghi chú
                  </h6>
                  <p className="text-muted">{evaluation.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Sister Info */}
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Thông tin Nữ Tu
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  {evaluation.sister_avatar ? (
                    <img
                      src={evaluation.sister_avatar}
                      alt={evaluation.sister_name}
                      className="rounded-circle"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  ) : (
                    <i className="fas fa-user fa-2x text-muted"></i>
                  )}
                </div>
                {evaluation.sister_religious_name && (
                  <h5 className="text-primary mb-1">
                    {evaluation.sister_religious_name}
                  </h5>
                )}
                <h6 className="mb-1">{evaluation.sister_name}</h6>
                <p className="text-muted mb-0">{evaluation.sister_code}</p>
              </div>

              <Button
                variant="primary"
                className="w-100"
                onClick={handleViewSister}
              >
                <i className="fas fa-user me-2"></i>
                Xem hồ sơ đầy đủ
              </Button>
            </Card.Body>
          </Card>

          {/* History */}
          <Card className="mt-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Lịch sử
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-plus-circle text-success me-2"></i>
                <div>
                  <div className="fw-semibold">Tạo mới</div>
                  <small className="text-muted">
                    {formatDate(evaluation.created_at)}
                  </small>
                </div>
              </div>
              {evaluation.updated_at &&
                evaluation.updated_at !== evaluation.created_at && (
                  <div className="d-flex align-items-center">
                    <i className="fas fa-edit text-primary me-2"></i>
                    <div>
                      <div className="fw-semibold">Cập nhật</div>
                      <small className="text-muted">
                        {formatDate(evaluation.updated_at)}
                      </small>
                    </div>
                  </div>
                )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EvaluationDetailPage;
