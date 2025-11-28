// src/features/su-vu/components/MissionForm/MissionForm.jsx

import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "@hooks";
import Input from "@components/forms/Input";
import Select from "@components/forms/Select";
import DatePicker from "@components/forms/DatePicker";
import TextArea from "@components/forms/TextArea";

const MissionForm = ({ show, onHide, mission, onSubmit }) => {
  const isEditMode = !!mission;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    handleSubmit,
  } = useForm(
    mission || {
      position: "",
      organization: "",
      type: "",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
    }
  );

  const validate = () => {
    const newErrors = {};

    if (!values.position) newErrors.position = "Chức vụ là bắt buộc";
    if (!values.organization) newErrors.organization = "Tổ chức là bắt buộc";
    if (!values.start_date) newErrors.start_date = "Ngày bắt đầu là bắt buộc";

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
          <i className="fas fa-briefcase me-2"></i>
          {isEditMode ? "Chỉnh sửa Sứ vụ" : "Thêm Sứ vụ Mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleFormSubmit}>
        <Modal.Body>
          <Row className="g-3">
            <Col md={8}>
              <Input
                label="Chức vụ / Vai trò"
                name="position"
                value={values.position}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.position}
                touched={touched.position}
                placeholder="VD: Giáo viên, Y tá..."
                required
              />
            </Col>

            <Col md={4}>
              <Select
                label="Loại sứ vụ"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Chọn loại</option>
                <option value="teaching">Giảng dạy</option>
                <option value="healthcare">Y tế</option>
                <option value="social">Xã hội</option>
                <option value="pastoral">Mục vụ</option>
                <option value="administration">Hành chính</option>
                <option value="other">Khác</option>
              </Select>
            </Col>

            <Col md={12}>
              <Input
                label="Tổ chức / Cơ quan"
                name="organization"
                value={values.organization}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.organization}
                touched={touched.organization}
                placeholder="Tên tổ chức, cơ quan"
                required
              />
            </Col>

            <Col md={12}>
              <Input
                label="Địa điểm"
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Địa điểm làm việc"
              />
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
                hint="Để trống nếu đang làm"
              />
            </Col>

            <Col md={12}>
              <TextArea
                label="Mô tả công việc"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Mô tả chi tiết về công việc..."
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

export default MissionForm;
