const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorize,
  checkPermission,
} = require("../middlewares/auth");
const {
  validateUserCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

const adminOnly = authorize("admin");

router.use(authenticateToken);

// Profile routes (must be before /:id routes)
router.put("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);

// Permission routes
router.get(
  "/permissions/all",
  checkPermission("users.create"),
  userController.getAllPermissions
);

router.get("/", checkPermission("users.view"), userController.getAllUsers);
router.get("/:id", userController.getUserById);

router.post(
  "/",
  checkPermission("users.create"),
  validateUserCreate,
  handleValidationErrors,
  userController.createUser
);

router.put("/:id", checkPermission("users.edit"), userController.updateUser);

router.delete(
  "/:id",
  checkPermission("users.delete"),
  userController.deleteUser
);

router.post(
  "/:id/reset-password",
  checkPermission("users.edit"),
  body("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .isLength({ min: 6 })
    .withMessage("newPassword must be at least 6 characters"),
  handleValidationErrors,
  userController.resetPassword
);

router.post(
  "/:id/toggle-status",
  checkPermission("users.edit"),
  userController.toggleUserStatus
);

router.get("/:id/activities", userController.getUserActivities);

// User permissions management
router.get(
  "/:id/permissions",
  checkPermission("users.view"),
  userController.getUserPermissions
);
router.put(
  "/:id/permissions",
  checkPermission("users.assign_permissions"),
  userController.updateUserPermissions
);

// User communities management
router.get(
  "/:id/communities",
  checkPermission("users.view"),
  userController.getUserCommunities
);
router.post(
  "/:id/communities",
  checkPermission("users.assign_communities"),
  userController.assignCommunities
);
router.delete(
  "/:id/communities/:communityId",
  checkPermission("users.remove_communities"),
  userController.removeCommunity
);

// Update data scope
router.put(
  "/:id/data-scope",
  checkPermission("users.update"),
  userController.updateDataScope
);

module.exports = router;
