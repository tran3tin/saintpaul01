const express = require("express");
const sisterController = require("../controllers/sisterController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");
const {
  validateSisterCreate,
  validateSisterUpdate,
  handleValidationErrors,
} = require("../middlewares/validation");
const { uploadPhoto, uploadDocuments } = require("../middlewares/upload");
const { logAction } = require("../middlewares/auditLog");
const { cacheMiddleware } = require("../middlewares/cache");

const router = express.Router();

const logSisterAction = (action) =>
  logAction({
    action,
    tableName: "sisters",
    getRecordId: (req) => req.params.id || null,
    getNewValue: (req, res) => (res.locals.payload ? res.locals.payload : null),
  });

// Apply authentication and data scope to all routes
router.use(authenticateToken);
router.use(attachDataScope);

// View routes - require sisters.view permission
router.get(
  "/",
  checkPermission("sisters.view_list"),
  sisterController.getAllSisters
);
router.get(
  "/search",
  checkPermission("sisters.view_list"),
  sisterController.searchSisters
);
router.get(
  "/:id",
  checkPermission("sisters.view_detail"),
  sisterController.getSisterById
);

// Create route
router.post(
  "/",
  checkPermission("sisters.create"),
  validateSisterCreate,
  handleValidationErrors,
  (req, res, next) => {
    res.locals.auditAction = "CREATE";
    next();
  },
  sisterController.createSister,
  logSisterAction("CREATE")
);

// Update route
router.put(
  "/:id",
  checkPermission("sisters.update_basic"),
  validateSisterUpdate,
  handleValidationErrors,
  (req, res, next) => {
    res.locals.auditAction = "UPDATE";
    res.locals.payload = req.body;
    next();
  },
  sisterController.updateSister,
  logSisterAction("UPDATE")
);

// Delete route
router.delete(
  "/:id",
  checkPermission("sisters.delete"),
  (req, res, next) => {
    res.locals.auditAction = "DELETE";
    next();
  },
  sisterController.deleteSister,
  logSisterAction("DELETE")
);

// Photo upload
router.post(
  "/:id/photo",
  checkPermission("sisters.upload_avatar"),
  uploadPhoto,
  sisterController.updateSisterPhoto,
  logSisterAction("UPLOAD_PHOTO")
);

// Document upload
router.post(
  "/:id/documents",
  checkPermission("sisters.upload_documents"),
  uploadDocuments,
  sisterController.uploadSisterDocuments,
  logSisterAction("UPLOAD_DOCUMENTS")
);

// Delete document
router.delete(
  "/:id/documents/:docIndex",
  checkPermission("sisters.upload_documents"),
  sisterController.deleteSisterDocument,
  logSisterAction("DELETE_DOCUMENT")
);

module.exports = router;
