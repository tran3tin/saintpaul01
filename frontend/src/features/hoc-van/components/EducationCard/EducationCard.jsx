// src/features/hoc-van/components/EducationCard/EducationCard.jsx

import React from "react";
import { Card, Badge } from "react-bootstrap";
import { formatDate } from "@utils";
import "./EducationCard.css";

const EducationCard = ({ education, onEdit, onDelete }) => {
  return (
    <Card className="education-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="education-icon">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <Badge bg={education.status === "completed" ? "success" : "primary"}>
            {education.status === "completed" ? "Đã tốt nghiệp" : "Đang học"}
          </Badge>
        </div>

        <h5 className="education-degree mb-2">{education.degree}</h5>
        <p className="education-institution mb-2">{education.institution}</p>

        {education.major && (
          <p className="text-muted mb-2">
            <i className="fas fa-book me-2"></i>
            {education.major}
          </p>
        )}

        <div className="education-details">
          <div className="detail-item">
            <i className="fas fa-calendar text-primary me-2"></i>
            <span>
              {education.start_year}
              {education.graduation_year && ` - ${education.graduation_year}`}
            </span>
          </div>

          {education.gpa && (
            <div className="detail-item">
              <i className="fas fa-star text-warning me-2"></i>
              <span>GPA: {education.gpa}</span>
            </div>
          )}

          {education.certificate_number && (
            <div className="detail-item">
              <i className="fas fa-certificate text-success me-2"></i>
              <span>Số văn bằng: {education.certificate_number}</span>
            </div>
          )}
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-success flex-grow-1"
            onClick={() => onEdit(education)}
          >
            <i className="fas fa-edit me-1"></i>
            Sửa
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(education)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default EducationCard;
