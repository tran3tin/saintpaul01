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
import "./EvaluationDetailPage.css";

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

  const evaluationType = evaluation.evaluation_type || "";
  const typeLabels = {
    annual: "Đánh giá năm",
    semi_annual: "Đánh giá 6 tháng",
    quarterly: "Đánh giá quý",
    monthly: "Đánh giá tháng",
    special: "Đánh giá đặc biệt",
  };

  return (
    <div className="evaluation-detail-page">
      <Container fluid className="py-4">
        <Breadcrumb
          title="Chi tiết Đánh giá"
          items={[
            { label: "Đánh giá", link: "/danh-gia" },
            { label: evaluation.sister_name || "Chi tiết" },
          ]}
        />

        <div className="evaluation-action-buttons">
          <Button className="btn-back" onClick={() => navigate("/danh-gia")}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <div className="action-group">
            <Button className="btn-edit" onClick={handleEdit}>
              <i className="fas fa-edit me-2"></i>
              Chỉnh sửa
            </Button>
            <Button className="btn-delete" onClick={handleDelete}>
              <i className="fas fa-trash me-2"></i>
              Xóa
            </Button>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            {/* Basic Info */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-clipboard-check"></i>
                <span>{typeLabels[evaluationType] || "Đánh giá"}</span>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="evaluation-detail-item">
                      <div className="label">Kỳ đánh giá</div>
                      <div className="value">{evaluation.period || "-"}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="evaluation-detail-item">
                      <div className="label">Ngày đánh giá</div>
                      <div className="value">
                        {formatDate(evaluation.evaluation_date) || "-"}
                      </div>
                    </div>
                  </Col>
                  <Col md={12}>
                    <div className="evaluation-detail-item">
                      <div className="label">Người đánh giá</div>
                      <div className="value">
                        {evaluation.evaluator_name ||
                          evaluation.evaluator ||
                          "-"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Overall Rating */}
            {evaluation.overall_rating && (
              <Card className="health-info-card">
                <Card.Header>
                  <i className="fas fa-star"></i>
                  <span>Tổng điểm</span>
                </Card.Header>
                <Card.Body>
                  <div className="evaluation-rating-display">
                    <div className="evaluation-rating-number">
                      {evaluation.overall_rating}
                    </div>
                    <div className="evaluation-rating-label">
                      {getRatingLabel(evaluation.overall_rating)}
                    </div>
                    <ProgressBar
                      now={evaluation.overall_rating}
                      variant={getRatingColor(evaluation.overall_rating)}
                      className="evaluation-progress-bar"
                    />
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Category Ratings */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-chart-bar"></i>
                <span>Điểm theo tiêu chí</span>
              </Card.Header>
              <Card.Body>
                {categories.map(
                  (category) =>
                    category.value && (
                      <div
                        key={category.key}
                        className="evaluation-category-item"
                      >
                        <div className="evaluation-category-label">
                          {category.label}
                        </div>
                        <div className="evaluation-category-bar">
                          <ProgressBar
                            now={category.value}
                            variant={getRatingColor(category.value)}
                            className="evaluation-progress-bar"
                          />
                        </div>
                        <div className="evaluation-category-score">
                          {category.value}
                        </div>
                      </div>
                    )
                )}
              </Card.Body>
            </Card>

            {/* Comments */}
            <Card className="health-info-card">
              <Card.Header className="diagnosis-header">
                <i className="fas fa-comment-alt"></i>
                <span>Nhận xét</span>
              </Card.Header>
              <Card.Body>
                {evaluation.strengths && (
                  <div className="evaluation-comment-section">
                    <div className="evaluation-comment-title">
                      <i className="fas fa-plus-circle text-success"></i>
                      Điểm mạnh
                    </div>
                    <div className="evaluation-comment-content">
                      {evaluation.strengths}
                    </div>
                  </div>
                )}

                {evaluation.weaknesses && (
                  <div className="evaluation-comment-section">
                    <div className="evaluation-comment-title">
                      <i className="fas fa-minus-circle text-warning"></i>
                      Điểm yếu
                    </div>
                    <div className="evaluation-comment-content">
                      {evaluation.weaknesses}
                    </div>
                  </div>
                )}

                {evaluation.recommendations && (
                  <div className="evaluation-comment-section">
                    <div className="evaluation-comment-title">
                      <i className="fas fa-lightbulb text-info"></i>
                      Khuyến nghị
                    </div>
                    <div className="evaluation-comment-content">
                      {evaluation.recommendations}
                    </div>
                  </div>
                )}

                {evaluation.notes && (
                  <div className="evaluation-comment-section">
                    <div className="evaluation-comment-title">
                      <i className="fas fa-sticky-note text-secondary"></i>
                      Ghi chú
                    </div>
                    <div className="evaluation-comment-content">
                      {evaluation.notes}
                    </div>
                  </div>
                )}

                {!evaluation.strengths &&
                  !evaluation.weaknesses &&
                  !evaluation.recommendations &&
                  !evaluation.notes && (
                    <p className="text-muted mb-0">Không có nhận xét</p>
                  )}
              </Card.Body>
            </Card>

            {/* Documents */}
            {evaluation.documents && (
              <Card className="health-info-card">
                <Card.Header className="documents-header">
                  <i className="fas fa-paperclip"></i>
                  <span>Tài liệu đính kèm</span>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    try {
                      const docs =
                        typeof evaluation.documents === "string"
                          ? JSON.parse(evaluation.documents)
                          : evaluation.documents;

                      if (!Array.isArray(docs) || docs.length === 0) {
                        return (
                          <div className="text-muted">Không có tài liệu</div>
                        );
                      }

                      return (
                        <div className="evaluation-documents">
                          {docs.map((doc, index) => (
                            <a
                              key={doc.id || index}
                              href={`http://localhost:5000${doc.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i
                                className={`fas ${
                                  doc.type?.includes("pdf")
                                    ? "fa-file-pdf text-danger"
                                    : doc.type?.includes("word")
                                    ? "fa-file-word text-primary"
                                    : doc.type?.includes("image")
                                    ? "fa-file-image text-success"
                                    : "fa-file text-secondary"
                                }`}
                              ></i>
                              <span>{doc.name}</span>
                            </a>
                          ))}
                        </div>
                      );
                    } catch (error) {
                      console.error("Error parsing documents:", error);
                      return (
                        <div className="text-danger">Lỗi khi tải tài liệu</div>
                      );
                    }
                  })()}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Right Column - Sister Info */}
          <Col lg={4}>
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-user"></i>
                <span>Thông tin Nữ Tu</span>
              </Card.Header>
              <Card.Body className="evaluation-sister-card">
                <div className="evaluation-sister-avatar">
                  {evaluation.sister_avatar ? (
                    <img
                      src={evaluation.sister_avatar}
                      alt={evaluation.sister_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="evaluation-sister-name">
                  {evaluation.sister_name || "N/A"}
                </div>
                <div className="evaluation-sister-code">
                  {evaluation.sister_code || "N/A"}
                </div>

                <Button
                  className="evaluation-view-profile-btn"
                  onClick={handleViewSister}
                >
                  <i className="fas fa-user me-2"></i>
                  Xem hồ sơ đầy đủ
                </Button>
              </Card.Body>
            </Card>

            {/* History */}
            <Card className="health-info-card">
              <Card.Header className="system-header">
                <i className="fas fa-history"></i>
                <span>Lịch sử</span>
              </Card.Header>
              <Card.Body>
                <div className="evaluation-history-item">
                  <div className="evaluation-history-icon created">
                    <i className="fas fa-plus-circle"></i>
                  </div>
                  <div className="evaluation-history-content">
                    <div className="evaluation-history-label">Tạo mới</div>
                    <div className="evaluation-history-date">
                      {formatDate(evaluation.created_at)}
                    </div>
                  </div>
                </div>
                {evaluation.updated_at &&
                  evaluation.updated_at !== evaluation.created_at && (
                    <div className="evaluation-history-item">
                      <div className="evaluation-history-icon updated">
                        <i className="fas fa-edit"></i>
                      </div>
                      <div className="evaluation-history-content">
                        <div className="evaluation-history-label">Cập nhật</div>
                        <div className="evaluation-history-date">
                          {formatDate(evaluation.updated_at)}
                        </div>
                      </div>
                    </div>
                  )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EvaluationDetailPage;
