const express = require("express");
const healthRecordController = require("../controllers/healthRecordController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

// Get all health records with pagination
router.get(
  "/",
  checkPermission("health.view_list"),
  healthRecordController.getAllHealthRecords
);

// Routes with specific paths must come before /:id
router.get(
  "/sister/:sisterId",
  checkPermission("health.view_list"),
  healthRecordController.healthRecordAccessLogger,
  healthRecordController.getHealthRecordBySister
);

router.get(
  "/sister/:sisterId/summary",
  checkPermission("health.view_list"),
  healthRecordController.healthRecordAccessLogger,
  healthRecordController.getGeneralHealthStatus
);

// Get health record by ID (must come after specific paths)
router.get(
  "/:id",
  checkPermission("health.view_detail"),
  healthRecordController.getHealthRecordById
);

router.post(
  "/",
  checkPermission("health.create"),
  healthRecordController.addHealthRecord
);

router.put(
  "/:id",
  checkPermission("health.edit"),
  healthRecordController.updateHealthRecord
);

router.delete(
  "/:id",
  checkPermission("health.delete"),
  healthRecordController.deleteHealthRecord
);

module.exports = router;
