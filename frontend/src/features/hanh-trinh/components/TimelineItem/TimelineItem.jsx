// src/features/hanh-trinh/components/TimelineItem/TimelineItem.jsx

import React from "react";
import { Badge, Button } from "react-bootstrap";
import { formatDate } from "@utils";
import { JOURNEY_STAGE_LABELS, JOURNEY_STAGE_COLORS } from "@utils/constants";
import "./TimelineItem.css";

const TimelineItem = ({ journey, isFirst, isLast, onEdit, onDelete }) => {
  return (
    <div
      className={`timeline-item ${isFirst ? "first" : ""} ${
        isLast ? "last" : ""
      }`}
    >
      {/* Marker */}
      <div className="timeline-marker">
        <i className="fas fa-circle"></i>
      </div>

      {/* Content */}
      <div className="timeline-content">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="mb-1">
              <Badge bg={JOURNEY_STAGE_COLORS[journey.stage]} className="me-2">
                {JOURNEY_STAGE_LABELS[journey.stage]}
              </Badge>
            </h5>
            <p className="text-muted mb-0">
              <i className="fas fa-calendar me-2"></i>
              {formatDate(journey.start_date)}
              {journey.end_date && ` - ${formatDate(journey.end_date)}`}
              {!journey.end_date && " - Hiện tại"}
            </p>
          </div>

          <div className="timeline-actions">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onEdit(journey)}
            >
              <i className="fas fa-edit"></i>
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(journey)}
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="timeline-details">
          {journey.location && (
            <div className="detail-row">
              <i className="fas fa-map-marker-alt text-primary me-2"></i>
              <span>{journey.location}</span>
            </div>
          )}

          {journey.superior && (
            <div className="detail-row">
              <i className="fas fa-user-tie text-success me-2"></i>
              <span>Bề trên: {journey.superior}</span>
            </div>
          )}

          {journey.formation_director && (
            <div className="detail-row">
              <i className="fas fa-chalkboard-teacher text-info me-2"></i>
              <span>Giám đốc đào tạo: {journey.formation_director}</span>
            </div>
          )}

          {journey.notes && (
            <div className="timeline-notes">
              <i className="fas fa-sticky-note text-warning me-2"></i>
              <span>{journey.notes}</span>
            </div>
          )}
        </div>

        {/* Documents */}
        {journey.documents && journey.documents.length > 0 && (
          <div className="timeline-documents mt-3">
            <h6 className="mb-2">
              <i className="fas fa-file-alt me-2"></i>
              Tài liệu đính kèm
            </h6>
            <div className="document-list">
              {journey.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-item"
                >
                  <i className="fas fa-file-pdf text-danger me-2"></i>
                  {doc.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;
