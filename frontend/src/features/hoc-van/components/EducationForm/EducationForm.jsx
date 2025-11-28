// src/features/hoc-van/components/EducationForm/EducationForm.jsx

import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import TextArea from "@components/forms/TextArea";

const EducationForm = ({ show, onHide, education, onSubmit }) => {
  const isEditMode = !!education;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    education || {
      degree: "",
      institution: "",
      major: "",
      start_year: "",
      graduation_year: "",
      gpa: "",
      certificate_number: "",
      certificate_date: "",
      status: "in_progress",
      notes: "",
    }
  );

  const validate = () => {
    const newErrors = {};

    if (!values.degree) newErrors.degree = "Bằng cấp là bắt buộc";
    if (!values.institution) newErrors.institution = "Trường học là bắt buộc";
    if (!values.start_year) newErrors.start_year = "Năm bắt đầu là bắt buộc";

    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-graduation-cap me-2"></i>
          {isEditMode ? "Chỉnh sửa Học vấn" : "Thêm Học vấn Mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Input
                label="Bằng cấp"
                name="degree"
                value={values.degree}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.degree}
                touched={touched.degree}
                placeholder="VD: Cử nhân, Thạc sĩ..."
                required
              />
            </Col>

            <Col md={6}>
              <Select
                label="Trạng thái"
                name="status"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="in_progress">Đang học</option>
                <option value="completed">Đã tốt nghiệp</option>
                <option value="suspended">Tạm dừng</option>
              </Select>
            </Col>

            <Col md={12}>
              <Input
                label="Trường học"
                name="institution"
                value={values.institution}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.institution}
                touched={touched.institution}
                placeholder="Tên trường học"
                required
              />
            </Col>

            <Col md={12}>
              <Input
                label="Chuyên ngành"
                name="major"
                value={values.major}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Chuyên ngành học"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Năm bắt đầu"
                name="start_year"
                type="number"
                value={values.start_year}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.start_year}
                touched={touched.start_year}
                placeholder="2020"
                required
              />
            </Col>

            <Col md={6}>
              <Input
                label="Năm tốt nghiệp"
                name="graduation_year"
                type="number"
                value={values.graduation_year}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="2024"
              />
            </Col>

            <Col md={6}>
              <Input
                label="GPA"
                name="gpa"
                type="number"
                step="0.01"
                value={values.gpa}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="3.50"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Số văn bằng"
                name="certificate_number"
                value={values.certificate_number}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Số văn bằng"
              />
            </Col>

            <Col md={12}>
              <TextArea
                label="Ghi chú"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Ghi chú về học vấn..."
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            <i className="fas fa-save me-2"></i>
            {isEditMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EducationForm;
