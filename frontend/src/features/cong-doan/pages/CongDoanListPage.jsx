// src/features/cong-doan/pages/CongDoanListPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { communityService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import SearchBox from "@components/common/SearchBox";
import Breadcrumb from "@components/common/Breadcrumb";
import Pagination from "@components/common/Pagination";
import StatsCards from "@components/common/StatsCards";

const CongDoanListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const showToast = (variant, title, message) => {
    setToast({ show: true, variant, title, message });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchCommunities();
  }, [currentPage, statusFilter]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await communityService.getList(params);
      if (response) {
        // Handle response format: { data: [...], meta: {...} }
        if (Array.isArray(response.data)) {
          setCommunities(response.data);
          setTotalPages(response.meta?.totalPages || 1);
        } else if (Array.isArray(response)) {
          setCommunities(response);
          setTotalPages(1);
        } else {
          setCommunities(response.items || []);
          setTotalPages(response.total_pages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCommunities();
  };

  const handleViewDetail = (id) => {
    navigate(`/cong-doan/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/cong-doan/${id}/edit`);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa cộng đoàn "${name}"?`)) {
      try {
        await communityService.delete(id);
        showToast(
          "success",
          "Xóa thành công!",
          `Đã xóa cộng đoàn "${name}" khỏi hệ thống.`
        );
        // Fetch lại danh sách từ server sau khi xóa
        await fetchCommunities();
      } catch (error) {
        console.error("Error deleting community:", error);
        let errorMessage = "Không thể xóa cộng đoàn. Vui lòng thử lại.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        showToast("danger", "Xóa thất bại!", errorMessage);
      }
    }
  };

  const handleAssign = (id) => {
    navigate(`/cong-doan/${id}/assign`);
  };

  const handleSort = (key) => {
    setSortOrder((prevOrder) =>
      sortBy === key && prevOrder === "asc" ? "desc" : "asc"
    );
    setSortBy(key);
  };

  const renderSortIcon = (key) => {
    if (sortBy !== key) {
      return <i className="fas fa-sort text-muted ms-1"></i>;
    }
    return sortOrder === "asc" ? (
      <i className="fas fa-sort-up ms-1"></i>
    ) : (
      <i className="fas fa-sort-down ms-1"></i>
    );
  };

  const filteredCommunities = useMemo(
    () =>
      communities.filter(
        (community) =>
          community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          community.code?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [communities, searchTerm]
  );

  const sortedCommunities = useMemo(() => {
    const items = [...filteredCommunities];
    items.sort((a, b) => {
      const getValue = (item) => {
        if (sortBy === "code") return item.code || "";
        if (sortBy === "member_count") return item.member_count || 0;
        if (sortBy === "status") return item.status || "";
        return item.name || "";
      };

      const valueA = getValue(a);
      const valueB = getValue(b);

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
      }

      return sortOrder === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    return items;
  }, [filteredCommunities, sortBy, sortOrder]);

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        title="Quản lý Cộng đoàn"
        items={[{ label: "Cộng đoàn" }]}
      />

      {/* Statistics Cards */}
      <StatsCards
        stats={[
          {
            label: "Tổng số",
            value: communities.length,
            icon: "fas fa-home",
            color: "primary",
          },
          {
            label: "Đang hoạt động",
            value: communities.filter((c) => c.status === "active").length,
            icon: "fas fa-check-circle",
            color: "success",
          },
          {
            label: "Thành viên",
            value: communities.reduce((sum, c) => sum + (c.member_count || 0), 0),
            icon: "fas fa-users",
            color: "info",
          },
          {
            label: "Cấp tỉnh",
            value: communities.filter((c) => c.type === "provincial").length,
            icon: "fas fa-building",
            color: "warning",
          },
        ]}
      />

      {/* Toast Notification */}
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        <Toast
          show={toast.show}
          onClose={hideToast}
          delay={5000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header closeButton>
            <i
              className={`me-2 ${
                toast.variant === "success"
                  ? "fas fa-check-circle text-success"
                  : "fas fa-exclamation-circle text-danger"
              }`}
            ></i>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body
            className={toast.variant === "danger" ? "text-white" : ""}
          >
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

        {/* Search & Filter */}
        <Row className="g-3 mb-4">
          <Col md={6}>
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={handleSearch}
              placeholder="Tìm kiếm cộng đoàn..."
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </Form.Select>
          </Col>
        </Row>

      <Card
        className="shadow-sm border-0 rounded-3"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredCommunities.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="text-nowrap">STT</th>
                    <th
                      role="button"
                      onClick={() => handleSort("code")}
                      className="text-nowrap"
                    >
                      Mã số {renderSortIcon("code")}
                    </th>
                    <th
                      role="button"
                      onClick={() => handleSort("name")}
                      className="text-nowrap"
                    >
                      Tên cộng đoàn {renderSortIcon("name")}
                    </th>
                    <th className="text-nowrap">Địa chỉ</th>
                    <th
                      role="button"
                      onClick={() => handleSort("member_count")}
                      className="text-nowrap"
                    >
                      Số thành viên {renderSortIcon("member_count")}
                    </th>
                    <th
                      role="button"
                      onClick={() => handleSort("status")}
                      className="text-nowrap"
                    >
                      Trạng thái {renderSortIcon("status")}
                    </th>
                    <th className="text-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCommunities.map((community, index) => (
                    <tr key={community.id}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td>{community.code}</td>
                      <td>
                        <span
                          className="text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewDetail(community.id)}
                        >
                          {community.name}
                        </span>
                      </td>
                      <td>{community.address || "-"}</td>
                      <td>{community.member_count || 0}</td>
                      <td>
                        <Badge
                          bg={
                            community.status === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {community.status === "active"
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewDetail(community.id)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleAssign(community.id)}
                          title="Phân công"
                        >
                          <i className="fas fa-user-plus"></i>
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleEdit(community.id)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(community.id, community.name)
                          }
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">Không tìm thấy cộng đoàn nào</p>
              <Button
                variant="primary"
                onClick={() => navigate("/cong-doan/create")}
              >
                Thêm cộng đoàn đầu tiên
              </Button>
            </div>
          )}
        </Card.Body>

        {totalPages > 1 && (
          <Card.Footer className="bg-white">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default CongDoanListPage;
