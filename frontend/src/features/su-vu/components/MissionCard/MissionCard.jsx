// src/features/su-vu/components/MissionCard/MissionCard.jsx

import React from "react";
import { Card, Badge } from "react-bootstrap";
import { formatDate } from "@utils";
import "./MissionCard.css";

const MissionCard = ({ mission, onEdit, onDelete }) => {
  const isActive = !mission.end_date;

  return (
    <Card className="mission-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="mission-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <Badge bg={isActive ? "success" : "secondary"}>
            {isActive ? "Đang làm" : "Đã kết thúc"}
          </Badge>
        </div>

        <h5 className="mission-position mb-2">{mission.position}</h5>
        <p className="mission-organization mb-2">
          <i className="fas fa-building me-2"></i>
          {mission.organization}
        </p>

        {mission.type && (
          <Badge bg="info" className="mb-2">
            {getMissionTypeLabel(mission.type)}
          </Badge>
        )}

        <div className="mission-details">
          <div className="detail-item">
            <i className="fas fa-calendar text-primary me-2"></i>
            <span>
              {formatDate(mission.start_date)}
              {mission.end_date
                ? ` - ${formatDate(mission.end_date)}`
                : " - Hiện tại"}
            </span>
          </div>

          {mission.location && (
            <div className="detail-item">
              <i className="fas fa-map-marker-alt text-danger me-2"></i>
              <span>{mission.location}</span>
            </div>
          )}

          {mission.description && (
            <div className="mission-description mt-2">
              <small className="text-muted">{mission.description}</small>
            </div>
          )}
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-success flex-grow-1"
            onClick={() => onEdit(mission)}
          >
            <i className="fas fa-edit me-1"></i>
            Sửa
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(mission)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

const getMissionTypeLabel = (type) => {
  const types = {
    teaching: "Giảng dạy",
    healthcare: "Y tế",
    social: "Xã hội",
    pastoral: "Mục vụ",
    administration: "Hành chính",
    other: "Khác",
  };
  return types[type] || type;
};

export default MissionCard;
