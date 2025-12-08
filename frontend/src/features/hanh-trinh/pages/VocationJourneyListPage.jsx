// src/features/hanh-trinh/pages/VocationJourneyListPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Badge,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { journeyService, lookupService } from "@services";
import { useTable, useDebounce } from "@hooks";
import DataTable from "@components/tables/DataTable";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";

const VocationJourneyListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [stages, setStages] = useState([]);

  const table = useTable({
    initialPageSize: 20,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    fetchJourneys();
  }, [
    table.currentPage,
    table.pageSize,
    debouncedSearch,
    stageFilter,
    table.sortBy,
    table.sortOrder,
  ]);

  const fetchStages = async () => {
    try {
      const response = await lookupService.getJourneyStages();
      if (response && response.data) {
        setStages(response.data);
      }
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const params = {
        ...table.getTableParams(),
        stage: stageFilter || undefined,
      };
      const response = await journeyService.getList(params);

      if (response.success) {
        // API returns { data: [...], meta: {...} }
        const items = Array.isArray(response.data) ? response.data : [];
        setJourneys(items);
        const total = response.meta?.total || items.length;
        table.setTotalItems(total);
      } else {
        setJourneys([]);
        table.setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching journeys:", error);
      setJourneys([]);
      table.setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (journey) => {
    navigate(`/hanh-trinh/${journey.id}`);
  };

  const handleView = (journey, e) => {
    e.stopPropagation();
    navigate(`/hanh-trinh/${journey.id}`);
  };

  const handleEdit = (journey, e) => {
    e.stopPropagation();
    navigate(`/hanh-trinh/${journey.id}/edit`);
  };

  const handleDelete = async (journey, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa hành trình "${journey.stage_name}" của ${
          journey.saint_name || journey.birth_name
        }?`
      )
    ) {
      try {
        const response = await journeyService.delete(journey.id);
        if (response.success) {
          alert(response.message || "Đã xóa hành trình thành công");
          fetchJourneys();
        } else {
          alert(response.error || "Không thể xóa hành trình");
        }
      } catch (error) {
        console.error("Error deleting journey:", error);
        alert("Có lỗi xảy ra khi xóa hành trình");
      }
    }
  };

  const columns = [
    {
      key: "stt",
      label: "#",
      width: "60px",
      render: (row, rowIndex) => {
        return (table.currentPage - 1) * table.pageSize + rowIndex + 1;
      },
    },
    {
      key: "sister_name",
      label: "Nữ Tu",
      sortable: true,
      render: (row) => (
        <div>
          {row.saint_name && (
            <div className="text-primary fw-semibold">{row.saint_name}</div>
          )}
          <div>{row.birth_name}</div>
          <small className="text-muted">{row.sister_code}</small>
        </div>
      ),
    },
    {
      key: "stage",
      label: "Giai đoạn",
      sortable: true,
      render: (row) => (
        <Badge
          style={{
            backgroundColor: row.stage_color || "#6c757d",
            color: "#fff",
          }}
        >
          {row.stage_name || row.stage}
        </Badge>
      ),
    },
    {
      key: "start_date",
      label: "Ngày bắt đầu",
      sortable: true,
      render: (row) => formatDate(row.start_date),
    },
    {
      key: "end_date",
      label: "Ngày kết thúc",
      sortable: true,
      render: (row) => (row.end_date ? formatDate(row.end_date) : "Hiện tại"),
    },
    {
      key: "location",
      label: "Địa điểm",
      sortable: true,
    },
    {
      key: "superior",
      label: "Bề trên",
      sortable: true,
      render: (row) => row.superior || "-",
    },
    {
      key: "duration",
      label: "Thời gian",
      sortable: false,
      render: (row) => {
        if (!row.end_date) return "Đang diễn ra";
        const start = new Date(row.start_date);
        const end = new Date(row.end_date);
        const months = Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30));
        return `${months} tháng`;
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      className: "text-center",
      render: (row) => (
        <div className="d-flex gap-1 justify-content-center">
          <Button
            variant="outline-info"
            size="sm"
            onClick={(e) => handleView(row, e)}
            title="Xem chi tiết"
          >
            <i className="fas fa-eye"></i>
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => handleEdit(row, e)}
            title="Chỉnh sửa"
          >
            <i className="fas fa-edit"></i>
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={(e) => handleDelete(row, e)}
            title="Xóa"
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Quản lý Hành trình Ơn Gọi"
        items={[{ label: "Hành trình Ơn Gọi" }]}
      />

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">{table.totalItems}</h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-route"></i>
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
                  <small className="text-muted">Đang diễn ra</small>
                  <h4 className="mb-0">
                    {journeys.filter((j) => !j.end_date).length}
                  </h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-play"></i>
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
                  <small className="text-muted">Đã hoàn thành</small>
                  <h4 className="mb-0">
                    {journeys.filter((j) => j.end_date).length}
                  </h4>
                </div>
                <div className="stat-icon bg-info">
                  <i className="fas fa-check"></i>
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
                  <small className="text-muted">Giai đoạn</small>
                  <h4 className="mb-0">{stages.length}</h4>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="fas fa-layer-group"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
      <Row className="g-3 mb-4">
        <Col md={5}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên nữ tu, địa điểm..."
            value={table.searchTerm}
            onChange={(e) => table.handleSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">Tất cả giai đoạn</option>
            {stages.map((stage) => (
              <option key={stage.code} value={stage.code}>
                {stage.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={table.pageSize}
            onChange={(e) => table.changePageSize(Number(e.target.value))}
          >
            <option value={10}>10 dòng</option>
            <option value={20}>20 dòng</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => {
              setStageFilter("");
              table.handleSearch("");
            }}
          >
            <i className="fas fa-redo me-2"></i>
            Đặt lại
          </Button>
        </Col>
      </Row>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <DataTable
              columns={columns}
              data={journeys}
              currentPage={table.currentPage}
              totalPages={table.totalPages}
              onPageChange={table.goToPage}
              sortBy={table.sortBy}
              sortOrder={table.sortOrder}
              onSort={table.handleSort}
              emptyMessage="Không có dữ liệu hành trình"
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default VocationJourneyListPage;
