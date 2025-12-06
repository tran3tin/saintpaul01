import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { departureService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";

const labelMap = {
  temporary: "Tạm thời",
  medical: "Khám chữa bệnh",
  study: "Học tập",
  mission: "Sứ vụ",
};

const stageLabelMap = {
  aspirant: "Ứng sinh",
  postulant: "Tiền tập",
  novice: "Tập sinh",
  temporary_vows: "Khấn tạm",
  perpetual_vows: "Khấn trọn",
};

const DepartureDetailPage = () => {
  const { id, sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await departureService.getById(id);
        if (res.success) {
          setDeparture(res.data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleBack = () => {
    navigate(sisterId ? `/nu-tu/${sisterId}/di-vang` : "/di-vang");
  };

  const handleEdit = () => {
    navigate(`/di-vang/${id}/edit`);
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

  if (!departure) {
    return (
      <Container fluid className="py-4">
        <Breadcrumb
          title="Chi tiết Đi vắng"
          items={[
            { label: "Đi vắng", link: "/di-vang" },
            { label: "Chi tiết" },
          ]}
        />
        <Card>
          <Card.Body>Không tìm thấy phiếu đi vắng.</Card.Body>
        </Card>
      </Container>
    );
  }

  const fullName = [departure.saint_name, departure.birth_name]
    .filter(Boolean)
    .join(" ");

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        title="Chi tiết Phiếu Đi vắng"
        items={[
          { label: "Đi vắng", link: "/di-vang" },
          { label: fullName || "Chi tiết" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="secondary" onClick={handleBack}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
        <Button variant="primary" onClick={handleEdit}>
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <i className="fas fa-plane-departure me-2 text-primary"></i>
                  {labelMap[departure.type] || departure.type}
                </h5>
                {fullName && <small className="text-muted">{fullName}</small>}
              </div>
              <div className="d-flex gap-2">
                <Badge bg="info">{departure.sister_code || "--"}</Badge>
                {departure.stage_at_departure && (
                  <Badge bg="secondary">
                    {stageLabelMap[departure.stage_at_departure] ||
                      departure.stage_at_departure}
                  </Badge>
                )}
                <Badge bg={departure.return_date ? "success" : "warning"}>
                  {departure.return_date ? "Đã trở về" : "Đang đi vắng"}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="text-muted">Ngày đi</div>
                  <div className="fw-semibold">
                    {formatDate(departure.departure_date)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted">Dự kiến về</div>
                  <div className="fw-semibold">
                    {departure.expected_return_date
                      ? formatDate(departure.expected_return_date)
                      : "--"}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted">Ngày về</div>
                  <div className="fw-semibold">
                    {departure.return_date
                      ? formatDate(departure.return_date)
                      : "Chưa về"}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted">Địa điểm</div>
                  <div className="fw-semibold">
                    {departure.destination || "--"}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted">Liên hệ</div>
                  <div className="fw-semibold">
                    {departure.contact_phone || "--"}
                  </div>
                  <div className="text-muted small">
                    {departure.contact_address || ""}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-muted">Người duyệt</div>
                  <div className="fw-semibold">
                    {departure.approved_by || "--"}
                  </div>
                </Col>
                <Col md={12}>
                  <div className="text-muted">Lý do</div>
                  <div>{departure.reason || "--"}</div>
                </Col>
                <Col md={12}>
                  <div className="text-muted">Ghi chú</div>
                  <div>{departure.notes || "--"}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header className="bg-white">
              <h6 className="mb-0">Tài liệu</h6>
            </Card.Header>
            <Card.Body>
              {departure.documents ? (
                <ul className="mb-0">
                  {(() => {
                    try {
                      const docs =
                        typeof departure.documents === "string"
                          ? JSON.parse(departure.documents)
                          : departure.documents;
                      return (Array.isArray(docs) ? docs : []).map((doc) => (
                        <li key={doc.id || doc.url}>
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            {doc.name || doc.url}
                          </a>
                        </li>
                      ));
                    } catch {
                      return <li>Không thể đọc tài liệu</li>;
                    }
                  })()}
                </ul>
              ) : (
                <div className="text-muted">Không có tài liệu</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartureDetailPage;
