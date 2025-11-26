const express = require("express");
const evaluationController = require("../controllers/evaluationController");
const { authenticateToken } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/sister/:sisterId", evaluationController.getEvaluationsBySister);

router.post("/", evaluationController.createEvaluation);

router.put("/:id", evaluationController.updateEvaluation);

router.delete("/:id", evaluationController.deleteEvaluation);

router.get("/:id/export", evaluationController.exportEvaluationPDF);

module.exports = router;
