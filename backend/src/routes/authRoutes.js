const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken, authorize } = require("../middlewares/auth");
const {
  validateUserCreate,
  validateLogin,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

const validateChangePassword = [
  body("oldPassword").notEmpty().withMessage("oldPassword is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters"),
];

router.post(
  "/register",
  // authenticateToken, // Temporarily disabled for public signup
  // authorize("admin"), // Temporarily disabled for public signup
  ...validateUserCreate,
  handleValidationErrors,
  authController.register
);

router.post(
  "/login",
  ...validateLogin,
  handleValidationErrors,
  authController.login
);

router.post("/logout", authenticateToken, authController.logout);

router.post(
  "/change-password",
  authenticateToken,
  ...validateChangePassword,
  handleValidationErrors,
  authController.changePassword
);

router.get("/profile", authenticateToken, authController.getProfile);

module.exports = router;
