// src/components/common/Breadcrumb/Breadcrumb.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb as BootstrapBreadcrumb } from "react-bootstrap";
import "./Breadcrumb.css";

const Breadcrumb = ({ items = [], className = "" }) => {
  const navigate = useNavigate();

  // Default home item
  const breadcrumbItems = [
    { label: "Trang chủ", link: "/dashboard", icon: "fas fa-home" },
    ...items,
  ];

  return (
    <div className={`app-breadcrumb ${className}`}>
      <BootstrapBreadcrumb className="breadcrumb-nav">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <BootstrapBreadcrumb.Item
              key={index}
              active={isLast || item.active}
              linkAs={isLast || item.active ? "span" : Link}
              linkProps={
                !isLast && !item.active ? { to: item.link } : undefined
              }
              className={isLast || item.active ? "active-item" : ""}
            >
              {item.icon && <i className={`${item.icon} me-2`}></i>}
              {item.label}
            </BootstrapBreadcrumb.Item>
          );
        })}
      </BootstrapBreadcrumb>

      {/* Back button */}
      <button
        className="btn-back"
        onClick={() => navigate(-1)}
        title="Quay lại"
      >
        <i className="fas fa-arrow-left me-2"></i>
        <span className="d-none d-md-inline">Quay lại</span>
      </button>
    </div>
  );
};

export default Breadcrumb;
