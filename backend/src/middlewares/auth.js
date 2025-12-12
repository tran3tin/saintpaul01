const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");
const UserModel = require("../models/UserModel");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details including permissions and scope info
    const db = require("../config/database");
    const [users] = await db.query(
      `SELECT id, username, is_admin, is_super_admin, data_scope 
       FROM users WHERE id = ?`,
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    // Get user permissions
    const permissions = await UserModel.getPermissions(decoded.id);
    const isAdmin = user.is_admin === 1;
    const isSuperAdmin = user.is_super_admin === 1;

    req.user = {
      ...decoded,
      isAdmin,
      is_super_admin: isSuperAdmin,
      data_scope: user.data_scope,
      permissions: permissions.map((p) => p.name),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "User context missing" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return next();
  };

/**
 * Check if user has required permission
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // Super admin bypasses ALL permission checks
    if (req.user && req.user.is_super_admin) {
      return next();
    }

    // Regular admin bypass all checks
    if (req.user && req.user.isAdmin) {
      return next();
    }

    // Check if user has the specific required permission
    if (
      !req.user ||
      !req.user.permissions ||
      !req.user.permissions.includes(requiredPermission)
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
        requiredPermission,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorize,
  checkPermission,
};
