import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";

// Context
import { useAuth } from "@context/AuthContext";

// Components
import UserMenu from "./UserMenu";
import NotificationDropdown from "./NotificationDropdown";

// Styles
import "./Header.css";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "Thông báo mới",
      message: "Sr. Maria đã cập nhật hồ sơ",
      time: "5 phút trước",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Nhắc nhở",
      message: "Có 3 hồ sơ cần phê duyệt",
      time: "1 giờ trước",
      read: false,
    },
    {
      id: 3,
      type: "success",
      title: "Thành công",
      message: "Báo cáo tháng 1 đã được tạo",
      time: "2 giờ trước",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return (
    <Navbar className="header-navbar" expand="lg" sticky="top">
      <Container fluid>
        {/* Toggle Sidebar Button (Mobile) */}
        <button
          className="sidebar-toggle d-lg-none"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        {/* Brand */}
        <Navbar.Brand as={Link} to="/dashboard" className="header-brand">
          <i className="fas fa-church me-2"></i>
          <span className="brand-text d-none d-md-inline">
            Hệ Thống Quản Lý Hội Dòng
          </span>
          <span className="brand-text-short d-inline d-md-none">HTQL</span>
        </Navbar.Brand>

        {/* Right Side */}
        <div className="header-right d-flex align-items-center">
          {/* Search (Desktop) */}
          <div className="header-search d-none d-lg-block me-3">
            <div className="search-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Tìm kiếm..."
              />
              <kbd className="search-shortcut">Ctrl K</kbd>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="header-actions d-none d-md-flex">
            <Link
              to="/nu-tu/create"
              className="btn btn-sm btn-primary me-2"
              title="Thêm nữ tu mới"
            >
              <i className="fas fa-plus me-1"></i>
              <span className="d-none d-lg-inline">Thêm mới</span>
            </Link>
          </div>

          {/* Notifications */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
          />

          {/* User Menu */}
          <UserMenu user={user} onLogout={handleLogout} />
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
