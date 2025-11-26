const express = require("express");
const healthRecordController = require("../controllers/healthRecordController");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

router.get(
  "/sister/:sisterId",
  healthRecordController.healthRecordAccessLogger,
  healthRecordController.getHealthRecordBySister
);

router.get(
  "/sister/:sisterId/summary",
  healthRecordController.healthRecordAccessLogger,
  healthRecordController.getGeneralHealthStatus
);

router.post("/", healthRecordController.addHealthRecord);

router.put("/:id", healthRecordController.updateHealthRecord);

module.exports = router;
