const express = require("express");
const trainingCourseController = require("../controllers/trainingCourseController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateTrainingCourseCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

router.get(
  "/",
  checkPermission("training.view"),
  trainingCourseController.getAllCourses
);
router.get(
  "/sister/:sisterId",
  checkPermission("training.view"),
  trainingCourseController.getCoursesBySister
);

router.post(
  "/",
  checkPermission("training.create"),
  validateTrainingCourseCreate,
  handleValidationErrors,
  trainingCourseController.addCourse
);

router.put(
  "/:id",
  checkPermission("training.edit"),
  trainingCourseController.updateCourse
);

router.delete(
  "/:id",
  checkPermission("training.delete"),
  trainingCourseController.deleteCourse
);

module.exports = router;
