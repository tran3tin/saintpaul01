// src/components/common/EmptyState/EmptyState.jsx

import React from "react";
import { Button } from "react-bootstrap";
import "./EmptyState.css";

const EmptyState = ({
  icon = "fas fa-inbox",
  title = "Không có dữ liệu",
  description = "Chưa có dữ liệu để hiển thị.",
  actionText,
  onAction,
  actionIcon = "fas fa-plus",
  size = "medium",
  className = "",
}) => {
  const sizeClass = {
    small: "empty-state-small",
    medium: "empty-state-medium",
    large: "empty-state-large",
  }[size];

  return (
    <div className={`empty-state ${sizeClass} ${className}`}>
      <div className="empty-state-icon">
        <i className={icon}></i>
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
          className="empty-state-action"
        >
          <i className={`${actionIcon} me-2`}></i>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
