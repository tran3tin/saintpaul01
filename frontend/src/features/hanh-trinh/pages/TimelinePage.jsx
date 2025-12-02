// src/features/hanh-trinh/pages/TimelinePage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { journeyService, sisterService } from "@services";
import { formatDate, calculateDuration } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./TimelinePage.css";

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
    } else {
      fetchSistersList();
    }
  }, [sisterId]);

  // Fetch danh sách nữ tu khi không có sisterId
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

  // Fetch thông tin nữ tu và hành trình
  const fetchSisterData = async (id) => {
    try {
      setLoading(true);

      // Fetch sister info
      const sisterRes = await sisterService.getDetail(id);
      if (sisterRes && sisterRes.success) {
        setSister(sisterRes.data);
      } else if (sisterRes && !sisterRes.success) {
        setSister(sisterRes);
      }

      // Fetch journey timeline for this sister
      const journeyRes = await journeyService.getList({
        sister_id: id,
        limit: 100,
      });
      if (journeyRes && journeyRes.success) {
        // Sort by start_date ascending for timeline
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

  // Xử lý khi chọn nữ tu từ dropdown
  const handleSisterChange = (e) => {
    const id = e.target.value;
    setSelectedSisterId(id);
    if (id) {
      fetchSisterData(id);
    } else {
      setSister(null);
      setJourneys([]);
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

  // Nếu không có sisterId, hiển thị giao diện chọn nữ tu
  if (!sisterId && !selectedSisterId) {
    return (
      <Container fluid className="py-4">
        <Breadcrumb
          items={[
            { label: "Trang chủ", link: "/dashboard" },
            { label: "Hành trình Ơn Gọi", link: "/hanh-trinh" },
            { label: "Timeline" },
          ]}
        />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Timeline Hành trình Ơn gọi</h2>
            <p className="text-muted mb-0">
              Chọn nữ tu để xem timeline hành trình
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/hanh-trinh")}>
            Quay lại
          </Button>
        </div>

        <Card>
          <Card.Body>
            <Form.Group>
              <Form.Label className="fw-semibold">Chọn Nữ tu</Form.Label>
              <Form.Select
                size="lg"
                value={selectedSisterId}
                onChange={handleSisterChange}
              >
                <option value="">-- Chọn nữ tu --</option>
                {sisters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.saint_name ? `${s.saint_name} - ` : ""}
                    {s.birth_name} ({s.code})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={
          sisterId
            ? [
                { label: "Trang chủ", link: "/dashboard" },
                { label: "Quản lý Nữ tu", link: "/nu-tu" },
                {
                  label: sister?.birth_name || sister?.full_name,
                  link: `/nu-tu/${sisterId}`,
                },
                { label: "Hành trình ơn gọi" },
              ]
            : [
                { label: "Trang chủ", link: "/dashboard" },
                { label: "Hành trình Ơn Gọi", link: "/hanh-trinh" },
                { label: "Timeline" },
              ]
        }
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Hành trình Ơn gọi</h2>
          <p className="text-muted mb-0">
            {sister?.saint_name && (
              <span className="text-primary me-2">{sister.saint_name}</span>
            )}
            {sister?.birth_name || sister?.full_name}
          </p>
        </div>
        <div className="d-flex gap-2">
          {!sisterId && (
            <Form.Select
              style={{ width: "300px" }}
              value={selectedSisterId}
              onChange={handleSisterChange}
            >
              <option value="">-- Chọn nữ tu khác --</option>
              {sisters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.saint_name ? `${s.saint_name} - ` : ""}
                  {s.birth_name} ({s.code})
                </option>
              ))}
            </Form.Select>
          )}
          <Button
            variant="secondary"
            onClick={() =>
              sisterId
                ? navigate(`/nu-tu/${sisterId}`)
                : navigate("/hanh-trinh")
            }
          >
            Quay lại
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Các giai đoạn</h5>
            </Card.Header>
            <Card.Body>
              {journeys.length > 0 ? (
                <div className="timeline">
                  {journeys.map((journey, index) => (
                    <div key={journey.id} className="timeline-item">
                      <div className="timeline-marker">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: journey.stage_color || "#6c757d",
                            color: "#fff",
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="timeline-content">
                        <Card className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {journey.stage_name || journey.stage}
                                </h6>
                                <small className="text-muted">
                                  {formatDate(journey.start_date)}
                                  {journey.end_date &&
                                    ` - ${formatDate(journey.end_date)}`}
                                </small>
                              </div>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    journey.stage_color || "#6c757d",
                                  color: "#fff",
                                }}
                              >
                                {journey.end_date
                                  ? "Hoàn thành"
                                  : "Đang thực hiện"}
                              </span>
                            </div>
                            {journey.notes && (
                              <p className="text-muted mt-2 mb-0 small">
                                {journey.notes}
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Chưa có thông tin hành trình</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Thông tin hiện tại</h5>
            </Card.Header>
            <Card.Body>
              {sister && (
                <>
                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Giai đoạn hiện tại
                    </small>
                    {journeys.length > 0 && journeys[journeys.length - 1] ? (
                      <span
                        className="badge mt-1"
                        style={{
                          backgroundColor:
                            journeys[journeys.length - 1].stage_color ||
                            "#6c757d",
                          color: "#fff",
                        }}
                      >
                        {journeys[journeys.length - 1].stage_name ||
                          journeys[journeys.length - 1].stage}
                      </span>
                    ) : (
                      <span className="badge bg-secondary mt-1">
                        Chưa xác định
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Mã số</small>
                    <div className="fw-semibold">
                      {sister.code || sister.sister_code}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Ngày sinh</small>
                    <div className="fw-semibold">
                      {formatDate(sister.date_of_birth || sister.birth_date)}
                    </div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Ngày gia nhập</small>
                    <div className="fw-semibold">
                      {formatDate(sister.join_date)}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TimelinePage;
