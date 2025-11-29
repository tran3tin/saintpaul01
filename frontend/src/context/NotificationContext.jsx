// src/context/NotificationContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationToast from "@components/common/NotificationToast";

const NotificationContext = createContext(null);

let notificationId = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 5000,
      autohide = true,
      closable = true,
      showToast = true,
    }) => {
      const id = ++notificationId;
      const timestamp = new Date().toISOString();
      const timeString = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const notification = {
        id,
        type,
        title,
        message,
        duration,
        autohide,
        closable,
        timestamp,
        timeString,
        show: showToast,
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Auto remove from toast after duration if autohide is true
      if (autohide && showToast) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const hideToast = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, show: false } : n))
    );
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1));
          return { ...n, read: true };
        }
        return n;
      })
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title, message, options = {}) => {
      return addNotification({ type: "success", title, message, ...options });
    },
    [addNotification]
  );

  const error = useCallback(
    (title, message, options = {}) => {
      return addNotification({
        type: "error",
        title,
        message,
        autohide: false,
        ...options,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title, message, options = {}) => {
      return addNotification({ type: "warning", title, message, ...options });
    },
    [addNotification]
  );

  const info = useCallback(
    (title, message, options = {}) => {
      return addNotification({ type: "info", title, message, ...options });
    },
    [addNotification]
  );

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    hideToast,
    markAsRead,
    markAllAsRead,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  // Get only visible toast notifications
  const visibleToasts = notifications.filter((n) => n.show);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToast notifications={visibleToasts} onClose={hideToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export default NotificationContext;
