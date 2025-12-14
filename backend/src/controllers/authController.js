const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const { JWT_SECRET = "changeme", JWT_EXPIRES_IN = "1d" } = process.env;

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...rest } = user;
  return rest;
};

const buildToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      data_scope: user.data_scope,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res
      .status(403)
      .json({ message: "Only admin users can perform this action" });
    return false;
  }
  return true;
};

const register = async (req, res) => {
  // if (!ensureAdmin(req, res)) {
  //   return;
  // }

  try {
    const { username, password, email } = req.body;

    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingEmail = await UserModel.executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      username,
      password: hashedPassword,
      email,
      is_admin: 0,
      is_active: 1,
    });

    return res.status(201).json({ user: sanitizeUser(newUser) });
  } catch (error) {
    console.error("Register error:", error.message);
    return res
      .status(500)
      .json({ message: `Failed to register user: ${error.message}` });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation errors object
    const errors = {};

    // Validate username
    if (!username || !username.trim()) {
      errors.username = "Vui lòng nhập tên đăng nhập";
    }

    // Validate password
    if (!password) {
      errors.password = "Vui lòng nhập mật khẩu";
    }

    // If validation errors exist, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: "Vui lòng kiểm tra lại thông tin đăng nhập",
      });
    }

    const user = await UserModel.findByUsername(username.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: {
          username: "Tên đăng nhập không tồn tại",
        },
        message: "Tên đăng nhập không tồn tại",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        errors: {
          password: "Mật khẩu không đúng",
        },
        message: "Mật khẩu không đúng",
      });
    }

    const token = buildToken(user);
    await UserModel.updateLastLogin(user.id);

    // Get user permissions
    const permissionsData = await UserModel.getPermissions(user.id);
    const permissions = permissionsData.map((p) => p.name); // Array of permission names

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: sanitizeUser({
          ...user,
          last_login: new Date(),
          permissions: permissions,
        }),
      },
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "oldPassword and newPassword are required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldMatches = await bcrypt.compare(oldPassword, user.password);
    if (!oldMatches) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(userId, hashedPassword);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

const logout = async (req, res) => {
  // In case of token blacklist, integrate with cache/DB here.
  return res.status(200).json({ message: "Logged out successfully" });
};

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const dbUser = await UserModel.findById(req.user.id);
    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(dbUser) });
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  logout,
  getProfile,
};
