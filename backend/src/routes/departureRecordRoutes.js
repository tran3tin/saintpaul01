const express = require("express");
const departureRecordController = require("../controllers/departureRecordController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateDepartureRecordCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

// Get list of all departure records
router.get(
  "/",
  checkPermission("departure.view"),
  departureRecordController.getDepartureRecords
);

// Get statistics
router.get(
  "/statistics",
  checkPermission("departure.view"),
  departureRecordController.getDepartureStatistics
);

// Get departures by sister
router.get(
  "/sister/:sisterId",
  checkPermission("departure.view"),
  departureRecordController.getDepartureRecordBySister
);

// Get single departure by ID
router.get(
  "/:id",
  checkPermission("departure.view"),
  departureRecordController.getDepartureRecordById
);

// Create new departure
router.post(
  "/",
  checkPermission("departure.create"),
  departureRecordController.createDepartureRecord
);

// Update departure
router.put(
  "/:id",
  checkPermission("departure.edit"),
  departureRecordController.updateDepartureRecord
);

// Delete departure
router.delete(
  "/:id",
  checkPermission("departure.delete"),
  departureRecordController.deleteDepartureRecord
);

module.exports = router;
