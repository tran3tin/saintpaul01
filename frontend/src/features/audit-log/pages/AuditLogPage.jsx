// src/features/audit-log/pages/AuditLogPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { useSearchParams } from "react-router-dom";

// Services
import auditLogService from "../services/auditLogService";

// Components
import Breadcrumb from "@components/common/Breadcrumb";
import Pagination from "@components/common/Pagination";
import EmptyState from "@components/common/EmptyState";
import Loading from "@components/common/Loading";

// Utils
import { formatDateTime } from "@utils/formatters";

// Styles
import "./AuditLogPage.css";

const AuditLogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    action: searchParams.get("action") || "",
    entityType: searchParams.get("entityType") || "",
    userId: searchParams.get("userId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  // Action types
  const actionTypes = [
    { value: "", label: "Tất cả hành động" },
    { value: "CREATE", label: "Tạo mới" },
    { value: "UPDATE", label: "Cập nhật" },
    { value: "DELETE", label: "Xóa" },
    { value: "LOGIN", label: "Đăng nhập" },
    { value: "LOGOUT", label: "Đăng xuất" },
    { value: "VIEW", label: "Xem" },
    { value: "EXPORT", label: "Xuất" },
    { value: "IMPORT", label: "Nhập" },
  ];

  // Entity types
  const entityTypes = [
    { value: "", label: "Tất cả đối tượng" },
    { value: "sister", label: "Nữ Tu" },
    { value: "community", label: "Cộng Đoàn" },
    { value: "journey", label: "Hành Trình" },
    { value: "education", label: "Học Vấn" },
    { value: "mission", label: "Sứ Vụ" },
    { value: "health", label: "Sức Khỏe" },
    { value: "evaluation", label: "Đánh Giá" },
    { value: "user", label: "Người Dùng" },
    { value: "setting", label: "Cài Đặt" },
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: "Trang chủ", path: "/dashboard" },
    { label: "Cài đặt", path: "/settings" },
    { label: "Nhật ký hệ thống", active: true },
  ];

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const result = await auditLogService.getAll(params);
      
      if (result.success) {
        setLogs(result.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.totalPages || 0,
        }));
      } else {
        // Mock data for demo
        setLogs(getMockLogs());
        setPagination((prev) => ({
          ...prev,
          total: 100,
          totalPages: 5,
        }));
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      // Use mock data
      setLogs(getMockLogs());
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Mock data
  const getMockLogs = () => {
    return [
      {
        id: 1,
        action: "LOGIN",
        entityType: "user",
        entityId: 1,
        description: "Đăng nhập vào hệ thống",
        user: { id: 1, fullName: "Admin", username: "admin" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        action: "CREATE",
        entityType: "sister",
        entityId: 15,
        description: "Thêm mới Nữ Tu: Maria Nguyễn Thị A",
        user: { id: 1, fullName: "Admin", username: "admin" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        oldData: null,
        newData: { holyName: "Maria", fullName: "Nguyễn Thị A" },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        action: "UPDATE",
        entityType: "community",
        entityId: 3,
        description: "Cập nhật thông tin Cộng Đoàn: Nhà Mẹ",
        user: { id: 2, fullName: "Bề Trên", username: "betren" },
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        oldData: { address: "123 Đường ABC" },
        newData: { address: "456 Đường XYZ" },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 4,
        action: "DELETE",
        entityType: "education",
        entityId: 8,
        description: "Xóa thông tin học vấn",
        user: { id: 1, fullName: "Admin", username: "admin" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        oldData: { degree: "Cử nhân", institution: "ĐH ABC" },
        newData: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 5,
        action: "EXPORT",
        entityType: "report",
        entityId: null,
        description: "Xuất báo cáo danh sách Nữ Tu",
        user: { id: 1, fullName: "Admin", username: "admin" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await auditLogService.export(filters);
      if (result.success) {
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-log-${new Date().toISOString().split("T")[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
    }
  };

  // Handle view detail
  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Get action badge
  const getActionBadge = (action) => {
    const badges = {
      CREATE: { bg: "success", label: "Tạo mới" },
      UPDATE: { bg: "info", label: "Cập nhật" },
      DELETE: { bg: "danger", label: "Xóa" },
      LOGIN: { bg: "primary", label: "Đăng nhập" },
      LOGOUT: { bg: "secondary", label: "Đăng xuất" },
      VIEW: { bg: "light", label: "Xem", text: "dark" },
      EXPORT: { bg: "warning", label: "Xuất" },
      IMPORT: { bg: "purple", label: "Nhập" },
    };
    const badge = badges[action] || { bg: "secondary", label: action };
    return (
      <Badge bg={badge.bg} text={badge.text}>
        {badge.label}
      </Badge>
    );
  };

  // Get entity label
  const getEntityLabel = (entityType) => {
    const labels = {
      sister: "Nữ Tu",
      community: "Cộng Đoàn",
      journey: "Hành Trình",
      education: "Học Vấn",
      mission: "Sứ Vụ",
      health: "Sức Khỏe",
      evaluation: "Đánh Giá",
      user: "Người Dùng",
      setting: "Cài Đặt",
      report: "Báo Cáo",
    };
    return labels[entityType] || entityType;
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      action: "",
      entityType: "",
      userId: "",
      startDate: "",
      endDate: "",
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <Container fluid className="audit-log-page py-4">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="page-header mb-4">
        <div>
          <h2 className="page-title">
            <i className="fas fa-history me-2"></i>
            Nhật ký hệ thống
          </h2>
          <p className="text-muted mb-0">
            Theo dõi tất cả hoạt động trong hệ thống
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="outline-primary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xuất...
              </>
            ) : (
              <>
                <i className="fas fa-download me-2"></i>
                Xuất Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="search"
                    placeholder="Mô tả, người dùng..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Hành động</Form.Label>
                <Form.Select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                >
                  {actionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Đối tượng</Form.Label>
                <Form.Select
                  name="entityType"
                  value={filters.entityType}
                  onChange={handleFilterChange}
                >
                  {entityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={1} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                title="Xóa bộ lọc"
              >
                <i className="fas fa-times"></i>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Logs Table */}
      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <Loading message="Đang tải nhật ký..." />
          ) : logs.length === 0 ? (
            <EmptyState
              icon="fas fa-history"
              title="Chưa có nhật ký"
              description="Các hoạt động trong hệ thống sẽ được ghi lại tại đây"
            />
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="audit-log-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "160px" }}>Thời gian</th>
                      <th style={{ width: "100px" }}>Hành động</th>
                      <th style={{ width: "120px" }}>Đối tượng</th>
                      <th>Mô tả</th>
                      <th style={{ width: "150px" }}>Người thực hiện</th>
                      <th style={{ width: "130px" }}>Địa chỉ IP</th>
                      <th style={{ width: "80px" }}>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <small>{formatDateTime(log.createdAt)}</small>
                        </td>
                        <td>{getActionBadge(log.action)}</td>
                        <td>
                          <span className="entity-type">
                            {getEntityLabel(log.entityType)}
                            {log.entityId && (
                              <small className="text-muted ms-1">
                                #{log.entityId}
                              </small>
                            )}
                          </span>
                        </td>
                        <td className="description-cell">
                          {log.description}
                        </td>
                        <td>
                          <div className="user-info">
                            <i className="fas fa-user-circle me-2 text-muted"></i>
                            {log.user?.fullName || log.user?.username || "N/A"}
                          </div>
                        </td>
                        <td>
                          <code className="ip-address">{log.ipAddress}</code>
                        </td>
                        <td>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewDetail(log)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-3 border-top">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                    total={pagination.total}
                    pageSize={pagination.limit}
                  />
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            Chi tiết nhật ký
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div className="log-detail">
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Thời gian:</strong>
                  <p>{formatDateTime(selectedLog.createdAt)}</p>
                </Col>
                <Col md={6}>
                  <strong>Hành động:</strong>
                  <p>{getActionBadge(selectedLog.action)}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Đối tượng:</strong>
                  <p>
                    {getEntityLabel(selectedLog.entityType)}
                    {selectedLog.entityId && ` #${selectedLog.entityId}`}
                  </p>
                </Col>
                <Col md={6}>
                  <strong>Người thực hiện:</strong>
                  <p>{selectedLog.user?.fullName || "N/A"}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Địa chỉ IP:</strong>
                  <p><code>{selectedLog.ipAddress}</code></p>
                </Col>
                <Col md={6}>
                  <strong>User Agent:</strong>
                  <p><small>{selectedLog.userAgent}</small></p>
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Mô tả:</strong>
                <p>{selectedLog.description}</p>
              </div>
              
              {(selectedLog.oldData || selectedLog.newData) && (
                <Row>
                  {selectedLog.oldData && (
                    <Col md={6}>
                      <strong>Dữ liệu cũ:</strong>
                      <pre className="data-preview bg-light p-2 rounded">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    </Col>
                  )}
                  {selectedLog.newData && (
                    <Col md={6}>
                      <strong>Dữ liệu mới:</strong>
                      <pre className="data-preview bg-light p-2 rounded">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </Col>
                  )}
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AuditLogPage;
