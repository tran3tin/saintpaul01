// src/components/common/Timeline/Timeline.jsx
// Reusable Timeline Component with Akkhor Sidebar Theme

import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { sisterService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
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
}) => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sister, setSister] = useState(null);
  const [items, setItems] = useState([]);
  const [sisters, setSisters] = useState([]);
  const [selectedSisterId, setSelectedSisterId] = useState(sisterId || "");

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSisters, setFilteredSisters] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (sisterId) {
      setSelectedSisterId(sisterId);
      fetchSisterData(sisterId);
    } else {
      fetchSistersList();
    }
  }, [sisterId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter sisters when search term changes
  useEffect(() => {
    if (isSearching && searchTerm.trim()) {
      const filtered = sisters.filter((s) => {
        const fullName = `${s.saint_name || ""} ${s.birth_name} ${
          s.code
        }`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredSisters(filtered);
    } else {
      setFilteredSisters(sisters);
    }
  }, [searchTerm, sisters, isSearching]);

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

  const handleSelectSister = (s) => {
    setSelectedSisterId(s.id);
    setSearchTerm(
      `${s.saint_name ? s.saint_name + " - " : ""}${s.birth_name} (${s.code})`
    );
    setShowDropdown(false);
    setIsSearching(false);
    fetchSisterData(s.id);
  };

  const handleSearchFocus = () => {
    if (sisters.length > 0) {
      setFilteredSisters(sisters);
      setShowDropdown(true);
      setIsSearching(true);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
    setShowDropdown(true);
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
            <Form.Group ref={searchRef} className="position-relative">
              <Form.Control
                type="text"
                size="lg"
                placeholder="Nhập tên để tìm hoặc click để chọn..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="searchable-select"
              />
              <i className="fas fa-chevron-down dropdown-arrow"></i>
              {showDropdown && (
                <div className="select-dropdown">
                  {filteredSisters.length > 0 ? (
                    filteredSisters.map((s) => (
                      <div
                        key={s.id}
                        className="select-dropdown-item"
                        onClick={() => handleSelectSister(s)}
                      >
                        <i className="fas fa-user me-2"></i>
                        {s.saint_name ? `${s.saint_name} - ` : ""}
                        {s.birth_name}
                        <span className="text-muted ms-2">({s.code})</span>
                      </div>
                    ))
                  ) : (
                    <div className="select-dropdown-item text-muted">
                      <i className="fas fa-search me-2"></i>
                      Không tìm thấy nữ tu nào
                    </div>
                  )}
                </div>
              )}
            </Form.Group>
            <div className="text-center mt-4">
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
                  className={`timeline-item ${config.className}`}
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

          {!sisterId && (
            <div
              ref={searchRef}
              className="position-relative"
              style={{ width: "350px" }}
            >
              <Form.Control
                type="text"
                placeholder="Chọn nữ tu khác..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="searchable-select-sm"
              />
              <i className="fas fa-chevron-down dropdown-arrow-sm"></i>
              {showDropdown && filteredSisters.length > 0 && (
                <div className="select-dropdown select-dropdown-up">
                  {filteredSisters.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="select-dropdown-item"
                      onClick={() => handleSelectSister(s)}
                    >
                      <i className="fas fa-user me-2"></i>
                      {s.saint_name ? `${s.saint_name} - ` : ""}
                      {s.birth_name}
                      <span className="text-muted ms-2">({s.code})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Timeline;
