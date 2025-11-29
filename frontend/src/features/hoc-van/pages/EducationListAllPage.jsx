// src/features/hoc-van/pages/EducationListAllPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Pagination,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { educationService } from "@services";
import { formatDate } from "@utils/formatters";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const EducationListAllPage = () => {
  const [loading, setLoading] = useState(true);
  const [educations, setEducations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    degree_type: "",
    status: "",
  });

  useEffect(() => {
    fetchEducations();
  }, [currentPage, filter]);

  const fetchEducations = async () => {
    try {
      setLoading(true);
      const response = await educationService.getList({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...filter,
      });
      if (response.success) {
        setEducations(response.data.items || response.data || []);
        setTotalPages(
          Math.ceil((response.data.total || response.data.length) / 10)
        );
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEducations();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học vấn này?")) {
      try {
        const result = await educationService.delete(id);
        if (result.success) {
          fetchEducations();
        }
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  const getDegreeTypeBadge = (type) => {
    const types = {
      dai_hoc: { label: "Đại học", variant: "primary" },
      thac_si: { label: "Thạc sĩ", variant: "success" },
      tien_si: { label: "Tiến sĩ", variant: "danger" },
      cao_dang: { label: "Cao đẳng", variant: "info" },
      trung_cap: { label: "Trung cấp", variant: "secondary" },
      chung_chi: { label: "Chứng chỉ", variant: "warning" },
    };
    const degreeInfo = types[type] || { label: type, variant: "secondary" };
    return <Badge bg={degreeInfo.variant}>{degreeInfo.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      dang_hoc: { label: "Đang học", variant: "primary" },
      da_tot_nghiep: { label: "Đã tốt nghiệp", variant: "success" },
      tam_nghi: { label: "Tạm nghỉ", variant: "warning" },
      da_nghi: { label: "Đã nghỉ", variant: "secondary" },
    };
    const statusInfo = statuses[status] || {
      label: status,
      variant: "secondary",
    };
    return <Badge bg={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading && educations.length === 0) {
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
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Học vấn" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaGraduationCap className="me-2" />
            Quản lý Học vấn
          </h2>
          <p className="text-muted mb-0">
            Danh sách học vấn và bằng cấp của các nữ tu
          </p>
        </div>
        <Link to="/hoc-van/create" className="btn btn-primary">
          <FaPlus className="me-2" />
          Thêm Học vấn
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tìm kiếm</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Tên nữ tu, trường học, ngành học..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                      <FaSearch />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Loại bằng</Form.Label>
                  <Form.Select
                    value={filter.degree_type}
                    onChange={(e) =>
                      setFilter({ ...filter, degree_type: e.target.value })
                    }
                  >
                    <option value="">Tất cả</option>
                    <option value="tien_si">Tiến sĩ</option>
                    <option value="thac_si">Thạc sĩ</option>
                    <option value="dai_hoc">Đại học</option>
                    <option value="cao_dang">Cao đẳng</option>
                    <option value="trung_cap">Trung cấp</option>
                    <option value="chung_chi">Chứng chỉ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={filter.status}
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                  >
                    <option value="">Tất cả</option>
                    <option value="dang_hoc">Đang học</option>
                    <option value="da_tot_nghiep">Đã tốt nghiệp</option>
                    <option value="tam_nghi">Tạm nghỉ</option>
                    <option value="da_nghi">Đã nghỉ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setFilter({ degree_type: "", status: "" });
                    setCurrentPage(1);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Card.Body>
          {educations.length === 0 ? (
            <div className="text-center py-5">
              <FaGraduationCap size={48} className="text-muted mb-3" />
              <h5>Chưa có thông tin học vấn</h5>
              <p className="text-muted">
                Thêm học vấn đầu tiên để theo dõi quá trình học tập
              </p>
              <Link to="/hoc-van/create" className="btn btn-primary">
                <FaPlus className="me-2" />
                Thêm Học vấn
              </Link>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nữ tu</th>
                    <th>Trường học</th>
                    <th>Ngành học</th>
                    <th>Loại bằng</th>
                    <th>Năm tốt nghiệp</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {educations.map((edu, index) => (
                    <tr key={edu.id}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td>
                        <Link to={`/nu-tu/${edu.sister_id}`}>
                          {edu.sister_name || edu.religious_name || "N/A"}
                        </Link>
                      </td>
                      <td>{edu.institution || edu.school_name || "N/A"}</td>
                      <td>{edu.major || edu.field_of_study || "N/A"}</td>
                      <td>{getDegreeTypeBadge(edu.degree_type)}</td>
                      <td>
                        {edu.graduation_year || edu.end_year || "Đang học"}
                      </td>
                      <td>{getStatusBadge(edu.status)}</td>
                      <td className="text-end">
                        <Link
                          to={`/nu-tu/${edu.sister_id}/hoc-van`}
                          className="btn btn-sm btn-outline-info me-1"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(edu.id)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Trang {currentPage} / {totalPages}
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                    />
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    <Pagination.Next
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EducationListAllPage;
