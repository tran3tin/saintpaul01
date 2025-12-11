// src/features/users/pages/PermissionsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "@context/AuthContext";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./PermissionsPage.css";

// Mock data for roles
const MOCK_ROLES = [
  {
    id: 1,
    key: "admin",
    name: "Quản trị viên",
    description: "Toàn quyền quản lý hệ thống",
    user_count: 2,
  },
  {
    id: 2,
    key: "be_tren_tong",
    name: "Bề Trên Tổng",
    description: "Quản lý toàn bộ Hội Dòng",
    user_count: 1,
  },
  {
    id: 3,
    key: "thu_ky",
    name: "Thư ký",
    description: "Hỗ trợ quản lý hồ sơ và báo cáo",
    user_count: 3,
  },
  {
    id: 4,
    key: "be_tren_cong_doan",
    name: "Bề Trên Cộng Đoàn",
    description: "Quản lý cộng đoàn được phân công",
    user_count: 8,
  },
];

// Mock data for permissions grouped by module
const MOCK_PERMISSIONS = [
  // Nữ tu
  {
    id: 1,
    key: "sisters.view",
    name: "Xem danh sách nữ tu",
    module: "Nữ Tu",
    icon: "users",
  },
  {
    id: 2,
    key: "sisters.create",
    name: "Thêm nữ tu mới",
    module: "Nữ Tu",
    icon: "user-plus",
  },
  {
    id: 3,
    key: "sisters.edit",
    name: "Chỉnh sửa thông tin nữ tu",
    module: "Nữ Tu",
    icon: "user-edit",
  },
  {
    id: 4,
    key: "sisters.delete",
    name: "Xóa nữ tu",
    module: "Nữ Tu",
    icon: "user-minus",
  },
  {
    id: 5,
    key: "sisters.export",
    name: "Xuất dữ liệu nữ tu",
    module: "Nữ Tu",
    icon: "file-export",
  },

  // Hành trình
  {
    id: 6,
    key: "journey.view",
    name: "Xem hành trình ơn gọi",
    module: "Hành Trình",
    icon: "route",
  },
  {
    id: 7,
    key: "journey.create",
    name: "Thêm giai đoạn mới",
    module: "Hành Trình",
    icon: "plus-circle",
  },
  {
    id: 8,
    key: "journey.edit",
    name: "Chỉnh sửa hành trình",
    module: "Hành Trình",
    icon: "edit",
  },
  {
    id: 9,
    key: "journey.delete",
    name: "Xóa giai đoạn",
    module: "Hành Trình",
    icon: "trash",
  },

  // Cộng đoàn
  {
    id: 10,
    key: "community.view",
    name: "Xem danh sách cộng đoàn",
    module: "Cộng Đoàn",
    icon: "building",
  },
  {
    id: 11,
    key: "community.create",
    name: "Thêm cộng đoàn mới",
    module: "Cộng Đoàn",
    icon: "plus",
  },
  {
    id: 12,
    key: "community.edit",
    name: "Chỉnh sửa cộng đoàn",
    module: "Cộng Đoàn",
    icon: "edit",
  },
  {
    id: 13,
    key: "community.delete",
    name: "Xóa cộng đoàn",
    module: "Cộng Đoàn",
    icon: "trash",
  },
  {
    id: 14,
    key: "community.assign",
    name: "Phân công nữ tu",
    module: "Cộng Đoàn",
    icon: "user-check",
  },

  // Sức khỏe
  {
    id: 15,
    key: "health.view",
    name: "Xem hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "heartbeat",
  },
  {
    id: 16,
    key: "health.create",
    name: "Thêm hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "notes-medical",
  },
  {
    id: 17,
    key: "health.edit",
    name: "Chỉnh sửa hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "edit",
  },
  {
    id: 18,
    key: "health.delete",
    name: "Xóa hồ sơ sức khỏe",
    module: "Sức Khỏe",
    icon: "trash",
  },

  // Đánh giá
  {
    id: 19,
    key: "evaluation.view",
    name: "Xem đánh giá",
    module: "Đánh Giá",
    icon: "star",
  },
  {
    id: 20,
    key: "evaluation.create",
    name: "Tạo đánh giá mới",
    module: "Đánh Giá",
    icon: "star-half-alt",
  },
  {
    id: 21,
    key: "evaluation.edit",
    name: "Chỉnh sửa đánh giá",
    module: "Đánh Giá",
    icon: "edit",
  },
  {
    id: 22,
    key: "evaluation.approve",
    name: "Phê duyệt đánh giá",
    module: "Đánh Giá",
    icon: "check-circle",
  },

  // Học vấn
  {
    id: 23,
    key: "education.view",
    name: "Xem thông tin học vấn",
    module: "Học Vấn",
    icon: "graduation-cap",
  },
  {
    id: 24,
    key: "education.create",
    name: "Thêm bằng cấp",
    module: "Học Vấn",
    icon: "plus",
  },
  {
    id: 25,
    key: "education.edit",
    name: "Chỉnh sửa học vấn",
    module: "Học Vấn",
    icon: "edit",
  },
  {
    id: 26,
    key: "education.delete",
    name: "Xóa bằng cấp",
    module: "Học Vấn",
    icon: "trash",
  },

  // Sứ vụ
  {
    id: 27,
    key: "mission.view",
    name: "Xem sứ vụ",
    module: "Sứ Vụ",
    icon: "briefcase",
  },
  {
    id: 28,
    key: "mission.create",
    name: "Tạo sứ vụ mới",
    module: "Sứ Vụ",
    icon: "plus",
  },
  {
    id: 29,
    key: "mission.edit",
    name: "Chỉnh sửa sứ vụ",
    module: "Sứ Vụ",
    icon: "edit",
  },
  {
    id: 30,
    key: "mission.assign",
    name: "Phân công sứ vụ",
    module: "Sứ Vụ",
    icon: "user-tag",
  },

  // Báo cáo
  {
    id: 31,
    key: "report.view",
    name: "Xem báo cáo",
    module: "Báo Cáo",
    icon: "chart-bar",
  },
  {
    id: 32,
    key: "report.create",
    name: "Tạo báo cáo mới",
    module: "Báo Cáo",
    icon: "file-alt",
  },
  {
    id: 33,
    key: "report.export",
    name: "Xuất báo cáo",
    module: "Báo Cáo",
    icon: "file-export",
  },
  {
    id: 34,
    key: "report.print",
    name: "In báo cáo",
    module: "Báo Cáo",
    icon: "print",
  },

  // Người dùng
  {
    id: 35,
    key: "users.view",
    name: "Xem danh sách người dùng",
    module: "Người Dùng",
    icon: "users-cog",
  },
  {
    id: 36,
    key: "users.create",
    name: "Tạo tài khoản mới",
    module: "Người Dùng",
    icon: "user-plus",
  },
  {
    id: 37,
    key: "users.edit",
    name: "Chỉnh sửa người dùng",
    module: "Người Dùng",
    icon: "user-edit",
  },
  {
    id: 38,
    key: "users.delete",
    name: "Xóa người dùng",
    module: "Người Dùng",
    icon: "user-times",
  },
  {
    id: 39,
    key: "users.permissions",
    name: "Quản lý phân quyền",
    module: "Người Dùng",
    icon: "shield-alt",
  },

  // Cài đặt
  {
    id: 40,
    key: "settings.view",
    name: "Xem cài đặt",
    module: "Cài Đặt",
    icon: "cog",
  },
  {
    id: 41,
    key: "settings.edit",
    name: "Thay đổi cài đặt",
    module: "Cài Đặt",
    icon: "cogs",
  },
  {
    id: 42,
    key: "settings.backup",
    name: "Sao lưu & khôi phục",
    module: "Cài Đặt",
    icon: "database",
  },
  {
    id: 43,
    key: "settings.audit",
    name: "Xem nhật ký hoạt động",
    module: "Cài Đặt",
    icon: "history",
  },
];

// Initial role permissions mapping
const INITIAL_ROLE_PERMISSIONS = {
  1: MOCK_PERMISSIONS.map((p) => p.id), // Admin has all
  2: [
    1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 40,
  ], // Bề Trên Tổng
  3: [1, 5, 6, 10, 15, 19, 23, 27, 31, 32, 33, 34], // Thư ký
  4: [1, 6, 10, 14, 15, 16, 17, 19, 20, 21, 23, 27, 31], // Bề Trên Cộng Đoàn
};

const PermissionsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [roles] = useState(MOCK_ROLES);
  const [permissions] = useState(MOCK_PERMISSIONS);
  const [rolePermissions, setRolePermissions] = useState(
    INITIAL_ROLE_PERMISSIONS
  );
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePermissionChange = (roleId, permissionId, checked) => {
    // Don't allow changing admin permissions
    if (roleId === 1) return;

    setRolePermissions((prev) => {
      const currentPermissions = prev[roleId] || [];
      let newPermissions;

      if (checked) {
        newPermissions = [...currentPermissions, permissionId];
      } else {
        newPermissions = currentPermissions.filter((id) => id !== permissionId);
      }

      return {
        ...prev,
        [roleId]: newPermissions,
      };
    });
  };

  const handleSelectAll = (roleId, modulePermissions, checked) => {
    if (roleId === 1) return;

    setRolePermissions((prev) => {
      const currentPermissions = prev[roleId] || [];
      const modulePermissionIds = modulePermissions.map((p) => p.id);

      let newPermissions;
      if (checked) {
        // Add all module permissions
        newPermissions = [
          ...new Set([...currentPermissions, ...modulePermissionIds]),
        ];
      } else {
        // Remove all module permissions
        newPermissions = currentPermissions.filter(
          (id) => !modulePermissionIds.includes(id)
        );
      }

      return {
        ...prev,
        [roleId]: newPermissions,
      };
    });
  };

  const hasPermission = (roleId, permissionId) => {
    return rolePermissions[roleId]?.includes(permissionId) || false;
  };

  const hasAllModulePermissions = (roleId, modulePermissions) => {
    const rolePerms = rolePermissions[roleId] || [];
    return modulePermissions.every((p) => rolePerms.includes(p.id));
  };

  const hasSomeModulePermissions = (roleId, modulePermissions) => {
    const rolePerms = rolePermissions[roleId] || [];
    return modulePermissions.some((p) => rolePerms.includes(p.id));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage for persistence
      localStorage.setItem("rolePermissions", JSON.stringify(rolePermissions));

      setSuccess("Lưu phân quyền thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu phân quyền");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "danger",
      be_tren_tong: "primary",
      thu_ky: "info",
      be_tren_cong_doan: "success",
    };
    return badges[role] || "secondary";
  };

  const getPermissionCount = (roleId) => {
    return rolePermissions[roleId]?.length || 0;
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

  // Check if current user is admin
  if (!user?.isAdmin && !user?.is_admin) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể
          quản lý phân quyền.
        </Alert>
      </Container>
    );
  }

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    const module = permission.module || "Khác";
    if (!acc[module]) acc[module] = [];
    acc[module].push(permission);
    return acc;
  }, {});

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Quản lý Phân quyền"
        items={[
          { label: "Người dùng", link: "/users" },
          { label: "Phân quyền" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="me-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      {/* Alerts */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Roles Overview */}
      <Row className="g-3 mb-4">
        {roles.map((role) => (
          <Col key={role.id} md={6} lg={3}>
            <Card
              className={`role-card h-100 ${
                selectedRole === role.id ? "border-primary" : ""
              }`}
              onClick={() =>
                setSelectedRole(selectedRole === role.id ? null : role.id)
              }
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Badge bg={getRoleBadge(role.key)} className="px-3 py-2">
                    {role.name}
                  </Badge>
                  <span className="text-muted small">
                    <i className="fas fa-users me-1"></i>
                    {role.user_count}
                  </span>
                </div>
                <p className="text-muted mb-2 small">{role.description}</p>
                <div className="d-flex align-items-center">
                  <div
                    className="progress flex-grow-1"
                    style={{ height: "6px" }}
                  >
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${
                          (getPermissionCount(role.id) / permissions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <small className="ms-2 text-muted">
                    {getPermissionCount(role.id)}/{permissions.length}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Permissions Matrix */}
      <Card className="permissions-card">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-table me-2"></i>
            Ma trận phân quyền
          </h5>
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Tick chọn để cấp quyền, bỏ tick để thu hồi quyền
          </small>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="permissions-table mb-0" hover>
              <thead>
                <tr>
                  <th className="module-column">Module / Quyền</th>
                  {roles.map((role) => (
                    <th key={role.id} className="text-center role-column">
                      <Badge bg={getRoleBadge(role.key)}>{role.name}</Badge>
                      {role.key === "admin" && (
                        <div className="small text-muted mt-1">
                          <i className="fas fa-lock"></i> Toàn quyền
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionsByModule).map(
                  ([module, modulePermissions]) => (
                    <React.Fragment key={module}>
                      {/* Module Header Row with Select All */}
                      <tr className="module-row">
                        <td>
                          <strong>
                            <i className="fas fa-folder-open me-2 text-warning"></i>
                            {module}
                          </strong>
                          <span className="text-muted small ms-2">
                            ({modulePermissions.length} quyền)
                          </span>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center">
                            {role.key !== "admin" && (
                              <Form.Check
                                type="checkbox"
                                checked={hasAllModulePermissions(
                                  role.id,
                                  modulePermissions
                                )}
                                ref={(el) => {
                                  if (el) {
                                    el.indeterminate =
                                      hasSomeModulePermissions(
                                        role.id,
                                        modulePermissions
                                      ) &&
                                      !hasAllModulePermissions(
                                        role.id,
                                        modulePermissions
                                      );
                                  }
                                }}
                                onChange={(e) =>
                                  handleSelectAll(
                                    role.id,
                                    modulePermissions,
                                    e.target.checked
                                  )
                                }
                                title={`Chọn tất cả quyền ${module}`}
                                className="module-checkbox"
                              />
                            )}
                            {role.key === "admin" && (
                              <i className="fas fa-check-circle text-success"></i>
                            )}
                          </td>
                        ))}
                      </tr>
                      {/* Permission Rows */}
                      {modulePermissions.map((permission) => (
                        <tr key={permission.id}>
                          <td className="permission-name ps-4">
                            <div className="d-flex align-items-center">
                              <i
                                className={`fas fa-${
                                  permission.icon || "key"
                                } text-muted me-2`}
                                style={{ width: "20px" }}
                              ></i>
                              <span>{permission.name}</span>
                            </div>
                          </td>
                          {roles.map((role) => (
                            <td key={role.id} className="text-center">
                              <Form.Check
                                type="checkbox"
                                checked={hasPermission(role.id, permission.id)}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    role.id,
                                    permission.id,
                                    e.target.checked
                                  )
                                }
                                disabled={role.key === "admin"}
                                className="permission-checkbox"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Info Alert */}
      <Card className="mt-4 border-info">
        <Card.Body>
          <div className="d-flex align-items-start">
            <i className="fas fa-info-circle text-info me-3 mt-1 fs-4"></i>
            <div>
              <h6 className="mb-2">Hướng dẫn phân quyền</h6>
              <Row>
                <Col md={6}>
                  <ul className="mb-0 small">
                    <li>
                      <strong>Quản trị viên (Admin):</strong> Có toàn quyền,
                      không thể thay đổi
                    </li>
                    <li>
                      <strong>Bề Trên Tổng:</strong> Quản lý toàn bộ Hội Dòng
                    </li>
                    <li>
                      <strong>Thư ký:</strong> Hỗ trợ báo cáo và hồ sơ
                    </li>
                    <li>
                      <strong>Bề Trên Cộng Đoàn:</strong> Quản lý cộng đoàn được
                      phân công
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="mb-0 small">
                    <li>Tick vào ô checkbox để cấp quyền</li>
                    <li>Bỏ tick để thu hồi quyền</li>
                    <li>
                      Nhấn <strong>Lưu thay đổi</strong> sau khi chỉnh sửa
                    </li>
                    <li>Người dùng cần đăng nhập lại để nhận quyền mới</li>
                  </ul>
                </Col>
              </Row>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PermissionsPage;
