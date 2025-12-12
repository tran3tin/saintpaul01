// src/features/users/pages/UserListPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Table,
  Badge,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "@services";
import { useTable, useDebounce } from "@hooks";
import { UserForm, UserFilter } from "../components";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import StatsCards from "@components/common/StatsCards";
import SearchFilterBar from "@components/common/SearchFilterBar";
import { formatDate } from "@utils";
import "./UserListPage.css";

const UserListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.sortBy, table.sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = table.getTableParams();
      console.log("Fetching users with params:", params);
      const response = await userService.getList(params);
      console.log("User service response:", response);

      if (response.success) {
        setUsers(response.data.items || []);
        table.setTotalItems(response.data.total || 0);
      } else {
        console.error("Failed to fetch users:", response.error);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleView = (user) => {
    navigate(`/users/${user.id}`);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.full_name}?`)
    ) {
      try {
        const response = await userService.delete(user.id);
        if (response.success) {
          toast.success(response.message || "Đã xóa người dùng thành công");
          fetchUsers();
        } else {
          toast.error(response.error || "Không thể xóa người dùng");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Có lỗi xảy ra khi xóa người dùng");
      }
    }
  };

  const handleResetPassword = (user) => {
    setResetPasswordUser(user);
    setShowResetPassword(true);
  };

  const handleConfirmResetPassword = async () => {
    try {
      const response = await userService.resetPassword(resetPasswordUser.id);
      setShowResetPassword(false);
      setResetPasswordUser(null);
      if (response.success) {
        toast.success("Mật khẩu mới đã được gửi qua email");
      } else {
        toast.error(response.error || "Không thể đặt lại mật khẩu");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Có lỗi xảy ra khi đặt lại mật khẩu");
    }
  };

  const handleSubmit = async (values) => {
    try {
      let response;
      if (selectedUser) {
        response = await userService.update(selectedUser.id, values);
        if (response.success) {
          toast.success("Cập nhật người dùng thành công!");
        } else {
          toast.error(response.error || "Không thể cập nhật người dùng");
        }
      } else {
        response = await userService.create(values);
        if (response.success) {
          toast.success("Tạo người dùng thành công!");
        } else {
          toast.error(response.error || "Không thể tạo người dùng");
        }
      }
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Có lỗi xảy ra khi lưu người dùng");
    }
  };

  const activeUsers = (users || []).filter(
    (u) => u.is_active === 1 || u.is_active === true
  );
  const inactiveUsers = (users || []).filter(
    (u) => u.is_active === 0 || u.is_active === false
  );

  const handleSort = (key) => {
    table.handleSort(key);
  };

  const renderSortIcon = (key) => {
    if (table.sortBy !== key)
      return <i className="fas fa-sort text-muted ms-1"></i>;
    return table.sortOrder === "asc" ? (
      <i className="fas fa-sort-up ms-1"></i>
    ) : (
      <i className="fas fa-sort-down ms-1"></i>
    );
  };

  const sortedUsers = useMemo(() => {
    const items = [...(users || [])];

    const getValue = (item) => {
      switch (table.sortBy) {
        case "full_name":
          return item.full_name || "";
        case "username":
          return item.username || "";
        case "email":
          return item.email || "";
        case "status":
          return item.status || "";
        case "created_at":
          return item.created_at ? new Date(item.created_at).getTime() : 0;
        default:
          return item.full_name || "";
      }
    };

    items.sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === "number" && typeof bVal === "number") {
        return table.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return table.sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return items;
  }, [users, table.sortBy, table.sortOrder]);

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
      {/* Breadcrumb */}
      <Breadcrumb
        title="Quản lý Người dùng"
        items={[{ label: "Quản lý Người dùng" }]}
      />

      {/* Statistics */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">{(users || []).length}</h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-users"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đang hoạt động</small>
                  <h4 className="mb-0">{activeUsers.length}</h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-user-check"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={4}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đã khóa</small>
                  <h4 className="mb-0">{inactiveUsers.length}</h4>
                </div>
                <div className="stat-icon bg-secondary">
                  <i className="fas fa-user-lock"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
      <Card className="mb-4 shadow-sm border-0 rounded-3">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tên, email, tên đăng nhập..."
                  value={table.searchTerm}
                  onChange={(e) => table.handleSearch(e.target.value)}
                  size="lg"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={table.filters?.is_active || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      is_active: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  <option value="1">Đang hoạt động</option>
                  <option value="0">Đã khóa</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button
                variant="outline-secondary"
                className="w-100"
                size="lg"
                onClick={() => {
                  table.handleSearch("");
                  table.clearFilters();
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content */}
      <Card
        className="shadow-sm border-0 rounded-3"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <Card.Body className="p-0">
          {(users || []).length === 0 ? (
            <div className="text-center py-5">
              <i
                className="fas fa-users text-muted mb-3"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5>Chưa có người dùng</h5>
              <p className="text-muted">Thêm người dùng đầu tiên để bắt đầu</p>
              <Button variant="primary" onClick={handleAdd}>
                <i className="fas fa-plus me-2"></i>
                Thêm Người dùng
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-nowrap">#</th>
                      <th
                        role="button"
                        onClick={() => handleSort("full_name")}
                        className="text-nowrap"
                      >
                        Họ và tên {renderSortIcon("full_name")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("username")}
                        className="text-nowrap"
                      >
                        Tên đăng nhập {renderSortIcon("username")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("email")}
                        className="text-nowrap"
                      >
                        Email {renderSortIcon("email")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("status")}
                        className="text-nowrap"
                      >
                        Trạng thái {renderSortIcon("status")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("created_at")}
                        className="text-nowrap"
                      >
                        Ngày tạo {renderSortIcon("created_at")}
                      </th>
                      <th className="text-end text-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user, index) => {
                      const isActive =
                        user.is_active === 1 || user.is_active === true;
                      return (
                        <tr key={user.id}>
                          <td>
                            {(table.currentPage - 1) * table.pageSize +
                              index +
                              1}
                          </td>
                          <td className="fw-semibold text-primary">
                            {user.full_name || "-"}
                          </td>
                          <td>{user.username || "-"}</td>
                          <td>{user.email || "-"}</td>
                          <td>
                            <Badge bg={isActive ? "success" : "secondary"}>
                              {isActive ? "Đang hoạt động" : "Đã khóa"}
                            </Badge>
                          </td>
                          <td className="text-nowrap">
                            {user.created_at
                              ? formatDate(user.created_at)
                              : "-"}
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(user)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(user)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="me-1"
                              onClick={() => handleResetPassword(user)}
                              title="Đặt lại mật khẩu"
                            >
                              <i className="fas fa-key"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(user)}
                              title="Xóa"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
        {table.totalPages > 1 && (
          <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Trang {table.currentPage} / {table.totalPages}
            </small>
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => table.firstPage()}
                disabled={table.currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => table.previousPage()}
                disabled={table.currentPage === 1}
              />
              <Pagination.Item active>{table.currentPage}</Pagination.Item>
              <Pagination.Next
                onClick={() => table.nextPage()}
                disabled={table.currentPage === table.totalPages}
              />
              <Pagination.Last
                onClick={() => table.lastPage()}
                disabled={table.currentPage === table.totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* User Form Modal */}
      <UserForm
        show={showForm}
        onHide={() => setShowForm(false)}
        user={selectedUser}
        onSubmit={handleSubmit}
      />

      {/* Reset Password Modal */}
      <Modal
        show={showResetPassword}
        onHide={() => setShowResetPassword(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-key me-2"></i>
            Đặt lại mật khẩu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng{" "}
            <strong>{resetPasswordUser?.full_name}</strong>?
          </p>
          <p className="text-muted mb-0">
            Mật khẩu mới sẽ được tạo tự động và gửi qua email:{" "}
            <strong>{resetPasswordUser?.email}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResetPassword(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirmResetPassword}>
            <i className="fas fa-check me-2"></i>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserListPage;
