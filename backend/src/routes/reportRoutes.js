const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

const statisticsCache = cacheMiddleware(300);

// Dashboard & Overview
router.get(
  "/dashboard",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getDashboard
);

router.get(
  "/statistics",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatistics
);

// Specific Reports
router.get(
  "/sisters",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getSisterReport
);

router.get(
  "/journey",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getJourneyReport
);

router.get(
  "/health",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getHealthReport
);

router.get(
  "/evaluations",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getEvaluationReport
);

// Category Reports
router.get(
  "/age",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatisticsByAge
);
router.get(
  "/stage",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatisticsByStage
);
router.get(
  "/community",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatisticsByCommunity
);
router.get(
  "/mission-field",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatisticsByMissionField
);
router.get(
  "/education",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getStatisticsByEducationLevel
);
router.get(
  "/comprehensive",
  statisticsCache,
  checkPermission("reports.view"),
  reportController.getComprehensiveReport
);

// Export
router.get(
  "/export/excel",
  checkPermission("reports.export"),
  reportController.exportReportExcel
);
router.get(
  "/export/pdf",
  checkPermission("reports.export"),
  reportController.exportReportPDF
);

module.exports = router;
