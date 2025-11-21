const express = require("express");
const departureRecordController = require("../controllers/departureRecordController");
const { authenticateToken } = require("../middlewares/auth");
const {
  validateDepartureRecordCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.use(authenticateToken);

router.post(
  "/",
  validateDepartureRecordCreate,
  handleValidationErrors,
  departureRecordController.createDepartureRecord
);

router.put("/:id", departureRecordController.updateDepartureRecord);

router.get(
  "/sister/:sisterId",
  departureRecordController.getDepartureRecordBySister
);

router.get("/statistics", departureRecordController.getDepartureStatistics);

module.exports = router;
