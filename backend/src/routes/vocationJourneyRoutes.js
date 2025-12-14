const express = require("express");
const vocationJourneyController = require("../controllers/vocationJourneyController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateVocationJourneyCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

// Get all journeys with pagination
router.get(
  "/",
  checkPermission("journey.view_list"),
  vocationJourneyController.getAllJourneys
);

// Statistics - must be before /:id
router.get(
  "/statistics",
  checkPermission("journey.view_list"),
  vocationJourneyController.getStatisticsByStage
);

// Get journeys by sister - must be before /:id
router.get(
  "/sister/:sisterId",
  checkPermission("journey.view_list"),
  vocationJourneyController.getJourneyBySister
);

// Get journey by ID - must be after specific routes
router.get(
  "/:id",
  checkPermission("journey.view_detail"),
  vocationJourneyController.getJourneyById
);

// Create new journey with sister_id in body
router.post(
  "/",
  checkPermission("journey.create"),
  vocationJourneyController.createJourney
);

router.put(
  "/:stageId",
  checkPermission("journey.edit"),
  vocationJourneyController.updateJourneyStage
);

router.delete(
  "/:stageId",
  checkPermission("journey.delete"),
  vocationJourneyController.deleteJourneyStage
);

module.exports = router;
