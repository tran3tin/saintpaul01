// features/settings/pages/AuditLogPage.jsx
import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import { FaHistory, FaSearch, FaFilter, FaUser, FaClock } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "./settings-common.css";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      const mockLogs = [
        {
          id: 1,
          user: "Admin",
          action: "CREATE",
          resource: "Sister",
          description: "Thêm mới nữ tu Maria Nguyễn",
          ip_address: "192.168.1.100",
          created_at: new Date(),
        },
        {
          id: 2,
          user: "Manager",
          action: "UPDATE",
          resource: "Community",
          description: "Cập nhật cộng đoàn Mẹ Vô Nhiễm",
          ip_address: "192.168.1.101",
          created_at: new Date(Date.now() - 3600000),
        },
        {
          id: 3,
          user: "Admin",
          action: "DELETE",
          resource: "Evaluation",
          description: "Xóa đánh giá #123",
          ip_address: "192.168.1.100",
          created_at: new Date(Date.now() - 7200000),
        },
        {
          id: 4,
          user: "User1",
          action: "LOGIN",
          resource: "Auth",
          description: "Đăng nhập hệ thống",
          ip_address: "192.168.1.102",
          created_at: new Date(Date.now() - 86400000),
        },
      ];
      setLogs(mockLogs);
      setTotalPages(5);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const variants = {
      CREATE: "success",
      UPDATE: "primary",
      DELETE: "danger",
      LOGIN: "info",
      LOGOUT: "secondary",
    };
    return <Badge bg={variants[action] || "secondary"}>{action}</Badge>;
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

  return (
    <Container fluid className="py-4 settings-page">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FaHistory /> Nhật Ký Hoạt Động
          </h2>
          <p className="text-muted">Theo dõi tất cả hoạt động trong hệ thống</p>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="health-info-card">
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
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Thời gian</th>
                    <th>Người dùng</th>
                    <th>Hành động</th>
                    <th>Đối tượng</th>
                    <th>Mô tả</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td>
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          {format(
                            new Date(log.created_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </small>
                      </td>
                      <td>
                        <strong>{log.user}</strong>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td>{log.resource}</td>
                      <td>{log.description}</td>
                      <td>
                        <code>{log.ip_address}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Trang {currentPage} / {totalPages}
                </small>
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuditLogPage;
