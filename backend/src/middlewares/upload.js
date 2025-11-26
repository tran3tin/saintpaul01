const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");
const PHOTO_DIR = path.join(UPLOADS_ROOT, "photos");
const DOCUMENT_DIR = path.join(UPLOADS_ROOT, "documents");
const CERTIFICATE_DIR = path.join(UPLOADS_ROOT, "certificates");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

[PHOTO_DIR, DOCUMENT_DIR, CERTIFICATE_DIR].forEach(ensureDir);

const generateFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).slice(2, 8);
  const extension = path.extname(originalName) || "";
  return `${timestamp}-${randomString}${extension}`;
};

const createStorage = (targetDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetDir),
    filename: (req, file, cb) => cb(null, generateFilename(file.originalname)),
  });

const photoMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
const documentMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const createUploader = ({ directory, allowedMimeTypes, fileSize }) =>
  multer({
    storage: createStorage(directory),
    limits: { fileSize },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
      return cb(new Error("Invalid file type")); // Non-MulterError handled downstream
    },
  });

const photoUploader = createUploader({
  directory: PHOTO_DIR,
  allowedMimeTypes: photoMimeTypes,
  fileSize: 5 * 1024 * 1024,
});

const documentUploader = createUploader({
  directory: DOCUMENT_DIR,
  allowedMimeTypes: documentMimeTypes,
  fileSize: 10 * 1024 * 1024,
});

const certificateUploader = createUploader({
  directory: CERTIFICATE_DIR,
  allowedMimeTypes: [...documentMimeTypes, ...photoMimeTypes],
  fileSize: 10 * 1024 * 1024,
});

const handleUploadErrors = (uploader) => (req, res, next) => {
  uploader(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const payload =
        error.code === "LIMIT_FILE_SIZE"
          ? { message: "File exceeds the allowed size limit" }
          : { message: `Upload error: ${error.message}` };
      return res.status(400).json(payload);
    }

    return res
      .status(400)
      .json({ message: error.message || "Invalid file upload" });
  });
};

const uploadPhoto = handleUploadErrors(photoUploader.single("photo"));
const uploadDocument = handleUploadErrors(documentUploader.single("document"));
const uploadMultiple = handleUploadErrors(
  certificateUploader.array("files", 5)
);
const uploadDocuments = handleUploadErrors(
  certificateUploader.array("documents", 10)
);

module.exports = {
  uploadPhoto,
  uploadDocument,
  uploadMultiple,
  uploadDocuments,
};
