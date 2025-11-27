// src/features/hanh-trinh/components/HanhTrinhForm/HanhTrinhForm.jsx

import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";
import { JOURNEY_STAGES, JOURNEY_STAGE_LABELS } from "@utils/constants";
import "./HanhTrinhForm.css";

const HanhTrinhForm = ({ show, onHide, journey, onSubmit }) => {
  const isEditMode = !!journey;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    journey || {
      stage: "",
      start_date: "",
      end_date: "",
      location: "",
      superior: "",
      formation_director: "",
      notes: "",
    }
  );

  const validate = () => {
    const newErrors = {};

    if (!values.stage) newErrors.stage = "Giai đoạn là bắt buộc";
    if (!values.start_date) newErrors.start_date = "Ngày bắt đầu là bắt buộc";
    if (!values.location) newErrors.location = "Địa điểm là bắt buộc";

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
          <i className="fas fa-route me-2"></i>
          {isEditMode ? "Chỉnh sửa Hành Trình" : "Thêm Hành Trình Mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Select
                label="Giai đoạn"
                name="stage"
                value={values.stage}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.stage}
                touched={touched.stage}
                required
              >
                <option value="">Chọn giai đoạn</option>
                {Object.entries(JOURNEY_STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Col>

            <Col md={6}>
              <DatePicker
                label="Ngày bắt đầu"
                name="start_date"
                value={values.start_date}
                onChange={(date) => setFieldValue("start_date", date)}
                onBlur={handleBlur}
                error={errors.start_date}
                touched={touched.start_date}
                required
              />
            </Col>

            <Col md={6}>
              <DatePicker
                label="Ngày kết thúc"
                name="end_date"
                value={values.end_date}
                onChange={(date) => setFieldValue("end_date", date)}
                onBlur={handleBlur}
                hint="Để trống nếu đang trong giai đoạn này"
              />
            </Col>

            <Col md={12}>
              <Input
                label="Địa điểm"
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.location}
                touched={touched.location}
                placeholder="Nhà dòng, giáo xứ..."
                required
              />
            </Col>

            <Col md={6}>
              <Input
                label="Bề trên"
                name="superior"
                value={values.superior}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tên bề trên"
              />
            </Col>

            <Col md={6}>
              <Input
                label="Giám đốc đào tạo"
                name="formation_director"
                value={values.formation_director}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tên giám đốc đào tạo"
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
                placeholder="Ghi chú về giai đoạn này..."
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

export default HanhTrinhForm;
