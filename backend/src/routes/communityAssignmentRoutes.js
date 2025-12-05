const express = require("express");
const communityAssignmentController = require("../controllers/communityAssignmentController");
const { authenticateToken } = require("../middlewares/auth");
const { uploadDocument } = require("../middlewares/upload");

const router = express.Router();

router.use(authenticateToken);

router.post("/", communityAssignmentController.assignSisterToCommunity);
router.put("/:id", communityAssignmentController.updateAssignment);
router.delete("/:id", communityAssignmentController.endAssignment);
router.get(
  "/sister/:sisterId",
  communityAssignmentController.getAssignmentHistory
);
router.get(
  "/community/:communityId",
  communityAssignmentController.getAssignmentsByCommunity
);
router.get(
  "/sister/:sisterId/current",
  communityAssignmentController.getCurrentAssignment
);
router.post(
  "/:id/decision-file",
  uploadDocument,
  communityAssignmentController.uploadDecisionFile
);

module.exports = router;
