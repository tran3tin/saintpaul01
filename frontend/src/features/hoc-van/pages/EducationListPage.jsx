// src/features/hoc-van/pages/EducationListPage.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { educationService } from "@services";
import EducationCard from "../components/EducationCard";
import EducationForm from "../components/EducationForm";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";

const EducationListPage = () => {
  const { sisterId } = useParams();
  const [loading, setLoading] = useState(true);
  const [educations, setEducations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);

  useEffect(() => {
    fetchEducations();
  }, [sisterId]);

  const fetchEducations = async () => {
    try {
      setLoading(true);
      const response = await educationService.getBySisterId(sisterId);
      if (response.success) {
        setEducations(response.data);
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEducation(null);
    setShowForm(true);
  };

  const handleEdit = (education) => {
    setSelectedEducation(education);
    setShowForm(true);
  };

  const handleDelete = async (education) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học vấn này?")) {
      try {
        await educationService.delete(education.id);
        fetchEducations();
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (selectedEducation) {
        await educationService.update(selectedEducation.id, values);
      } else {
        await educationService.create({ ...values, sister_id: sisterId });
      }
      setShowForm(false);
      fetchEducations();
    } catch (error) {
      console.error("Error saving education:", error);
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
          { label: "Trang chủ", link: "/dashboard" },
          { label: "Quản lý Nữ Tu", link: "/nu-tu" },
          { label: "Học vấn" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Học vấn</h2>
          <p className="text-muted mb-0">Danh sách học vấn và bằng cấp</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          <i className="fas fa-plus me-2"></i>
          Thêm Học vấn
        </Button>
      </div>

      {educations.length > 0 ? (
        <Row className="g-4">
          {educations.map((education) => (
            <Col key={education.id} xs={12} sm={6} lg={4}>
              <EducationCard
                education={education}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <i
              className="fas fa-graduation-cap text-muted mb-3"
              style={{ fontSize: "3rem" }}
            ></i>
            <h5>Chưa có thông tin học vấn</h5>
            <p className="text-muted">
              Thêm học vấn đầu tiên để theo dõi quá trình học tập
            </p>
            <Button variant="primary" onClick={handleAdd}>
              <i className="fas fa-plus me-2"></i>
              Thêm Học vấn
            </Button>
          </Card.Body>
        </Card>
      )}

      <EducationForm
        show={showForm}
        onHide={() => setShowForm(false)}
        education={selectedEducation}
        onSubmit={handleSubmit}
      />
    </Container>
  );
};

export default EducationListPage;
