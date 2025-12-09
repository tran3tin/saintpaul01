// src/features/su-vu/pages/MissionListPage.jsx (Updated)

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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { missionService } from "@services";
import { useTable, useDebounce } from "@hooks";
import MissionForm from "../components/MissionForm";
import MissionFilter from "../components/MissionFilter";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";

const MissionListPage = () => {
  const navigate = useNavigate();
  const { sisterId } = useParams();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchMissions();
  }, [
    table.currentPage,
    table.pageSize,
    debouncedSearch,
    table.filters,
    table.sortBy,
    table.sortOrder,
  ]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const params = table.getTableParams();

      let response;
      if (sisterId) {
        // Fetch missions for specific sister
        response = await missionService.getBySister(sisterId, params);
      } else {
        response = await missionService.getList(params);
      }

      if (response.success) {
        const rawItems =
          response.data?.items ||
          response.data?.missions ||
          response.data?.data ||
          response.data ||
          [];

        const items = Array.isArray(rawItems)
          ? rawItems
          : Array.isArray(rawItems.items)
          ? rawItems.items
          : [];

        const total =
          response.data?.total ?? response.data?.meta?.total ?? items.length;

        setMissions(items);
        table.setTotalItems(total);
      }
    } catch (error) {
      console.error("Error fetching missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedMission(null);
    setShowForm(true);
  };

  const handleView = (mission) => {
    navigate(`/su-vu/${mission.id}`);
  };

  const handleEdit = (mission) => {
    setSelectedMission(mission);
    setShowForm(true);
  };

  const handleDelete = async (mission) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sứ vụ này?")) {
      try {
        const result = await missionService.delete(mission.id);
        if (result.success) {
          toast.success("Xóa sứ vụ thành công!");
          fetchMissions();
        } else {
          toast.error(result.error || "Không thể xóa sứ vụ");
        }
      } catch (error) {
        console.error("Error deleting mission:", error);
        toast.error("Đã xảy ra lỗi khi xóa sứ vụ");
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Add sisterId if provided via URL
      const payload = sisterId ? { ...values, sister_id: sisterId } : values;

      if (selectedMission) {
        const result = await missionService.update(selectedMission.id, payload);
        if (result.success) {
          toast.success("Cập nhật sứ vụ thành công!");
        } else {
          toast.error(result.error || "Không thể cập nhật sứ vụ");
          return;
        }
      } else {
        const result = await missionService.create(payload);
        if (result.success) {
          toast.success("Thêm sứ vụ mới thành công!");
        } else {
          toast.error(result.error || "Không thể thêm sứ vụ");
          return;
        }
      }
      setShowForm(false);
      fetchMissions();
    } catch (error) {
      console.error("Error saving mission:", error);
      toast.error("Đã xảy ra lỗi khi lưu sứ vụ");
    }
  };

  const activeMissions = missions.filter(
    (m) => !m.end_date || new Date(m.end_date) >= new Date()
  );
  const completedMissions = missions.filter(
    (m) => m.end_date && new Date(m.end_date) < new Date()
  );

  const handleSort = (key) => {
    table.handleSort(key);
  };

  const renderSortIcon = (key) => {
    if (table.sortBy !== key) {
      return <i className="fas fa-sort text-muted ms-1"></i>;
    }
    return table.sortOrder === "asc" ? (
      <i className="fas fa-sort-up ms-1"></i>
    ) : (
      <i className="fas fa-sort-down ms-1"></i>
    );
  };

  const fieldLabel = (field) => {
    const map = {
      education: "Giáo dục",
      pastoral: "Mục vụ",
      publishing: "Xuất bản",
      media: "Truyền thông",
      healthcare: "Y tế",
      social: "Xã hội",
    };
    return map[field] || field || "-";
  };

  const sortedMissions = useMemo(() => {
    const items = [...missions];

    const getValue = (item) => {
      switch (table.sortBy) {
        case "religious_name":
          return item.religious_name || item.sister_name || "";
        case "specific_role":
          return item.specific_role || "";
        case "organization":
          return item.organization || "";
        case "field":
          return item.field || "";
        case "start_date":
          return item.start_date ? new Date(item.start_date).getTime() : 0;
        case "status": {
          const isActive =
            !item.end_date || new Date(item.end_date) >= new Date();
          return isActive ? "active" : "completed";
        }
        default:
          return item.start_date ? new Date(item.start_date).getTime() : 0;
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
  }, [missions, table.sortBy, table.sortOrder]);

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
      <Breadcrumb title="Quản lý Sứ vụ" items={[{ label: "Quản lý Sứ vụ" }]} />

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="stat-card shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Tổng số</small>
                  <h4 className="mb-0">
                    {table.totalItems || missions.length}
                  </h4>
                </div>
                <div className="stat-icon bg-primary">
                  <i className="fas fa-briefcase"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đang làm</small>
                  <h4 className="mb-0">{activeMissions.length}</h4>
                </div>
                <div className="stat-icon bg-success">
                  <i className="fas fa-play"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Đã kết thúc</small>
                  <h4 className="mb-0">{completedMissions.length}</h4>
                </div>
                <div className="stat-icon bg-info">
                  <i className="fas fa-check"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="stat-card shadow-sm border-0 rounded-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">Lĩnh vực</small>
                  <h4 className="mb-0">
                    {new Set(missions.map((m) => m.field).filter(Boolean)).size}
                  </h4>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="fas fa-layer-group"></i>
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
                  placeholder="Chức vụ, tổ chức, tên nữ tu..."
                  value={table.searchTerm}
                  onChange={(e) => table.handleSearch(e.target.value)}
                  size="lg"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Lĩnh vực</Form.Label>
                <Form.Select
                  value={table.filters?.field || ""}
                  onChange={(e) =>
                    table.updateFilters({
                      ...table.filters,
                      field: e.target.value,
                    })
                  }
                  size="lg"
                >
                  <option value="">Tất cả</option>
                  <option value="education">Giáo dục</option>
                  <option value="pastoral">Mục vụ</option>
                  <option value="publishing">Xuất bản</option>
                  <option value="media">Truyền thông</option>
                  <option value="healthcare">Y tế</option>
                  <option value="social">Xã hội</option>
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
                  <option value="active">Đang làm</option>
                  <option value="completed">Đã kết thúc</option>
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
          {missions.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="fas fa-briefcase text-muted mb-3"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5>Chưa có thông tin sứ vụ</h5>
              <p className="text-muted">
                Thêm sứ vụ đầu tiên để theo dõi công tác
              </p>
              <Button variant="primary" onClick={handleAdd}>
                <i className="fas fa-plus me-2"></i>
                Thêm Sứ vụ
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
                        onClick={() => handleSort("religious_name")}
                        className="text-nowrap"
                      >
                        Nữ tu {renderSortIcon("religious_name")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("specific_role")}
                        className="text-nowrap"
                      >
                        Chức vụ {renderSortIcon("specific_role")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("organization")}
                        className="text-nowrap"
                      >
                        Tổ chức {renderSortIcon("organization")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("field")}
                        className="text-nowrap"
                      >
                        Lĩnh vực {renderSortIcon("field")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("start_date")}
                        className="text-nowrap"
                      >
                        Thời gian {renderSortIcon("start_date")}
                      </th>
                      <th
                        role="button"
                        onClick={() => handleSort("status")}
                        className="text-nowrap"
                      >
                        Trạng thái {renderSortIcon("status")}
                      </th>
                      <th className="text-nowrap text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMissions.map((mission, index) => {
                      const isActive =
                        !mission.end_date ||
                        new Date(mission.end_date) >= new Date();
                      return (
                        <tr key={mission.id}>
                          <td>
                            {(table.currentPage - 1) * table.pageSize +
                              index +
                              1}
                          </td>
                          <td className="fw-semibold text-primary">
                            {mission.religious_name ||
                              mission.sister_name ||
                              "N/A"}
                          </td>
                          <td>{mission.specific_role || "-"}</td>
                          <td>{mission.organization || "-"}</td>
                          <td>{fieldLabel(mission.field)}</td>
                          <td className="text-nowrap">
                            {mission.start_date
                              ? formatDate(mission.start_date)
                              : "-"}{" "}
                            {mission.end_date
                              ? `- ${formatDate(mission.end_date)}`
                              : "- Hiện tại"}
                          </td>
                          <td>
                            <Badge bg={isActive ? "success" : "secondary"}>
                              {isActive ? "Đang làm" : "Đã kết thúc"}
                            </Badge>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(mission)}
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(mission)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(mission)}
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

      <MissionForm
        show={showForm}
        onHide={() => setShowForm(false)}
        mission={selectedMission}
        onSubmit={handleSubmit}
        sisterId={sisterId}
      />
    </Container>
  );
};

export default MissionListPage;
