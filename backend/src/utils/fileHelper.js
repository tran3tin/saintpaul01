const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const deleteFile = async (filePath) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }
};

const generateUniqueFileName = (originalName = "") => {
  const ext = path.extname(originalName) || "";
  const baseName = path
    .basename(originalName, ext)
    .replace(/\s+/g, "-")
    .toLowerCase();
  const uniqueToken = crypto.randomBytes(8).toString("hex");
  const safeBase = baseName || "file";

  return `${safeBase}-${Date.now()}-${uniqueToken}${ext}`;
};

const getFileExtension = (fileName = "") =>
  path.extname(fileName).toLowerCase();

const isValidFileType = (fileName, allowedTypes = []) => {
  if (!allowedTypes.length) {
    return true;
  }

  const fileExt = getFileExtension(fileName);
  if (!fileExt) {
    return false;
  }

  const normalized = allowedTypes.map((type) =>
    type.startsWith(".") ? type.toLowerCase() : `.${type.toLowerCase()}`
  );
  return normalized.includes(fileExt);
};

const getFileSize = async (filePath) => {
  if (!filePath) {
    throw new Error("File path is required");
  }

  const stats = await fs.promises.stat(filePath);
  return stats.size;
};

module.exports = {
  deleteFile,
  generateUniqueFileName,
  getFileExtension,
  isValidFileType,
  getFileSize,
};
