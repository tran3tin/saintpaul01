// src/components/common/Timeline/Timeline.jsx
// Reusable Timeline Component with Akkhor Sidebar Theme

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { sisterService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import SearchableSelect from "@components/forms/SearchableSelect";
import "./Timeline.css";

const Timeline = ({
  title = "Timeline",
  subtitle = "",
  icon = "fas fa-route",
  backUrl = "/",
  fetchDataBySister,
  getItemConfig,
  renderItemContent,
  emptyMessage = "Chưa có dữ liệu",
  emptyDescription = "Không tìm thấy thông tin nào.",
  statsConfig = [],
  calculateStats = null,
  onItemClick = null,
}) => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sister, setSister] = useState(null);
  const [items, setItems] = useState([]);
  const [sisters, setSisters] = useState([]);
  const [selectedSisterId, setSelectedSisterId] = useState(sisterId || "");

  useEffect(() => {
    if (sisterId) {
      setSelectedSisterId(sisterId);
      fetchSisterData(sisterId);
    }
  }, [sisterId]);

  // Always load sisters list for switching dropdown
  useEffect(() => {
    fetchSistersList();
  }, []);

  const formatSisterLabel = (s) =>
    `${s.saint_name ? `${s.saint_name} ` : ""}${s.birth_name || ""}${
      s.code ? ` (${s.code})` : ""
    }`;

  const sisterOptions = (sisters || []).map((s) => ({
    value: s.id,
    label: formatSisterLabel(s),
  }));

  const fetchSistersList = async () => {
    try {
      setLoading(true);
      const res = await sisterService.getList({ limit: 1000 });
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setSisters(list);
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

      // Fetch items using provided function
      if (fetchDataBySister) {
        const data = await fetchDataBySister(id);
        setItems(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSister = (e) => {
    const id = e?.target?.value;
    setSelectedSisterId(id);
    if (id) {
      fetchSisterData(id);
    } else {
      setSister(null);
      setItems([]);
    }
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

  const getPhotoUrl = (sisterData) => {
    if (sisterData?.photo_url) {
      if (sisterData.photo_url.startsWith("/")) {
        return `http://localhost:5000${sisterData.photo_url}`;
      }
      return sisterData.photo_url;
    }
    return null;
  };

  // Calculate stats if function provided
  const stats = calculateStats ? calculateStats(items, sister) : [];

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
              <i className={`${icon} me-2`}></i>
              {title}
            </h4>
            <p className="text-center text-muted mb-4">{subtitle}</p>
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
            <div className="text-center mt-2">
              <Button variant="secondary" onClick={() => navigate(backUrl)}>
                <i className="fas fa-arrow-left me-2"></i>
                Quay lại
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

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
                <div>
                  {sister.current_community_name && (
                    <span className="info-badge">
                      <i className="fas fa-home"></i>
                      Cộng đoàn: {sister.current_community_name}
                    </span>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Stats Cards */}
        {stats.length > 0 && (
          <Row className="mb-5">
            {stats.map((stat, index) => (
              <Col md={3} className="mb-3" key={index}>
                <div className="stats-card">
                  <div
                    className="stats-icon"
                    style={{ background: stat.gradient }}
                  >
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stats-value">{stat.value}</div>
                  <div className="stats-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Timeline */}
        {items.length > 0 ? (
          <div className="timeline">
            {items.map((item, index) => {
              const config = getItemConfig
                ? getItemConfig(item)
                : {
                    icon: "fas fa-circle",
                    className: "stage-default",
                    label: "Mặc định",
                  };
              return (
                <div
                  key={item.id || index}
                  className={`timeline-item ${config.className}${
                    onItemClick ? " clickable" : ""
                  }`}
                  onClick={() => onItemClick && onItemClick(item)}
                  style={onItemClick ? { cursor: "pointer" } : {}}
                >
                  <div className={`timeline-icon ${config.className}`}>
                    <i className={config.icon}></i>
                  </div>
                  <div className="timeline-content">
                    {renderItemContent ? (
                      renderItemContent(item, config)
                    ) : (
                      <>
                        <div className="timeline-date">
                          <i className="fas fa-calendar"></i>
                          {formatDate(item.created_at)}
                        </div>
                        <h3 className="timeline-title">
                          {item.title || "Không có tiêu đề"}
                        </h3>
                        <span className={`timeline-stage ${config.className}`}>
                          {config.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-timeline">
            <i className={icon}></i>
            <h4>{emptyMessage}</h4>
            <p>{emptyDescription}</p>
          </div>
        )}

        {/* Back button and Sister select */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
          <Button
            variant="secondary"
            onClick={() =>
              sisterId ? navigate(`/nu-tu/${sisterId}`) : navigate(backUrl)
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

export default Timeline;
