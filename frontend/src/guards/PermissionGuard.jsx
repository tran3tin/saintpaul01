// src/guards/PermissionGuard.jsx

import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "@hooks";
import { ForbiddenPage } from "@pages/errors";
import { toast } from "react-toastify";

/**
 * PermissionGuard - Protect routes based on permissions
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string|string[]} props.permissions - Required permission(s)
 * @param {string|string[]} props.roles - Required role(s)
 * @param {boolean} props.requireAll - Require all permissions (default: false)
 * @param {string} props.redirectTo - Redirect path if no permission
 * @param {boolean} props.showForbidden - Show 403 page instead of redirect
 */
const PermissionGuard = ({
  children,
  permissions,
  roles,
  requireAll = false,
  redirectTo = "/thong-tin",
  showForbidden = true,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  } = usePermission();
  const toastShownRef = useRef(false);

  // Check role-based access
  const checkRoleAccess = () => {
    if (roles) {
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return hasAnyRole(rolesArray);
    }
    return true;
  };

  // Check permission-based access
  const checkPermissionAccess = () => {
    if (permissions) {
      const permissionsArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

      if (requireAll) {
        return hasAllPermissions(permissionsArray);
      } else {
        return hasAnyPermission(permissionsArray);
      }
    }
    return true;
  };

  const hasRoleAccess = checkRoleAccess();
  const hasPermissionAccess = checkPermissionAccess();
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // Show toast only once when access denied
  useEffect(() => {
    if (!hasAccess && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error("Bạn không có quyền truy cập trang này", {
        toastId: "permission-denied",
      });
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return showForbidden ? (
      <ForbiddenPage />
    ) : (
      <Navigate to={redirectTo} replace />
    );
  }

  // Render children if authorized
  return <>{children}</>;
};

export default PermissionGuard;
