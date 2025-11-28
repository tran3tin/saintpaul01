// src/features/danh-gia/components/EvaluationCard/EvaluationCard.jsx

import React from "react";
import { Card, Badge, ProgressBar } from "react-bootstrap";
import { formatDate } from "@utils";
import "./EvaluationCard.css";

const EvaluationCard = ({ evaluation, onView, onEdit, onDelete }) => {
  const getEvaluationTypeColor = (type) => {
    const colors = {
      annual: "primary",
      semi_annual: "info",
      quarterly: "success",
      monthly: "warning",
      special: "danger",
    };
    return colors[type] || "secondary";
  };

  const getEvaluationTypeLabel = (type) => {
    const labels = {
      annual: "Đánh giá năm",
      semi_annual: "Đánh giá 6 tháng",
      quarterly: "Đánh giá quý",
      monthly: "Đánh giá tháng",
      special: "Đánh giá đặc biệt",
    };
    return labels[type] || type;
  };

  const getRatingColor = (rating) => {
    if (rating >= 90) return "success";
    if (rating >= 75) return "info";
    if (rating >= 60) return "warning";
    return "danger";
  };

  return (
    <Card className="evaluation-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="evaluation-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <Badge bg={getEvaluationTypeColor(evaluation.type)}>
            {getEvaluationTypeLabel(evaluation.type)}
          </Badge>
        </div>

        <h6 className="evaluation-period mb-2">
          <i className="fas fa-calendar-alt text-primary me-2"></i>
          {evaluation.period}
        </h6>

        <p className="evaluation-date text-muted mb-3">
          <i className="fas fa-clock me-2"></i>
          {formatDate(evaluation.evaluation_date)}
        </p>

        {/* Overall Rating */}
        {evaluation.overall_rating && (
          <div className="rating-section mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Tổng điểm</small>
              <Badge
                bg={getRatingColor(evaluation.overall_rating)}
                className="rating-badge"
              >
                {evaluation.overall_rating}/100
              </Badge>
            </div>
            <ProgressBar
              now={evaluation.overall_rating}
              variant={getRatingColor(evaluation.overall_rating)}
              className="rating-progress"
            />
          </div>
        )}

        {/* Evaluator */}
        {evaluation.evaluator && (
          <div className="evaluator-info">
            <i className="fas fa-user-tie text-success me-2"></i>
            <span className="text-muted">Người đánh giá: </span>
            <span className="fw-semibold">{evaluation.evaluator}</span>
          </div>
        )}

        {/* Categories Preview */}
        {evaluation.categories && evaluation.categories.length > 0 && (
          <div className="categories-preview mt-3">
            <small className="text-muted d-block mb-2">
              <i className="fas fa-list me-1"></i>
              {evaluation.categories.length} tiêu chí đánh giá
            </small>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={() => onView(evaluation)}
          >
            <i className="fas fa-eye me-1"></i>
            Xem
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(evaluation)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(evaluation)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default EvaluationCard;
