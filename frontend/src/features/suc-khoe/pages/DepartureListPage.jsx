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
import { departureService } from "@services";
import { useTable, useDebounce } from "@hooks";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";

const DepartureListPage = () => {
  const { sisterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departures, setDepartures] = useState([]);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchDepartures();
  }, [
    sisterId,
    table.currentPage,
    table.pageSize,
    debouncedSearch,
    table.sortBy,
    table.sortOrder,
  ]);

  const fetchDepartures = async () => {
    try {
      setLoading(true);
      const params = sisterId
        ? { sister_id: sisterId, ...table.getTableParams() }
        : table.getTableParams();
      const response = await departureService.getList(params);

      if (response.success) {
        setDepartures(response.data.items || []);
        table.setTotalItems(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching departures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate(
      sisterId ? `/nu-tu/${sisterId}/di-vang/create` : "/di-vang/create"
    );
  };

  const handleView = (record) => {
    navigate(`/di-vang/${record.id}`);
  };

  const handleEdit = (record) => {
    navigate(`/di-vang/${record.id}/edit`);
  };

  const handleDelete = async (record) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu đi vắng này?")) {
      try {
        await departureService.delete(record.id);
        fetchDepartures();
      } catch (error) {
        console.error("Error deleting departure:", error);
      }
    }
  };

  const departuresByType = {
    temporary: departures.filter((d) => d.type === "temporary"),
    medical: departures.filter((d) => d.type === "medical"),
    study: departures.filter((d) => d.type === "study"),
    mission: departures.filter((d) => d.type === "mission"),
    other: departures.filter(
      (d) => !["temporary", "medical", "study", "mission"].includes(d.type)
    ),
  };

  const activeCount = departures.filter((d) => !d.return_date).length;
  const returnedCount = departures.filter((d) => d.return_date).length;

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

  const typeLabel = (type) => {
    const map = {
      temporary: "Tạm thời",
      medical: "Khám chữa bệnh",
      study: "Học tập",
      mission: "Công tác",
      other: "Khác",
    };
    return map[type] || type || "-";
  };

  const sisterName = (d) => {
    const saint = d.sister_saint_name || d.saint_name;
    const birth = d.sister_birth_name || d.birth_name;
    if (saint && birth) return `${saint} ${birth}`;
    return saint || birth || `Nữ tu #${d.sister_id || "?"}`;
  };

  const sortedDepartures = useMemo(() => {
    const items = [...departures];

    const getValue = (item) => {
      switch (table.sortBy) {
        case "sister":
          return sisterName(item);
        case "departure_date":
          return item.departure_date
            ? new Date(item.departure_date).getTime()
            : 0;
        case "return_date":
          return item.return_date ? new Date(item.return_date).getTime() : 0;
        case "destination":
          return item.destination || "";
        case "reason":
          return item.reason || "";
        case "type":
          return item.type || "";
        case "status": {
          return item.return_date ? "returned" : "active";
        }
        default:
          return item.departure_date
            ? new Date(item.departure_date).getTime()
            : 0;
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
  }, [departures, table.sortBy, table.sortOrder]);

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
      <Breadcrumb
        title="Quản lý Đi vắng"
        items={[
          { label: "Quản lý Nữ Tu", link: "/nu-tu" },
          { label: "Đi vắng" },
        ]}
      />

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">{departures.length}</h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-plane-departure"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đang đi vắng</small>
                  <h4 className="mb-0">{activeCount}</h4>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="fas fa-walking"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đã trở về</small>
                  <h4 className="mb-0">{returnedCount}</h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-home"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Khám chữa bệnh</small>
                  <h4 className="mb-0">{departuresByType.medical.length}</h4>
                </div>
                <div className="stat-icon bg-danger">
                  <i className="fas fa-hospital"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4 shadow-sm border-0 rounded-3">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tên, địa điểm, lý do..."
                  value={table.searchTerm}
                  onChange={(e) => table.handleSearch(e.target.value)}
                  size="lg"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Loại đi vắng</Form.Label>
                <Form.Select
                  value={table.filters?.type || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      type: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  <option value="temporary">Tạm thời</option>
                  <option value="medical">Khám chữa bệnh</option>
                  <option value="study">Học tập</option>
                  <option value="mission">Công tác</option>
                  <option value="other">Khác</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={table.filters?.status || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      status: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang đi vắng</option>
                  <option value="returned">Đã trở về</option>
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
          {departures.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="fas fa-plane-departure text-muted mb-3"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5>Chưa có phiếu đi vắng</h5>
              <p className="text-muted">Đăng ký phiếu đi vắng đầu tiên</p>
              <Button variant="primary" onClick={handleAdd}>
                <i className="fas fa-plus me-2"></i>
                Đăng ký Đi vắng
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
                        onClick={() => handleSort("sister")}
                        className="text-nowrap"
                      >
                        Nữ tu {renderSortIcon("sister")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("departure_date")}
                        className="text-nowrap"
                      >
                        Ngày đi {renderSortIcon("departure_date")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("return_date")}
                        className="text-nowrap"
                      >
                        Ngày về {renderSortIcon("return_date")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("destination")}
                        className="text-nowrap"
                      >
                        Địa điểm {renderSortIcon("destination")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("reason")}
                        className="text-nowrap"
                      >
                        Lý do {renderSortIcon("reason")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("type")}
                        className="text-nowrap"
                      >
                        Loại {renderSortIcon("type")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("status")}
                        className="text-nowrap"
                      >
                        Trạng thái {renderSortIcon("status")}
                      </th>
                      <th className="text-end text-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDepartures.map((departure, index) => {
                      const isActive = !departure.return_date;
                      return (
                        <tr key={departure.id}>
                          <td>
                            {(table.currentPage - 1) * table.pageSize +
                              index +
                              1}
                          </td>
                          <td className="fw-semibold text-primary">
                            {sisterName(departure)}
                          </td>
                          <td className="text-nowrap">
                            {departure.departure_date
                              ? formatDate(departure.departure_date)
                              : "-"}
                          </td>
                          <td className="text-nowrap">
                            {departure.return_date
                              ? formatDate(departure.return_date)
                              : "Chưa về"}
                          </td>
                          <td>{departure.destination || "-"}</td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: 200 }}
                          >
                            {departure.reason || "-"}
                          </td>
                          <td>{typeLabel(departure.type)}</td>
                          <td>
                            <Badge bg={isActive ? "warning" : "success"}>
                              {isActive ? "Đang đi vắng" : "Đã trở về"}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(departure)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(departure)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(departure)}
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

export default DepartureListPage;
