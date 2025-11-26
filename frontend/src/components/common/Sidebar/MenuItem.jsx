// src/components/common/Sidebar/MenuItem.jsx

import React from "react";
import { Nav } from "react-bootstrap";

const MenuItem = ({
  item,
  isActive,
  onClick,
  isChild = false,
  isCompact = false,
  isPinned = false,
  onTogglePin,
  tooltip,
}) => {
  return (
    <Nav.Link
      className={`sidebar-menu-item ${isActive ? "active" : ""} ${
        isChild ? "child-item" : ""
      } ${isPinned ? "pinned" : ""}`}
      onClick={onClick}
      data-tooltip={isCompact ? tooltip : undefined} // ← For compact mode
    >
      <div className="menu-item-content">
        <div className="menu-item-icon">
          <i className={item.icon}></i>
        </div>
        {!isCompact && (
          <>
            <span className="menu-item-text">{item.label}</span>
            {item.badge && (
              <span className={`badge bg-${item.badge.color} ms-auto`}>
                {item.badge.text}
              </span>
            )}
            {/* ← THÊM: Pin button */}
            {!isChild && onTogglePin && (
              <button
                className="btn-pin"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                title={isPinned ? "Bỏ ghim" : "Ghim menu"}
              >
                <i
                  className={`fas fa-thumbtack ${isPinned ? "pinned" : ""}`}
                ></i>
              </button>
            )}
          </>
        )}
      </div>
    </Nav.Link>
  );
};

export default MenuItem;
