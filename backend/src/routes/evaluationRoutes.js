const express = require("express");
const evaluationController = require("../controllers/evaluationController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

router.get(
  "/",
  checkPermission("evaluations.view_list"),
  evaluationController.getEvaluations
);

router.get(
  "/sister/:sisterId",
  checkPermission("evaluations.view_list"),
  evaluationController.getEvaluationsBySister
);

router.get(
  "/:id",
  checkPermission("evaluations.view_detail"),
  evaluationController.getEvaluationById
);

router.post(
  "/",
  checkPermission("evaluations.create"),
  evaluationController.createEvaluation
);

router.put(
  "/:id",
  checkPermission("evaluations.edit"),
  evaluationController.updateEvaluation
);

router.delete(
  "/:id",
  checkPermission("evaluations.delete"),
  evaluationController.deleteEvaluation
);

router.get(
  "/:id/export",
  checkPermission("evaluations.view_detail"),
  evaluationController.exportEvaluationPDF
);

module.exports = router;
