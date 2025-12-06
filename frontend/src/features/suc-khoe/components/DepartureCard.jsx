import React from "react";
import { Card, Badge } from "react-bootstrap";
import { formatDate } from "@utils";

const DepartureCard = ({ departure, onView, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      temporary: "primary",
      medical: "danger",
      study: "info",
      mission: "success",
    };
    return colors[type] || "secondary";
  };

  const getTypeLabel = (type) => {
    const labels = {
      temporary: "Tạm thời",
      medical: "Khám chữa bệnh",
      study: "Học tập",
      mission: "Sứ vụ",
    };
    return labels[type] || type;
  };

  const isActive = !departure.return_date;

  return (
    <Card className="departure-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="departure-icon">
            <i className="fas fa-plane-departure"></i>
          </div>
          <div className="d-flex gap-2">
            <Badge bg={getTypeColor(departure.type)}>
              {getTypeLabel(departure.type)}
            </Badge>
            {isActive ? (
              <Badge bg="warning">Đang đi vắng</Badge>
            ) : (
              <Badge bg="success">Đã trở về</Badge>
            )}
          </div>
        </div>

        {(departure.saint_name ||
          departure.birth_name ||
          departure.sister_code) && (
          <h6 className="mb-2 d-flex align-items-center flex-wrap gap-2">
            <i className="fas fa-user text-primary me-2"></i>
            {departure.sister_code && (
              <span className="text-muted">[{departure.sister_code}]</span>
            )}
            <span className="d-flex align-items-center flex-wrap gap-1">
              {[departure.saint_name, departure.birth_name]
                .filter(Boolean)
                .join(" ")}
            </span>
          </h6>
        )}

        <div className="departure-details">
          <div className="detail-item">
            <i className="fas fa-calendar-alt text-success me-2"></i>
            <span>Từ: {formatDate(departure.departure_date)}</span>
          </div>

          {departure.expected_return_date && (
            <div className="detail-item">
              <i className="fas fa-calendar-check text-info me-2"></i>
              <span>
                Dự kiến về: {formatDate(departure.expected_return_date)}
              </span>
            </div>
          )}

          {departure.return_date && (
            <div className="detail-item">
              <i className="fas fa-home text-success me-2"></i>
              <span>Đã về: {formatDate(departure.return_date)}</span>
            </div>
          )}

          {departure.destination && (
            <div className="detail-item">
              <i className="fas fa-map-marker-alt text-danger me-2"></i>
              <span>{departure.destination}</span>
            </div>
          )}

          {departure.reason && (
            <div className="detail-item">
              <i className="fas fa-comment text-warning me-2"></i>
              <span className="text-truncate">{departure.reason}</span>
            </div>
          )}
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={() => onView(departure)}
          >
            <i className="fas fa-eye me-1"></i>
            Xem
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(departure)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(departure)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default DepartureCard;
