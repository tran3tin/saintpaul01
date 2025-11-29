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
import { FaGraduationCap, FaSave, FaArrowLeft } from "react-icons/fa";
import { educationService, sisterService } from "@services";
import Breadcrumb from "@components/common/Breadcrumb";

const EducationFormPage = () => {
  const navigate = useNavigate();
  const { id, sisterId } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [sisters, setSisters] = useState([]);

  const [formData, setFormData] = useState({
    sister_id: sisterId || "",
    institution: "",
    major: "",
    degree_type: "dai_hoc",
    start_year: "",
    end_year: "",
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
      const response = await sisterService.getAll();
      if (response.success) {
        setSisters(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching sisters:", error);
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
      let result;
      if (isEdit) {
        result = await educationService.update(id, formData);
      } else {
        result = await educationService.create(formData);
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
        items={[
          { label: "Trang chủ", link: "/dashboard" },
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
                {isEdit ? "Chỉnh sửa Học vấn" : "Thêm Học vấn mới"}
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
                            {sister.religious_name} {sister.full_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Loại bằng *</Form.Label>
                      <Form.Select
                        name="degree_type"
                        value={formData.degree_type}
                        onChange={handleChange}
                        required
                      >
                        <option value="tien_si">Tiến sĩ</option>
                        <option value="thac_si">Thạc sĩ</option>
                        <option value="dai_hoc">Đại học</option>
                        <option value="cao_dang">Cao đẳng</option>
                        <option value="trung_cap">Trung cấp</option>
                        <option value="chung_chi">Chứng chỉ</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Trường / Cơ sở đào tạo *</Form.Label>
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Năm bắt đầu</Form.Label>
                      <Form.Control
                        type="number"
                        name="start_year"
                        value={formData.start_year}
                        onChange={handleChange}
                        placeholder="VD: 2020"
                        min="1950"
                        max={new Date().getFullYear() + 5}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Năm kết thúc</Form.Label>
                      <Form.Control
                        type="number"
                        name="end_year"
                        value={formData.end_year}
                        onChange={handleChange}
                        placeholder="VD: 2024"
                        min="1950"
                        max={new Date().getFullYear() + 10}
                      />
                    </Form.Group>
                  </Col>
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
                </Row>

                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Điểm trung bình (GPA)</Form.Label>
                      <Form.Control
                        type="text"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleChange}
                        placeholder="VD: 3.5/4.0 hoặc 8.5/10"
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
