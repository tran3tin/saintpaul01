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
import { journeyService } from "@services";
import { useTable, useDebounce } from "@hooks";
import DataTable from "@components/tables/DataTable";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";
import { JOURNEY_STAGE_LABELS, JOURNEY_STAGE_COLORS } from "@utils/constants";

const VocationJourneyListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState([]);
  const [stageFilter, setStageFilter] = useState("");

  const table = useTable({
    initialPageSize: 20,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

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

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const params = {
        ...table.getTableParams(),
        stage: stageFilter || undefined,
      };
      const response = await journeyService.getList(params);

      if (response.success) {
        setJourneys(response.data.items);
        table.setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching journeys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (journey) => {
    navigate(`/hanh-trinh/${journey.id}`);
  };

  const handleEdit = (journey) => {
    navigate(`/hanh-trinh/${journey.id}/edit`);
  };

  const handleDelete = async (journey) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành trình này?")) {
      try {
        await journeyService.delete(journey.id);
        fetchJourneys();
      } catch (error) {
        console.error("Error deleting journey:", error);
      }
    }
  };

  const handleViewSister = (journey) => {
    navigate(`/nu-tu/${journey.sister_id}`);
  };

  const columns = [
    {
      key: "sister_name",
      label: "Nữ Tu",
      sortable: true,
      render: (row) => (
        <div>
          {row.sister_religious_name && (
            <div className="text-primary fw-semibold">
              {row.sister_religious_name}
            </div>
          )}
          <div>{row.sister_name}</div>
          <small className="text-muted">{row.sister_code}</small>
        </div>
      ),
    },
    {
      key: "stage",
      label: "Giai đoạn",
      sortable: true,
      render: (row) => (
        <Badge bg={JOURNEY_STAGE_COLORS[row.stage]}>
          {JOURNEY_STAGE_LABELS[row.stage]}
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
      render: (row) => row.superior || "-",
    },
    {
      key: "duration",
      label: "Thời gian",
      render: (row) => {
        if (!row.end_date) return "Đang diễn ra";
        const start = new Date(row.start_date);
        const end = new Date(row.end_date);
        const months = Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30));
        return `${months} tháng`;
      },
    },
  ];

  const actions = [
    {
      label: "Xem nữ tu",
      icon: "fas fa-user",
      variant: "info",
      onClick: handleViewSister,
    },
    {
      label: "Xem",
      icon: "fas fa-eye",
      variant: "primary",
      onClick: handleView,
    },
    {
      label: "Sửa",
      icon: "fas fa-edit",
      variant: "success",
      onClick: handleEdit,
    },
    {
      label: "Xóa",
      icon: "fas fa-trash",
      variant: "danger",
      onClick: handleDelete,
    },
  ];

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Hành trình Ơn Gọi" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Hành trình Ơn Gọi</h2>
          <p className="text-muted mb-0">
            Danh sách tất cả hành trình ơn gọi trong hệ thống
          </p>
        </div>
      </div>

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
                  <h4 className="mb-0">
                    {Object.keys(JOURNEY_STAGE_LABELS).length}
                  </h4>
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
        <Col md={6}>
          <SearchBox
            value={table.searchTerm}
            onChange={table.handleSearch}
            placeholder="Tìm kiếm theo tên nữ tu, địa điểm..."
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">Tất cả giai đoạn</option>
            {Object.entries(JOURNEY_STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
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
              actions={actions}
              pagination={{
                currentPage: table.currentPage,
                totalPages: table.totalPages,
                pageSize: table.pageSize,
                onPageChange: table.goToPage,
                onPageSizeChange: table.changePageSize,
              }}
              sorting={{
                sortBy: table.sortBy,
                sortOrder: table.sortOrder,
                onSort: table.handleSort,
              }}
              emptyMessage="Không có dữ liệu hành trình"
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default VocationJourneyListPage;
