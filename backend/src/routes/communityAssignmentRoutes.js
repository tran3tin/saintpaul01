const express = require("express");
const communityAssignmentController = require("../controllers/communityAssignmentController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { uploadDocument } = require("../middlewares/upload");

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/",
  checkPermission("community_assignment.create"),
  communityAssignmentController.assignSisterToCommunity
);
router.put(
  "/:id",
  checkPermission("community_assignment.edit"),
  communityAssignmentController.updateAssignment
);
router.delete(
  "/:id",
  checkPermission("community_assignment.delete"),
  communityAssignmentController.endAssignment
);
router.get(
  "/sister/:sisterId",
  checkPermission("community_assignment.view"),
  communityAssignmentController.getAssignmentHistory
);
router.get(
  "/community/:communityId",
  checkPermission("community_assignment.view"),
  communityAssignmentController.getAssignmentsByCommunity
);
router.get(
  "/sister/:sisterId/current",
  checkPermission("community_assignment.view"),
  communityAssignmentController.getCurrentAssignment
);
router.post(
  "/:id/decision-file",
  checkPermission("community_assignment.edit"),
  uploadDocument,
  communityAssignmentController.uploadDecisionFile
);

module.exports = router;
