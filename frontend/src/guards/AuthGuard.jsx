// src/guards/AuthGuard.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";

/**
 * AuthGuard - Protect routes that require authentication
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.redirectTo - Redirect path if not authenticated
 */
const AuthGuard = ({ children, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default AuthGuard;
