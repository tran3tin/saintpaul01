// src/features/cong-doan/pages/AssignmentPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService, sisterService } from "@services";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";
import "./AssignmentPage.css";

const AssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [community, setCommunity] = useState(null);
  const [availableSisters, setAvailableSisters] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [selectedSisters, setSelectedSisters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch community info
      const communityRes = await communityService.getDetail(id);
      if (communityRes) {
        setCommunity(communityRes);
      }

      // Fetch current members
      const membersRes = await communityService.getMembers(id);
      if (membersRes) {
        setCurrentMembers(membersRes);
      }

      // Fetch available sisters (not in this community)
      const sistersRes = await sisterService.getList({
        page_size: 1000,
        exclude_community_id: id,
      });
      if (sistersRes) {
        setAvailableSisters(sistersRes.items || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSister = (sisterId) => {
    if (selectedSisters.includes(sisterId)) {
      setSelectedSisters(selectedSisters.filter((sid) => sid !== sisterId));
    } else {
      setSelectedSisters([...selectedSisters, sisterId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSisters.length === filteredSisters.length) {
      setSelectedSisters([]);
    } else {
      setSelectedSisters(filteredSisters.map((s) => s.id));
    }
  };

  const handleAssign = async () => {
    if (selectedSisters.length === 0) {
      setError("Vui lòng chọn ít nhất một nữ tu");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await communityService.addMember(id, {
        sister_ids: selectedSisters,
        role: "member",
        joined_date: new Date().toISOString().split("T")[0],
      });

      setSuccess(`Đã phân công ${selectedSisters.length} nữ tu thành công`);
      setSelectedSisters([]);
      fetchData();
    } catch (err) {
      console.error("Error assigning members:", err);
      setError("Có lỗi xảy ra khi phân công thành viên");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi cộng đoàn?")
    ) {
      try {
        await communityService.removeMember(id, memberId);
        setSuccess("Đã xóa thành viên khỏi cộng đoàn");
        fetchData();
      } catch (err) {
        console.error("Error removing member:", err);
        setError("Có lỗi xảy ra khi xóa thành viên");
      }
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await communityService.updateMemberRole(id, memberId, {
        role: newRole,
      });
      setSuccess("Đã cập nhật vai trò thành công");
      fetchData();
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Có lỗi xảy ra khi cập nhật vai trò");
    }
  };

  const filteredSisters = availableSisters.filter(
    (sister) =>
      sister.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sister.sister_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sister.religious_name &&
        sister.religious_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        items={[
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Cộng Đoàn", link: "/cong-doan" },
          { label: community?.name, link: `/cong-doan/${id}` },
          { label: "Phân công thành viên" },
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Phân công Thành viên</h2>
          <p className="text-muted mb-0">
            Cộng đoàn: <strong>{community?.name}</strong>
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(`/cong-doan/${id}`)}
        >
          Quay lại
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Row className="g-4">
        {/* Left - Available Sisters */}
        <Col lg={7}>
          <Card>
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Nữ tu có sẵn ({filteredSisters.length})
                </h5>
                {selectedSisters.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={handleAssign}
                    disabled={submitting}
                  >
                    {submitting ? "Đang phân công..." : `Phân công (${selectedSisters.length})`}
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tìm kiếm nữ tu..."
                className="mb-3"
              />

              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>
                        <Form.Check
                          type="checkbox"
                          checked={
                            selectedSisters.length === filteredSisters.length &&
                            filteredSisters.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Mã số</th>
                      <th>Họ tên</th>
                      <th>Tên thánh</th>
                      <th>Ngày sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSisters.length > 0 ? (
                      filteredSisters.map((sister) => (
                        <tr key={sister.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedSisters.includes(sister.id)}
                              onChange={() => handleSelectSister(sister.id)}
                            />
                          </td>
                          <td>{sister.sister_code}</td>
                          <td>{sister.full_name}</td>
                          <td>{sister.religious_name || "-"}</td>
                          <td>{formatDate(sister.birth_date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Không tìm thấy nữ tu nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right - Current Members */}
        <Col lg={5}>
          <Card>
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                Thành viên hiện tại ({currentMembers.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {currentMembers.length > 0 ? (
                <div className="members-list">
                  {currentMembers.map((member) => (
                    <Card key={member.id} className="member-card mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              {member.religious_name && (
                                <span className="text-primary me-2">
                                  {member.religious_name}
                                </span>
                              )}
                              {member.full_name}
                            </h6>
                            <small className="text-muted d-block mb-2">
                              {member.sister_code}
                            </small>

                            <Form.Select
                              size="sm"
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateRole(member.id, e.target.value)
                              }
                              className="mb-2"
                            >
                              <option value="member">Thành viên</option>
                              <option value="superior">Bề trên</option>
                              <option value="assistant">Phó bề trên</option>
                              <option value="treasurer">Thủ quỹ</option>
                              <option value="secretary">Thư ký</option>
                            </Form.Select>

                            <small className="text-muted">
                              Tham gia: {formatDate(member.joined_date)}
                            </small>
                          </div>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            X
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Chưa có thành viên nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentPage;
