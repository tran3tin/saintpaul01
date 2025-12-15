const express = require("express");
const communityController = require("../controllers/communityController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateCommunityCreate,
  validateCommunityUpdate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

router.get(
  "/",
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
  checkPermission("communities.view_list"),
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
  checkPermission("communities.edit"),
  validateCommunityUpdate,
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
  checkPermission("communities.assign"),
  communityController.addMember
);

router.put(
  "/:id/members/:memberId",
  checkPermission("communities.assign"),
  communityController.updateMemberRole
);

router.delete(
  "/:id/members/:memberId",
  checkPermission("communities.assign"),
  communityController.removeMember
);

module.exports = router;
