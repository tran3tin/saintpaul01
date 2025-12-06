// src/features/hanh-trinh/pages/TimelinePage.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { journeyService, sisterService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import SearchableSelect from "@components/forms/SearchableSelect";
import "./TimelinePage.css";

// Stage configurations
const stageConfig = {
  inquiry: {
    label: "Tìm hiểu",
    icon: "fas fa-search",
    className: "stage-inquiry",
  },
  postulant: {
    label: "Thỉnh sinh",
    icon: "fas fa-door-open",
    className: "stage-postulant",
  },
  aspirant: {
    label: "Tiền Tập Viện",
    icon: "fas fa-book-open",
    className: "stage-aspirant",
  },
  novice: {
    label: "Tập Viện",
    icon: "fas fa-graduation-cap",
    className: "stage-novice",
  },
  temporary_vows: {
    label: "Khấn Tạm",
    icon: "fas fa-praying-hands",
    className: "stage-temporary_vows",
  },
  perpetual_vows: {
    label: "Khấn Vĩnh Viễn",
    icon: "fas fa-infinity",
    className: "stage-perpetual_vows",
  },
  left: {
    label: "Đã rời",
    icon: "fas fa-sign-out-alt",
    className: "stage-left",
  },
};

const getStageConfig = (stage) => {
  return (
    stageConfig[stage] || {
      label: stage || "Chưa xác định",
      icon: "fas fa-circle",
      className: "stage-default",
    }
  );
};

const TimelinePage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sister, setSister] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [sisters, setSisters] = useState([]);
  const [selectedSisterId, setSelectedSisterId] = useState(sisterId || "");

  useEffect(() => {
    if (sisterId) {
      setSelectedSisterId(sisterId);
      fetchSisterData(sisterId);
    }
  }, [sisterId]);

  useEffect(() => {
    fetchSistersList();
  }, []);

  const formatSisterLabel = (sister) =>
    `${sister.saint_name ? `${sister.saint_name} ` : ""}${
      sister.birth_name || ""
    }${sister.code ? ` (${sister.code})` : ""}`;

  const sisterOptions = (sisters || []).map((s) => ({
    value: s.id,
    label: formatSisterLabel(s),
  }));

  const fetchSistersList = async () => {
    try {
      setLoading(true);
      const res = await sisterService.getList({ limit: 1000 });
      if (res && res.success) {
        setSisters(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching sisters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSisterData = async (id) => {
    try {
      setLoading(true);

      const sisterRes = await sisterService.getDetail(id);
      if (sisterRes && sisterRes.success) {
        setSister(sisterRes.data);
      } else if (sisterRes && !sisterRes.success) {
        setSister(sisterRes);
      }

      const journeyRes = await journeyService.getList({
        sister_id: id,
        limit: 100,
      });
      if (journeyRes && journeyRes.success) {
        const sortedJourneys = (journeyRes.data || []).sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        );
        setJourneys(sortedJourneys);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSister = (event) => {
    const id = event?.target?.value;
    setSelectedSisterId(id);
    if (id) {
      fetchSisterData(id);
    } else {
      setSister(null);
      setJourneys([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculateYearsInCongregation = () => {
    if (!journeys.length) return 0;
    const firstJourney = journeys[0];
    if (!firstJourney.start_date) return 0;
    const start = new Date(firstJourney.start_date);
    const today = new Date();
    return Math.floor((today - start) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const countVows = () => {
    return journeys.filter(
      (j) => j.stage === "temporary_vows" || j.stage === "perpetual_vows"
    ).length;
  };

  const getPhotoUrl = (sisterData) => {
    if (sisterData?.photo_url) {
      if (sisterData.photo_url.startsWith("/")) {
        return `http://localhost:5000${sisterData.photo_url}`;
      }
      return sisterData.photo_url;
    }
    return null;
  };

  const getCurrentStage = () => {
    if (!journeys.length) return null;
    const currentJourney = journeys.find((j) => !j.end_date);
    return currentJourney || journeys[journeys.length - 1];
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

  // Nếu không có sisterId, hiển thị giao diện chọn nữ tu
  if (!sisterId && !selectedSisterId) {
    return (
      <div className="timeline-page">
        <Container className="mt-4">
          <div className="select-sister-card">
            <h4 className="text-center mb-4">
              <i className="fas fa-user-circle me-2"></i>
              Chọn Nữ Tu để xem Hành Trình
            </h4>
            <div className="mb-3">
              <SearchableSelect
                name="sister_id"
                value={selectedSisterId}
                onChange={handleSelectSister}
                options={sisterOptions}
                placeholder="Nhập tên để tìm hoặc click để chọn..."
                maxDisplayItems={8}
              />
            </div>
            <div className="text-center mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/hanh-trinh")}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const currentStage = getCurrentStage();
  const currentStageConfig = currentStage
    ? getStageConfig(currentStage.stage)
    : null;

  return (
    <div className="timeline-page">
      <Container className="mt-4">
        {/* Sister Info Card */}
        {sister && (
          <div className="sister-info">
            <Row className="align-items-center">
              <Col md={3} className="text-center">
                <div className="sister-avatar">
                  {getPhotoUrl(sister) ? (
                    <img
                      src={getPhotoUrl(sister)}
                      alt={sister.birth_name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<i class="fas fa-user"></i>';
                      }}
                    />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
              </Col>
              <Col md={9}>
                <h2 className="mb-3">
                  {sister.saint_name && `Sr. ${sister.saint_name} `}
                  {sister.birth_name}
                </h2>
                <div className="mb-3">
                  {sister.date_of_birth && (
                    <span className="info-badge">
                      <i className="fas fa-calendar"></i>
                      Ngày sinh: {formatDate(sister.date_of_birth)}
                    </span>
                  )}
                  {calculateAge(sister.date_of_birth) && (
                    <span className="info-badge">
                      <i className="fas fa-birthday-cake"></i>
                      {calculateAge(sister.date_of_birth)} tuổi
                    </span>
                  )}
                  {sister.place_of_birth && (
                    <span className="info-badge">
                      <i className="fas fa-map-marker-alt"></i>
                      {sister.place_of_birth}
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  {sister.saint_name && (
                    <span className="info-badge">
                      <i className="fas fa-church"></i>
                      Tên dòng: {sister.saint_name}
                    </span>
                  )}
                  {sister.baptism_date && (
                    <span className="info-badge">
                      <i className="fas fa-cross"></i>
                      Rửa tội: {formatDate(sister.baptism_date)}
                    </span>
                  )}
                </div>
                <div>
                  {sister.current_community_name && (
                    <span className="info-badge">
                      <i className="fas fa-home"></i>
                      Cộng đoàn: {sister.current_community_name}
                    </span>
                  )}
                  {currentStageConfig && (
                    <span className="info-badge">
                      <i className="fas fa-star"></i>
                      Giai đoạn: {currentStageConfig.label}
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Stats Cards */}
        <Row className="mb-5">
          <Col md={3} className="mb-3">
            <div className="stats-card">
              <div
                className="stats-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stats-value">{journeys.length}</div>
              <div className="stats-label">Sự kiện quan trọng</div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card">
              <div
                className="stats-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
                }}
              >
                <i className="fas fa-hourglass-half"></i>
              </div>
              <div className="stats-value">
                {calculateYearsInCongregation()}
              </div>
              <div className="stats-label">Năm tu hành</div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card">
              <div
                className="stats-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                }}
              >
                <i className="fas fa-praying-hands"></i>
              </div>
              <div className="stats-value">{countVows()}</div>
              <div className="stats-label">Lần khấn</div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card">
              <div
                className="stats-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                }}
              >
                <i className="fas fa-heart"></i>
              </div>
              <div className="stats-value">100%</div>
              <div className="stats-label">Tận tâm phục vụ</div>
            </div>
          </Col>
        </Row>

        {/* Timeline */}
        {journeys.length > 0 ? (
          <div className="timeline">
            {journeys.map((journey, index) => {
              const config = getStageConfig(journey.stage);
              return (
                <div
                  key={journey.id}
                  className={`timeline-item ${config.className}`}
                >
                  <div className={`timeline-icon ${config.className}`}>
                    <i className={config.icon}></i>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">
                      <i className="fas fa-calendar"></i>
                      {formatDate(journey.start_date)}
                      {journey.end_date && ` - ${formatDate(journey.end_date)}`}
                    </div>
                    <h3 className="timeline-title">
                      {journey.stage_name || config.label}
                    </h3>
                    <span className={`timeline-stage ${config.className}`}>
                      {config.label}
                    </span>
                    {journey.notes && (
                      <p className="timeline-description">{journey.notes}</p>
                    )}
                    {journey.location && (
                      <div className="timeline-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {journey.location}
                      </div>
                    )}
                    {journey.supervisor && (
                      <div className="timeline-supervisor">
                        <i className="fas fa-user-tie"></i>
                        Người hướng dẫn: {journey.supervisor}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-timeline">
            <i className="fas fa-route"></i>
            <h4>Chưa có thông tin hành trình</h4>
            <p>Hành trình ơn gọi của nữ tu này chưa được ghi nhận.</p>
          </div>
        )}

        {/* Back button and Sister select */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button
            variant="secondary"
            onClick={() =>
              sisterId
                ? navigate(`/nu-tu/${sisterId}`)
                : navigate("/hanh-trinh")
            }
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>

          <div style={{ width: "350px" }}>
            <SearchableSelect
              name="sister_id"
              value={selectedSisterId}
              onChange={handleSelectSister}
              options={sisterOptions}
              placeholder="Chọn nữ tu khác..."
              maxDisplayItems={8}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TimelinePage;
