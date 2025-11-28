// src/features/danh-gia/components/EvaluationForm/EvaluationForm.jsx

import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";

const EvaluationForm = ({ show, onHide, evaluation, onSubmit }) => {
  const isEditMode = !!evaluation;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    evaluation || {
      type: "",
      period: "",
      evaluation_date: "",
      evaluator: "",
      spiritual_life: "",
      community_life: "",
      apostolic_work: "",
      personal_development: "",
      overall_rating: "",
      strengths: "",
      weaknesses: "",
      recommendations: "",
      notes: "",
    }
  );

  const validate = () => {
    const newErrors = {};

    if (!values.type) newErrors.type = "Loại đánh giá là bắt buộc";
    if (!values.period) newErrors.period = "Kỳ đánh giá là bắt buộc";
    if (!values.evaluation_date)
      newErrors.evaluation_date = "Ngày đánh giá là bắt buộc";

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
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-clipboard-check me-2"></i>
          {isEditMode ? "Chỉnh sửa Đánh giá" : "Thêm Đánh giá Mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {/* Basic Info */}
            <Col md={12}>
              <h6 className="mb-3">
                <i className="fas fa-info-circle me-2"></i>
                Thông tin cơ bản
              </h6>
            </Col>

            <Col md={4}>
              <Select
                label="Loại đánh giá"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.type}
                touched={touched.type}
                required
              >
                <option value="">Chọn loại</option>
                <option value="annual">Đánh giá năm</option>
                <option value="semi_annual">Đánh giá 6 tháng</option>
                <option value="quarterly">Đánh giá quý</option>
                <option value="monthly">Đánh giá tháng</option>
                <option value="special">Đánh giá đặc biệt</option>
              </Select>
            </Col>

            <Col md={4}>
              <Input
                label="Kỳ đánh giá"
                name="period"
                value={values.period}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.period}
                touched={touched.period}
                placeholder="VD: Năm 2024, Quý 1/2024..."
                required
              />
            </Col>

            <Col md={4}>
              <DatePicker
                label="Ngày đánh giá"
                name="evaluation_date"
                value={values.evaluation_date}
                onChange={(date) => setFieldValue("evaluation_date", date)}
                onBlur={handleBlur}
                error={errors.evaluation_date}
                touched={touched.evaluation_date}
                required
              />
            </Col>

            <Col md={12}>
              <Input
                label="Người đánh giá"
                name="evaluator"
                value={values.evaluator}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tên người đánh giá"
              />
            </Col>

            {/* Rating Categories */}
            <Col md={12} className="mt-4">
              <h6 className="mb-3">
                <i className="fas fa-star me-2"></i>
                Điểm đánh giá (0-100)
              </h6>
            </Col>

            <Col md={6}>
              <Input
                label="Đời sống thiêng liêng"
                name="spiritual_life"
                type="number"
                min="0"
                max="100"
                value={values.spiritual_life}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0-100"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Đời sống cộng đoàn"
                name="community_life"
                type="number"
                min="0"
                max="100"
                value={values.community_life}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0-100"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Công tác tông đồ"
                name="apostolic_work"
                type="number"
                min="0"
                max="100"
                value={values.apostolic_work}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0-100"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Phát triển cá nhân"
                name="personal_development"
                type="number"
                min="0"
                max="100"
                value={values.personal_development}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0-100"
              />
            </Col>

            <Col md={12}>
              <Input
                label="Tổng điểm"
                name="overall_rating"
                type="number"
                min="0"
                max="100"
                value={values.overall_rating}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0-100"
              />
            </Col>

            {/* Comments */}
            <Col md={12} className="mt-4">
              <h6 className="mb-3">
                <i className="fas fa-comment-alt me-2"></i>
                Nhận xét
              </h6>
            </Col>

            <Col md={12}>
              <TextArea
                label="Điểm mạnh"
                name="strengths"
                value={values.strengths}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Những điểm mạnh cần phát huy..."
              />
            </Col>

            <Col md={12}>
              <TextArea
                label="Điểm yếu"
                name="weaknesses"
                value={values.weaknesses}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Những điểm cần cải thiện..."
              />
            </Col>

            <Col md={12}>
              <TextArea
                label="Khuyến nghị"
                name="recommendations"
                value={values.recommendations}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Các khuyến nghị cho kỳ tiếp theo..."
              />
            </Col>

            <Col md={12}>
              <TextArea
                label="Ghi chú"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                placeholder="Ghi chú thêm..."
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

export default EvaluationForm;
