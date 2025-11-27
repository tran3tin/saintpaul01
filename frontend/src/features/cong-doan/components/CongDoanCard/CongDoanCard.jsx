// src/features/cong-doan/components/CongDoanCard/CongDoanCard.jsx

import React from "react";
import { Card, Badge } from "react-bootstrap";
import { formatDate } from "@utils";
import "./CongDoanCard.css";

const CongDoanCard = ({ community, onView, onEdit, onDelete }) => {
  return (
    <Card className="cong-doan-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h5 className="community-name mb-2">{community.name}</h5>
            <p className="community-code text-muted mb-2">
              <i className="fas fa-barcode me-2"></i>
              {community.code}
            </p>
            <Badge bg="primary" className="mb-2">
              {community.member_count || 0} thành viên
            </Badge>
          </div>
          <div className="community-icon">
            <i className="fas fa-home"></i>
          </div>
        </div>

        <div className="community-details">
          <div className="detail-item">
            <i className="fas fa-map-marker-alt text-danger me-2"></i>
            <span>{community.address || "Chưa có địa chỉ"}</span>
          </div>

          <div className="detail-item">
            <i className="fas fa-phone text-success me-2"></i>
            <span>{community.phone || "Chưa có SĐT"}</span>
          </div>

          <div className="detail-item">
            <i className="fas fa-user-tie text-primary me-2"></i>
            <span>Bề trên: {community.superior_name || "-"}</span>
          </div>

          <div className="detail-item">
            <i className="fas fa-calendar text-info me-2"></i>
            <span>Thành lập: {formatDate(community.established_date)}</span>
          </div>
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-primary flex-grow-1"
            onClick={() => onView(community)}
          >
            <i className="fas fa-eye me-1"></i>
            Xem
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => onEdit(community)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(community)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default CongDoanCard;
