// src/features/cong-doan/pages/CongDoanListPage.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { communityService } from "@services";
import { useTable, useDebounce } from "@hooks";
import CongDoanCard from "../components/CongDoanCard";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";

const CongDoanListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);

  const table = useTable({
    initialPageSize: 12,
  });

  const debouncedSearch = useDebounce(table.searchTerm, 500);

  useEffect(() => {
    fetchCommunities();
  }, [table.currentPage, table.pageSize, debouncedSearch]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = table.getTableParams();
      const response = await communityService.getList(params);

      if (response.success) {
        setCommunities(response.data.items);
        table.setTotalItems(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/cong-doan/create");
  };

  const handleView = (community) => {
    navigate(`/cong-doan/${community.id}`);
  };

  const handleEdit = (community) => {
    navigate(`/cong-doan/${community.id}/edit`);
  };

  const handleDelete = async (community) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${community.name}?`)) {
      try {
        await communityService.delete(community.id);
        fetchCommunities();
      } catch (error) {
        console.error("Error deleting community:", error);
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Cộng Đoàn</h2>
          <p className="text-muted mb-0">
            Danh sách các cộng đoàn trong hội dòng
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <i className="fas fa-plus me-2"></i>
          Thêm Cộng Đoàn
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <SearchBox
            value={table.searchTerm}
            onChange={table.handleSearch}
            placeholder="Tìm kiếm theo tên, mã số..."
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <Row className="g-4">
          {communities.map((community) => (
            <Col key={community.id} xs={12} sm={6} lg={4} xl={3}>
              <CongDoanCard
                community={community}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CongDoanListPage;
