// src/features/hoc-van/pages/EducationFormPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaGraduationCap, FaSave, FaArrowLeft, FaPaperclip } from "react-icons/fa";
import { educationService, sisterService } from "@services";
import Breadcrumb from "@components/common/Breadcrumb";
import MultiFileUpload from "@components/forms/MultiFileUpload";

// Chuẩn hóa danh sách nữ tu, loại bỏ trùng lặp
const normalizeSisters = (rawList = []) => {
  const map = new Map();
  rawList.forEach((sister) => {
    if (!sister || !sister.id || map.has(sister.id)) return;
    map.set(sister.id, {
      id: sister.id,
      code: sister.code,
      displayName:
        sister.religious_name || sister.birth_name || sister.full_name || "",
    });
  });
  return Array.from(map.values()).sort((a, b) =>
    (a.displayName || "").localeCompare(b.displayName || "", "vi")
  );
};

// Trích xuất danh sách từ response API
const extractSisterItems = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const EducationFormPage = () => {
  const navigate = useNavigate();
  const { id, sisterId } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sisters, setSisters] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [formData, setFormData] = useState({
    sister_id: sisterId || "",
    level: "bachelor",
    major: "",
    institution: "",
    start_date: "",
    end_date: "",
    graduation_year: "",
    status: "dang_hoc",
    gpa: "",
    thesis_title: "",
    notes: "",
  });

  useEffect(() => {
    fetchSisters();
    if (isEdit) {
      fetchEducation();
    }
  }, [id]);

  const fetchSisters = async () => {
    try {
      const response = await sisterService.getList({ limit: 1000, status: "all" });
      const list = normalizeSisters(
        extractSisterItems(response?.data) || extractSisterItems(response)
      );
      setSisters(list);
    } catch (error) {
      console.error("Error fetching sisters:", error);
      setMessage({ type: "danger", text: "Không thể tải danh sách nữ tu" });
    }
  };

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const response = await educationService.getById(id);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error("Error fetching education:", error);
      setMessage({ type: "danger", text: "Lỗi khi tải thông tin học vấn" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Chuẩn bị payload với đúng định dạng backend yêu cầu
      const payload = {
        sister_id: parseInt(formData.sister_id, 10),
        level: formData.level,
        major: formData.major || null,
        institution: formData.institution || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null,
        status: formData.status || "dang_hoc",
        gpa: formData.gpa || null,
        thesis_title: formData.thesis_title || null,
        notes: formData.notes || null,
        documents: documents.length > 0 ? JSON.stringify(documents) : null,
      };

      let result;
      if (isEdit) {
        result = await educationService.update(id, payload);
      } else {
        result = await educationService.create(payload);
      }

      if (result.success) {
        setMessage({
          type: "success",
          text: isEdit
            ? "Đã cập nhật học vấn thành công!"
            : "Đã thêm học vấn thành công!",
        });
        setTimeout(() => {
          if (sisterId) {
            navigate(`/nu-tu/${sisterId}/hoc-van`);
          } else {
            navigate("/hoc-van");
          }
        }, 1500);
      } else {
        setMessage({ type: "danger", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Lỗi khi lưu thông tin học vấn" });
    } finally {
      setSaving(false);
    }
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
    <Container fluid className="py-4">
      <Breadcrumb
        title={isEdit ? "Chỉnh sửa Học vấn" : "Thêm Học vấn mới"}
        items={[
          { label: "Học vấn", link: "/hoc-van" },
          { label: isEdit ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      />

      <div className="mb-4">
        <Link
          to={sisterId ? `/nu-tu/${sisterId}/hoc-van` : "/hoc-van"}
          className="btn btn-outline-secondary"
        >
          <FaArrowLeft className="me-2" />
          Quay lại
        </Link>
      </div>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaGraduationCap className="me-2" />
                Thông tin Học vấn
              </h5>
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert
                  variant={message.type}
                  dismissible
                  onClose={() => setMessage({ type: "", text: "" })}
                >
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nữ tu *</Form.Label>
                      <Form.Select
                        name="sister_id"
                        value={formData.sister_id}
                        onChange={handleChange}
                        required
                        disabled={Boolean(sisterId)}
                      >
                        <option value="">-- Chọn nữ tu --</option>
                        {sisters.map((sister) => (
                          <option key={sister.id} value={sister.id}>
                            {sister.displayName}
                            {sister.code ? ` (${sister.code})` : ""}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trình độ *</Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                      >
                        <option value="secondary">Trung học</option>
                        <option value="bachelor">Đại học</option>
                        <option value="master">Thạc sĩ</option>
                        <option value="doctorate">Tiến sĩ</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Trường / Cơ sở đào tạo</Form.Label>
                  <Form.Control
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Nhập tên trường hoặc cơ sở đào tạo"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ngành học / Chuyên ngành *</Form.Label>
                  <Form.Control
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="Nhập ngành học hoặc chuyên ngành"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày bắt đầu</Form.Label>
                      <Form.Control
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày kết thúc</Form.Label>
                      <Form.Control
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Năm tốt nghiệp</Form.Label>
                      <Form.Control
                        type="number"
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={handleChange}
                        placeholder="VD: 2024"
                        min="1950"
                        max={new Date().getFullYear() + 10}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="dang_hoc">Đang học</option>
                        <option value="da_tot_nghiep">Đã tốt nghiệp</option>
                        <option value="tam_nghi">Tạm nghỉ</option>
                        <option value="da_nghi">Đã nghỉ</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Điểm trung bình (GPA)</Form.Label>
                      <Form.Control
                        type="text"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleChange}
                        placeholder="VD: 3.5/4.0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Tên luận văn / Đề tài</Form.Label>
                  <Form.Control
                    type="text"
                    name="thesis_title"
                    value={formData.thesis_title}
                    onChange={handleChange}
                    placeholder="Nhập tên luận văn hoặc đề tài nghiên cứu (nếu có)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Ghi chú thêm..."
                  />
                </Form.Group>

                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaPaperclip className="me-2" />
                      Tài liệu đính kèm
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <MultiFileUpload
                      value={documents}
                      onChange={setDocuments}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024}
                    />
                    <small className="text-muted d-block mt-2">
                      Hỗ trợ: PDF, Word, hình ảnh (tối đa 5 file, mỗi file ≤ 10MB)
                    </small>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-end gap-2">
                  <Link
                    to={sisterId ? `/nu-tu/${sisterId}/hoc-van` : "/hoc-van"}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </Link>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {isEdit ? "Cập nhật" : "Lưu"}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>Hướng dẫn</Card.Header>
            <Card.Body>
              <ul className="mb-0">
                <li className="mb-2">Các trường có dấu (*) là bắt buộc</li>
                <li className="mb-2">Chọn đúng loại bằng cấp tương ứng</li>
                <li className="mb-2">
                  Điền đầy đủ thông tin trường học và ngành học
                </li>
                <li className="mb-2">
                  Cập nhật trạng thái khi hoàn thành khóa học
                </li>
                <li>Có thể bổ sung thông tin luận văn và GPA sau</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EducationFormPage;
