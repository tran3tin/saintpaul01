// src/features/users/pages/PermissionsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Form,
} from "react-bootstrap";
import { useAuth } from "@context/AuthContext";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./PermissionsPage.css";

// Note: System uses pure permission-based access control
// All users (including admins) must be granted specific permissions

// Available permissions grouped by module - ordered by sidebar menu
const AVAILABLE_PERMISSIONS = [
  // ===== THÔNG TIN (Bài đăng) =====
  {
    key: "posts.view",
    name: "Xem bài đăng",
    module: "Thông Tin",
    icon: "newspaper",
  },
  {
    key: "posts.create",
    name: "Tạo bài đăng mới",
    module: "Thông Tin",
    icon: "plus-circle",
  },
  {
    key: "posts.update",
    name: "Chỉnh sửa bài đăng",
    module: "Thông Tin",
    icon: "edit",
  },
  {
    key: "posts.delete",
    name: "Xóa bài đăng",
    module: "Thông Tin",
    icon: "trash",
  },

  // ===== QUẢN LÝ NỮ TU =====
  {
    key: "sisters_view",
    name: "Xem danh sách nữ tu",
    module: "Quản lý Nữ Tu",
    icon: "users",
  },
  {
    key: "sisters_create",
    name: "Thêm nữ tu mới",
    module: "Quản lý Nữ Tu",
    icon: "user-plus",
  },
  {
    key: "sisters_edit",
    name: "Chỉnh sửa thông tin nữ tu",
    module: "Quản lý Nữ Tu",
    icon: "user-edit",
  },
  {
    key: "sisters_delete",
    name: "Xóa nữ tu",
    module: "Quản lý Nữ Tu",
    icon: "user-minus",
  },
  {
    key: "sisters_export",
    name: "Xuất dữ liệu nữ tu",
    module: "Quản lý Nữ Tu",
    icon: "file-export",
  },

  // ===== HÀNH TRÌNH ƠN GỌI =====
  {
    key: "journey_view",
    name: "Xem hành trình ơn gọi",
    module: "Hành trình Ơn Gọi",
    icon: "route",
  },
  {
    key: "journey_create",
    name: "Thêm giai đoạn mới",
    module: "Hành trình Ơn Gọi",
    icon: "plus-circle",
  },
  {
    key: "journey_edit",
    name: "Chỉnh sửa hành trình",
    module: "Hành trình Ơn Gọi",
    icon: "edit",
  },
  {
    key: "journey_delete",
    name: "Xóa giai đoạn",
    module: "Hành trình Ơn Gọi",
    icon: "trash",
  },

  // ===== QUẢN LÝ CỘNG ĐOÀN =====
  {
    key: "communities.view",
    name: "Xem danh sách cộng đoàn",
    module: "Quản lý Cộng Đoàn",
    icon: "building",
  },
  {
    key: "communities.create",
    name: "Thêm cộng đoàn mới",
    module: "Quản lý Cộng Đoàn",
    icon: "plus",
  },
  {
    key: "communities.edit",
    name: "Chỉnh sửa cộng đoàn",
    module: "Quản lý Cộng Đoàn",
    icon: "edit",
  },
  {
    key: "communities.delete",
    name: "Xóa cộng đoàn",
    module: "Quản lý Cộng Đoàn",
    icon: "trash",
  },
  {
    key: "communities.assign",
    name: "Phân công nữ tu",
    module: "Quản lý Cộng Đoàn",
    icon: "user-check",
  },
  {
    key: "communities.history_view",
    name: "Xem lịch sử hình thành",
    module: "Quản lý Cộng Đoàn",
    icon: "book",
  },
  {
    key: "communities.history_edit",
    name: "Chỉnh sửa lịch sử hình thành",
    module: "Quản lý Cộng Đoàn",
    icon: "book-open",
  },

  // ===== HỌC VẤN =====
  {
    key: "education_view",
    name: "Xem thông tin học vấn",
    module: "Học Vấn",
    icon: "graduation-cap",
  },
  {
    key: "education_create",
    name: "Thêm bằng cấp",
    module: "Học Vấn",
    icon: "plus",
  },
  {
    key: "education_edit",
    name: "Chỉnh sửa học vấn",
    module: "Học Vấn",
    icon: "edit",
  },
  {
    key: "education_delete",
    name: "Xóa bằng cấp",
    module: "Học Vấn",
    icon: "trash",
  },

  // ===== SỨ VỤ =====
  {
    key: "mission_view",
    name: "Xem sứ vụ",
    module: "Sứ Vụ",
    icon: "briefcase",
  },
  {
    key: "mission_create",
    name: "Tạo sứ vụ mới",
    module: "Sứ Vụ",
    icon: "plus",
  },
  {
    key: "mission_edit",
    name: "Chỉnh sửa sứ vụ",
    module: "Sứ Vụ",
    icon: "edit",
  },
  {
    key: "mission_assign",
    name: "Phân công sứ vụ",
    module: "Sứ Vụ",
    icon: "user-tag",
  },

  // ===== SỨC KHỎE =====
  {
    key: "health_view",
    name: "Xem hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "heartbeat",
  },
  {
    key: "health_create",
    name: "Thêm hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "notes-medical",
  },
  {
    key: "health_edit",
    name: "Chỉnh sửa hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "edit",
  },
  {
    key: "health_delete",
    name: "Xóa hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "trash",
  },

  // ===== ĐÁNH GIÁ =====
  {
    key: "evaluation_view",
    name: "Xem đánh giá",
    module: "Đánh Giá",
    icon: "star",
  },
  {
    key: "evaluation_create",
    name: "Tạo đánh giá mới",
    module: "Đánh Giá",
    icon: "star-half-alt",
  },
  {
    key: "evaluation_edit",
    name: "Chỉnh sửa đánh giá",
    module: "Đánh Giá",
    icon: "edit",
  },
  {
    key: "evaluation_approve",
    name: "Phê duyệt đánh giá",
    module: "Đánh Giá",
    icon: "check-circle",
  },

  // ===== BÁO CÁO & THỐNG KÊ =====
  {
    key: "report_view",
    name: "Xem báo cáo",
    module: "Báo Cáo & Thống Kê",
    icon: "chart-bar",
  },
  {
    key: "report_create",
    name: "Tạo báo cáo mới",
    module: "Báo Cáo & Thống Kê",
    icon: "file-alt",
  },
  {
    key: "report_export",
    name: "Xuất báo cáo",
    module: "Báo Cáo & Thống Kê",
    icon: "file-export",
  },
  {
    key: "report_print",
    name: "In báo cáo",
    module: "Báo Cáo & Thống Kê",
    icon: "print",
  },

  // ===== QUẢN LÝ NGƯỜI DÙNG =====
  {
    key: "users_view",
    name: "Xem danh sách người dùng",
    module: "Quản lý Người Dùng",
    icon: "users-cog",
  },
  {
    key: "users_create",
    name: "Tạo tài khoản mới",
    module: "Quản lý Người Dùng",
    icon: "user-plus",
  },
  {
    key: "users_edit",
    name: "Chỉnh sửa người dùng",
    module: "Quản lý Người Dùng",
    icon: "user-edit",
  },
  {
    key: "users_delete",
    name: "Xóa người dùng",
    module: "Quản lý Người Dùng",
    icon: "user-times",
  },
  {
    key: "users_manage",
    name: "Quản lý người dùng",
    module: "Quản lý Người Dùng",
    icon: "shield-alt",
  },
  {
    key: "permissions_manage",
    name: "Quản lý phân quyền",
    module: "Quản lý Người Dùng",
    icon: "key",
  },

  // ===== CÀI ĐẶT HỆ THỐNG =====
  {
    key: "settings_view",
    name: "Xem cài đặt",
    module: "Cài đặt Hệ thống",
    icon: "cog",
  },
  {
    key: "settings_edit",
    name: "Thay đổi cài đặt",
    module: "Cài đặt Hệ thống",
    icon: "cogs",
  },
  {
    key: "settings_backup",
    name: "Sao lưu & khôi phục",
    module: "Cài đặt Hệ thống",
    icon: "database",
  },
  {
    key: "settings_audit",
    name: "Xem nhật ký hoạt động",
    module: "Cài đặt Hệ thống",
    icon: "history",
  },
];

const PermissionsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Get current user's permissions
  const userPermissions = user?.permissions || [];

  // Check if current user has a specific permission
  const hasPermission = (permissionKey) => {
    return userPermissions.includes(permissionKey);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Group permissions by module
  const permissionsByModule = AVAILABLE_PERMISSIONS.reduce(
    (acc, permission) => {
      const module = permission.module || "Khác";
      if (!acc[module]) acc[module] = [];
      acc[module].push(permission);
      return acc;
    },
    {}
  );

  // Count user's permissions per module
  const getModulePermissionCount = (module) => {
    const permissions = permissionsByModule[module] || [];
    return permissions.filter((p) => hasPermission(p.key)).length;
  };

  const getModuleIcon = (module) => {
    const icons = {
      "Thông Tin": "newspaper",
      "Quản lý Nữ Tu": "users",
      "Hành trình Ơn Gọi": "route",
      "Quản lý Cộng Đoàn": "building",
      "Học Vấn": "graduation-cap",
      "Sứ Vụ": "briefcase",
      "Sức Khỏe": "heartbeat",
      "Đánh Giá": "star",
      "Báo Cáo & Thống Kê": "chart-bar",
      "Quản lý Người Dùng": "user-shield",
      "Cài đặt Hệ thống": "cog",
    };
    return icons[module] || "folder";
  };

  const getModuleBadge = (module) => {
    const colors = {
      "Thông Tin": "info",
      "Quản lý Nữ Tu": "primary",
      "Hành trình Ơn Gọi": "success",
      "Quản lý Cộng Đoàn": "warning",
      "Học Vấn": "secondary",
      "Sứ Vụ": "dark",
      "Sức Khỏe": "danger",
      "Đánh Giá": "warning",
      "Báo Cáo & Thống Kê": "info",
      "Quản lý Người Dùng": "danger",
      "Cài đặt Hệ thống": "secondary",
    };
    return colors[module] || "light";
  };

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Thông tin Phân quyền"
        items={[
          { label: "Người dùng", link: "/users" },
          { label: "Phân quyền" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-shield-alt me-2"></i>
            Tham khảo Quyền hạn
          </h4>
          <p className="text-muted mb-0">
            Danh sách các quyền có sẵn trong hệ thống
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-start">
          <i className="fas fa-info-circle me-3 mt-1 fs-4"></i>
          <div>
            <h6 className="mb-2">Quyền hạn của bạn</h6>
            <p className="mb-2">
              Xin chào <strong>{user?.full_name || user?.username}</strong>! Bạn
              đang có <Badge bg="primary">{userPermissions.length}</Badge> quyền
              trong hệ thống.
            </p>
            <ul className="mb-0 small">
              <li>
                <i className="fas fa-check-circle text-success me-1"></i>
                <strong>Tick xanh:</strong> Quyền bạn đang được cấp
              </li>
              <li>
                <i className="fas fa-times-circle text-danger me-1"></i>
                <strong>Không tick:</strong> Quyền bạn chưa được cấp
              </li>
              <li>Liên hệ quản trị viên nếu cần thêm quyền hạn</li>
            </ul>
          </div>
        </div>
      </Alert>

      {/* Permissions by Module */}
      <Row className="g-4">
        {Object.entries(permissionsByModule).map(([module, permissions]) => (
          <Col key={module} md={6} lg={4}>
            <Card className="h-100">
              <Card.Header className="bg-white">
                <div className="d-flex align-items-center">
                  <i
                    className={`fas fa-${getModuleIcon(
                      module
                    )} me-2 text-${getModuleBadge(module)}`}
                  ></i>
                  <h6 className="mb-0">{module}</h6>
                  <Badge
                    bg={
                      getModulePermissionCount(module) === permissions.length
                        ? "success"
                        : getModulePermissionCount(module) > 0
                        ? "warning"
                        : "secondary"
                    }
                    className="ms-auto"
                  >
                    {getModulePermissionCount(module)}/{permissions.length}{" "}
                    quyền
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table size="sm" className="mb-0" hover>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr
                        key={permission.key}
                        className={
                          hasPermission(permission.key) ? "table-success" : ""
                        }
                      >
                        <td className="py-2 px-3">
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={hasPermission(permission.key)}
                              disabled
                              className="me-2"
                              style={{ pointerEvents: "none" }}
                            />
                            <i
                              className={`fas fa-${permission.icon} me-2 ${
                                hasPermission(permission.key)
                                  ? "text-success"
                                  : "text-muted"
                              }`}
                              style={{ width: 20 }}
                            ></i>
                            <div>
                              <div
                                className={`fw-medium ${
                                  hasPermission(permission.key)
                                    ? "text-success"
                                    : ""
                                }`}
                              >
                                {permission.name}
                              </div>
                              <small className="text-muted font-monospace">
                                {permission.key}
                              </small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Additional Info */}
      <Card className="mt-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="fas fa-lightbulb me-2 text-warning"></i>
            Hướng dẫn phân quyền
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card className="h-100 border-success">
                <Card.Body>
                  <h6 className="text-success mb-3">
                    <i className="fas fa-check-circle me-2"></i>
                    Ưu điểm của Permission-Based
                  </h6>
                  <ul className="small mb-0">
                    <li>Phân quyền chi tiết cho từng chức năng cụ thể</li>
                    <li>Linh hoạt - không bị giới hạn bởi vai trò cố định</li>
                    <li>Dễ dàng thêm/bớt quyền cho người dùng</li>
                    <li>Có thể tạo bộ quyền tùy chỉnh cho từng người</li>
                    <li>Dễ dàng mở rộng khi có chức năng mới</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-primary">
                <Card.Body>
                  <h6 className="text-primary mb-3">
                    <i className="fas fa-user-cog me-2"></i>
                    Cách gán quyền
                  </h6>
                  <ul className="small mb-0">
                    <li>
                      Vào trang <strong>Quản lý Người dùng</strong>
                    </li>
                    <li>Chọn người dùng cần gán quyền</li>
                    <li>
                      Nhấn nút <strong>Chỉnh sửa</strong>
                    </li>
                    <li>
                      Chọn các quyền cần gán trong phần{" "}
                      <strong>Phân quyền</strong>
                    </li>
                    <li>
                      Nhấn <strong>Lưu</strong> để áp dụng
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-4 border-info">
        <Card.Body>
          <h6 className="mb-3">
            <i className="fas fa-bolt me-2"></i>
            Thao tác nhanh
          </h6>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/users")}
            >
              <i className="fas fa-users me-2"></i>
              Quản lý Người dùng
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => (window.location.href = "/users/create")}
            >
              <i className="fas fa-user-plus me-2"></i>
              Tạo người dùng mới
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PermissionsPage;
