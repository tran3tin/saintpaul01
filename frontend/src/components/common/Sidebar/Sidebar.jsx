// src/components/common/Sidebar/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Nav } from "react-bootstrap";

// Context
import { useAuth } from "@context/AuthContext";

// Components
import MenuItem from "./MenuItem";
import MenuGroup from "./MenuGroup";

// Config
import { menuConfig } from "@config/menu.config";

// Styles
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, isCompact = false, onToggleCompact }) => {
  // ← THÊM isCompact prop
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [activeMenu, setActiveMenu] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // ← THÊM search state
  const [pinnedItems, setPinnedItems] = useState([]); // ← THÊM pinned state

  // Load pinned items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pinnedMenuItems");
    if (saved) {
      setPinnedItems(JSON.parse(saved));
    }
  }, []);

  // Check if menu item is active
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveMenu(currentPath);

    // Auto expand group if child is active (chỉ khi không compact)
    if (!isCompact) {
      menuConfig.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) =>
            currentPath.startsWith(child.path)
          );
          if (hasActiveChild && !expandedGroups.includes(item.id)) {
            setExpandedGroups((prev) => [...prev, item.id]);
          }
        }
      });
    }
  }, [location.pathname, isCompact]);

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    if (isCompact) return; // Không expand khi compact mode

    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Handle menu click
  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  // Check if user has permission to see menu
  const hasPermission = (roles) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.role);
  };

  // ← THÊM: Toggle pin item
  const togglePin = (itemId) => {
    const newPinned = pinnedItems.includes(itemId)
      ? pinnedItems.filter((id) => id !== itemId)
      : [...pinnedItems, itemId];

    setPinnedItems(newPinned);
    localStorage.setItem("pinnedMenuItems", JSON.stringify(newPinned));
  };

  // ← THÊM: Filter menu by search
  const filterMenu = (items) => {
    if (!searchTerm) return items;

    return items.filter((item) => {
      if (item.type === "divider" || item.type === "label") return false;

      const matchLabel = item.label
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchChildren = item.children?.some((child) =>
        child.label?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchLabel || matchChildren;
    });
  };

  // Filter menu by permission and search
  const filteredMenu = filterMenu(
    menuConfig.filter((item) => hasPermission(item.roles))
  );

  // ← THÊM: Separate pinned and unpinned items
  const pinnedMenuItems = filteredMenu.filter((item) =>
    pinnedItems.includes(item.id)
  );
  const unpinnedMenuItems = filteredMenu.filter(
    (item) => !pinnedItems.includes(item.id)
  );

  // ← THÊM: Render menu items
  const renderMenuItem = (item, isPinned = false) => {
    // Handle divider
    if (item.type === "divider") {
      return <div key={item.id} className="menu-divider"></div>;
    }

    // Handle label
    if (item.type === "label") {
      return (
        <div key={item.id} className="menu-label">
          {item.label}
        </div>
      );
    }

    // Handle menu group
    if (item.children) {
      return (
        <MenuGroup
          key={item.id}
          item={item}
          isExpanded={expandedGroups.includes(item.id)}
          onToggle={() => toggleGroup(item.id)}
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          isCompact={isCompact}
          isPinned={isPinned}
          onTogglePin={() => togglePin(item.id)}
        />
      );
    }

    // Handle single menu item
    return (
      <MenuItem
        key={item.id}
        item={item}
        isActive={activeMenu === item.path}
        onClick={() => handleMenuClick(item.path)}
        isCompact={isCompact}
        isPinned={isPinned}
        onTogglePin={() => togglePin(item.id)}
        tooltip={item.label} // ← For compact mode tooltip
      />
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          isCompact ? "compact" : ""
        }`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <i className="fas fa-church"></i>
            {!isCompact && <span className="brand-text">Quản Lý Hội Dòng</span>}
          </div>

          {/* Compact toggle button (desktop only) */}
          {!isCompact && (
            <button
              className="sidebar-compact-toggle d-none d-lg-block"
              onClick={onToggleCompact}
              title="Thu gọn sidebar"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
          )}

          <button className="sidebar-close d-lg-none" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* ← THÊM: Search Box (chỉ hiển thị khi không compact) */}
        {!isCompact && (
          <div className="sidebar-search">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <Nav className="sidebar-nav flex-column">
          {/* ← THÊM: Pinned Items Section */}
          {!isCompact && pinnedMenuItems.length > 0 && (
            <>
              <div className="menu-label">
                <i className="fas fa-thumbtack me-2"></i>
                Đã ghim
              </div>
              {pinnedMenuItems.map((item) => renderMenuItem(item, true))}
              <div className="menu-divider"></div>
            </>
          )}

          {/* Regular Menu Items */}
          {unpinnedMenuItems.map((item) => renderMenuItem(item, false))}

          {/* ← THÊM: Empty state when search has no results */}
          {searchTerm && filteredMenu.length === 0 && (
            <div className="empty-search">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy kết quả</p>
            </div>
          )}
        </Nav>

        {/* Sidebar Footer */}
        {!isCompact && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-content">
              <div className="app-version">
                <i className="fas fa-code-branch me-2"></i>
                Version 1.0.0
              </div>
              <div className="copyright">© 2024 Hội Dòng</div>
            </div>
          </div>
        )}

        {/* ← THÊM: Compact mode expand button */}
        {isCompact && (
          <div className="sidebar-expand-btn">
            <button
              className="btn-expand"
              onClick={onToggleCompact}
              title="Mở rộng sidebar"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
