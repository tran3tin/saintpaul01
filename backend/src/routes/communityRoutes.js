const express = require("express");
const communityController = require("../controllers/communityController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateCommunityCreate,
  handleValidationErrors,
} = require("../middlewares/validation");
const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

router.get(
  "/",
  cacheMiddleware(600),
  checkPermission("communities.view_list"),
  communityController.getAllCommunities
);
router.get(
  "/:id",
  checkPermission("communities.view_detail"),
  communityController.getCommunityById
);
router.get(
  "/:id/members",
  checkPermission("communities.view_assignments"),
  communityController.getCommunityMembers
);

router.post(
  "/",
  checkPermission("communities.create"),
  validateCommunityCreate,
  handleValidationErrors,
  communityController.createCommunity
);

router.put(
  "/:id",
  checkPermission("communities.update"),
  validateCommunityCreate,
  handleValidationErrors,
  communityController.updateCommunity
);

router.delete(
  "/:id",
  checkPermission("communities.delete"),
  communityController.deleteCommunity
);

// Member management routes
router.post(
  "/:id/members",
  checkPermission("communities.assign_sister"),
  communityController.addMember
);

router.put(
  "/:id/members/:memberId",
  checkPermission("communities.assign_sister"),
  communityController.updateMemberRole
);

router.delete(
  "/:id/members/:memberId",
  checkPermission("communities.remove_sister"),
  communityController.removeMember
);

module.exports = router;
