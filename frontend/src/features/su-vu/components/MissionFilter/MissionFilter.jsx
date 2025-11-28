// src/features/su-vu/components/MissionFilter/MissionFilter.jsx

import React, { useState } from "react";
import { Button, Offcanvas, Form, Badge } from "react-bootstrap";
import Select from "@components/forms/Select";
import DatePicker from "@components/forms/DatePicker";
import "./MissionFilter.css";

const MissionFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClear = () => {
    onClearFilters();
    handleClose();
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      {/* Filter Button */}
      <Button
        variant="outline-secondary"
        onClick={handleShow}
        className="w-100"
      >
        <i className="fas fa-filter me-2"></i>
        Bộ lọc
        {activeFilterCount > 0 && (
          <Badge bg="primary" className="ms-2">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Offcanvas */}
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <i className="fas fa-filter me-2"></i>
            Bộ lọc tìm kiếm
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <Form>
            {/* Mission Type */}
            <Form.Group className="mb-3">
              <Form.Label>Loại sứ vụ</Form.Label>
              <Select
                value={filters.type || ""}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="teaching">Giảng dạy</option>
                <option value="healthcare">Y tế</option>
                <option value="social">Xã hội</option>
                <option value="pastoral">Mục vụ</option>
                <option value="administration">Hành chính</option>
                <option value="other">Khác</option>
              </Select>
            </Form.Group>

            {/* Status */}
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Select
                value={filters.status || ""}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="active">Đang làm</option>
                <option value="completed">Đã kết thúc</option>
              </Select>
            </Form.Group>

            {/* Organization */}
            <Form.Group className="mb-3">
              <Form.Label>Tổ chức</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tên tổ chức"
                value={filters.organization || ""}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
            </Form.Group>

            {/* Location */}
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Địa điểm làm việc"
                value={filters.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </Form.Group>

            {/* Date Range */}
            <Form.Group className="mb-3">
              <Form.Label>Từ ngày</Form.Label>
              <DatePicker
                value={filters.start_date_from || ""}
                onChange={(date) => handleChange("start_date_from", date)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Đến ngày</Form.Label>
              <DatePicker
                value={filters.start_date_to || ""}
                onChange={(date) => handleChange("start_date_to", date)}
              />
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleClear}
                className="flex-grow-1"
              >
                <i className="fas fa-redo me-2"></i>
                Xóa bộ lọc
              </Button>
              <Button
                variant="primary"
                onClick={handleClose}
                className="flex-grow-1"
              >
                <i className="fas fa-check me-2"></i>
                Áp dụng
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MissionFilter;
