const express = require("express");
const auditLogController = require("../controllers/auditLogController");
const { authenticateToken, authorize } = require("../middlewares/auth");

const router = express.Router();

const privilegedRoles = ["admin", "superior_general"];

router.use(authenticateToken, authorize(...privilegedRoles));

router.get("/", auditLogController.getAuditLogs);
router.get("/user/:userId", auditLogController.getAuditLogsByUser);
router.get("/table/:tableName", auditLogController.getAuditLogsByTable);
router.get(
  "/table/:tableName/record/:recordId",
  auditLogController.getAuditLogsByRecord
);

module.exports = router;
