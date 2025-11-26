const express = require("express");
const trainingCourseController = require("../controllers/trainingCourseController");
const { authenticateToken, authorize } = require("../middlewares/auth");
const {
  validateTrainingCourseCreate,
  handleValidationErrors,
} = require("../middlewares/validation");

const router = express.Router();

const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

router.use(authenticateToken);

router.get("/", trainingCourseController.getAllCourses);
router.get("/sister/:sisterId", trainingCourseController.getCoursesBySister);

router.post(
  "/",
  authorize(...editorRoles),
  validateTrainingCourseCreate,
  handleValidationErrors,
  trainingCourseController.addCourse
);

router.put(
  "/:id",
  authorize(...editorRoles),
  trainingCourseController.updateCourse
);

router.delete(
  "/:id",
  authorize(...editorRoles),
  trainingCourseController.deleteCourse
);

module.exports = router;
