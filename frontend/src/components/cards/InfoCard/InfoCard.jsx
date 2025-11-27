// src/components/cards/InfoCard/InfoCard.jsx

import React from "react";
import { Card, Badge } from "react-bootstrap";
import "./InfoCard.css";

const InfoCard = ({
  title,
  subtitle,
  image,
  avatar,
  badge,
  badgeVariant = "primary",
  children,
  footer,
  actions,
  onClick,
  className = "",
}) => {
  return (
    <Card
      className={`info-card ${onClick ? "clickable" : ""} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="info-card-image">
          <Card.Img variant="top" src={image} alt={title} />
        </div>
      )}

      <Card.Body>
        <div className="info-card-header">
          {avatar && (
            <div className="info-card-avatar">
              <img src={avatar} alt={title} />
            </div>
          )}

          <div className="info-card-title-wrapper">
            <Card.Title className="info-card-title">
              {title}
              {badge && (
                <Badge bg={badgeVariant} className="info-card-badge ms-2">
                  {badge}
                </Badge>
              )}
            </Card.Title>
            {subtitle && (
              <Card.Subtitle className="info-card-subtitle">
                {subtitle}
              </Card.Subtitle>
            )}
          </div>
        </div>

        {children && <div className="info-card-content">{children}</div>}

        {actions && <div className="info-card-actions">{actions}</div>}
      </Card.Body>

      {footer && (
        <Card.Footer className="info-card-footer">{footer}</Card.Footer>
      )}
    </Card>
  );
};

export default InfoCard;
