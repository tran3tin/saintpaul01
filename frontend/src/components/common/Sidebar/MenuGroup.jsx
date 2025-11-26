// src/components/common/Sidebar/MenuGroup.jsx

import React from "react";
import { Nav, Collapse } from "react-bootstrap";
import MenuItem from "./MenuItem";

const MenuGroup = ({
  item,
  isExpanded,
  onToggle,
  activeMenu,
  onMenuClick,
  isCompact = false,
  isPinned = false,
  onTogglePin,
}) => {
  const hasActiveChild = item.children?.some((child) =>
    activeMenu.startsWith(child.path)
  );

  return (
    <div className="sidebar-menu-group">
      <Nav.Link
        className={`sidebar-menu-item group-item ${
          hasActiveChild ? "active" : ""
        } ${isExpanded ? "expanded" : ""} ${isPinned ? "pinned" : ""}`}
        onClick={onToggle}
        data-tooltip={isCompact ? item.label : undefined}
      >
        <div className="menu-item-content">
          <div className="menu-item-icon">
            <i className={item.icon}></i>
          </div>
          {!isCompact && (
            <>
              <span className="menu-item-text">{item.label}</span>
              {/* ← THÊM: Pin button for group */}
              {onTogglePin && (
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
              <i
                className={`fas fa-chevron-down ms-auto menu-arrow ${
                  isExpanded ? "rotated" : ""
                }`}
              ></i>
            </>
          )}
        </div>
      </Nav.Link>

      {/* Không hiển thị submenu trong compact mode */}
      {!isCompact && (
        <Collapse in={isExpanded}>
          <div className="sidebar-submenu">
            {item.children?.map((child) => (
              <MenuItem
                key={child.id}
                item={child}
                isActive={activeMenu === child.path}
                onClick={() => onMenuClick(child.path)}
                isChild={true}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
};

export default MenuGroup;
