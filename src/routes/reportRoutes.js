const express = require("express");
const reportController = require("../controllers/reportController");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/age", reportController.getStatisticsByAge);
router.get("/stage", reportController.getStatisticsByStage);
router.get("/community", reportController.getStatisticsByCommunity);
router.get("/mission-field", reportController.getStatisticsByMissionField);
router.get("/education", reportController.getStatisticsByEducationLevel);
router.get("/comprehensive", reportController.getComprehensiveReport);
router.get("/export/excel", reportController.exportReportExcel);
router.get("/export/pdf", reportController.exportReportPDF);

module.exports = router;
