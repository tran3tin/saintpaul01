import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Nav, Tab, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { departureService } from "@services";
import { useTable, useDebounce } from "@hooks";
import DepartureCard from "../components/DepartureCard";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const DepartureListPage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState([]);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchDepartures();
  }, [sisterId, table.currentPage, table.pageSize, debouncedSearch]);

  const fetchDepartures = async () => {
    try {
      setLoading(true);
      const params = sisterId
        ? { sister_id: sisterId, ...table.getTableParams() }
        : table.getTableParams();
      const response = await departureService.getList(params);

      if (response.success) {
        setDepartures(response.data.items || []);
        table.setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching departures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate(
      sisterId ? `/nu-tu/${sisterId}/di-vang/create` : "/di-vang/create"
    );
  };

  const handleView = (record) => {
    navigate(`/di-vang/${record.id}`);
  };

  const handleEdit = (record) => {
    navigate(`/di-vang/${record.id}/edit`);
  };

  const handleDelete = async (record) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu đi vắng này?")) {
      try {
        await departureService.delete(record.id);
        fetchDepartures();
      } catch (error) {
        console.error("Error deleting departure:", error);
      }
    }
  };

  const departuresByType = {
    temporary: departures.filter((d) => d.type === "temporary"),
    medical: departures.filter((d) => d.type === "medical"),
    study: departures.filter((d) => d.type === "study"),
    mission: departures.filter((d) => d.type === "mission"),
    other: departures.filter((d) => !["temporary", "medical", "study", "mission"].includes(d.type)),
  };

  const activeCount = departures.filter((d) => !d.return_date).length;
  const returnedCount = departures.filter((d) => d.return_date).length;

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
          { label: "Đi vắng" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Đi vắng</h2>
          <p className="text-muted mb-0">Theo dõi tình trạng đi vắng của nữ tu</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <i className="fas fa-plus me-2"></i>
          Đăng ký Đi vắng
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">{departures.length}</h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-plane-departure"></i>
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
                  <small className="text-muted">Đang đi vắng</small>
                  <h4 className="mb-0">{activeCount}</h4>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="fas fa-walking"></i>
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
                  <small className="text-muted">Đã trở về</small>
                  <h4 className="mb-0">{returnedCount}</h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-home"></i>
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
                  <small className="text-muted">Khám chữa bệnh</small>
                  <h4 className="mb-0">{departuresByType.medical.length}</h4>
                </div>
                <div className="stat-icon bg-danger">
                  <i className="fas fa-hospital"></i>
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
            placeholder="Tìm kiếm theo tên, địa điểm, lý do..."
          />
        </Col>
      </Row>

      {departures.length > 0 ? (
        <Tab.Container defaultActiveKey="all">
          <Card>
            <Card.Header className="bg-white">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="all">
                    <i className="fas fa-list me-2"></i>
                    Tất cả ({departures.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="active">
                    <i className="fas fa-walking me-2"></i>
                    Đang đi vắng ({activeCount})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="returned">
                    <i className="fas fa-home me-2"></i>
                    Đã trở về ({returnedCount})
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane eventKey="all">
                  <Row className="g-4">
                    {departures.map((departure) => (
                      <Col key={departure.id} xs={12} sm={6} lg={4}>
                        <DepartureCard
                          departure={departure}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="active">
                  <Row className="g-4">
                    {departures.filter((d) => !d.return_date).map((departure) => (
                      <Col key={departure.id} xs={12} sm={6} lg={4}>
                        <DepartureCard
                          departure={departure}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="returned">
                  <Row className="g-4">
                    {departures.filter((d) => d.return_date).map((departure) => (
                      <Col key={departure.id} xs={12} sm={6} lg={4}>
                        <DepartureCard
                          departure={departure}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <i
              className="fas fa-plane-departure text-muted mb-3"
              style={{ fontSize: "3rem" }}
            ></i>
            <h5>Chưa có phiếu đi vắng</h5>
            <p className="text-muted">
              Đăng ký phiếu đi vắng đầu tiên
            </p>
            <Button variant="primary" onClick={handleAdd}>
              <i className="fas fa-plus me-2"></i>
              Đăng ký Đi vắng
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default DepartureListPage;
