const express = require("express");
const communityController = require("../controllers/communityController");
const { authenticateToken, authorize } = require("../middlewares/auth");
const {
  validateCommunityCreate,
  handleValidationErrors,
} = require("../middlewares/validation");
const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

router.use(authenticateToken);

router.get("/", cacheMiddleware(600), communityController.getAllCommunities);
router.get("/:id", communityController.getCommunityById);
router.get("/:id/members", communityController.getCommunityMembers);

router.post(
  "/",
  authorize(...editorRoles),
  validateCommunityCreate,
  handleValidationErrors,
  communityController.createCommunity
);

router.put(
  "/:id",
  authorize(...editorRoles),
  validateCommunityCreate,
  handleValidationErrors,
  communityController.updateCommunity
);

router.delete(
  "/:id",
  authorize(...editorRoles),
  communityController.deleteCommunity
);

module.exports = router;
