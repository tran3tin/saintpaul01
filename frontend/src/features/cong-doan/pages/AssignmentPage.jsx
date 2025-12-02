import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
  Modal,
  Badge,
  Pagination,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { communityService, sisterService } from "@services";
import { formatDate } from "@utils";
import Breadcrumb from "@components/common/Breadcrumb";
import "./AssignmentPage.css";

// Role labels and styles
const roleConfig = {
  leader: { label: "Bề trên", icon: "fa-crown", className: "role-leader" },
  vice_leader: { label: "Phó bề trên", icon: "fa-user-tie", className: "role-vice-leader" },
  superior: { label: "Bề trên", icon: "fa-crown", className: "role-leader" },
  assistant: { label: "Phó bề trên", icon: "fa-user-tie", className: "role-vice-leader" },
  secretary: { label: "Thư ký", icon: "fa-file-alt", className: "role-secretary" },
  treasurer: { label: "Thủ quỹ", icon: "fa-coins", className: "role-treasurer" },
  member: { label: "Thành viên", icon: "fa-user", className: "role-member" },
};

// Status labels and styles
const statusConfig = {
  active: { label: "Đang hoạt động", icon: "fa-check-circle", className: "status-active" },
  pending: { label: "Chờ xử lý", icon: "fa-clock", className: "status-pending" },
  completed: { label: "Đã hoàn thành", icon: "fa-check-double", className: "status-completed" },
  cancelled: { label: "Đã hủy", icon: "fa-times-circle", className: "status-cancelled" },
};

// Stage labels
const stageLabels = {
  inquiry: "Tìm hiểu",
  postulant: "Thỉnh sinh",
  aspirant: "Tiền tập",
  novice: "Tập viện",
  temporary_vows: "Khấn tạm",
  perpetual_vows: "Khấn trọn",
};

const AssignmentPage = () => {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [sisters, setSisters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    community_id: "",
    role: "",
    status: "",
    search: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    sister_id: "",
    community_id: "",
    role: "member",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    decision_number: "",
    notes: "",
    is_primary: true,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  });

  // Fetch data
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (communities.length > 0) {
      fetchAssignments();
    }
  }, [filters, pagination.page, communities]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [communitiesRes, sistersRes] = await Promise.all([
        communityService.getList({ limit: 100 }),
        sisterService.getList({ limit: 1000 }),
      ]);

      if (communitiesRes?.data) {
        setCommunities(communitiesRes.data);
      }
      if (sistersRes?.data) {
        setSisters(sistersRes.data);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // Get assignments from all communities
      const allAssignments = [];
      for (const community of communities) {
        try {
          const members = await communityService.getMembers(community.id);
          if (members && Array.isArray(members)) {
            members.forEach(m => {
              allAssignments.push({
                ...m,
                community_id: community.id,
                community_name: community.name,
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching members for community ${community.id}:`, err);
        }
      }

      // Apply filters
      let filteredAssignments = allAssignments;
      
      if (filters.community_id) {
        filteredAssignments = filteredAssignments.filter(
          a => a.community_id === parseInt(filters.community_id)
        );
      }
      
      if (filters.role) {
        filteredAssignments = filteredAssignments.filter(
          a => a.role === filters.role
        );
      }
      
      if (filters.status) {
        const today = new Date();
        if (filters.status === 'active') {
          filteredAssignments = filteredAssignments.filter(
            a => !a.end_date || new Date(a.end_date) > today
          );
        } else if (filters.status === 'completed') {
          filteredAssignments = filteredAssignments.filter(
            a => a.end_date && new Date(a.end_date) <= today
          );
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAssignments = filteredAssignments.filter(a => {
          const sister = sisters.find(s => s.id === a.sister_id) || a;
          const name = sister.saint_name 
            ? `${sister.saint_name} ${sister.birth_name}`
            : sister.birth_name || sister.full_name || "";
          return name.toLowerCase().includes(searchLower);
        });
      }

      setAssignments(filteredAssignments);
      
      // Calculate stats
      const today = new Date();
      const activeCount = allAssignments.filter(a => !a.end_date || new Date(a.end_date) > today).length;
      const completedCount = allAssignments.filter(a => a.end_date && new Date(a.end_date) <= today).length;
      
      setStats({
        total: allAssignments.length,
        active: activeCount,
        pending: 0,
        completed: completedCount,
      });

      setPagination(prev => ({
        ...prev,
        total: filteredAssignments.length,
        totalPages: Math.ceil(filteredAssignments.length / prev.limit) || 1,
      }));
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAssignments(assignments.map(a => a.id));
    } else {
      setSelectedAssignments([]);
    }
  };

  const handleSelectAssignment = (id) => {
    setSelectedAssignments(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const handleOpenAddModal = () => {
    setFormData({
      sister_id: "",
      community_id: "",
      role: "member",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      decision_number: "",
      notes: "",
      is_primary: true,
    });
    setIsEditing(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (assignment) => {
    setFormData({
      sister_id: assignment.sister_id || assignment.id,
      community_id: assignment.community_id,
      role: assignment.role || "member",
      start_date: assignment.start_date?.split("T")[0] || assignment.joined_date?.split("T")[0] || "",
      end_date: assignment.end_date?.split("T")[0] || "",
      decision_number: assignment.decision_number || "",
      notes: assignment.notes || "",
      is_primary: assignment.is_primary !== false,
    });
    setSelectedAssignment(assignment);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.sister_id || !formData.community_id) {
      setError("Vui lòng chọn nữ tu và cộng đoàn");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (isEditing && selectedAssignment) {
        await communityService.updateMemberRole(
          formData.community_id,
          selectedAssignment.id,
          {
            role: formData.role,
            end_date: formData.end_date || null,
            notes: formData.notes,
          }
        );
        toast.success("Đã cập nhật bổ nhiệm thành công");
      } else {
        await communityService.addMember(formData.community_id, {
          sister_ids: [parseInt(formData.sister_id)],
          role: formData.role,
          joined_date: formData.start_date,
          notes: formData.notes,
        });
        toast.success("Đã thêm bổ nhiệm thành công");
      }

      setShowAddModal(false);
      fetchAssignments();
    } catch (err) {
      console.error("Error saving assignment:", err);
      setError("Có lỗi xảy ra khi lưu bổ nhiệm");
      toast.error("Không thể lưu bổ nhiệm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bổ nhiệm này?")) {
      return;
    }

    try {
      await communityService.removeMember(assignment.community_id, assignment.id);
      toast.success("Đã xóa bổ nhiệm thành công");
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      toast.error("Không thể xóa bổ nhiệm");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleConfig = (role) => {
    return roleConfig[role] || roleConfig.member;
  };

  const getAssignmentStatus = (assignment) => {
    if (!assignment.end_date) return statusConfig.active;
    const endDate = new Date(assignment.end_date);
    const today = new Date();
    if (endDate > today) return statusConfig.active;
    return statusConfig.completed;
  };

  const getSisterById = (id) => {
    return sisters.find(s => s.id === id);
  };

  const getCommunityById = (id) => {
    return communities.find(c => c.id === id);
  };

  // Get paginated assignments
  const getPaginatedAssignments = () => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return assignments.slice(start, end);
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const items = [];
    for (let i = 1; i <= Math.min(pagination.totalPages, 5); i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mb-0">
        <Pagination.Prev
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        />
        {items}
        <Pagination.Next
          disabled={pagination.page === pagination.totalPages}
          onClick={() => handlePageChange(pagination.page + 1)}
        />
      </Pagination>
    );
  };

  if (loading && assignments.length === 0 && communities.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const paginatedAssignments = getPaginatedAssignments();

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Cộng Đoàn", link: "/cong-doan" },
          { label: "Quản lý Bổ Nhiệm" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản Lý Bổ Nhiệm</h2>
          <p className="text-muted mb-0">
            Quản lý bổ nhiệm thành viên vào các cộng đoàn
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <i className="fas fa-plus me-2"></i>
          Bổ nhiệm mới
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

        {/* Stats Cards */}
        <Row className="mb-4 animate-in">
          <Col md={3} className="mb-3">
            <div className="stats-card primary">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-gradient-primary">
                  <i className="fas fa-users"></i>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="stats-value">{stats.total}</div>
                  <p className="stats-label">Tổng bổ nhiệm</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card success">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-gradient-success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="stats-value">{stats.active}</div>
                  <p className="stats-label">Đang hoạt động</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card warning">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-gradient-warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="stats-value">{stats.pending}</div>
                  <p className="stats-label">Chờ xử lý</p>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="stats-card danger">
              <div className="d-flex align-items-center">
                <div className="stats-icon bg-gradient-danger">
                  <i className="fas fa-history"></i>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="stats-value">{stats.completed}</div>
                  <p className="stats-label">Đã kết thúc</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Main Card */}
        <Card className="main-card animate-in">
          {/* Card Header */}
          <div className="card-header-custom">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Danh Sách Bổ Nhiệm
              </h5>
              <div className="d-flex gap-2">
                <Button variant="light" size="sm">
                  <i className="fas fa-file-excel me-1"></i>
                  Xuất Excel
                </Button>
                <Button variant="light" size="sm" onClick={() => window.print()}>
                  <i className="fas fa-print me-1"></i>
                  In
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-section">
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Cộng đoàn</Form.Label>
                <Form.Select
                  value={filters.community_id}
                  onChange={(e) => handleFilterChange("community_id", e.target.value)}
                >
                  <option value="">Tất cả cộng đoàn</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Chức vụ</Form.Label>
                <Form.Select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                >
                  <option value="">Tất cả chức vụ</option>
                  <option value="leader">Bề trên</option>
                  <option value="superior">Bề trên</option>
                  <option value="vice_leader">Phó bề trên</option>
                  <option value="assistant">Phó bề trên</option>
                  <option value="secretary">Thư ký</option>
                  <option value="treasurer">Thủ quỹ</option>
                  <option value="member">Thành viên</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="completed">Đã hoàn thành</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Tìm kiếm</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Tên nữ tu..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                  <Button variant="primary">
                    <i className="fas fa-search"></i>
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </div>

          {/* Table */}
          <div className="table-responsive p-3">
            <Table hover className="custom-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <Form.Check
                      type="checkbox"
                      checked={selectedAssignments.length === paginatedAssignments.length && paginatedAssignments.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Nữ Tu</th>
                  <th>Cộng Đoàn</th>
                  <th>Chức Vụ</th>
                  <th>Ngày Bắt Đầu</th>
                  <th>Ngày Kết Thúc</th>
                  <th>Trạng Thái</th>
                  <th style={{ width: "120px" }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssignments.length > 0 ? (
                  paginatedAssignments.map((assignment) => {
                    const sister = getSisterById(assignment.sister_id) || assignment;
                    const community = getCommunityById(assignment.community_id) || { name: assignment.community_name };
                    const roleInfo = getRoleConfig(assignment.role);
                    const statusInfo = getAssignmentStatus(assignment);
                    const sisterName = sister.saint_name 
                      ? `${sister.saint_name} ${sister.birth_name}`
                      : sister.birth_name || sister.full_name || "N/A";

                    return (
                      <tr key={`${assignment.community_id}-${assignment.id}`}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedAssignments.includes(assignment.id)}
                            onChange={() => handleSelectAssignment(assignment.id)}
                          />
                        </td>
                        <td>
                          <div className="sister-info">
                            <div className="sister-avatar">
                              {getInitials(sisterName)}
                            </div>
                            <div className="sister-details">
                              <div className="sister-name">{sisterName}</div>
                              <div className="sister-stage">
                                {stageLabels[sister.current_stage] || sister.current_stage || "Chưa xác định"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <i className="fas fa-home text-primary me-1"></i>
                            {community?.name || "N/A"}
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${roleInfo.className}`}>
                            <i className={`fas ${roleInfo.icon} me-1`}></i>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td>
                          <i className="far fa-calendar-alt text-muted me-1"></i>
                          {formatDate(assignment.start_date || assignment.joined_date)}
                        </td>
                        <td>
                          <i className="far fa-calendar-alt text-muted me-1"></i>
                          {assignment.end_date ? formatDate(assignment.end_date) : "—"}
                        </td>
                        <td>
                          <span className={`status-badge ${statusInfo.className}`}>
                            <i className={`fas ${statusInfo.icon} me-1`}></i>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn btn-view"
                            onClick={() => handleViewAssignment(assignment)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="action-btn btn-edit"
                            onClick={() => handleOpenEditModal(assignment)}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="action-btn btn-delete"
                            onClick={() => handleDelete(assignment)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="empty-state">
                        <i className="fas fa-users-slash"></i>
                        <p>Không có bổ nhiệm nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top flex-wrap gap-2">
            <div className="text-muted">
              Hiển thị <strong>{Math.min(((pagination.page - 1) * pagination.limit) + 1, pagination.total)}-{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> trong tổng số <strong>{pagination.total}</strong> bản ghi
            </div>
            {renderPagination()}
          </div>
        </Card>

      {/* Add/Edit Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <i className={`fas ${isEditing ? "fa-edit" : "fa-user-plus"} me-2`}></i>
            {isEditing ? "Chỉnh Sửa Bổ Nhiệm" : "Bổ Nhiệm Mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-user text-primary me-1"></i>
                  Nữ Tu <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.sister_id}
                  onChange={(e) => handleFormChange("sister_id", e.target.value)}
                  disabled={isEditing}
                  required
                >
                  <option value="">-- Chọn nữ tu --</option>
                  {sisters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.saint_name ? `${s.saint_name} ${s.birth_name}` : s.birth_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-home text-primary me-1"></i>
                  Cộng Đoàn <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.community_id}
                  onChange={(e) => handleFormChange("community_id", e.target.value)}
                  disabled={isEditing}
                  required
                >
                  <option value="">-- Chọn cộng đoàn --</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-user-tag text-primary me-1"></i>
                  Chức Vụ <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                  required
                >
                  <option value="member">Thành viên</option>
                  <option value="superior">Bề trên</option>
                  <option value="assistant">Phó bề trên</option>
                  <option value="secretary">Thư ký</option>
                  <option value="treasurer">Thủ quỹ</option>
                </Form.Select>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-toggle-on text-primary me-1"></i>
                  Chức Vụ Chính
                </Form.Label>
                <div className="mt-2">
                  <Form.Check
                    type="switch"
                    id="isPrimary"
                    label="Đây là chức vụ chính"
                    checked={formData.is_primary}
                    onChange={(e) => handleFormChange("is_primary", e.target.checked)}
                  />
                </div>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-calendar-alt text-primary me-1"></i>
                  Ngày Bắt Đầu <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleFormChange("start_date", e.target.value)}
                  required
                />
              </Col>

              <Col md={6} className="mb-3">
                <Form.Label>
                  <i className="fas fa-calendar-check text-primary me-1"></i>
                  Ngày Kết Thúc
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleFormChange("end_date", e.target.value)}
                />
                <Form.Text className="text-muted">Để trống nếu không xác định</Form.Text>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>
                  <i className="fas fa-file-alt text-primary me-1"></i>
                  Quyết Định Bổ Nhiệm
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Số quyết định..."
                  value={formData.decision_number}
                  onChange={(e) => handleFormChange("decision_number", e.target.value)}
                />
              </Col>

              <Col md={12} className="mb-3">
                <Form.Label>
                  <i className="fas fa-comment-alt text-primary me-1"></i>
                  Ghi Chú
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Nhập ghi chú..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            <i className="fas fa-times me-1"></i>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" className="me-1" />
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Lưu Bổ Nhiệm
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            Chi Tiết Bổ Nhiệm
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssignment && (() => {
            const sister = getSisterById(selectedAssignment.sister_id) || selectedAssignment;
            const community = getCommunityById(selectedAssignment.community_id) || { name: selectedAssignment.community_name };
            const roleInfo = getRoleConfig(selectedAssignment.role);
            const statusInfo = getAssignmentStatus(selectedAssignment);
            const sisterName = sister.saint_name 
              ? `${sister.saint_name} ${sister.birth_name}`
              : sister.birth_name || sister.full_name || "N/A";

            return (
              <Row>
                <Col md={6} className="mb-4">
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-user me-2"></i>
                        Thông Tin Nữ Tu
                      </h6>
                      <div className="d-flex align-items-center mb-3">
                        <div className="sister-avatar" style={{ width: 60, height: 60, fontSize: "1.5rem" }}>
                          {getInitials(sisterName)}
                        </div>
                        <div className="ms-3">
                          <h5 className="mb-1">{sisterName}</h5>
                          <p className="text-muted mb-0">
                            {stageLabels[sister.current_stage] || "Chưa xác định"}
                          </p>
                        </div>
                      </div>
                      {sister.date_of_birth && (
                        <div className="mb-2">
                          <i className="fas fa-birthday-cake text-primary me-2"></i>
                          <strong>Ngày sinh:</strong> {formatDate(sister.date_of_birth)}
                        </div>
                      )}
                      {sister.phone && (
                        <div className="mb-2">
                          <i className="fas fa-phone text-primary me-2"></i>
                          <strong>Điện thoại:</strong> {sister.phone}
                        </div>
                      )}
                      {sister.email && (
                        <div>
                          <i className="fas fa-envelope text-primary me-2"></i>
                          <strong>Email:</strong> {sister.email}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-4">
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-3">
                        <i className="fas fa-briefcase me-2"></i>
                        Thông Tin Bổ Nhiệm
                      </h6>
                      <div className="mb-2">
                        <i className="fas fa-home text-primary me-2"></i>
                        <strong>Cộng đoàn:</strong> {community?.name}
                      </div>
                      <div className="mb-2">
                        <i className="fas fa-user-tag text-primary me-2"></i>
                        <strong>Chức vụ:</strong>
                        <span className={`role-badge ${roleInfo.className} ms-2`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      <div className="mb-2">
                        <i className="fas fa-calendar-alt text-primary me-2"></i>
                        <strong>Bắt đầu:</strong> {formatDate(selectedAssignment.start_date || selectedAssignment.joined_date)}
                      </div>
                      <div className="mb-2">
                        <i className="fas fa-calendar-check text-primary me-2"></i>
                        <strong>Kết thúc:</strong> {selectedAssignment.end_date ? formatDate(selectedAssignment.end_date) : "Chưa xác định"}
                      </div>
                      <div>
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        <strong>Trạng thái:</strong>
                        <span className={`status-badge ${statusInfo.className} ms-2`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {selectedAssignment.notes && (
                  <Col md={12}>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-muted mb-3">
                          <i className="fas fa-file-alt me-2"></i>
                          Chi Tiết
                        </h6>
                        <div>
                          <strong>Ghi chú:</strong> {selectedAssignment.notes}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            <i className="fas fa-times me-1"></i>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => {
            setShowViewModal(false);
            handleOpenEditModal(selectedAssignment);
          }}>
            <i className="fas fa-edit me-1"></i>
            Chỉnh Sửa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AssignmentPage;
