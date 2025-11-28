// src/features/su-vu/pages/MissionDetailPage.jsx

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
import { missionService } from "@services";
import { formatDate, calculateDuration } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./MissionDetailPage.css";

const MissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState(null);

  useEffect(() => {
    fetchMissionDetail();
  }, [id]);

  const fetchMissionDetail = async () => {
    try {
      setLoading(true);
      const response = await missionService.getById(id);
      if (response.success) {
        setMission(response.data);
      }
    } catch (error) {
      console.error("Error fetching mission detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/su-vu/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sứ vụ này?")) {
      try {
        await missionService.delete(id);
        navigate("/su-vu");
      } catch (error) {
        console.error("Error deleting mission:", error);
      }
    }
  };

  const handleViewSister = () => {
    navigate(`/nu-tu/${mission.sister_id}`);
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

  if (!mission) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Không tìm thấy thông tin sứ vụ</h3>
          <Button variant="primary" onClick={() => navigate("/su-vu")}>
            Quay lại danh sách
          </Button>
        </div>
      </Container>
    );
  }

  const isActive = !mission.end_date;
  const duration = calculateDuration(mission.start_date, mission.end_date);

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Sứ vụ", link: "/su-vu" },
          { label: "Chi tiết" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Chi tiết Sứ vụ</h2>
          <p className="text-muted mb-0">Thông tin chi tiết về sứ vụ</p>
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
          <Button variant="secondary" onClick={() => navigate("/su-vu")}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column - Mission Info */}
        <Col lg={8}>
          <Card className="mission-detail-card mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Thông tin sứ vụ
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {/* Status Badge */}
                <Col xs={12}>
                  <div className="status-badge-large">
                    <Badge
                      bg={isActive ? "success" : "secondary"}
                      className="p-3"
                    >
                      <i
                        className={`fas fa-${
                          isActive ? "play" : "check"
                        }-circle me-2`}
                      ></i>
                      {isActive ? "Đang làm việc" : "Đã kết thúc"}
                    </Badge>
                    {mission.type && (
                      <Badge bg="info" className="p-3 ms-2">
                        <i className="fas fa-tag me-2"></i>
                        {getMissionTypeLabel(mission.type)}
                      </Badge>
                    )}
                  </div>
                </Col>

                {/* Position & Organization */}
                <Col md={12}>
                  <InfoItem
                    icon="fas fa-briefcase"
                    iconColor="primary"
                    label="Chức vụ / Vai trò"
                    value={mission.position}
                  />
                </Col>

                <Col md={12}>
                  <InfoItem
                    icon="fas fa-building"
                    iconColor="success"
                    label="Tổ chức / Cơ quan"
                    value={mission.organization}
                  />
                </Col>

                {/* Location */}
                {mission.location && (
                  <Col md={12}>
                    <InfoItem
                      icon="fas fa-map-marker-alt"
                      iconColor="danger"
                      label="Địa điểm"
                      value={mission.location}
                    />
                  </Col>
                )}

                {/* Timeline */}
                <Col md={6}>
                  <InfoItem
                    icon="fas fa-calendar-alt"
                    iconColor="info"
                    label="Ngày bắt đầu"
                    value={formatDate(mission.start_date)}
                  />
                </Col>

                <Col md={6}>
                  <InfoItem
                    icon="fas fa-calendar-check"
                    iconColor="warning"
                    label="Ngày kết thúc"
                    value={
                      mission.end_date
                        ? formatDate(mission.end_date)
                        : "Hiện tại"
                    }
                  />
                </Col>

                {/* Duration */}
                <Col md={12}>
                  <InfoItem
                    icon="fas fa-clock"
                    iconColor="secondary"
                    label="Thời gian"
                    value={duration}
                  />
                </Col>

                {/* Description */}
                {mission.description && (
                  <Col xs={12}>
                    <div className="description-section">
                      <h6 className="mb-2">
                        <i className="fas fa-align-left text-primary me-2"></i>
                        Mô tả công việc
                      </h6>
                      <div className="description-content">
                        {mission.description}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

          {/* Achievements */}
          {mission.achievements && mission.achievements.length > 0 && (
            <Card className="mission-detail-card mb-4">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  Thành tích
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {mission.achievements.map((achievement, index) => (
                    <ListGroup.Item key={index} className="px-0">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-medal text-warning me-3 mt-1"></i>
                        <div>
                          <div className="fw-semibold">{achievement.title}</div>
                          {achievement.description && (
                            <small className="text-muted">
                              {achievement.description}
                            </small>
                          )}
                          {achievement.date && (
                            <div>
                              <small className="text-muted">
                                <i className="fas fa-calendar me-1"></i>
                                {formatDate(achievement.date)}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* Documents */}
          {mission.documents && mission.documents.length > 0 && (
            <Card className="mission-detail-card">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>
                  Tài liệu đính kèm ({mission.documents.length})
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {mission.documents.map((doc, index) => (
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
          <Card className="mission-detail-card">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Thông tin Nữ Tu
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="sister-avatar-medium mx-auto mb-3">
                  {mission.sister_avatar ? (
                    <img
                      src={mission.sister_avatar}
                      alt={mission.sister_name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                {mission.sister_religious_name && (
                  <h5 className="text-primary mb-1">
                    {mission.sister_religious_name}
                  </h5>
                )}
                <h6 className="mb-1">{mission.sister_name}</h6>
                <p className="text-muted mb-0">{mission.sister_code}</p>
              </div>

              <div className="sister-info-list">
                <div className="info-row">
                  <i className="fas fa-birthday-cake text-primary"></i>
                  <div>
                    <small className="text-muted">Ngày sinh</small>
                    <div>{formatDate(mission.sister_birth_date)}</div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-home text-success"></i>
                  <div>
                    <small className="text-muted">Cộng đoàn</small>
                    <div>{mission.sister_community || "-"}</div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-phone text-info"></i>
                  <div>
                    <small className="text-muted">Điện thoại</small>
                    <div>{mission.sister_phone || "-"}</div>
                  </div>
                </div>

                <div className="info-row">
                  <i className="fas fa-envelope text-warning"></i>
                  <div>
                    <small className="text-muted">Email</small>
                    <div>{mission.sister_email || "-"}</div>
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

          {/* Statistics */}
          <Card className="mission-detail-card mt-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Thống kê
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="stat-list">
                <div className="stat-item">
                  <div className="stat-icon bg-primary bg-opacity-10">
                    <i className="fas fa-calendar text-primary"></i>
                  </div>
                  <div>
                    <small className="text-muted">Thời gian</small>
                    <div className="fw-semibold">{duration}</div>
                  </div>
                </div>

                {mission.achievements && (
                  <div className="stat-item">
                    <div className="stat-icon bg-warning bg-opacity-10">
                      <i className="fas fa-trophy text-warning"></i>
                    </div>
                    <div>
                      <small className="text-muted">Thành tích</small>
                      <div className="fw-semibold">
                        {mission.achievements.length}
                      </div>
                    </div>
                  </div>
                )}

                {mission.documents && (
                  <div className="stat-item">
                    <div className="stat-icon bg-info bg-opacity-10">
                      <i className="fas fa-file text-info"></i>
                    </div>
                    <div>
                      <small className="text-muted">Tài liệu</small>
                      <div className="fw-semibold">
                        {mission.documents.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* History */}
          <Card className="mission-detail-card mt-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Lịch sử cập nhật
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="history-list">
                <div className="history-item">
                  <i className="fas fa-plus-circle text-success"></i>
                  <div>
                    <div className="fw-semibold">Tạo mới</div>
                    <small className="text-muted">
                      {formatDate(mission.created_at)}
                    </small>
                  </div>
                </div>
                {mission.updated_at &&
                  mission.updated_at !== mission.created_at && (
                    <div className="history-item">
                      <i className="fas fa-edit text-primary"></i>
                      <div>
                        <div className="fw-semibold">Cập nhật</div>
                        <small className="text-muted">
                          {formatDate(mission.updated_at)}
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

// Helper Function
const getMissionTypeLabel = (type) => {
  const types = {
    teaching: "Giảng dạy",
    healthcare: "Y tế",
    social: "Xã hội",
    pastoral: "Mục vụ",
    administration: "Hành chính",
    other: "Khác",
  };
  return types[type] || type;
};

export default MissionDetailPage;
