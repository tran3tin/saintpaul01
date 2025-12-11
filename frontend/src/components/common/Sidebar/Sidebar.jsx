// src/components/common/Sidebar/Sidebar.jsx - AKKHOR STYLE

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

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission: authHasPermission, hasRole } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [activeMenu, setActiveMenu] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  // Save collapsed state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
    // Dispatch custom event to notify MainLayout
    window.dispatchEvent(new Event("sidebarToggle"));
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if menu item is active
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveMenu(currentPath);

    // Auto expand group if child is active (chỉ khi không collapsed)
    if (!isCollapsed) {
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
  }, [location.pathname, isCollapsed]);

  // Toggle group expansion
  const toggleGroup = (groupId) => {
    if (isCollapsed) return; // Không expand khi collapsed mode

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
  const hasMenuPermission = (menuItem) => {
    // Admin users can see everything
    if (user?.isAdmin || user?.is_admin === 1) {
      return true;
    }

    // Check permission first (new system)
    if (menuItem.permission) {
      return authHasPermission(menuItem.permission);
    }

    // Fallback to role check (legacy system)
    const roles = menuItem.roles;
    if (!roles || roles.length === 0) return true;
    return hasRole(roles);
  };

  // Filter menu by search (exclude dividers and labels)
  const filterMenu = (items) => {
    // First filter out dividers and labels
    const menuItems = items.filter(
      (item) => item.type !== "divider" && item.type !== "label"
    );

    if (!searchTerm) return menuItems;

    return menuItems.filter((item) => {
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
    menuConfig.filter((item) => hasMenuPermission(item))
  );

  // Render menu items
  const renderMenuItem = (item) => {
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
          isCollapsed={isCollapsed}
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
        isCollapsed={isCollapsed}
        tooltip={item.label}
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
          isCollapsed ? "collapsed" : ""
        }`}
      >
        {/* Search Box & Toggle Arrow */}
        <div className="sidebar-header-area">
          {!isCollapsed ? (
            <>
              <div className="sidebar-search">
                <div className="search-wrapper">
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
              <button
                className="sidebar-toggle-btn d-none d-lg-flex"
                onClick={toggleCollapsed}
                title="Thu gọn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </>
          ) : (
            <button
              className="sidebar-toggle-btn d-none d-lg-flex"
              onClick={toggleCollapsed}
              title="Mở rộng"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}

          <button className="sidebar-close d-lg-none" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Navigation Menu */}
        <Nav className="sidebar-nav flex-column">
          {/* Menu Items */}
          {filteredMenu.map((item) => renderMenuItem(item))}

          {/* Empty state when search has no results */}
          {searchTerm && filteredMenu.length === 0 && (
            <div className="empty-search">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy kết quả</p>
            </div>
          )}
        </Nav>

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-content">
              <div className="app-version">
                <i className="fas fa-code-branch me-2"></i>
                Version 1.0.0
              </div>
              <div className="copyright">© 2024 Hội Dòng OSP</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
