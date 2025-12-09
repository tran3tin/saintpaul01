// src/features/hanh-trinh/pages/VocationJourneyDetailPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { journeyService } from "@services";
import { formatDate, calculateDuration } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./VocationJourneyDetailPage.css";

const VocationJourneyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState(null);

  useEffect(() => {
    fetchJourneyDetail();
  }, [id]);

  const fetchJourneyDetail = async () => {
    try {
      setLoading(true);
      const response = await journeyService.getById(id);
      if (response.success) {
        setJourney(response.data);
      }
    } catch (error) {
      console.error("Error fetching journey detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/hanh-trinh/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành trình này?")) {
      try {
        await journeyService.delete(id);
        navigate("/hanh-trinh");
      } catch (error) {
        console.error("Error deleting journey:", error);
      }
    }
  };

  const handleViewSister = () => {
    navigate(`/nu-tu/${journey.sister_id}`);
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

  if (!journey) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Không tìm thấy thông tin hành trình</h3>
          <Button variant="primary" onClick={() => navigate("/hanh-trinh")}>
            Quay lại danh sách
          </Button>
        </div>
      </Container>
    );
  }

  const duration = calculateDuration(journey.start_date, journey.end_date);

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Chi tiết Hành trình"
        items={[
          { label: "Hành trình Ơn Gọi", link: "/hanh-trinh" },
          { label: "Chi tiết" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleEdit}>
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>
            Xóa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/hanh-trinh")}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column - Main Info */}
        <Col lg={8}>
          <Card className="health-info-card mb-4">
            <Card.Header>
              <i className="fas fa-info-circle"></i>
              <span>Thông tin giai đoạn</span>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {/* Stage Badge */}
                <Col xs={12}>
                  <div className="stage-badge-large">
                    <Badge
                      style={{
                        backgroundColor: journey.stage_color || "#6c757d",
                      }}
                      className="p-3 fs-6"
                    >
                      <i className="fas fa-route me-2"></i>
                      {journey.stage_name || journey.stage}
                    </Badge>
                  </div>
                </Col>

                {/* Timeline */}
                <Col md={6}>
                  <InfoItem
                    icon="fas fa-calendar-alt"
                    iconColor="primary"
                    label="Ngày bắt đầu"
                    value={formatDate(journey.start_date)}
                  />
                </Col>
                <Col md={6}>
                  <InfoItem
                    icon="fas fa-calendar-check"
                    iconColor="success"
                    label="Ngày kết thúc"
                    value={
                      journey.end_date
                        ? formatDate(journey.end_date)
                        : "Hiện tại"
                    }
                  />
                </Col>

                {/* Duration */}
                <Col md={6}>
                  <InfoItem
                    icon="fas fa-clock"
                    iconColor="info"
                    label="Thời gian"
                    value={duration}
                  />
                </Col>

                {/* Location */}
                <Col md={6}>
                  <InfoItem
                    icon="fas fa-map-marker-alt"
                    iconColor="danger"
                    label="Địa điểm"
                    value={journey.location}
                  />
                </Col>

                {/* Superior */}
                {journey.superior && (
                  <Col md={6}>
                    <InfoItem
                      icon="fas fa-user-tie"
                      iconColor="warning"
                      label="Bề trên"
                      value={journey.superior}
                    />
                  </Col>
                )}

                {/* Formation Director - Chị giáo */}
                {journey.formation_director && (
                  <Col md={6}>
                    <InfoItem
                      icon="fas fa-chalkboard-teacher"
                      iconColor="secondary"
                      label="Chị giáo"
                      value={journey.formation_director}
                    />
                  </Col>
                )}

                {/* Notes */}
                {journey.notes && (
                  <Col xs={12}>
                    <div className="notes-section">
                      <h6 className="mb-2">
                        <i className="fas fa-sticky-note text-warning me-2"></i>
                        Ghi chú
                      </h6>
                      <div className="notes-content">{journey.notes}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Documents */}
          {journey.documents && journey.documents.length > 0 && (
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-file-alt"></i>
                <span>Tài liệu đính kèm ({journey.documents.length})</span>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {journey.documents.map((doc, index) => (
                    <ListGroup.Item key={index} className="px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-file-pdf text-danger me-3 fs-4"></i>
                          <div>
                            <div className="fw-semibold">{doc.name}</div>
                            <small className="text-muted">
                              {doc.size && `${(doc.size / 1024).toFixed(2)} KB`}
                              {doc.uploaded_at &&
                                ` • ${formatDate(doc.uploaded_at)}`}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={doc.url}
                            target="_blank"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            href={doc.url}
                            download
                          >
                            <i className="fas fa-download"></i>
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
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
            <Card.Body>
              <div className="text-center mb-3">
                <div className="sister-avatar-medium mx-auto mb-3">
                  {journey.sister_avatar ? (
                    <img
                      src={journey.sister_avatar}
                      alt={journey.sister_name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                {journey.sister_religious_name && (
                  <h5 className="text-primary mb-1">
                    {journey.sister_religious_name}
                  </h5>
                )}
                <h6 className="mb-1">{journey.sister_name}</h6>
                <p className="text-muted mb-0">{journey.sister_code}</p>
              </div>

              <div className="sister-info-list">
                <div className="info-row">
                  <i className="fas fa-birthday-cake text-primary"></i>
                  <div>
                    <small className="text-muted">Ngày sinh</small>
                    <div>
                      {journey.sister_birth_date
                        ? formatDate(journey.sister_birth_date)
                        : "-"}
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-home text-success"></i>
                  <div>
                    <small className="text-muted">Cộng đoàn hiện tại</small>
                    <div>{journey.sister_community || "-"}</div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-phone text-info"></i>
                  <div>
                    <small className="text-muted">Điện thoại</small>
                    <div>{journey.sister_phone || "-"}</div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-envelope text-warning"></i>
                  <div>
                    <small className="text-muted">Email</small>
                    <div>{journey.sister_email || "-"}</div>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleViewSister}
              >
                <i className="fas fa-user me-2"></i>
                Xem hồ sơ đầy đủ
              </Button>
            </Card.Body>
          </Card>

          {/* Timeline History */}
          <Card className="health-info-card mt-4">
            <Card.Header className="system-header">
              <i className="fas fa-history"></i>
              <span>Lịch sử cập nhật</span>
            </Card.Header>
            <Card.Body>
              <div className="history-list">
                <div className="history-item">
                  <i className="fas fa-plus-circle text-success"></i>
                  <div>
                    <div className="fw-semibold">Tạo mới</div>
                    <small className="text-muted">
                      {formatDate(journey.created_at)}
                    </small>
                  </div>
                </div>
                {journey.updated_at &&
                  journey.updated_at !== journey.created_at && (
                    <div className="history-item">
                      <i className="fas fa-edit text-primary"></i>
                      <div>
                        <div className="fw-semibold">Cập nhật</div>
                        <small className="text-muted">
                          {formatDate(journey.updated_at)}
                        </small>
                      </div>
                    </div>
                  )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Helper Component
const InfoItem = ({ icon, iconColor, label, value }) => (
  <div className="info-item-box">
    <div className={`info-icon bg-${iconColor} bg-opacity-10`}>
      <i className={`${icon} text-${iconColor}`}></i>
    </div>
    <div className="info-content">
      <small className="text-muted d-block mb-1">{label}</small>
      <div className="fw-semibold">{value}</div>
    </div>
  </div>
);

export default VocationJourneyDetailPage;
