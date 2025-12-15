import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Context
import { useAuth } from "@context/AuthContext";

// Services
import { notificationService } from "@services";

// Utils
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Styles
import "./Header.css";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationService.getAll({ limit: 10 });
      if (result.success) {
        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success("Đã đánh dấu tất cả đã đọc");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const result = await notificationService.delete(notificationId);
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Đã xóa thông báo");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return dateString;
    }
  };

  // Get icon class based on notification type
  const getNotificationIcon = (type) => {
    const icons = {
      info: "fa-info-circle",
      warning: "fa-exclamation-triangle",
      success: "fa-check-circle",
      error: "fa-times-circle",
      birthday: "fa-birthday-cake",
      anniversary: "fa-calendar-check",
      reminder: "fa-bell",
    };
    return icons[type] || "fa-bell";
  };

  // Get background class based on notification type
  const getNotificationBg = (type) => {
    const backgrounds = {
      info: "bg-skyblue",
      warning: "bg-yellow",
      success: "bg-green",
      error: "bg-pink",
      birthday: "bg-purple",
      anniversary: "bg-orange",
      reminder: "bg-blue",
    };
    return backgrounds[type] || "bg-skyblue";
  };

  return (
    <header className="header-menu-one">
      {/* Nav Bar Header (Logo Area - Orange) */}
      <div className="nav-bar-header-one">
        <div className="header-logo">
          <Link to="/dashboard">
            <i className="fas fa-church logo-icon"></i>
            <span className="logo-text">Hội Dòng OSP</span>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="mobile-nav-bar d-lg-none">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleSidebar}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Header Main Menu */}
      <div className="header-main-menu d-none d-lg-flex">
        {/* Search Bar */}
        <div className="header-search-bar">
          <div className="stylish-input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
            />
            <span className="input-group-addon">
              <button type="button">
                <i className="fas fa-search"></i>
              </button>
            </span>
          </div>
        </div>

        {/* Right Nav Items */}
        <ul className="navbar-nav">
          {/* Messages - Hover dropdown */}
          <li className="navbar-item header-message">
            <a className="navbar-nav-link" href="#">
              <i className="far fa-envelope"></i>
              <span>0</span>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="item-header">
                <h6 className="item-title">Tin nhắn</h6>
              </div>
              <div className="item-content">
                <p className="text-center text-muted py-3">
                  Không có tin nhắn mới
                </p>
              </div>
            </div>
          </li>

          {/* Notifications - Hover dropdown */}
          <li className="navbar-item header-notification">
            <a className="navbar-nav-link" href="#">
              <i className="far fa-bell"></i>
              <span>{unreadCount}</span>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="item-header">
                <h6 className="item-title">
                  Thông báo {unreadCount > 0 && `(${unreadCount} mới)`}
                </h6>
              </div>
              <div className="item-content">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`media ${!notification.is_read ? "unread" : ""}`}
                      onClick={() =>
                        !notification.is_read && handleMarkAsRead(notification.id)
                      }
                    >
                      <div className={`item-icon ${getNotificationBg(notification.type)}`}>
                        <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                      </div>
                      <div className="media-body space-sm">
                        <div className="post-title">{notification.title}</div>
                        <p>{notification.message}</p>
                        <span>{formatTime(notification.created_at)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted py-3">
                    Không có thông báo
                  </p>
                )}
              </div>
            </div>
          </li>

          {/* User Menu - Hover dropdown */}
          <li className="navbar-item header-admin">
            <a className="navbar-nav-link" href="#">
              <div className="admin-title">
                <h5 className="item-title">
                  {user?.full_name || user?.username || "User"}
                </h5>
                <span>
                  {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </div>
              <div className="admin-img">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.full_name || "User"} />
                ) : (
                  <div className="admin-avatar-placeholder">
                    {(user?.full_name || user?.username || "U")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="item-header">
                <h6 className="item-title">
                  {user?.full_name || user?.username || "User"}
                </h6>
              </div>
              <div className="item-content">
                <ul className="settings-list">
                  <li>
                    <Link to="/profile">
                      <i className="fas fa-user"></i>Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings">
                      <i className="fas fa-cog"></i>Cài đặt tài khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile#password">
                      <i className="fas fa-key"></i>Đổi mật khẩu
                    </Link>
                  </li>
                  <li>
                    <Link to="/help">
                      <i className="fas fa-question-circle"></i>Trợ giúp
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      className="text-danger"
                    >
                      <i className="fas fa-sign-out-alt"></i>Đăng xuất
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
