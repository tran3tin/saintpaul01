// src/features/settings/pages/BackupSettingsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Table,
  Badge,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaDatabase,
  FaArrowLeft,
  FaPlus,
  FaDownload,
  FaTrash,
  FaHistory,
  FaHdd,
  FaSync,
} from "react-icons/fa";
import { settingService } from "@services";
import { formatDate, formatFileSize } from "@utils/formatters";
import "./settings-common.css";

const BackupSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [backups, setBackups] = useState([]);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  });
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [backupsResult, storageResult] = await Promise.all([
        settingService.getBackups(),
        settingService.getStorageInfo(),
      ]);

      if (backupsResult.success) {
        setBackups(backupsResult.data || []);
      }
      if (storageResult.success) {
        setStorageInfo(
          storageResult.data || { used: 0, total: 0, percentage: 0 }
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!window.confirm("Bạn có chắc muốn tạo bản sao lưu mới?")) {
      return;
    }

    setCreating(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await settingService.createBackup();
      if (result.success) {
        setMessage({ type: "success", text: "Đã tạo bản sao lưu thành công!" });
        fetchData();
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi tạo bản sao lưu!" });
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    try {
      const result = await settingService.downloadBackup(backup.id);
      if (result.success) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", backup.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi tải bản sao lưu!" });
    }
  };

  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    setRestoring(true);
    setShowRestoreModal(false);

    try {
      const result = await settingService.restoreBackup(selectedBackup.id);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Đã khôi phục dữ liệu thành công! Hệ thống sẽ tải lại...",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi khôi phục dữ liệu!" });
    } finally {
      setRestoring(false);
      setSelectedBackup(null);
    }
  };

  const handleDelete = async (backup) => {
    if (
      !window.confirm(`Bạn có chắc muốn xóa bản sao lưu "${backup.filename}"?`)
    ) {
      return;
    }

    try {
      const result = await settingService.deleteBackup(backup.id);
      if (result.success) {
        setMessage({ type: "success", text: "Đã xóa bản sao lưu!" });
        fetchData();
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi xóa bản sao lưu!" });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      pending: "warning",
      failed: "danger",
    };
    const labels = {
      completed: "Hoàn thành",
      pending: "Đang xử lý",
      failed: "Thất bại",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="settings-page py-4">
      <Row className="mb-4">
        <Col>
          <Link to="/settings" className="btn btn-outline-secondary mb-3">
            <FaArrowLeft className="me-2" />
            Quay lại
          </Link>
          <h2 className="page-title">
            <FaDatabase className="me-2" />
            Sao Lưu & Khôi Phục
          </h2>
          <p className="text-muted">
            Quản lý sao lưu dữ liệu và khôi phục hệ thống
          </p>
        </Col>
      </Row>

      {message.text && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      {restoring && (
        <Alert variant="info">
          <Spinner size="sm" className="me-2" />
          Đang khôi phục dữ liệu... Vui lòng không đóng trình duyệt.
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={4}>
          <Card className="health-info-card h-100">
            <Card.Body className="text-center">
              <FaHdd size={40} className="text-primary mb-3" />
              <h5>Dung lượng lưu trữ</h5>
              <ProgressBar
                now={storageInfo.percentage}
                variant={storageInfo.percentage > 80 ? "danger" : "primary"}
                className="mb-2"
              />
              <p className="mb-0">
                {formatFileSize(storageInfo.used)} /{" "}
                {formatFileSize(storageInfo.total)}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="health-info-card h-100">
            <Card.Body className="text-center">
              <FaDatabase size={40} className="text-success mb-3" />
              <h5>Tổng số bản sao lưu</h5>
              <h2 className="mb-0">{backups.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="health-info-card h-100">
            <Card.Body className="text-center">
              <FaHistory size={40} className="text-info mb-3" />
              <h5>Bản sao lưu gần nhất</h5>
              <p className="mb-0">
                {backups.length > 0
                  ? formatDate(backups[0].created_at, "long")
                  : "Chưa có"}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="health-info-card">
        <Card.Header className="d-flex justify-content-between align-items-center documents-header">
          <span>Danh sách bản sao lưu</span>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2"
              onClick={fetchData}
            >
              <FaSync className="me-1" />
              Làm mới
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateBackup}
              disabled={creating}
            >
              {creating ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaPlus className="me-1" />
                  Tạo bản sao lưu
                </>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {backups.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaDatabase size={48} className="mb-3" />
              <p>Chưa có bản sao lưu nào</p>
              <Button variant="primary" onClick={handleCreateBackup}>
                <FaPlus className="me-2" />
                Tạo bản sao lưu đầu tiên
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Tên file</th>
                  <th>Kích thước</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td>
                      <FaDatabase className="me-2 text-primary" />
                      {backup.filename}
                    </td>
                    <td>{formatFileSize(backup.size)}</td>
                    <td>{formatDate(backup.created_at, "long")}</td>
                    <td>{getStatusBadge(backup.status)}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleDownload(backup)}
                        title="Tải xuống"
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleRestoreClick(backup)}
                        title="Khôi phục"
                        disabled={backup.status !== "completed"}
                      >
                        <FaHistory />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(backup)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Restore Confirmation Modal */}
      <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận khôi phục</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Cảnh báo!</strong> Khôi phục dữ liệu sẽ thay thế toàn bộ dữ
            liệu hiện tại bằng dữ liệu từ bản sao lưu. Thao tác này không thể
            hoàn tác.
          </Alert>
          {selectedBackup && (
            <p>
              Bạn có chắc muốn khôi phục dữ liệu từ bản sao lưu{" "}
              <strong>{selectedBackup.filename}</strong> (tạo ngày{" "}
              {formatDate(selectedBackup.created_at, "long")})?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRestoreModal(false)}
          >
            Hủy
          </Button>
          <Button variant="danger" onClick={handleRestore}>
            Xác nhận khôi phục
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BackupSettingsPage;
