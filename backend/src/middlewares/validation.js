const { body, param, query, validationResult } = require("express-validator");

const USER_ROLES = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
  "viewer",
];

const optionalDate = (field) =>
  body(field)
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage(`${field} phải là ngày hợp lệ`);

const optionalEmail = (field) =>
  body(field)
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage(`${field} phải là email hợp lệ`);

const optionalPhone = (field) =>
  body(field)
    .optional({ checkFalsy: true })
    .custom((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    })
    .withMessage(`${field} phải là 10 số (di động) hoặc 11 số (bàn)`);

const validateSisterCreate = [
  body("birth_name").notEmpty().withMessage("Tên khai sinh là bắt buộc"),
  body("date_of_birth")
    .notEmpty()
    .withMessage("Ngày sinh là bắt buộc")
    .isISO8601()
    .withMessage("Ngày sinh phải là ngày hợp lệ"),
  body("place_of_birth")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("Nơi sinh không được để trống"),
  optionalEmail("email"),
  optionalPhone("phone"),
  optionalPhone("emergency_contact_phone"),
  optionalDate("baptism_date"),
  optionalDate("confirmation_date"),
  optionalDate("first_communion_date"),
];

const validateSisterUpdate = [
  body("birth_name")
    .optional()
    .notEmpty()
    .withMessage("Tên khai sinh không được để trống"),
  body("date_of_birth")
    .optional()
    .isISO8601()
    .withMessage("Ngày sinh phải là ngày hợp lệ"),
  body("place_of_birth")
    .optional()
    .notEmpty()
    .withMessage("Nơi sinh không được để trống"),
  optionalEmail("email"),
  optionalPhone("phone"),
  optionalPhone("emergency_contact_phone"),
  optionalDate("baptism_date"),
  optionalDate("confirmation_date"),
  optionalDate("first_communion_date"),
];

const validateUserCreate = [
  body("username")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 4 })
    .withMessage("username must be at least 4 characters"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be valid"),
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(USER_ROLES)
    .withMessage(`role must be one of: ${USER_ROLES.join(", ")}`),
];

const validateLogin = [
  body("username").notEmpty().withMessage("username is required"),
  body("password").notEmpty().withMessage("password is required"),
];

const validateCommunityCreate = [
  body("code").optional({ nullable: true, checkFalsy: true }),
  body("name").notEmpty().withMessage("name is required"),
];

const validateCommunityAssignmentCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("community_id")
    .isInt({ min: 1 })
    .withMessage("community_id must be a positive integer"),
  body("role")
    .notEmpty()
    .withMessage("role is required")
    .isIn(["superior", "deputy", "treasurer", "member"])
    .withMessage("invalid assignment role"),
  body("start_date")
    .notEmpty()
    .withMessage("start_date is required")
    .isISO8601()
    .withMessage("start_date must be a valid date"),
  optionalDate("end_date"),
];

const validateVocationJourneyCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("stage")
    .notEmpty()
    .withMessage("stage is required")
    .isIn([
      "inquiry",
      "postulant",
      "aspirant",
      "novice",
      "temporary_vows",
      "perpetual_vows",
      "left",
    ])
    .withMessage("invalid stage value"),
  body("start_date")
    .notEmpty()
    .withMessage("start_date is required")
    .isISO8601()
    .withMessage("start_date must be a valid date"),
  optionalDate("end_date"),
];

const validateMissionCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("field")
    .notEmpty()
    .withMessage("field is required")
    .isIn([
      "education",
      "pastoral",
      "publishing",
      "media",
      "healthcare",
      "social",
    ])
    .withMessage("invalid mission field"),
  body("start_date")
    .notEmpty()
    .withMessage("start_date is required")
    .isISO8601()
    .withMessage("start_date must be a valid date"),
  optionalDate("end_date"),
];

const validateEducationCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("level")
    .notEmpty()
    .withMessage("level is required")
    .isIn(["secondary", "bachelor", "master", "doctorate"])
    .withMessage("invalid education level"),
  optionalDate("start_date"),
  optionalDate("end_date"),
];

const validateTrainingCourseCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("course_name").notEmpty().withMessage("course_name is required"),
  optionalDate("start_date"),
  optionalDate("end_date"),
];

const validateHealthRecordCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("general_health")
    .notEmpty()
    .withMessage("general_health is required")
    .isIn(["good", "average", "weak"])
    .withMessage("invalid general_health value"),
  optionalDate("checkup_date"),
];

const validateEvaluationCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("evaluation_period")
    .notEmpty()
    .withMessage("evaluation_period is required"),
  [
    "spiritual_life_score",
    "community_life_score",
    "mission_score",
    "personality_score",
    "obedience_score",
  ].map((field) =>
    body(field)
      .optional({ checkFalsy: true })
      .isInt({ min: 0, max: 10 })
      .withMessage(`${field} must be between 0 and 10`)
  ),
].flat();

const validateDepartureRecordCreate = [
  body("sister_id")
    .isInt({ min: 1 })
    .withMessage("sister_id must be a positive integer"),
  body("departure_date")
    .notEmpty()
    .withMessage("departure_date is required")
    .isISO8601()
    .withMessage("departure_date must be a valid date"),
  body("stage_at_departure")
    .optional({ nullable: true, checkFalsy: true })
    .isIn([
      "inquiry",
      "postulant",
      "aspirant",
      "novice",
      "temporary_vows",
      "perpetual_vows",
      "left",
    ])
    .withMessage("invalid stage_at_departure value"),
  body("type")
    .optional({ nullable: true })
    .isString()
    .withMessage("type must be a string"),
  body("expected_return_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("expected_return_date must be a valid date"),
  body("return_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("return_date must be a valid date"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors
    .array()
    .map((err) => ({ field: err.path || err.param, message: err.msg }));
  return res.status(400).json({ errors: formatted });
};

module.exports = {
  validateSisterCreate,
  validateSisterUpdate,
  validateUserCreate,
  validateLogin,
  validateCommunityCreate,
  validateCommunityAssignmentCreate,
  validateVocationJourneyCreate,
  validateMissionCreate,
  validateEducationCreate,
  validateTrainingCourseCreate,
  validateHealthRecordCreate,
  validateEvaluationCreate,
  validateDepartureRecordCreate,
  handleValidationErrors,
};
