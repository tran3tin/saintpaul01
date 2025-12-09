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
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { healthService } from "@services";
import { useTable, useDebounce } from "@hooks";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import StatsCards from "@components/common/StatsCards";
import SearchFilterBar from "@components/common/SearchFilterBar";
import { formatDate } from "@utils";

const HealthRecordListPage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState([]);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchHealthRecords();
  }, [
    sisterId,
    table.currentPage,
    table.pageSize,
    debouncedSearch,
    table.sortBy,
    table.sortOrder,
  ]);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const params = sisterId
        ? { sister_id: sisterId, ...table.getTableParams() }
        : table.getTableParams();
      const response = await healthService.getList(params);

      if (response.success) {
        // Handle both response formats: { data: [...], pagination: {...} } or { items: [...], total: ... }
        const items = response.data?.data || response.data?.items || [];
        const total =
          response.data?.pagination?.total || response.data?.total || 0;
        setHealthRecords(items);
        table.setTotalItems(total);
      } else {
        setHealthRecords([]);
      }
    } catch (error) {
      console.error("Error fetching health records:", error);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    navigate(`/suc-khoe/${record.id}`);
  };

  const handleEdit = (record) => {
    navigate(`/suc-khoe/${record.id}/edit`);
  };

  const handleDelete = async (record) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ sức khỏe này?")) {
      try {
        await healthService.delete(record.id);
        toast.success("Đã xóa hồ sơ sức khỏe thành công!");
        fetchHealthRecords();
      } catch (error) {
        console.error("Error deleting health record:", error);
        toast.error(
          "Lỗi khi xóa hồ sơ sức khỏe: " + (error.message || "Vui lòng thử lại")
        );
      }
    }
  };

  // Ensure healthRecords is always an array
  const records = Array.isArray(healthRecords) ? healthRecords : [];

  // Map by general_health field from database (good, average, weak)
  const recordsByStatus = {
    good: records.filter((r) => r.general_health === "good"),
    average: records.filter((r) => r.general_health === "average"),
    weak: records.filter((r) => r.general_health === "weak"),
  };

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

  const healthStatusBadge = (status) => {
    const map = {
      good: { label: "Tốt", variant: "success" },
      average: { label: "Trung bình", variant: "warning" },
      weak: { label: "Yếu", variant: "danger" },
    };
    return (
      map[status] || { label: status || "Chưa xác định", variant: "secondary" }
    );
  };

  const sisterName = (r) => {
    const saint = r.sister_saint_name || r.saint_name;
    const birth = r.sister_birth_name || r.birth_name;
    if (saint && birth) return `${saint} ${birth}`;
    return saint || birth || `Nữ tu #${r.sister_id || "?"}`;
  };

  const sortedRecords = useMemo(() => {
    const items = [...records];

    const getValue = (item) => {
      switch (table.sortBy) {
        case "sister":
          return sisterName(item);
        case "checkup_date":
          return item.checkup_date ? new Date(item.checkup_date).getTime() : 0;
        case "diagnosis":
          return item.diagnosis || "";
        case "doctor":
          return item.doctor || "";
        case "checkup_place":
          return item.checkup_place || "";
        case "general_health":
          return item.general_health || "";
        default:
          return item.checkup_date ? new Date(item.checkup_date).getTime() : 0;
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
  }, [records, table.sortBy, table.sortOrder]);

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
    <Container
      fluid
      className="py-4"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      <Breadcrumb
        title="Hồ sơ Sức khỏe"
        items={[
          { label: "Quản lý Nữ Tu", link: "/nu-tu" },
          { label: "Hồ sơ Sức khỏe" },
        ]}
      />

      <StatsCards
        stats={[
          {
            label: "Tổng số",
            value: records.length,
            icon: "fas fa-heartbeat",
            color: "primary",
          },
          {
            label: "Sức khỏe tốt",
            value: recordsByStatus.good.length,
            icon: "fas fa-smile",
            color: "success",
          },
          {
            label: "Trung bình",
            value: recordsByStatus.average.length,
            icon: "fas fa-meh",
            color: "warning",
          },
          {
            label: "Sức khỏe yếu",
            value: recordsByStatus.weak.length,
            icon: "fas fa-frown",
            color: "danger",
          },
        ]}
      />

      <Card className="mb-4 shadow-sm border-0 rounded-3">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Bệnh viện, bác sĩ, chẩn đoán..."
                  value={table.searchTerm}
                  onChange={(e) => table.handleSearch(e.target.value)}
                  size="lg"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tình trạng sức khỏe</Form.Label>
                <Form.Select
                  value={table.filters?.general_health || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      general_health: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  <option value="good">Tốt</option>
                  <option value="average">Trung bình</option>
                  <option value="weak">Yếu</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Năm khám</Form.Label>
                <Form.Select
                  value={table.filters?.year || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      year: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  {Array.from(
                    new Set(
                      records
                        .map((r) =>
                          r.checkup_date
                            ? new Date(r.checkup_date).getFullYear()
                            : null
                        )
                        .filter(Boolean)
                    )
                  )
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
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

      <Card
        className="shadow-sm border-0 rounded-3"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        <Card.Body className="p-0">
          {records.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="fas fa-heartbeat text-muted mb-3"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5>Chưa có hồ sơ sức khỏe</h5>
              <p className="text-muted">
                Thêm hồ sơ đầu tiên để theo dõi sức khỏe
              </p>
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
                        onClick={() => handleSort("sister")}
                        className="text-nowrap"
                      >
                        Nữ tu {renderSortIcon("sister")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("checkup_date")}
                        className="text-nowrap"
                      >
                        Ngày khám {renderSortIcon("checkup_date")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("diagnosis")}
                        className="text-nowrap"
                      >
                        Chẩn đoán {renderSortIcon("diagnosis")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("doctor")}
                        className="text-nowrap"
                      >
                        Bác sĩ {renderSortIcon("doctor")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("checkup_place")}
                        className="text-nowrap"
                      >
                        Nơi khám {renderSortIcon("checkup_place")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("general_health")}
                        className="text-nowrap"
                      >
                        Tình trạng {renderSortIcon("general_health")}
                      </th>
                      <th className="text-end text-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((record, index) => {
                      const badge = healthStatusBadge(record.general_health);
                      return (
                        <tr key={record.id}>
                          <td>
                            {(table.currentPage - 1) * table.pageSize +
                              index +
                              1}
                          </td>
                          <td className="fw-semibold text-primary">
                            {sisterName(record)}
                          </td>
                          <td className="text-nowrap">
                            {record.checkup_date
                              ? formatDate(record.checkup_date)
                              : "-"}
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: 220 }}
                          >
                            {record.diagnosis || "-"}
                          </td>
                          <td>{record.doctor || "-"}</td>
                          <td>{record.checkup_place || "-"}</td>
                          <td>
                            <Badge bg={badge.variant}>{badge.label}</Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(record)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(record)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(record)}
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
    </Container>
  );
};

export default HealthRecordListPage;
