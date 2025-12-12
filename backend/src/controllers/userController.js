const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const AuditLogModel = require("../models/AuditLogModel");

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Vietnamese phone: starts with 0, 10-11 digits
  // Also allow formats like: 0123-456-789, 0123 456 789, +84123456789
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  const cleanPhone = phone.replace(/[\s\-\.]/g, "");
  return phoneRegex.test(cleanPhone);
};

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

  // Check isAdmin (set by authenticateToken middleware)
  if (!req.user.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }

  return true;
};

const canManageUser = (req, targetUserId) => {
  if (!req.user) {
    return false;
  }

  // Admin can manage all users
  if (req.user.isAdmin) {
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

    const sanitizedUsers = users.map(sanitizeUser);

    return res.status(200).json({
      success: true,
      data: {
        items: sanitizedUsers,
        total: sanitizedUsers.length,
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
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

    const {
      username,
      password,
      email,
      role,
      full_name,
      phone,
      avatar,
      status,
    } = req.body;

    // Validation errors object
    const errors = {};

    // Validate username
    if (!username || !username.trim()) {
      errors.username = "Tên đăng nhập là bắt buộc";
    } else if (username.trim().length < 3) {
      errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    // Validate password
    if (!password) {
      errors.password = "Mật khẩu là bắt buộc";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate email
    if (!email || !email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!isValidEmail(email)) {
      errors.email = "Email không hợp lệ";
    }

    // Validate full_name
    if (!full_name || !full_name.trim()) {
      errors.full_name = "Họ tên là bắt buộc";
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate role
    if (!role) {
      errors.role = "Vai trò là bắt buộc";
    }

    // If validation errors exist, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: "Vui lòng kiểm tra lại thông tin",
      });
    }

    // Check if username already exists
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({
        success: false,
        errors: { username: "Tên đăng nhập đã tồn tại" },
        message: "Tên đăng nhập đã được sử dụng",
      });
    }

    // Check if email already exists
    const existingEmail = await UserModel.executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { email: "Email đã tồn tại" },
        message: "Email đã được sử dụng",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields
    const userData = {
      username: username.trim(),
      password: hashedPassword,
      email: email.trim(),
      role,
      full_name: full_name.trim(),
      phone: phone ? phone.trim() : null,
      avatar: avatar || null,
      is_active: status === "active" ? 1 : 0,
    };

    const created = await UserModel.create(userData);

    await logAudit(req, "CREATE", created.id, null, sanitizeUser(created));

    return res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      data: sanitizeUser(created),
    });
  } catch (error) {
    console.error("createUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo người dùng",
    });
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { email, role, full_name, phone, avatar, status } = req.body;

    // Validation errors object
    const errors = {};

    // Validate email if provided
    if (email !== undefined) {
      if (!email || !email.trim()) {
        errors.email = "Email là bắt buộc";
      } else if (!isValidEmail(email)) {
        errors.email = "Email không hợp lệ";
      } else {
        // Check if email already exists for another user
        const existingEmail = await UserModel.executeQuery(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, id]
        );
        if (existingEmail.length > 0) {
          errors.email = "Email đã tồn tại";
        }
      }
    }

    // Validate full_name if provided
    if (full_name !== undefined && (!full_name || !full_name.trim())) {
      errors.full_name = "Họ tên là bắt buộc";
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    // If validation errors exist, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: "Vui lòng kiểm tra lại thông tin",
      });
    }

    // Build update payload
    const payload = {};

    if (email !== undefined) payload.email = email.trim();
    if (full_name !== undefined) payload.full_name = full_name.trim();
    if (phone !== undefined) payload.phone = phone ? phone.trim() : null;
    if (avatar !== undefined) payload.avatar = avatar;
    if (status !== undefined) payload.is_active = status === "active" ? 1 : 0;

    // Admin can update role
    if (req.user.role === "admin" && role !== undefined) {
      payload.role = role;
    }

    if (!Object.keys(payload).length) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const updated = await UserModel.update(id, payload);
    await logAudit(
      req,
      "UPDATE",
      id,
      sanitizeUser(user),
      sanitizeUser(updated)
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: sanitizeUser(updated),
    });
  } catch (error) {
    console.error("updateUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật người dùng",
    });
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
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Log audit trước khi xóa
    await logAudit(req, "DELETE", id, sanitizeUser(user), null);

    // Xóa người dùng khỏi database
    const deleted = await UserModel.delete(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Không thể xóa người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa người dùng thành công",
    });
  } catch (error) {
    console.error("deleteUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng",
    });
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

// Update current user's profile
const updateProfile = async (req, res) => {
  try {
    if (!ensureAuthenticated(req, res)) {
      return;
    }

    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { full_name, email, phone, avatar } = req.body;

    // Validate email format
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          message: "Email không đúng định dạng. Ví dụ: example@domain.com",
        });
      }
      // Check if email already exists
      if (email !== user.email) {
        const existingEmail = await UserModel.executeQuery(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [email, userId]
        );
        if (existingEmail.length > 0) {
          return res
            .status(409)
            .json({ message: "Email đã được sử dụng bởi tài khoản khác" });
        }
      }
    }

    // Validate phone format
    if (phone && phone.trim() !== "") {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          message:
            "Số điện thoại không đúng định dạng. Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số",
        });
      }
    }

    const payload = {};
    if (full_name !== undefined) payload.full_name = full_name;
    if (email !== undefined) payload.email = email;
    if (phone !== undefined) payload.phone = phone;
    if (avatar !== undefined) payload.avatar = avatar;

    if (!Object.keys(payload).length) {
      return res
        .status(400)
        .json({ message: "Không có thông tin để cập nhật" });
    }

    const updated = await UserModel.update(userId, payload);
    await logAudit(
      req,
      "UPDATE_PROFILE",
      userId,
      sanitizeUser(user),
      sanitizeUser(updated)
    );

    return res.status(200).json({
      success: true,
      data: sanitizeUser(updated),
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.error("updateProfile error:", error.message);
    return res.status(500).json({ message: "Lỗi khi cập nhật thông tin" });
  }
};

// Change current user's password
const changePassword = async (req, res) => {
  try {
    if (!ensureAuthenticated(req, res)) {
      return;
    }

    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await UserModel.update(userId, { password: hashedPassword });
    await logAudit(req, "CHANGE_PASSWORD", userId, null, { id: userId });

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("changePassword error:", error.message);
    return res.status(500).json({ message: "Lỗi khi đổi mật khẩu" });
  }
};

const getUserActivities = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has permission to view activities
    const canView = canManageUser(req, id);
    if (!canView && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem hoạt động này",
      });
    }

    // Get user activities from audit_logs
    const activities = await AuditLogModel.executeQuery(
      `SELECT * FROM audit_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("getUserActivities error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tải hoạt động người dùng",
    });
  }
};

/**
 * Get all available permissions (grouped by module)
 */
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await UserModel.executeQuery(`
      SELECT id, name, display_name as displayName, description, module
      FROM permissions
      WHERE is_active = 1
      ORDER BY module, name
    `);

    // Group by module
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push({
        id: perm.id,
        name: perm.name,
        displayName: perm.displayName,
        description: perm.description,
      });
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("getAllPermissions error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách quyền",
    });
  }
};

/**
 * Update user permissions
 */
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc",
      });
    }

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Assign permissions
    await UserModel.assignPermissions(id, permissionIds || [], req.user.id);

    // Log audit
    await logAudit(req, "UPDATE_PERMISSIONS", id, null, { permissionIds });

    return res.status(200).json({
      success: true,
      message: "Cập nhật quyền thành công",
    });
  } catch (error) {
    console.error("updateUserPermissions error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể cập nhật quyền",
    });
  }
};

/**
 * Get user permissions
 */
const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc",
      });
    }

    const permissions = await UserModel.getPermissions(id);

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("getUserPermissions error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy quyền người dùng",
    });
  }
};

/**
 * Get user communities
 */
const getUserCommunities = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc",
      });
    }

    const communities = await UserModel.executeQuery(
      `SELECT c.* 
       FROM communities c
       INNER JOIN user_communities uc ON uc.community_id = c.id
       WHERE uc.user_id = ?
       ORDER BY c.name`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: communities,
    });
  } catch (error) {
    console.error("getUserCommunities error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách cộng đoàn",
    });
  }
};

/**
 * Assign communities to user
 */
const assignCommunities = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const { community_ids } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc",
      });
    }

    if (!community_ids || !Array.isArray(community_ids)) {
      return res.status(400).json({
        success: false,
        message: "Danh sách cộng đoàn không hợp lệ",
      });
    }

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Delete existing assignments
    await UserModel.executeQuery(
      "DELETE FROM user_communities WHERE user_id = ?",
      [id]
    );

    // Insert new assignments
    if (community_ids.length > 0) {
      const values = community_ids.map((cid) => [id, cid, req.user.id]);
      await UserModel.executeQuery(
        `INSERT INTO user_communities (user_id, community_id, granted_by) VALUES ?`,
        [values]
      );
    }

    // Clear scope cache
    const { clearScopeCache } = require("../middlewares/dataScope");
    clearScopeCache(id);

    // Log audit
    await logAudit(req, "ASSIGN_COMMUNITIES", id, null, { community_ids });

    return res.status(200).json({
      success: true,
      message: "Gán cộng đoàn thành công",
    });
  } catch (error) {
    console.error("assignCommunities error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể gán cộng đoàn",
    });
  }
};

/**
 * Remove community from user
 */
const removeCommunity = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id, communityId } = req.params;

    if (!id || !communityId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin",
      });
    }

    await UserModel.executeQuery(
      "DELETE FROM user_communities WHERE user_id = ? AND community_id = ?",
      [id, communityId]
    );

    // Clear scope cache
    const { clearScopeCache } = require("../middlewares/dataScope");
    clearScopeCache(id);

    // Log audit
    await logAudit(req, "REMOVE_COMMUNITY", id, null, { communityId });

    return res.status(200).json({
      success: true,
      message: "Đã gỡ khỏi cộng đoàn",
    });
  } catch (error) {
    console.error("removeCommunity error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể gỡ cộng đoàn",
    });
  }
};

/**
 * Update user data scope
 */
const updateDataScope = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) {
      return;
    }

    const { id } = req.params;
    const { data_scope } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng là bắt buộc",
      });
    }

    if (!["all", "community", "own"].includes(data_scope)) {
      return res.status(400).json({
        success: false,
        message: "data_scope không hợp lệ (all/community/own)",
      });
    }

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Update data_scope
    await UserModel.update(id, { data_scope });

    // Clear scope cache
    const { clearScopeCache } = require("../middlewares/dataScope");
    clearScopeCache(id);

    // Log audit
    await logAudit(
      req,
      "UPDATE_DATA_SCOPE",
      id,
      { data_scope: user.data_scope },
      { data_scope }
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật phạm vi dữ liệu thành công",
    });
  } catch (error) {
    console.error("updateDataScope error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật phạm vi dữ liệu",
    });
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
  updateProfile,
  changePassword,
  getUserActivities,
  getAllPermissions,
  updateUserPermissions,
  getUserPermissions,
  getUserCommunities,
  assignCommunities,
  removeCommunity,
  updateDataScope,
};
