// src/features/users/pages/UserDetailPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Table,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./UserDetailPage.css";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  useEffect(() => {
    fetchUserDetail();
    fetchUserActivities();
    fetchUserPermissions();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await userService.getById(id);
      console.log("User detail response:", response);
      console.log("Response data:", response?.data);
      console.log("Response error:", response?.error);
      console.log("Response success:", response?.success);

      if (response && response.success && response.data && response.data.user) {
        // Map is_active từ backend sang status cho frontend
        const userData = {
          ...response.data.user,
          status:
            response.data.user.is_active === 1 ||
            response.data.user.is_active === true
              ? "active"
              : "inactive",
        };
        setUser(userData);
      } else {
        const errorMsg =
          response?.error || "Không thể tải thông tin người dùng";
        console.error("Failed to fetch user:", errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching user detail:", error);
      alert("Có lỗi xảy ra khi tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const response = await userService.getActivities(id);
      if (response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await userService.getUserPermissions(id);
      console.log("Permissions response:", response);
      if (response.success) {
        setPermissions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await userService.delete(id);
        if (response.success) {
          toast.success("Đã xóa người dùng thành công");
          navigate("/users");
        } else {
          toast.error(response.error || "Không thể xóa người dùng");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Có lỗi xảy ra khi xóa người dùng");
      }
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại mật khẩu?")) {
      try {
        const response = await userService.resetPassword(id);
        if (response.success) {
          toast.success("Mật khẩu mới đã được gửi qua email");
        } else {
          toast.error(response.error || "Không thể đặt lại mật khẩu");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        toast.error("Có lỗi xảy ra khi đặt lại mật khẩu");
      }
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "mở khóa" : "khóa";
    const actionPast = newStatus === "active" ? "mở khóa" : "khóa";

    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      try {
        const response = await userService.updateStatus(id, newStatus);
        if (response.success) {
          toast.success(`Đã ${actionPast} tài khoản thành công`);
          fetchUserDetail();
        } else {
          toast.error(response.error || `Không thể ${action} tài khoản`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error(`Có lỗi xảy ra khi ${action} tài khoản`);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { bg: "danger", label: "Quản trị viên", icon: "fa-user-shield" },
      superior_general: {
        bg: "danger",
        label: "Bề trên Tổng quyền",
        icon: "fa-crown",
      },
      superior_provincial: {
        bg: "primary",
        label: "Bề trên Tỉnh",
        icon: "fa-user-tie",
      },
      superior_community: {
        bg: "info",
        label: "Bề trên Cộng đoàn",
        icon: "fa-users",
      },
      secretary: { bg: "success", label: "Thư ký", icon: "fa-user-edit" },
      viewer: { bg: "secondary", label: "Xem", icon: "fa-eye" },
    };
    return roles[role] || { bg: "secondary", label: role, icon: "fa-user" };
  };

  const getStatusBadge = (status) => {
    return status === "active"
      ? { bg: "success", label: "Đang hoạt động", icon: "fa-check-circle" }
      : { bg: "secondary", label: "Đã khóa", icon: "fa-lock" };
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

  if (!user) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Không tìm thấy thông tin người dùng</h3>
          <Button variant="primary" onClick={() => navigate("/users")}>
            Quay lại danh sách
          </Button>
        </div>
      </Container>
    );
  }

  const roleBadge = getRoleBadge(user.role);
  const statusBadge = getStatusBadge(user.status);

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Chi tiết Người dùng"
        items={[{ label: "Người dùng", link: "/users" }, { label: "Chi tiết" }]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleEdit}>
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa
          </Button>
          <Button
            variant={user.status === "active" ? "warning" : "info"}
            onClick={handleToggleStatus}
          >
            <i
              className={`fas fa-${
                user.status === "active" ? "lock" : "unlock"
              } me-2`}
            ></i>
            {user.status === "active" ? "Khóa" : "Mở khóa"}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>
            Xóa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/users")}>
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column - User Info */}
        <Col lg={4}>
          <Card className="user-detail-card">
            <Card.Body className="text-center">
              <div className="user-avatar-large mx-auto mb-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>

              <h4 className="mb-1">{user.full_name}</h4>
              <p className="text-muted mb-3">@{user.username}</p>

              <div className="d-flex gap-2 justify-content-center mb-4">
                <Badge bg={roleBadge.bg} className="px-3 py-2">
                  <i className={`fas ${roleBadge.icon} me-2`}></i>
                  {roleBadge.label}
                </Badge>
                <Badge bg={statusBadge.bg} className="px-3 py-2">
                  <i className={`fas ${statusBadge.icon} me-2`}></i>
                  {statusBadge.label}
                </Badge>
              </div>

              <Button
                variant="outline-primary"
                className="w-100"
                onClick={handleResetPassword}
              >
                <i className="fas fa-key me-2"></i>
                Đặt lại mật khẩu
              </Button>
            </Card.Body>
          </Card>

          {/* Contact Info */}
          <Card className="user-detail-card mt-4">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0 text-white">
                <i className="fas fa-address-card me-2"></i>
                Thông tin liên hệ
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-envelope text-primary me-3"></i>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <div>{user.email}</div>
                    </div>
                  </div>
                </ListGroup.Item>
                {user.phone && (
                  <ListGroup.Item className="px-0">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-phone text-success me-3"></i>
                      <div>
                        <small className="text-muted d-block">Điện thoại</small>
                        <div>{user.phone}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Account Info */}
          <Card className="user-detail-card mt-4">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0 text-white">
                <i className="fas fa-info-circle me-2"></i>
                Thông tin tài khoản
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Ngày tạo</span>
                    <span className="fw-semibold">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Cập nhật</span>
                    <span className="fw-semibold">
                      {formatDate(user.updated_at)}
                    </span>
                  </div>
                </ListGroup.Item>
                {user.last_login && (
                  <ListGroup.Item className="px-0">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Đăng nhập cuối</span>
                      <span className="fw-semibold">
                        {formatDate(user.last_login)}
                      </span>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
              d
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Permissions & Activities */}
        <Col lg={8}>
          {/* Permissions */}
          <Card className="user-detail-card mb-4">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0 text-white">
                <i className="fas fa-shield-alt me-2"></i>
                Quyền hạn
              </h5>
            </Card.Header>
            <Card.Body>
              {loadingPermissions ? (
                <div className="text-center py-3">
                  <LoadingSpinner size="small" />
                </div>
              ) : permissions && permissions.length > 0 ? (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <Row className="g-3">
                    {permissions.map((permission, index) => (
                      <Col key={index} md={6}>
                        <div className="permission-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span>
                            {permission.module_name ? (
                              <>
                                <strong>{permission.module_name}:</strong>{" "}
                                {permission.name || permission.permission_name}
                              </>
                            ) : (
                              permission.name || permission.permission_name
                            )}
                          </span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-info-circle me-2"></i>
                  Chưa có quyền hạn được gán
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Statistics */}
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="stat-card-small">
                <Card.Body>
                  <div className="stat-icon-small bg-primary">
                    <i className="fas fa-sign-in-alt"></i>
                  </div>
                  <div className="stat-info-small">
                    <div className="stat-label-small">Số lần đăng nhập</div>
                    <div className="stat-value-small">
                      {user.login_count || 0}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card-small">
                <Card.Body>
                  <div className="stat-icon-small bg-success">
                    <i className="fas fa-tasks"></i>
                  </div>
                  <div className="stat-info-small">
                    <div className="stat-label-small">Hoạt động</div>
                    <div className="stat-value-small">{activities.length}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stat-card-small">
                <Card.Body>
                  <div className="stat-icon-small bg-info">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info-small">
                    <div className="stat-label-small">Thời gian online</div>
                    <div className="stat-value-small">
                      {user.online_time || "0h"}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Activity Log */}
          <Card className="user-detail-card">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0 text-white">
                <i className="fas fa-history me-2"></i>
                Lịch sử hoạt động
              </h5>
            </Card.Header>
            <Card.Body>
              {activities.length > 0 ? (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <div className="table-responsive">
                    <Table hover className="activity-table">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Hoạt động</th>
                          <th>Chi tiết</th>
                          <th>IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity) => (
                          <tr key={activity.id}>
                            <td>{formatDate(activity.created_at)}</td>
                            <td>
                              <Badge bg={getActivityBadge(activity.action).bg}>
                                {activity.action_label}
                              </Badge>
                            </td>
                            <td>{activity.description}</td>
                            <td>
                              <code>{activity.ip_address}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i
                    className="fas fa-history mb-3"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="mb-0">Chưa có hoạt động nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Helper function
const getActivityBadge = (action) => {
  const badges = {
    login: { bg: "success" },
    logout: { bg: "secondary" },
    create: { bg: "primary" },
    update: { bg: "info" },
    delete: { bg: "danger" },
  };
  return badges[action] || { bg: "secondary" };
};

export default UserDetailPage;
