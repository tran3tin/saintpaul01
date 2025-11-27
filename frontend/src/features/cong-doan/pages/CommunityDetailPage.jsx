// src/features/cong-doan/pages/CommunityDetailPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Tab,
  Nav,
  Table,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./CommunityDetailPage.css";

const getRoleLabel = (role) => {
  const roles = {
    superior: "Be tren",
    assistant: "Pho be tren",
    treasurer: "Thu quy",
    secretary: "Thu ky",
    member: "Thanh vien",
  };
  return roles[role] || "Thanh vien";
};

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <small className="text-muted d-block mb-1">{label}</small>
    <div className="fw-semibold">{value || "-"}</div>
  </div>
);

const CommunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchCommunityDetail();
    fetchMembers();
  }, [id]);

  const fetchCommunityDetail = async () => {
    try {
      setLoading(true);
      const response = await communityService.getDetail(id);
      if (response) {
        setCommunity(response);
      }
    } catch (error) {
      console.error("Error fetching community detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await communityService.getMembers(id);
      if (response) {
        setMembers(response);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/cong-doan/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Ban co chac chan muon xoa cong doan nay?")) {
      try {
        await communityService.delete(id);
        navigate("/cong-doan");
      } catch (error) {
        console.error("Error deleting community:", error);
      }
    }
  };

  const handleAssignMembers = () => {
    navigate(`/cong-doan/${id}/assign`);
  };

  const handleViewMember = (memberId) => {
    navigate(`/nu-tu/${memberId}`);
  };

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

  if (!community) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <h3>Khong tim thay thong tin cong doan</h3>
          <Button variant="primary" onClick={() => navigate("/cong-doan")}>
            Quay lai danh sach
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chu", link: "/dashboard" },
          { label: "Quan ly Cong Doan", link: "/cong-doan" },
          { label: community.name },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Thong tin Cong Doan</h2>
          <p className="text-muted mb-0">Chi tiet thong tin cong doan</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleEdit}>
            Chinh sua
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xoa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/cong-doan")}>
            Quay lai
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="community-profile-card">
            <Card.Body className="text-center">
              <div className="community-icon-large mb-3">
                <span style={{ fontSize: "3rem" }}>🏠</span>
              </div>
              <h3 className="mb-2">{community.name}</h3>
              <p className="text-muted mb-3">{community.code}</p>
              <Badge
                bg={community.status === "active" ? "success" : "secondary"}
                className="mb-3"
              >
                {community.status === "active"
                  ? "Dang hoat dong"
                  : "Khong hoat dong"}
              </Badge>

              <div className="quick-stats mt-3">
                <div className="d-flex justify-content-around">
                  <div>
                    <small className="text-muted">Thanh vien</small>
                    <h4 className="mb-0">{members.length}</h4>
                  </div>
                  <div>
                    <small className="text-muted">Thanh lap</small>
                    <div className="fw-semibold">
                      {formatDate(community.established_date)}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-100 mt-3"
                onClick={handleAssignMembers}
              >
                Phan cong thanh vien
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Tab.Container defaultActiveKey="info">
            <Card>
              <Card.Header className="bg-white">
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="info">Thong tin</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="members">
                      Thanh vien ({members.length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>

              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="info">
                    <h5 className="mb-3">Thong tin co ban</h5>
                    <Row className="g-3">
                      <Col md={6}>
                        <InfoItem
                          label="Ten cong doan"
                          value={community.name}
                        />
                      </Col>
                      <Col md={6}>
                        <InfoItem label="Ma so" value={community.code} />
                      </Col>
                      <Col md={6}>
                        <InfoItem
                          label="Ngay thanh lap"
                          value={formatDate(community.established_date)}
                        />
                      </Col>
                      <Col md={6}>
                        <InfoItem
                          label="Trang thai"
                          value={
                            community.status === "active"
                              ? "Dang hoat dong"
                              : "Khong hoat dong"
                          }
                        />
                      </Col>
                      <Col md={12}>
                        <InfoItem label="Dia chi" value={community.address} />
                      </Col>
                      <Col md={6}>
                        <InfoItem label="Dien thoai" value={community.phone} />
                      </Col>
                      <Col md={6}>
                        <InfoItem label="Email" value={community.email} />
                      </Col>
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="members">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Danh sach thanh vien</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAssignMembers}
                      >
                        Them thanh vien
                      </Button>
                    </div>

                    {members.length > 0 ? (
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Ma so</th>
                            <th>Ho ten</th>
                            <th>Ten thanh</th>
                            <th>Vai tro</th>
                            <th>Ngay tham gia</th>
                            <th>Thao tac</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, index) => (
                            <tr key={member.id}>
                              <td>{index + 1}</td>
                              <td>{member.sister_code}</td>
                              <td>{member.full_name}</td>
                              <td>{member.religious_name || "-"}</td>
                              <td>
                                <Badge
                                  bg={
                                    member.role === "superior"
                                      ? "danger"
                                      : member.role === "assistant"
                                      ? "warning"
                                      : "secondary"
                                  }
                                >
                                  {getRoleLabel(member.role)}
                                </Badge>
                              </td>
                              <td>{formatDate(member.joined_date)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewMember(member.id)}
                                >
                                  Xem
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <p className="text-muted">Chua co thanh vien nao</p>
                        <Button variant="primary" onClick={handleAssignMembers}>
                          Them thanh vien dau tien
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default CommunityDetailPage;
