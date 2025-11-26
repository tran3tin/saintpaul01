import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

// Mock useAuth for demo - always returns mock user
export const useAuth = () => {
  return {
    user: {
      full_name: "Admin",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    },
    logout: async () => {
      console.log("Logout clicked");
    },
    isAuthenticated: true,
  };
};

export const AuthProvider = ({ children }) => {
  return children;
};

export default AuthContext;
