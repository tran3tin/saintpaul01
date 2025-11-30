// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";
import authService from "@services/authService";

const AuthContext = createContext(null);

// Role labels mapping
const ROLE_LABELS = {
  admin: "Quản trị viên",
  superior_general: "Bề Trên Tổng",
  superior_provincial: "Bề Trên Tỉnh",
  superior_community: "Bề Trên Cộng Đoàn",
  secretary: "Thư ký",
  viewer: "Người xem",
};

// Helper to validate user data structure - defined outside component
const isValidUserData = (data) => {
  // Valid user must NOT have password field
  // If it has password, it's form data not user data
  if (!data || typeof data !== "object") return false;
  if (data.password !== undefined) return false;
  // Must have at least one of: id, role, username
  return !!(data.id || data.role || data.username);
};

// Get initial user from localStorage (runs BEFORE first render)
const getInitialUser = () => {
  try {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      const parsed = JSON.parse(userData);

      // Validate the data
      if (isValidUserData(parsed)) {
        // Add role_label if not present
        if (!parsed.role_label && parsed.role) {
          parsed.role_label = ROLE_LABELS[parsed.role] || parsed.role;
        }
        return parsed;
      } else {
        // Invalid data - clear it immediately
        console.warn("🔧 Invalid user data detected, clearing localStorage...");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    }
  } catch (e) {
    console.error("Error parsing user data:", e);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Initialize with validated user data
  const [user, setUser] = useState(() => getInitialUser());
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!getInitialUser()
  );

  // Login - kết nối với backend thật
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      console.log("🔐 Login attempt with:", { username: credentials.username });

      // Gọi API backend
      const response = await authService.login(credentials);
      console.log("📡 Backend response:", response);

      if (response.success && response.data?.token && response.data?.user) {
        // Add role_label to user data
        const userData = {
          ...response.data.user,
          role_label:
            ROLE_LABELS[response.data.user.role] || response.data.user.role,
        };

        // authService đã lưu token và user vào localStorage
        // Cập nhật lại với role_label
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Login successful:", userData.username);

        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: userData };
      }

      console.log("❌ Login failed - response not valid");
      return {
        success: false,
        error: response.message || "Đăng nhập thất bại",
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...userData };
      // Add role_label if role changed
      if (userData.role && !userData.role_label) {
        newUser.role_label = ROLE_LABELS[userData.role] || userData.role;
      }
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  // Refresh user from server
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        const userData = {
          ...response.data,
          role_label: ROLE_LABELS[response.data.role] || response.data.role,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      throw error;
    }
  }, []);

  // Check permission
  const hasPermission = useCallback(
    (roles) => {
      if (!roles || roles.length === 0) return true;
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    hasPermission,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
