const fs = require("fs");
const path = require("path");
const EducationModel = require("../models/EducationModel");
const SisterModel = require("../models/SisterModel");
const AuditLogModel = require("../models/AuditLogModel");

const viewerRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
  "viewer",
];
const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

const ensurePermission = (req, res, roles) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  if (!roles.includes(req.user.role)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "education",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Education audit log failed:", error.message);
  }
};

const getEducationBySister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const education = await EducationModel.findBySisterId(sisterId);
    return res
      .status(200)
      .json({ sister: { id: sister.id, code: sister.code }, education });
  } catch (error) {
    console.error("getEducationBySister error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch education records" });
  }
};

const addEducation = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const {
      sister_id: sisterId,
      level,
      major,
      institution,
      start_date: startDate,
      end_date: endDate,
    } = req.body;
    if (!sisterId || !level) {
      return res
        .status(400)
        .json({ message: "sister_id and level are required" });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const payload = {
      sister_id: sisterId,
      level,
      major: major || null,
      institution: institution || null,
      start_date: startDate || null,
      end_date: endDate || null,
      certificate_url: null,
    };

    const created = await EducationModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ education: created });
  } catch (error) {
    console.error("addEducation error:", error.message);
    return res.status(500).json({ message: "Failed to add education record" });
  }
};

const updateEducation = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const { id } = req.params;
    const existing = await EducationModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Education record not found" });
    }

    if (req.body.sister_id) {
      const sister = await SisterModel.findById(req.body.sister_id);
      if (!sister) {
        return res.status(404).json({ message: "Sister not found" });
      }
    }

    const updated = await EducationModel.update(id, req.body);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({ education: updated });
  } catch (error) {
    console.error("updateEducation error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to update education record" });
  }
};

const removeCertificateFile = (certificateUrl) => {
  if (!certificateUrl) return;

  try {
    const uploadsRoot = path.resolve(__dirname, "../uploads");
    const relative = certificateUrl.replace("/uploads/", "");
    const filePath = path.join(uploadsRoot, relative);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Failed to remove certificate file:", error.message);
  }
};

const deleteEducation = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const { id } = req.params;
    const existing = await EducationModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Education record not found" });
    }

    removeCertificateFile(existing.certificate_url);
    const deleted = await EducationModel.delete(id);
    if (!deleted) {
      return res
        .status(500)
        .json({ message: "Failed to delete education record" });
    }

    await logAudit(req, "DELETE", id, existing, null);
    return res
      .status(200)
      .json({ message: "Education record deleted successfully" });
  } catch (error) {
    console.error("deleteEducation error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to delete education record" });
  }
};

const uploadCertificate = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const { id } = req.params;
    const education = await EducationModel.findById(id);
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    removeCertificateFile(education.certificate_url);

    const uploadsRoot = path.resolve(__dirname, "../uploads");
    const relative = path
      .relative(uploadsRoot, req.file.path)
      .replace(/\\/g, "/");
    const fileUrl = `/uploads/${relative}`;

    const updated = await EducationModel.update(id, {
      certificate_url: fileUrl,
    });
    await logAudit(req, "UPDATE", id, education, updated);

    return res.status(200).json({ certificateUrl: fileUrl });
  } catch (error) {
    console.error("uploadCertificate error:", error.message);
    return res.status(500).json({ message: "Failed to upload certificate" });
  }
};

const getStatisticsByLevel = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const stats = await EducationModel.executeQuery(
      `SELECT level, COUNT(*) AS total
       FROM education
       GROUP BY level`
    );

    return res.status(200).json({ data: stats });
  } catch (error) {
    console.error("getStatisticsByLevel error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch education statistics" });
  }
};

module.exports = {
  getEducationBySister,
  addEducation,
  updateEducation,
  deleteEducation,
  uploadCertificate,
  getStatisticsByLevel,
};
