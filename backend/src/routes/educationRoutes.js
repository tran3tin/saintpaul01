const express = require("express");
const educationController = require("../controllers/educationController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateEducationCreate,
  handleValidationErrors,
} = require("../middlewares/validation");
const { uploadDocument } = require("../middlewares/upload");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

// List all education records
router.get(
  "/",
  checkPermission("education.view_list"),
  educationController.getAllEducation
);

router.get(
  "/sister/:sisterId",
  checkPermission("education.view_list"),
  educationController.getEducationBySister
);
router.get(
  "/statistics/level",
  checkPermission("education.view_list"),
  educationController.getStatisticsByLevel
);
router.get(
  "/:id",
  checkPermission("education.view_detail"),
  educationController.getEducationById
);

router.post(
  "/",
  checkPermission("education.create"),
  validateEducationCreate,
  handleValidationErrors,
  educationController.addEducation
);

router.put(
  "/:id",
  checkPermission("education.edit"),
  educationController.updateEducation
);

router.delete(
  "/:id",
  checkPermission("education.delete"),
  educationController.deleteEducation
);

router.post(
  "/:id/certificate",
  checkPermission("education.create"),
  uploadDocument,
  educationController.uploadCertificate
);

module.exports = router;
