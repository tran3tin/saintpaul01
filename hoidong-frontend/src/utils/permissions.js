/**
 * Permission definitions and check functions
 */

// Permission definitions
export const PERMISSIONS = {
  // Sisters
  SISTERS_READ: 'sisters:read',
  SISTERS_CREATE: 'sisters:create',
  SISTERS_UPDATE: 'sisters:update',
  SISTERS_DELETE: 'sisters:delete',
  
  // Vocation
  VOCATION_READ: 'vocation:read',
  VOCATION_CREATE: 'vocation:create',
  VOCATION_UPDATE: 'vocation:update',
  VOCATION_DELETE: 'vocation:delete',
  
  // Communities
  COMMUNITIES_READ: 'communities:read',
  COMMUNITIES_CREATE: 'communities:create',
  COMMUNITIES_UPDATE: 'communities:update',
  COMMUNITIES_DELETE: 'communities:delete',
  
  // Education
  EDUCATION_READ: 'education:read',
  EDUCATION_CREATE: 'education:create',
  EDUCATION_UPDATE: 'education:update',
  EDUCATION_DELETE: 'education:delete',
  
  // Missions
  MISSIONS_READ: 'missions:read',
  MISSIONS_CREATE: 'missions:create',
  MISSIONS_UPDATE: 'missions:update',
  MISSIONS_DELETE: 'missions:delete',
  
  // Health
  HEALTH_READ: 'health:read',
  HEALTH_CREATE: 'health:create',
  HEALTH_UPDATE: 'health:update',
  HEALTH_DELETE: 'health:delete',
  
  // Evaluations
  EVALUATIONS_READ: 'evaluations:read',
  EVALUATIONS_CREATE: 'evaluations:create',
  EVALUATIONS_UPDATE: 'evaluations:update',
  EVALUATIONS_DELETE: 'evaluations:delete',
  
  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  
  // Users
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  
  // Audit
  AUDIT_READ: 'audit:read',
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.SISTERS_READ,
    PERMISSIONS.SISTERS_CREATE,
    PERMISSIONS.SISTERS_UPDATE,
    PERMISSIONS.SISTERS_DELETE,
    PERMISSIONS.VOCATION_READ,
    PERMISSIONS.VOCATION_CREATE,
    PERMISSIONS.VOCATION_UPDATE,
    PERMISSIONS.VOCATION_DELETE,
    PERMISSIONS.COMMUNITIES_READ,
    PERMISSIONS.COMMUNITIES_CREATE,
    PERMISSIONS.COMMUNITIES_UPDATE,
    PERMISSIONS.COMMUNITIES_DELETE,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_CREATE,
    PERMISSIONS.EDUCATION_UPDATE,
    PERMISSIONS.EDUCATION_DELETE,
    PERMISSIONS.MISSIONS_READ,
    PERMISSIONS.MISSIONS_CREATE,
    PERMISSIONS.MISSIONS_UPDATE,
    PERMISSIONS.MISSIONS_DELETE,
    PERMISSIONS.HEALTH_READ,
    PERMISSIONS.HEALTH_CREATE,
    PERMISSIONS.HEALTH_UPDATE,
    PERMISSIONS.HEALTH_DELETE,
    PERMISSIONS.EVALUATIONS_READ,
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.EVALUATIONS_DELETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.AUDIT_READ,
  ],
  manager: [
    PERMISSIONS.SISTERS_READ,
    PERMISSIONS.SISTERS_CREATE,
    PERMISSIONS.SISTERS_UPDATE,
    PERMISSIONS.VOCATION_READ,
    PERMISSIONS.VOCATION_CREATE,
    PERMISSIONS.VOCATION_UPDATE,
    PERMISSIONS.COMMUNITIES_READ,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_CREATE,
    PERMISSIONS.EDUCATION_UPDATE,
    PERMISSIONS.MISSIONS_READ,
    PERMISSIONS.MISSIONS_CREATE,
    PERMISSIONS.MISSIONS_UPDATE,
    PERMISSIONS.HEALTH_READ,
    PERMISSIONS.HEALTH_CREATE,
    PERMISSIONS.HEALTH_UPDATE,
    PERMISSIONS.EVALUATIONS_READ,
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_UPDATE,
    PERMISSIONS.REPORTS_READ,
  ],
  secretary: [
    PERMISSIONS.SISTERS_READ,
    PERMISSIONS.SISTERS_CREATE,
    PERMISSIONS.VOCATION_READ,
    PERMISSIONS.VOCATION_CREATE,
    PERMISSIONS.COMMUNITIES_READ,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.EDUCATION_CREATE,
    PERMISSIONS.MISSIONS_READ,
    PERMISSIONS.HEALTH_READ,
    PERMISSIONS.REPORTS_READ,
  ],
  user: [
    PERMISSIONS.SISTERS_READ,
    PERMISSIONS.VOCATION_READ,
    PERMISSIONS.COMMUNITIES_READ,
    PERMISSIONS.EDUCATION_READ,
    PERMISSIONS.MISSIONS_READ,
  ],
};

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean} Has permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean} Has any permission
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.role || !permissions || permissions.length === 0) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object with role
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean} Has all permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.role || !permissions || permissions.length === 0) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a role
 * @param {string} role - Role name
 * @returns {string[]} Permissions array
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user is admin or super admin
 * @param {Object} user - User object with role
 * @returns {boolean} Is admin
 */
export const isAdmin = (user) => {
  if (!user || !user.role) return false;
  return ['super_admin', 'admin'].includes(user.role);
};

/**
 * Check if user is super admin
 * @param {Object} user - User object with role
 * @returns {boolean} Is super admin
 */
export const isSuperAdmin = (user) => {
  if (!user || !user.role) return false;
  return user.role === 'super_admin';
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isAdmin,
  isSuperAdmin,
};
