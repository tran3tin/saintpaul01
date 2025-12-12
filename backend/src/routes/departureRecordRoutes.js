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
  checkPermission("departures.view_list"),
  departureRecordController.getDepartureRecords
);

// Get statistics
router.get(
  "/statistics",
  checkPermission("departures.view_list"),
  departureRecordController.getDepartureStatistics
);

// Get departures by sister
router.get(
  "/sister/:sisterId",
  checkPermission("departures.view_list"),
  departureRecordController.getDepartureRecordBySister
);

// Get single departure by ID
router.get(
  "/:id",
  checkPermission("departures.view_detail"),
  departureRecordController.getDepartureRecordById
);

// Create new departure
router.post(
  "/",
  checkPermission("departures.create"),
  departureRecordController.createDepartureRecord
);

// Update departure
router.put(
  "/:id",
  checkPermission("departures.create"),
  departureRecordController.updateDepartureRecord
);

// Delete departure
router.delete(
  "/:id",
  checkPermission("departures.create"),
  departureRecordController.deleteDepartureRecord
);

module.exports = router;
