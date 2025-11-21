const express = require("express");
const educationController = require("../controllers/educationController");
const { authenticateToken, authorize } = require("../middlewares/auth");
const {
  validateEducationCreate,
  handleValidationErrors,
} = require("../middlewares/validation");
const { uploadDocument } = require("../middlewares/upload");

const router = express.Router();

const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

router.use(authenticateToken);

router.get("/sister/:sisterId", educationController.getEducationBySister);
router.get("/statistics/level", educationController.getStatisticsByLevel);

router.post(
  "/",
  authorize(...editorRoles),
  validateEducationCreate,
  handleValidationErrors,
  educationController.addEducation
);

router.put(
  "/:id",
  authorize(...editorRoles),
  educationController.updateEducation
);

router.delete(
  "/:id",
  authorize(...editorRoles),
  educationController.deleteEducation
);

router.post(
  "/:id/certificate",
  authorize(...editorRoles),
  uploadDocument,
  educationController.uploadCertificate
);

module.exports = router;
