// src/hooks/usePermission.js

import { useAuth } from "@context/AuthContext";

/**
 * Hook to check user permissions
 * @returns {object} Permission checking functions
 */
export const usePermission = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission key
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!user) return false;

    // Check if user has the specific permission
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some((p) => {
        // Handle both string permissions and object permissions
        if (typeof p === "string") {
          return p === permission;
        }
        return p.key === permission || p.name === permission;
      });
    }

    return false;
  };

  /**
   * Check if user has any of the permissions
   * @param {string[]} permissions - Array of permission keys
   * @returns {boolean}
   */
  const hasAnyPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * Check if user has all of the permissions
   * @param {string[]} permissions - Array of permission keys
   * @returns {boolean}
   */
  const hasAllPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every((permission) => hasPermission(permission));
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role key
   * @returns {boolean}
   */
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  /**
   * Check if user has any of the roles
   * @param {string[]} roles - Array of role keys
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user can perform an action on a resource
   * @param {string} action - Action name (create, read, update, delete)
   * @param {string} resource - Resource name
   * @returns {boolean}
   */
  const can = (action, resource) => {
    const permission = `${resource}.${action}`;
    return hasPermission(permission);
  };

  /**
   * Check if user cannot perform an action on a resource
   * @param {string} action - Action name
   * @param {string} resource - Resource name
   * @returns {boolean}
   */
  const cannot = (action, resource) => {
    return !can(action, resource);
  };

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole("admin");
  };

  /**
   * Check if user is manager
   * @returns {boolean}
   */
  const isManager = () => {
    return hasRole("manager");
  };

  /**
   * Get all user permissions
   * @returns {array}
   */
  const getPermissions = () => {
    if (!user || !user.permissions) return [];
    return user.permissions;
  };

  /**
   * Get user role
   * @returns {string|null}
   */
  const getRole = () => {
    return user?.role || null;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    can,
    cannot,
    isAdmin,
    isManager,
    getPermissions,
    getRole,
  };
};

export default usePermission;
