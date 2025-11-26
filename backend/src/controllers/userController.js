const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const AuditLogModel = require("../models/AuditLogModel");

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safe } = user;
  return safe;
};

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "users",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("User audit log failed:", error.message);
  }
};

const ensureAuthenticated = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
};

const ensureAdmin = (req, res) => {
  if (!ensureAuthenticated(req, res)) {
    return false;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }

  return true;
};

const canManageUser = (req, targetUserId) => {
  if (!req.user) {
    return false;
  }

  if (req.user.role === "admin") {
    return true;
  }

  return `${req.user.id}` === `${targetUserId}`;
};

const getAllUsers = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const users = await UserModel.executeQuery(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    return res.status(200).json({ data: users.map(sanitizeUser) });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!ensureAuthenticated(req, res)) {
      return;
    }

    const { id } = req.params;
    if (!canManageUser(req, id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error("getUserById error:", error.message);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

const createUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { username, password, email, role } = req.body;
    if (!username || !password || !email || !role) {
      return res
        .status(400)
        .json({ message: "username, password, email, role are required" });
    }

    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await UserModel.create({
      username,
      password: hashedPassword,
      email,
      role,
      is_active: 1,
    });

    await logAudit(req, "CREATE", created.id, null, sanitizeUser(created));

    return res.status(201).json({ user: sanitizeUser(created) });
  } catch (error) {
    console.error("createUser error:", error.message);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!ensureAuthenticated(req, res)) {
      return;
    }

    const { id } = req.params;
    if (!canManageUser(req, id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = ["email"];
    if (req.user.role === "admin") {
      allowedFields.push("role");
    }

    const payload = {};
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    });

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const updated = await UserModel.update(id, payload);
    await logAudit(
      req,
      "UPDATE",
      id,
      sanitizeUser(user),
      sanitizeUser(updated)
    );

    return res.status(200).json({ user: sanitizeUser(updated) });
  } catch (error) {
    console.error("updateUser error:", error.message);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updated = await UserModel.update(id, { is_active: 0 });
    await logAudit(
      req,
      "DEACTIVATE",
      id,
      sanitizeUser(user),
      sanitizeUser(updated)
    );

    return res.status(200).json({ message: "User deactivated" });
  } catch (error) {
    console.error("deleteUser error:", error.message);
    return res.status(500).json({ message: "Failed to deactivate user" });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "newPassword is required" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.update(id, { password: hashedPassword });
    await logAudit(req, "RESET_PASSWORD", id, null, { id });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const { is_active: desiredStatus } = req.body;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let nextStatus;
    if (
      typeof desiredStatus === "number" ||
      typeof desiredStatus === "boolean"
    ) {
      nextStatus = desiredStatus ? 1 : 0;
    } else {
      nextStatus = user.is_active ? 0 : 1;
    }

    const updated = await UserModel.update(id, { is_active: nextStatus });
    await logAudit(
      req,
      "TOGGLE_STATUS",
      id,
      sanitizeUser(user),
      sanitizeUser(updated)
    );

    return res.status(200).json({
      message: nextStatus ? "User activated" : "User deactivated",
      user: sanitizeUser(updated),
    });
  } catch (error) {
    console.error("toggleUserStatus error:", error.message);
    return res.status(500).json({ message: "Failed to toggle user status" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
};
