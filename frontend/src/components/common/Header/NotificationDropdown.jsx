import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Badge } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const NotificationDropdown = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    const icons = {
      info: { icon: "fa-info-circle", color: "text-info" },
      warning: { icon: "fa-exclamation-triangle", color: "text-warning" },
      success: { icon: "fa-check-circle", color: "text-success" },
      error: { icon: "fa-times-circle", color: "text-danger" },
    };
    return icons[type] || icons.info;
  };

  return (
    <Dropdown align="end" className="notification-dropdown me-2">
      <Dropdown.Toggle
        variant="link"
        id="notification-dropdown"
        className="notification-toggle position-relative"
      >
        <i className="fas fa-bell notification-icon"></i>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="notification-badge position-absolute"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown-menu">
        {/* Header */}
        <div className="dropdown-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="fas fa-bell me-2"></i>
            Thông báo
            {unreadCount > 0 && (
              <Badge bg="danger" pill className="ms-2">
                {unreadCount}
              </Badge>
            )}
          </h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-link text-primary p-0"
              onClick={onMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        <Dropdown.Divider className="my-0" />

        {/* Notification List */}
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const iconData = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read ? "unread" : ""
                  }`}
                >
                  <div className="notification-content">
                    <div className="d-flex">
                      <div
                        className={`notification-icon-wrapper ${iconData.color}`}
                      >
                        <i className={`fas ${iconData.icon}`}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="notification-title">
                          {notification.title}
                          {!notification.read && (
                            <span className="unread-dot ms-2"></span>
                          )}
                        </div>
                        <div className="notification-message">
                          {notification.message}
                        </div>
                        <div className="notification-time">
                          <i className="far fa-clock me-1"></i>
                          {notification.time}
                        </div>
                      </div>
                      <div className="notification-actions">
                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="link"
                            size="sm"
                            className="notification-action-toggle"
                          >
                            <i className="fas fa-ellipsis-v"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {!notification.read && (
                              <Dropdown.Item
                                onClick={() => onMarkAsRead(notification.id)}
                              >
                                <i className="fas fa-check me-2"></i>
                                Đánh dấu đã đọc
                              </Dropdown.Item>
                            )}
                            <Dropdown.Item
                              onClick={() => onDelete(notification.id)}
                              className="text-danger"
                            >
                              <i className="fas fa-trash me-2"></i>
                              Xóa
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-notifications">
              <i className="fas fa-bell-slash"></i>
              <p>Không có thông báo nào</p>
            </div>
          )}
        </div>

        <Dropdown.Divider className="my-0" />

        {/* Footer */}
        <div className="dropdown-footer text-center">
          <Link to="/notifications" className="btn btn-sm btn-link">
            Xem tất cả thông báo
            <i className="fas fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
