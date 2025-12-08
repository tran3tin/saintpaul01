// src/features/nu-tu/pages/SisterListPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Table,
  Badge,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import sisterService from "@services/sisterService";
import Breadcrumb from "@components/common/Breadcrumb/Breadcrumb";
import StatsCards from "@components/common/StatsCards";

// Stage labels mapping (từ database ENUM)
const stageLabels = {
  inquiry: { label: "Tìm hiểu", color: "secondary" },
  postulant: { label: "Thỉnh sinh", color: "info" },
  aspirant: { label: "Tiền tập", color: "primary" },
  novice: { label: "Tập viện", color: "warning" },
  temporary_vows: { label: "Tạm khấn", color: "orange" },
  perpetual_vows: { label: "Vĩnh khấn", color: "success" },
  left: { label: "Đã rời", color: "danger" },
};

const SisterListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sisters, setSisters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [stageFilter, setStageFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Fetch sisters from API
  const fetchSisters = useCallback(
    async (page = 1, search = "") => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: pagination.limit,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await sisterService.getList(params);

        if (response && response.data) {
          setSisters(response.data);
          if (response.meta) {
            setPagination({
              page: response.meta.page || 1,
              limit: response.meta.limit || 20,
              total: response.meta.total || 0,
              totalPages: response.meta.totalPages || 1,
            });
          }
        } else {
          setSisters([]);
        }
      } catch (err) {
        console.error("Error fetching sisters:", err);
        setError("Không thể tải danh sách nữ tu. Vui lòng thử lại.");
        setSisters([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  // Initial load
  useEffect(() => {
    fetchSisters(1, "");
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSisters(1, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchSisters(newPage, searchTerm);
  };

  const handleCreate = () => navigate("/nu-tu/create");
  const handleView = (sister) => navigate(`/nu-tu/${sister.id}`);
  const handleEdit = (sister) => navigate(`/nu-tu/${sister.id}/edit`);

  const handleDelete = async (sister) => {
    const name = sister.religious_name || sister.birth_name;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${name}?`)) {
      try {
        await sisterService.delete(sister.id);
        toast.success(`Đã xóa nữ tu ${name} thành công`);
        // Refresh list
        fetchSisters(pagination.page, searchTerm);
      } catch (err) {
        console.error("Error deleting sister:", err);
        toast.error("Không thể xóa nữ tu. Vui lòng thử lại.");
      }
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getStageInfo = (stage) =>
    stageLabels[stage] || {
      label: stage || "Chưa xác định",
      color: "secondary",
    };

  // Get photo URL with fallback
  const getPhotoUrl = (sister) => {
    if (sister.photo_url) {
      // If it's a relative URL, prepend the API base
      if (sister.photo_url.startsWith("/")) {
        return `http://localhost:5000${sister.photo_url}`;
      }
      return sister.photo_url;
    }
    return null;
  };

  // Derived filters and sorting
  const filteredSisters = useMemo(() => {
    return (sisters || []).filter((s) => {
      const matchesSearch = searchTerm
        ? (s.birth_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (s.saint_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesStage = stageFilter ? s.current_stage === stageFilter : true;
      const matchesCommunity = communityFilter
        ? s.current_community_name === communityFilter
        : true;
      return matchesSearch && matchesStage && matchesCommunity;
    });
  }, [sisters, searchTerm, stageFilter, communityFilter]);

  const sortedSisters = useMemo(() => {
    const arr = [...filteredSisters];
    if (!sortBy) return arr;

    const compare = (a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "saint_name":
          return dir * (a.saint_name || "").localeCompare(b.saint_name || "");
        case "birth_name":
          return dir * (a.birth_name || "").localeCompare(b.birth_name || "");
        case "age":
          return (
            dir *
            ((calculateAge(a.date_of_birth) || 0) -
              (calculateAge(b.date_of_birth) || 0))
          );
        case "stage":
          return (
            dir * (a.current_stage || "").localeCompare(b.current_stage || "")
          );
        case "community":
          return (
            dir *
            (a.current_community_name || "").localeCompare(
              b.current_community_name || ""
            )
          );
        default:
          return 0;
      }
    };

    return arr.sort(compare);
  }, [filteredSisters, sortBy, sortOrder]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key) => {
    if (sortBy !== key) return <i className="fas fa-sort text-muted ms-1"></i>;
    return sortOrder === "asc" ? (
      <i className="fas fa-sort-up ms-1"></i>
    ) : (
      <i className="fas fa-sort-down ms-1"></i>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    items.push(
      <Pagination.First
        key="first"
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(1)}
      />,
      <Pagination.Prev
        key="prev"
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(pagination.page - 1)}
      />
    );

    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    for (let i = startPage; i <= endPage; i++) {
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

    if (endPage < pagination.totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={pagination.page === pagination.totalPages}
        onClick={() => handlePageChange(pagination.page + 1)}
      />,
      <Pagination.Last
        key="last"
        disabled={pagination.page === pagination.totalPages}
        onClick={() => handlePageChange(pagination.totalPages)}
      />
    );

    return <Pagination className="mb-0">{items}</Pagination>;
  };

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        title="Danh sách Nữ Tu"
        items={[{ label: "Quản lý Nữ Tu", link: "/nu-tu" }]}
      />

      {/* Statistics Cards */}
      <StatsCards
        stats={[
          {
            label: "Tổng số",
            value: pagination.total,
            icon: "fas fa-users",
            color: "primary",
          },
          {
            label: "Đang hoạt động",
            value: sisters.filter((s) => s.status === "active").length,
            icon: "fas fa-user-check",
            color: "success",
          },
          {
            label: "Vĩnh khấn",
            value: sisters.filter((s) => s.current_stage === "perpetual_vows")
              .length,
            icon: "fas fa-cross",
            color: "info",
          },
          {
            label: "Tạm khấn",
            value: sisters.filter((s) => s.current_stage === "temporary_vows")
              .length,
            icon: "fas fa-praying-hands",
            color: "warning",
          },
        ]}
      />

      {/* Search & Filter */}
      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên, tên thánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="">Tất cả giai đoạn</option>
            {Object.entries(stageLabels).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={communityFilter}
            onChange={(e) => setCommunityFilter(e.target.value)}
          >
            <option value="">Tất cả cộng đoàn</option>
            {Array.from(
              new Set(
                sisters.map((s) => s.current_community_name).filter(Boolean)
              )
            ).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => fetchSisters(1, searchTerm)}
          >
            <i className="fas fa-redo me-2"></i>Thử lại
          </Button>
        </Alert>
      ) : sisters.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>Không có dữ liệu</Alert.Heading>
          <p>
            {searchTerm
              ? `Không tìm thấy nữ tu nào với từ khóa "${searchTerm}"`
              : "Chưa có nữ tu nào trong hệ thống."}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={handleCreate}>
              <i className="fas fa-plus me-2"></i>Thêm nữ tu đầu tiên
            </Button>
          )}
        </Alert>
      ) : (
        <Card className="shadow-sm" style={{ borderRadius: "12px" }}>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead
                className="bg-light"
                style={{
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                }}
              >
                <tr>
                  <th>#</th>
                  <th role="button" onClick={() => handleSort("saint_name")}>
                    Tên Thánh {renderSortIcon("saint_name")}
                  </th>
                  <th role="button" onClick={() => handleSort("birth_name")}>
                    Họ và Tên {renderSortIcon("birth_name")}
                  </th>
                  <th role="button" onClick={() => handleSort("age")}>
                    Tuổi {renderSortIcon("age")}
                  </th>
                  <th role="button" onClick={() => handleSort("stage")}>
                    Giai đoạn {renderSortIcon("stage")}
                  </th>
                  <th role="button" onClick={() => handleSort("community")}>
                    Cộng đoàn {renderSortIcon("community")}
                  </th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedSisters.map((sister, index) => (
                  <tr key={`${sister.id}-${index}`}>
                    <td>
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td>
                      <strong>{sister.saint_name || "—"}</strong>
                    </td>
                    <td>{sister.birth_name}</td>
                    <td>{calculateAge(sister.date_of_birth)}</td>
                    <td>
                      <Badge bg={getStageInfo(sister.current_stage).color}>
                        {getStageInfo(sister.current_stage).label}
                      </Badge>
                    </td>
                    <td>{sister.current_community_name || "Chưa phân công"}</td>
                    <td className="text-center">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-1"
                        onClick={() => handleView(sister)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEdit(sister)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(sister)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Pagination & Summary */}
      {!loading && !error && sortedSisters.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, sortedSisters.length)}{" "}
            / {sortedSisters.length} nữ tu
          </div>
          {renderPagination()}
        </div>
      )}
    </Container>
  );
};

export default SisterListPage;
