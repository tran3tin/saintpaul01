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
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { communityService } from "@services";
import { formatDate } from "@utils";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import "./CommunityDetailPage.css";

const getRoleLabel = (role) => {
  const roles = {
    superior: "Bề trên",
    assistant: "Phó bề trên",
    treasurer: "Thủ quỹ",
    secretary: "Thư ký",
    member: "Thành viên",
  };
  return roles[role] || "Thành viên";
};

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <label>{label}</label>
    <div className={`value ${!value || value === "-" ? "empty" : ""}`}>
      {value || "Chưa cập nhật"}
    </div>
  </div>
);

const CommunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  
  // History states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyContent, setHistoryContent] = useState("");
  const [editingHistory, setEditingHistory] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    fetchCommunityDetail();
    fetchMembers();
  }, [id]);

  useEffect(() => {
    // Load history content when community data is loaded
    if (community?.history) {
      setHistoryContent(community.history);
    }
  }, [community]);

  const fetchCommunityDetail = async () => {
    try {
      setLoading(true);
      const response = await communityService.getDetail(id);
      if (response && response.community) {
        setCommunity(response.community);
        // Nếu API trả về members cùng lúc
        if (response.members) {
          setMembers(response.members);
        }
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
      if (response && response.members) {
        setMembers(response.members);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/cong-doan/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cộng đoàn này?")) {
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

  // History handlers
  const handleOpenHistoryEditor = () => {
    setEditingHistory(true);
    setShowHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setEditingHistory(false);
    // Reset to saved content
    if (community?.history) {
      setHistoryContent(community.history);
    }
  };

  const handleSaveHistory = async () => {
    try {
      setSavingHistory(true);
      await communityService.update(id, { history: historyContent });
      setCommunity(prev => ({ ...prev, history: historyContent }));
      setShowHistoryModal(false);
      setEditingHistory(false);
    } catch (error) {
      console.error("Error saving history:", error);
      alert("Không thể lưu lịch sử. Vui lòng thử lại.");
    } finally {
      setSavingHistory(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử hình thành?")) {
      try {
        await communityService.update(id, { history: null });
        setCommunity(prev => ({ ...prev, history: null }));
        setHistoryContent("");
      } catch (error) {
        console.error("Error deleting history:", error);
        alert("Không thể xóa lịch sử. Vui lòng thử lại.");
      }
    }
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
          <h3>Không tìm thấy thông tin cộng đoàn</h3>
          <Button variant="primary" onClick={() => navigate("/cong-doan")}>
            Quay lại danh sách
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        title="Thông tin Cộng Đoàn"
        items={[
          { label: "Quản lý Cộng Đoàn", link: "/cong-doan" },
          { label: community.name },
        ]}
      />

      {/* Action Buttons */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <div className="action-buttons">
          <Button variant="success" onClick={handleEdit}>
            <i className="fas fa-edit me-2"></i>Chỉnh sửa
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>Xóa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/cong-doan")}>
            <i className="fas fa-arrow-left me-2"></i>Quay lại
          </Button>
        </div>
      </div>

      <Tab.Container defaultActiveKey="info">
        <Row className="g-4">
          {/* Left Column - Icon & Quick Info */}
          <Col lg={3}>
            {/* Community Icon Card */}
            <Card className="health-info-card">
              <Card.Header className="documents-header">
                <i className="fas fa-home"></i>
                <span>Cộng Đoàn</span>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="community-icon-section">
                  <div className="community-icon-large">
                    <span style={{ fontSize: "3rem" }}>🏠</span>
                  </div>
                  <div className="name-display">
                    <h3 className="community-name">{community.name}</h3>
                    <div className="code">
                      <i className="fas fa-id-card me-2"></i>
                      {community.code}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge
                      bg={
                        community.status === "active" ? "success" : "secondary"
                      }
                    >
                      {community.status === "active"
                        ? "Đang hoạt động"
                        : "Không hoạt động"}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Info Card */}
            <Card className="health-info-card">
              <Card.Header className="system-header">
                <i className="fas fa-info-circle"></i>
                <span>Thông tin nhanh</span>
              </Card.Header>
              <Card.Body className="p-2">
                <div className="quick-info">
                  <div className="quick-info-item">
                    <i className="fas fa-users text-primary"></i>
                    <div className="info-content">
                      <small className="text-muted">Số thành viên</small>
                      <div className="fw-semibold">{members.length}</div>
                    </div>
                  </div>

                  <div className="quick-info-item">
                    <i className="fas fa-calendar-alt text-success"></i>
                    <div className="info-content">
                      <small className="text-muted">Ngày thành lập</small>
                      <div className="fw-semibold">
                        {formatDate(community.established_date)}
                      </div>
                    </div>
                  </div>

                  <div className="quick-info-item">
                    <i className="fas fa-map-marker-alt text-info"></i>
                    <div className="info-content">
                      <small className="text-muted">Địa chỉ</small>
                      <div className="fw-semibold">
                        {community.address || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="quick-info-item">
                    <i className="fas fa-phone text-warning"></i>
                    <div className="info-content">
                      <small className="text-muted">Điện thoại</small>
                      <div className="fw-semibold">
                        {community.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Action Card */}
            <Card className="health-info-card">
              <Card.Body>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleAssignMembers}
                >
                  <i className="fas fa-user-plus me-2"></i>Phân công thành viên
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Content */}
          <Col lg={9}>
            {/* Navigation Tabs */}
            <Card className="health-info-card mb-3">
              <Card.Body className="p-2">
                <Nav variant="pills" className="nav-horizontal-tabs">
                  <Nav.Link eventKey="info">
                    <i className="fas fa-info-circle"></i>
                    Thông tin
                  </Nav.Link>
                  <Nav.Link eventKey="members">
                    <i className="fas fa-users"></i>
                    Thành viên ({members.length})
                  </Nav.Link>
                  <Nav.Link eventKey="history">
                    <i className="fas fa-book"></i>
                    Lịch sử hình thành
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>

            {/* Content Card */}
            <Card className="health-info-card">
              <Card.Header>
                <i className="fas fa-info-circle"></i>
                <span>Chi tiết thông tin</span>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="info">
                    <div className="info-section">
                      <h5>
                        <i className="fas fa-home"></i>
                        Thông tin cơ bản
                      </h5>
                      <Row className="g-3">
                        <Col md={6}>
                          <InfoItem
                            label="Tên cộng đoàn"
                            value={community.name}
                          />
                        </Col>
                        <Col md={6}>
                          <InfoItem label="Mã số" value={community.code} />
                        </Col>
                        <Col md={6}>
                          <InfoItem
                            label="Ngày thành lập"
                            value={formatDate(community.established_date)}
                          />
                        </Col>
                        <Col md={6}>
                          <InfoItem
                            label="Trạng thái"
                            value={
                              community.status === "active"
                                ? "Đang hoạt động"
                                : "Không hoạt động"
                            }
                          />
                        </Col>
                        <Col md={12}>
                          <InfoItem label="Địa chỉ" value={community.address} />
                        </Col>
                        <Col md={6}>
                          <InfoItem
                            label="Điện thoại"
                            value={community.phone}
                          />
                        </Col>
                        <Col md={6}>
                          <InfoItem label="Email" value={community.email} />
                        </Col>
                        <Col md={12}>
                          <InfoItem
                            label="Mô tả"
                            value={community.description}
                          />
                        </Col>
                      </Row>
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="members">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Danh sách thành viên</h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAssignMembers}
                      >
                        <i className="fas fa-plus me-2"></i>Thêm thành viên
                      </Button>
                    </div>

                    {members.length > 0 ? (
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Mã số</th>
                            <th>Họ tên</th>
                            <th>Tên thánh</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, index) => (
                            <tr key={member.id}>
                              <td>{index + 1}</td>
                              <td>{member.sister_code}</td>
                              <td>{member.birth_name}</td>
                              <td>{member.saint_name || "-"}</td>
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
                              <td>{formatDate(member.start_date)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() =>
                                    handleViewMember(member.sister_id)
                                  }
                                >
                                  <i className="fas fa-eye"></i>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <p className="text-muted">Chưa có thành viên nào</p>
                        <Button variant="primary" onClick={handleAssignMembers}>
                          <i className="fas fa-user-plus me-2"></i>Thêm thành
                          viên đầu tiên
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>

                  <Tab.Pane eventKey="history">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <i className="fas fa-book me-2"></i>
                        Lịch sử hình thành
                      </h5>
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenHistoryEditor}
                        >
                          <i className="fas fa-edit me-2"></i>
                          {community?.history ? "Sửa" : "Soạn thảo"}
                        </Button>
                        {community?.history && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDeleteHistory}
                          >
                            <i className="fas fa-trash me-2"></i>
                            Xóa
                          </Button>
                        )}
                      </div>
                    </div>

                    {community?.history ? (
                      <div className="history-content">
                        <div 
                          className="ql-editor" 
                          dangerouslySetInnerHTML={{ __html: community.history }}
                          style={{ 
                            padding: '15px', 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '8px',
                            minHeight: '200px',
                            backgroundColor: '#fafafa'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-book text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted">Chưa có thông tin lịch sử hình thành</p>
                        <Button variant="primary" onClick={handleOpenHistoryEditor}>
                          <i className="fas fa-edit me-2"></i>Soạn thảo lịch sử
                        </Button>
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Tab.Container>

      {/* History Editor Modal */}
      <Modal 
        show={showHistoryModal} 
        onHide={handleCloseHistoryModal}
        size="xl"
        centered
        className="history-editor-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2"></i>
            Soạn thảo lịch sử hình thành - {community?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Nội dung chi tiết <span className="text-danger">*</span>
            </Form.Label>
            <div className="quill-container" style={{ minHeight: '400px' }}>
              <ReactQuill
                theme="snow"
                value={historyContent}
                onChange={setHistoryContent}
                modules={quillModules}
                formats={quillFormats}
                style={{ height: '350px' }}
                placeholder="Nhập nội dung lịch sử hình thành cộng đoàn..."
              />
            </div>
            <small className="text-muted mt-5 d-block">
              <i className="fas fa-info-circle me-1"></i>
              Sử dụng thanh công cụ để định dạng văn bản, thêm hình ảnh, liên kết...
            </small>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseHistoryModal} disabled={savingHistory}>
            <i className="fas fa-times me-2"></i>Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveHistory} disabled={savingHistory}>
            {savingHistory ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>Lưu
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommunityDetailPage;
