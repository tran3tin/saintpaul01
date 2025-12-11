// src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";
import authService from "@services/authService";

const AuthContext = createContext(null);

// Helper to validate user data structure - defined outside component
const isValidUserData = (data) => {
  // Valid user must NOT have password field
  // If it has password, it's form data not user data
  if (!data || typeof data !== "object") return false;
  if (data.password !== undefined) return false;
  // Must have at least one of: id, username
  return !!(data.id || data.username);
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
        // Ensure isAdmin is set properly
        if (parsed.isAdmin === undefined && parsed.is_admin !== undefined) {
          parsed.isAdmin = parsed.is_admin === 1;
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
        // User permissions are already included from backend (as permission names)
        const userData = {
          ...response.data.user,
          isAdmin: response.data.user.is_admin === 1,
          // permissions is already an array of permission names from backend
        };

        // Save to localStorage
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
        errors: response.errors || {},
      };
    } catch (error) {
      console.error("❌ Login error:", error);

      // Trả về lỗi từ backend nếu có - KHÔNG throw
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.message || "Đăng nhập thất bại",
          errors: error.response.data.errors || {},
        };
      }

      // Lỗi network hoặc lỗi khác
      return {
        success: false,
        error: error.message || "Không thể kết nối đến server",
        errors: {},
      };
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

  // Check permission by permission name
  const hasPermission = useCallback(
    (permissionName) => {
      if (!user) return false;
      // Admin has all permissions
      if (user.isAdmin) return true;
      if (!user.permissions || user.permissions.length === 0) return false;

      // Check if permission name is in the array
      return user.permissions.includes(permissionName);
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.isAdmin === true;
  }, [user]);

  // Legacy hasPermission for roles (for backward compatibility)
  const hasRole = useCallback(
    (roles) => {
      if (!roles || roles.length === 0) return true;
      if (!user) return false;

      // Only admin users have roles now
      return user.isAdmin || user.is_admin === 1;
    },
    [user]
  );

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    hasPermission,
    hasRole, // Legacy role check for backward compatibility
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
