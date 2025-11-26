const express = require("express");
const vocationJourneyController = require("../controllers/vocationJourneyController");
const { authenticateToken, authorize } = require("../middlewares/auth");
const {
  validateVocationJourneyCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

router.use(authenticateToken);

router.get("/sister/:sisterId", vocationJourneyController.getJourneyBySister);

router.get("/statistics", vocationJourneyController.getStatisticsByStage);

router.post(
  "/",
  authorize(...editorRoles),
  validateVocationJourneyCreate,
  handleValidationErrors,
  vocationJourneyController.addJourneyStage
);

router.put(
  "/:stageId",
  authorize(...editorRoles),
  vocationJourneyController.updateJourneyStage
);

router.delete(
  "/:stageId",
  authorize(...editorRoles),
  vocationJourneyController.deleteJourneyStage
);

module.exports = router;
