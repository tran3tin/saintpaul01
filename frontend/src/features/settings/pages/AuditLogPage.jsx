// features/settings/pages/AuditLogPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Pagination,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaHistory, FaFilter, FaUser, FaClock, FaSync } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { auditLogService } from "@services";
import "./settings-common.css";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.action) params.action = filters.action;
      if (filters.user) params.user = filters.user;
      if (filters.dateFrom) params.startDate = filters.dateFrom;
      if (filters.dateTo) params.endDate = filters.dateTo;

      const result = await auditLogService.getAll(params);

      if (result.success) {
        setLogs(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotalLogs(result.meta?.total || 0);
      } else {
        setError(result.error || "Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Lỗi khi tải nhật ký hoạt động");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action) => {
    const variants = {
      CREATE: "success",
      INSERT: "success",
      UPDATE: "primary",
      DELETE: "danger",
      LOGIN: "info",
      LOGOUT: "secondary",
      VIEW: "light",
    };
    const labels = {
      CREATE: "Tạo mới",
      INSERT: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      LOGIN: "Đăng nhập",
      LOGOUT: "Đăng xuất",
      VIEW: "Xem",
    };
    return (
      <Badge bg={variants[action] || "secondary"}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getTableLabel = (tableName) => {
    const labels = {
      sisters: "Nữ tu",
      communities: "Cộng đoàn",
      users: "Người dùng",
      evaluations: "Đánh giá",
      health_records: "Sức khỏe",
      education_records: "Học vấn",
      missions: "Sứ vụ",
      posts: "Bài đăng",
      vocation_journeys: "Hành trình ơn gọi",
    };
    return labels[tableName] || tableName;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      user: "",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mb-0">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        />
        {startPage > 1 && <Pagination.Ellipsis disabled />}
        {pages}
        {endPage < totalPages && <Pagination.Ellipsis disabled />}
        <Pagination.Next
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container fluid className="py-4 settings-page">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="d-flex align-items-center gap-2">
                <FaHistory /> Nhật Ký Hoạt Động
              </h2>
              <p className="text-muted mb-0">
                Theo dõi tất cả hoạt động trong hệ thống ({totalLogs} bản ghi)
              </p>
            </div>
            <Button
              variant="outline-primary"
              onClick={fetchLogs}
              disabled={loading}
            >
              <FaSync className={`me-2 ${loading ? "fa-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="health-info-card mb-4">
        <Card.Header className="documents-header">
          <FaFilter className="me-2" />
          <span>Bộ lọc</span>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <FaFilter className="me-1" /> Loại hành động
                </Form.Label>
                <Form.Select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="CREATE">Tạo mới</option>
                  <option value="INSERT">Thêm</option>
                  <option value="UPDATE">Cập nhật</option>
                  <option value="DELETE">Xóa</option>
                  <option value="LOGIN">Đăng nhập</option>
                  <option value="LOGOUT">Đăng xuất</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <FaUser className="me-1" /> Người dùng
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    name="user"
                    placeholder="Tìm người dùng..."
                    value={filters.user}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Logs Table */}
      <Card className="health-info-card">
        <Card.Header className="system-header d-flex align-items-center">
          <FaHistory className="me-2" />
          <span>Danh sách nhật ký</span>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FaHistory size={48} className="mb-3 opacity-50" />
              <p>Không có nhật ký hoạt động nào</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th style={{ width: "150px" }}>Thời gian</th>
                    <th style={{ width: "120px" }}>Người dùng</th>
                    <th style={{ width: "100px" }}>Hành động</th>
                    <th style={{ width: "120px" }}>Đối tượng</th>
                    <th>Mô tả</th>
                    <th style={{ width: "120px" }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td>
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {log.created_at
                            ? format(
                                new Date(log.created_at),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )
                            : "-"}
                        </small>
                      </td>
                      <td>
                        <strong>
                          {log.username || `User #${log.user_id}`}
                        </strong>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td>{getTableLabel(log.table_name)}</td>
                      <td>
                        <small>
                          {log.description ||
                            `${log.action} ${log.table_name} #${log.record_id}`}
                        </small>
                      </td>
                      <td>
                        <code className="small">{log.ip_address || "-"}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalLogs)} /{" "}
                  {totalLogs} bản ghi
                </small>
                {renderPagination()}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuditLogPage;
