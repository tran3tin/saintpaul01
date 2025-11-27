// src/features/hanh-trinh/pages/TimelinePage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { missionService, sisterService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const TimelinePage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sister, setSister] = useState(null);
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    fetchData();
  }, [sisterId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch sister info
      const sisterRes = await sisterService.getDetail(sisterId);
      if (sisterRes) {
        setSister(sisterRes);
      }

      // Fetch journey timeline
      const journeyRes = await missionService.journey.getTimeline(sisterId);
      if (journeyRes) {
        setJourneys(journeyRes);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage) => {
    const stages = {
      inquiry: "Tim hieu",
      postulant: "Thỉnh sinh",
      novice_1: "Tan tap I",
      novice_2: "Tan tap II",
      temporary_vows: "Khan tam",
      perpetual_vows: "Khan tron",
    };
    return stages[stage] || stage;
  };

  const getStageBadgeColor = (stage) => {
    const colors = {
      inquiry: "secondary",
      postulant: "info",
      novice_1: "primary",
      novice_2: "primary",
      temporary_vows: "warning",
      perpetual_vows: "success",
    };
    return colors[stage] || "secondary";
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

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chu", link: "/dashboard" },
          { label: "Quan ly Nu Tu", link: "/nu-tu" },
          { label: sister?.full_name, link: `/nu-tu/${sisterId}` },
          { label: "Hanh trinh on goi" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Hanh trinh On goi</h2>
          <p className="text-muted mb-0">
            {sister?.religious_name && (
              <span className="text-primary me-2">{sister.religious_name}</span>
            )}
            {sister?.full_name}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/nu-tu/${sisterId}`)}>
          Quay lai
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Cac giai doan</h5>
            </Card.Header>
            <Card.Body>
              {journeys.length > 0 ? (
                <div className="timeline">
                  {journeys.map((journey, index) => (
                    <div key={journey.id} className="timeline-item">
                      <div className="timeline-marker">
                        <Badge bg={getStageBadgeColor(journey.stage)}>
                          {index + 1}
                        </Badge>
                      </div>
                      <div className="timeline-content">
                        <Card className="mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {getStageLabel(journey.stage)}
                                </h6>
                                <small className="text-muted">
                                  {formatDate(journey.start_date)}
                                  {journey.end_date && ` - ${formatDate(journey.end_date)}`}
                                </small>
                              </div>
                              <Badge bg={getStageBadgeColor(journey.stage)}>
                                {journey.status === "completed"
                                  ? "Hoan thanh"
                                  : "Dang thuc hien"}
                              </Badge>
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
                  <p className="text-muted">Chua co thong tin hanh trinh</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Thong tin hien tai</h5>
            </Card.Header>
            <Card.Body>
              {sister && (
                <>
                  <div className="mb-3">
                    <small className="text-muted d-block">Giai doan hien tai</small>
                    <Badge bg={getStageBadgeColor(sister.current_stage)} className="mt-1">
                      {getStageLabel(sister.current_stage)}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Ma so</small>
                    <div className="fw-semibold">{sister.sister_code}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Ngay sinh</small>
                    <div className="fw-semibold">{formatDate(sister.birth_date)}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Ngay gia nhap</small>
                    <div className="fw-semibold">{formatDate(sister.join_date)}</div>
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
