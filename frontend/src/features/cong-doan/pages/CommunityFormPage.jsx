// src/features/cong-doan/pages/CommunityFormPage.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService } from "@services";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const CommunityFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    established_date: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    if (isEdit) {
      fetchCommunityDetail();
    }
  }, [id]);

  const fetchCommunityDetail = async () => {
    try {
      setLoading(true);
      const response = await communityService.getDetail(id);
      if (response) {
        setFormData({
          name: response.name || "",
          code: response.code || "",
          address: response.address || "",
          phone: response.phone || "",
          email: response.email || "",
          established_date: response.established_date || "",
          status: response.status || "active",
          description: response.description || "",
        });
      }
    } catch (err) {
      console.error("Error fetching community:", err);
      setError("Khong the tai thong tin cong doan");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Vui long nhap ten cong doan");
      return;
    }

    if (!formData.code.trim()) {
      setError("Vui long nhap ma cong doan");
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        await communityService.update(id, formData);
      } else {
        await communityService.create(formData);
      }

      navigate("/cong-doan");
    } catch (err) {
      console.error("Error saving community:", err);
      setError("Co loi xay ra khi luu thong tin");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chu", link: "/dashboard" },
          { label: "Quan ly Cong Doan", link: "/cong-doan" },
          { label: isEdit ? "Chinh sua" : "Them moi" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            {isEdit ? "Chinh sua Cong Doan" : "Them Cong Doan moi"}
          </h2>
          <p className="text-muted mb-0">
            {isEdit ? "Cap nhat thong tin cong doan" : "Tao cong doan moi"}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/cong-doan")}>
          Quay lai
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ten cong doan *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhap ten cong doan"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ma cong doan *</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Nhap ma cong doan"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Dia chi</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Nhap dia chi"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dien thoai</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhap so dien thoai"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhap email"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Ngay thanh lap</Form.Label>
                  <Form.Control
                    type="date"
                    name="established_date"
                    value={formData.established_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trang thai</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="active">Dang hoat dong</option>
                    <option value="inactive">Khong hoat dong</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Mo ta</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Nhap mo ta"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/cong-doan")}
                disabled={submitting}
              >
                Huy
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Dang luu..." : isEdit ? "Cap nhat" : "Tao moi"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CommunityFormPage;
