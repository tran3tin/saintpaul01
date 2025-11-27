// src/features/cong-doan/pages/CongDoanListPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { communityService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import SearchBox from "@components/common/SearchBox";
import Breadcrumb from "@components/common/Breadcrumb";
import Pagination from "@components/common/Pagination";

const CongDoanListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchCommunities();
  }, [currentPage, statusFilter]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await communityService.getList(params);
      if (response) {
        setCommunities(response.items || []);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
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
    if (window.confirm(`Bạn có chắc chắn muốn xóa cộng đoàn ${name}?`)) {
      try {
        await communityService.delete(id);
        fetchCommunities();
      } catch (error) {
        console.error("Error deleting community:", error);
      }
    }
  };

  const handleAssign = (id) => {
    navigate(`/cong-doan/${id}/assign`);
  };

  const filteredCommunities = communities.filter(
    (community) =>
      community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Cộng Đoàn" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Cộng Đoàn</h2>
          <p className="text-muted mb-0">
            Danh sách các cộng đoàn trong hội dòng
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/cong-doan/create")}>
          Thêm Cộng Đoàn
        </Button>
      </div>

      <Card>
        <Card.Header className="bg-white">
          <Row className="align-items-center">
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
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredCommunities.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã số</th>
                  <th>Tên cộng đoàn</th>
                  <th>Địa chỉ</th>
                  <th>Số thành viên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommunities.map((community, index) => (
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
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetail(community.id)}
                        >
                          Xem
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleAssign(community.id)}
                        >
                          Phân công
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEdit(community.id)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            handleDelete(community.id, community.name)
                          }
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
