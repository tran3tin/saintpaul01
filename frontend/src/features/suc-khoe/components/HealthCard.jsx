import React from "react";
import { Card, Badge } from "react-bootstrap";
import { formatDate } from "@utils";

const HealthCard = ({ healthRecord, onView, onEdit, onDelete }) => {
  const getHealthStatusColor = (status) => {
    const colors = {
      excellent: "success",
      good: "info",
      fair: "warning",
      poor: "danger",
    };
    return colors[status] || "secondary";
  };

  const getHealthStatusLabel = (status) => {
    const labels = {
      excellent: "Tốt",
      good: "Khá",
      fair: "Trung bình",
      poor: "Yếu",
    };
    return labels[status] || status;
  };

  return (
    <Card className="health-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="health-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <Badge bg={getHealthStatusColor(healthRecord.health_status)}>
            {getHealthStatusLabel(healthRecord.health_status)}
          </Badge>
        </div>

        <h6 className="health-date mb-2">
          <i className="fas fa-calendar-alt text-primary me-2"></i>
          {formatDate(healthRecord.check_date)}
        </h6>

        <div className="health-details">
          <div className="detail-item">
            <i className="fas fa-hospital text-success me-2"></i>
            <span>{healthRecord.facility}</span>
          </div>

          {healthRecord.doctor && (
            <div className="detail-item">
              <i className="fas fa-user-md text-info me-2"></i>
              <span>BS. {healthRecord.doctor}</span>
            </div>
          )}

          {healthRecord.diagnosis && (
            <div className="detail-item">
              <i className="fas fa-stethoscope text-danger me-2"></i>
              <span className="text-truncate">{healthRecord.diagnosis}</span>
            </div>
          )}

          {healthRecord.blood_pressure && (
            <div className="detail-item">
              <i className="fas fa-tint text-danger me-2"></i>
              <span>Huyết áp: {healthRecord.blood_pressure}</span>
            </div>
          )}

          {healthRecord.weight && (
            <div className="detail-item">
              <i className="fas fa-weight text-warning me-2"></i>
              <span>Cân nặng: {healthRecord.weight} kg</span>
            </div>
          )}
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={() => onView(healthRecord)}
          >
            <i className="fas fa-eye me-1"></i>
            Xem
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(healthRecord)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(healthRecord)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default HealthCard;
