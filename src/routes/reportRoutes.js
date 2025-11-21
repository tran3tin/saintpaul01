const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticateToken } = require("../middlewares/auth");
const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

router.use(authenticateToken);

const statisticsCache = cacheMiddleware(300);

router.get("/age", statisticsCache, reportController.getStatisticsByAge);
router.get("/stage", statisticsCache, reportController.getStatisticsByStage);
router.get(
  "/community",
  statisticsCache,
  reportController.getStatisticsByCommunity
);
router.get(
  "/mission-field",
  statisticsCache,
  reportController.getStatisticsByMissionField
);
router.get(
  "/education",
  statisticsCache,
  reportController.getStatisticsByEducationLevel
);
router.get(
  "/comprehensive",
  statisticsCache,
  reportController.getComprehensiveReport
);
router.get("/export/excel", reportController.exportReportExcel);
router.get("/export/pdf", reportController.exportReportPDF);

module.exports = router;
