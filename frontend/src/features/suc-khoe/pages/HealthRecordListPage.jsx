import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Nav, Tab } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { healthService } from "@services";
import { useTable, useDebounce } from "@hooks";
import HealthCard from "../components/HealthCard";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const HealthRecordListPage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState([]);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchHealthRecords();
  }, [sisterId, table.currentPage, table.pageSize, debouncedSearch]);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const params = sisterId
        ? { sister_id: sisterId, ...table.getTableParams() }
        : table.getTableParams();
      const response = await healthService.getList(params);

      if (response.success) {
        setHealthRecords(response.data.items);
        table.setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching health records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate(
      sisterId ? `/nu-tu/${sisterId}/suc-khoe/create` : "/suc-khoe/create"
    );
  };

  const handleView = (record) => {
    navigate(`/suc-khoe/${record.id}`);
  };

  const handleEdit = (record) => {
    navigate(`/suc-khoe/${record.id}/edit`);
  };

  const handleDelete = async (record) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ sức khỏe này?")) {
      try {
        await healthService.delete(record.id);
        fetchHealthRecords();
      } catch (error) {
        console.error("Error deleting health record:", error);
      }
    }
  };

  const recordsByStatus = {
    excellent: healthRecords.filter((r) => r.health_status === "excellent"),
    good: healthRecords.filter((r) => r.health_status === "good"),
    fair: healthRecords.filter((r) => r.health_status === "fair"),
    poor: healthRecords.filter((r) => r.health_status === "poor"),
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
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Nữ Tu", link: "/nu-tu" },
          { label: "Hồ sơ Sức khỏe" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Hồ sơ Sức khỏe</h2>
          <p className="text-muted mb-0">Quản lý hồ sơ khám sức khỏe</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <i className="fas fa-plus me-2"></i>
          Thêm Hồ sơ
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">{healthRecords.length}</h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-heartbeat"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Sức khỏe tốt</small>
                  <h4 className="mb-0">{recordsByStatus.excellent.length}</h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-smile"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Cần theo dõi</small>
                  <h4 className="mb-0">{recordsByStatus.fair.length}</h4>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Cần chăm sóc</small>
                  <h4 className="mb-0">{recordsByStatus.poor.length}</h4>
                </div>
                <div className="stat-icon bg-danger">
                  <i className="fas fa-ambulance"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <SearchBox
            value={table.searchTerm}
            onChange={table.handleSearch}
            placeholder="Tìm kiếm theo bệnh viện, bác sĩ, chẩn đoán..."
          />
        </Col>
      </Row>

      {healthRecords.length > 0 ? (
        <Tab.Container defaultActiveKey="all">
          <Card>
            <Card.Header className="bg-white">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="all">
                    <i className="fas fa-list me-2"></i>
                    Tất cả ({healthRecords.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="excellent">
                    <i className="fas fa-smile me-2"></i>
                    Tốt ({recordsByStatus.excellent.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="good">
                    <i className="fas fa-meh me-2"></i>
                    Khá ({recordsByStatus.good.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fair">
                    <i className="fas fa-frown me-2"></i>
                    Trung bình ({recordsByStatus.fair.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="poor">
                    <i className="fas fa-sad-tear me-2"></i>
                    Yếu ({recordsByStatus.poor.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="all">
                  <Row className="g-4">
                    {healthRecords.map((record) => (
                      <Col key={record.id} xs={12} sm={6} lg={4}>
                        <HealthCard
                          healthRecord={record}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
                {Object.entries(recordsByStatus).map(([status, records]) => (
                  <Tab.Pane key={status} eventKey={status}>
                    <Row className="g-4">
                      {records.map((record) => (
                        <Col key={record.id} xs={12} sm={6} lg={4}>
                          <HealthCard
                            healthRecord={record}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Tab.Pane>
                ))}
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <i
              className="fas fa-heartbeat text-muted mb-3"
              style={{ fontSize: "3rem" }}
            ></i>
            <h5>Chưa có hồ sơ sức khỏe</h5>
            <p className="text-muted">
              Thêm hồ sơ đầu tiên để theo dõi sức khỏe
            </p>
            <Button variant="primary" onClick={handleAdd}>
              <i className="fas fa-plus me-2"></i>
              Thêm Hồ sơ
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default HealthRecordListPage;
