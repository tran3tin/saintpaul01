// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

// Helper to validate user data structure - defined outside component
const isValidUserData = (data) => {
  // Valid user must NOT have password field
  // If it has password, it's form data not user data
  if (!data || typeof data !== 'object') return false;
  if (data.password !== undefined) return false;
  // Must have at least one of: id, role, full_name
  return !!(data.id || data.role || data.full_name);
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getInitialUser());

  // Login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      
      // Extract username and password from credentials object
      const { username, password, email } = credentials || {};
      const userIdentifier = username || email || '';
      
      // Mock login - replace with actual API call
      const mockUser = {
        id: 1,
        full_name: "Admin",
        username: userIdentifier,
        email: userIdentifier.includes('@') ? userIdentifier : `${userIdentifier}@example.com`,
        role: "admin",
        role_label: "Quản trị viên",
      };

      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify(mockUser));

      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, data: mockUser };
    } catch (error) {
      throw new Error("Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user
  const updateUser = useCallback(
    (userData) => {
      setUser((prev) => {
        const newUser = { ...prev, ...userData };
        localStorage.setItem("user", JSON.stringify(newUser));
        return newUser;
      });
    },
    []
  );

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
