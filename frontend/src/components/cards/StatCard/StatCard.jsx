// src/components/cards/StatCard/StatCard.jsx

import React from "react";
import { Card } from "react-bootstrap";
import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  trend,
  trendValue,
  trendLabel,
  subtitle,
  onClick,
  loading = false,
  className = "",
}) => {
  const colorClasses = {
    primary: "stat-card-primary",
    success: "stat-card-success",
    danger: "stat-card-danger",
    warning: "stat-card-warning",
    info: "stat-card-info",
    secondary: "stat-card-secondary",
  };

  const getTrendIcon = () => {
    if (trend === "up") return "fas fa-arrow-up";
    if (trend === "down") return "fas fa-arrow-down";
    return "fas fa-minus";
  };

  const getTrendClass = () => {
    if (trend === "up") return "trend-up";
    if (trend === "down") return "trend-down";
    return "trend-neutral";
  };

  return (
    <Card
      className={`stat-card ${colorClasses[color]} ${
        onClick ? "clickable" : ""
      } ${loading ? "loading" : ""} ${className}`}
      onClick={onClick}
    >
      <Card.Body>
        <div className="stat-card-content">
          <div className="stat-card-info">
            <div className="stat-card-title">{title}</div>
            {loading ? (
              <div className="stat-card-skeleton">
                <div className="skeleton skeleton-text"></div>
              </div>
            ) : (
              <>
                <div className="stat-card-value">{value}</div>
                {subtitle && (
                  <div className="stat-card-subtitle">{subtitle}</div>
                )}
              </>
            )}

            {(trend || trendValue) && !loading && (
              <div className={`stat-card-trend ${getTrendClass()}`}>
                <i className={getTrendIcon()}></i>
                {trendValue && (
                  <span className="trend-value">{trendValue}</span>
                )}
                {trendLabel && (
                  <span className="trend-label">{trendLabel}</span>
                )}
              </div>
            )}
          </div>

          {icon && (
            <div className="stat-card-icon">
              <i className={icon}></i>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatCard;
