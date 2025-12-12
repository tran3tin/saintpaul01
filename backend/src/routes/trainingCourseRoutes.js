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
  checkPermission("training.view_list"),
  trainingCourseController.getAllCourses
);
router.get(
  "/sister/:sisterId",
  checkPermission("training.view_list"),
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
  checkPermission("training.update"),
  trainingCourseController.updateCourse
);

router.delete(
  "/:id",
  checkPermission("training.delete"),
  trainingCourseController.deleteCourse
);

module.exports = router;
