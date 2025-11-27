// src/features/nu-tu/pages/SisterListPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Mock data
const mockSisters = [
  {
    id: 1,
    religious_name: "Maria",
    full_name: "Nguyễn Thị An",
    birth_date: "1985-03-15",
    current_stage: "vinh_khan",
    community: "Cộng đoàn Mẹ Vô Nhiễm",
    status: "active",
  },
  {
    id: 2,
    religious_name: "Teresa",
    full_name: "Trần Thị Bình",
    birth_date: "1990-07-22",
    current_stage: "tam_khan",
    community: "Cộng đoàn Thánh Tâm",
    status: "active",
  },
  {
    id: 3,
    religious_name: "Anna",
    full_name: "Lê Thị Cúc",
    birth_date: "1988-11-10",
    current_stage: "vinh_khan",
    community: "Cộng đoàn Fatima",
    status: "active",
  },
  {
    id: 4,
    religious_name: "Rosa",
    full_name: "Phạm Thị Dung",
    birth_date: "1992-05-08",
    current_stage: "tien_tap",
    community: "Cộng đoàn Mẹ Vô Nhiễm",
    status: "active",
  },
  {
    id: 5,
    religious_name: "Lucia",
    full_name: "Hoàng Thị Em",
    birth_date: "1995-01-20",
    current_stage: "thỉnh_sinh",
    community: "Nhà Mẹ",
    status: "active",
  },
];

const stageLabels = {
  thinh_sinh: { label: "Thỉnh sinh", color: "secondary" },
  tien_tap: { label: "Tiền tập", color: "info" },
  tap_vien: { label: "Tập viện", color: "primary" },
  tam_khan: { label: "Tạm khấn", color: "warning" },
  vinh_khan: { label: "Vĩnh khấn", color: "success" },
};

const SisterListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sisters, setSisters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSisters(mockSisters);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSisters = sisters.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.religious_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => navigate("/nu-tu/create");
  const handleView = (sister) => navigate(`/nu-tu/${sister.id}`);
  const handleEdit = (sister) => navigate(`/nu-tu/${sister.id}/edit`);
  const handleDelete = (sister) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${sister.full_name}?`)) {
      setSisters(sisters.filter((s) => s.id !== sister.id));
    }
  };

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getStageInfo = (stage) => stageLabels[stage] || { label: stage, color: "secondary" };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Nữ Tu</h2>
          <p className="text-muted mb-0">Danh sách tất cả nữ tu trong hệ thống</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <i className="fas fa-plus me-2"></i>
          Thêm Nữ Tu
        </Button>
      </div>

      {/* Search & View Toggle */}
      <Row className="g-3 mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, tên thánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <ButtonGroup className="w-100">
            <Button
              variant={viewMode === "table" ? "primary" : "outline-secondary"}
              onClick={() => setViewMode("table")}
            >
              <i className="fas fa-table me-1"></i> Bảng
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "outline-secondary"}
              onClick={() => setViewMode("grid")}
            >
              <i className="fas fa-th me-1"></i> Lưới
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <Card>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Tên Thánh</th>
                  <th>Họ và Tên</th>
                  <th>Tuổi</th>
                  <th>Giai đoạn</th>
                  <th>Cộng đoàn</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSisters.map((sister, index) => (
                  <tr key={sister.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{sister.religious_name}</strong>
                    </td>
                    <td>{sister.full_name}</td>
                    <td>{calculateAge(sister.birth_date)}</td>
                    <td>
                      <Badge bg={getStageInfo(sister.current_stage).color}>
                        {getStageInfo(sister.current_stage).label}
                      </Badge>
                    </td>
                    <td>{sister.community}</td>
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
      ) : (
        <Row className="g-4">
          {filteredSisters.map((sister) => (
            <Col key={sister.id} xs={12} sm={6} lg={4} xl={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <div
                    className="avatar-circle bg-primary text-white mx-auto mb-3"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                    }}
                  >
                    {sister.religious_name.charAt(0)}
                  </div>
                  <h5 className="mb-1">{sister.religious_name}</h5>
                  <p className="text-muted mb-2">{sister.full_name}</p>
                  <Badge bg={getStageInfo(sister.current_stage).color} className="mb-3">
                    {getStageInfo(sister.current_stage).label}
                  </Badge>
                  <p className="small text-muted mb-0">{sister.community}</p>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-1"
                    onClick={() => handleView(sister)}
                  >
                    <i className="fas fa-eye"></i>
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEdit(sister)}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(sister)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Summary */}
      <div className="mt-4 text-muted">
        Hiển thị {filteredSisters.length} / {sisters.length} nữ tu
      </div>
    </Container>
  );
};

export default SisterListPage;
