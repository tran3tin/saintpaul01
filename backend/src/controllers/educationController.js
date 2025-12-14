const fs = require("fs");
const path = require("path");
const EducationModel = require("../models/EducationModel");
const SisterModel = require("../models/SisterModel");
const AuditLogModel = require("../models/AuditLogModel");
const { applyScopeFilter, checkScopeAccess } = require("../utils/scopeHelper");

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
  // Permission-based access control - no admin bypass
  // Actual permission checking done by checkPermission middleware in routes
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
    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    // Check scope access
    const hasAccess = await checkScopeAccess(
      req.userScope,
      sisterId,
      "sisters",
      async (sisterRecord) => sisterRecord.current_community_id
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have permission to view this sister's education records",
      });
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

const getEducationById = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await EducationModel.findById(id);
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }

    let sister = null;
    if (education.sister_id) {
      sister = await SisterModel.findById(education.sister_id);
    }

    return res.status(200).json({
      ...education,
      sister_name: sister?.birth_name || null,
      religious_name: sister?.saint_name || null,
      sister_code: sister?.code || null,
    });
  } catch (error) {
    console.error("getEducationById error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch education record" });
  }
};

const addEducation = async (req, res) => {
  try {
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
    const whereClauses = [];
    const params = [];

    // Apply data scope filter
    const { whereClause: scopeWhere, params: scopeParams } = applyScopeFilter(
      req.userScope,
      "s",
      {
        communityIdField: "s.current_community_id",
        useJoin: false,
      }
    );

    if (scopeWhere) {
      whereClauses.push(scopeWhere);
      params.push(...scopeParams);
    }

    const whereClause = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const stats = await EducationModel.executeQuery(
      `SELECT e.level, COUNT(*) AS total
       FROM education e
       INNER JOIN sisters s ON e.sister_id = s.id
       ${whereClause}
       GROUP BY e.level`,
      params
    );

    return res.status(200).json({ data: stats });
  } catch (error) {
    console.error("getStatisticsByLevel error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch education statistics" });
  }
};

const getAllEducation = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100
    );
    const offset = (page - 1) * limit;
    const { search, level, status } = req.query;

    const whereClauses = ["1=1"];
    const params = [];

    if (search) {
      whereClauses.push(
        "(s.birth_name LIKE ? OR s.saint_name LIKE ? OR e.institution LIKE ? OR e.major LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (level) {
      whereClauses.push("e.level = ?");
      params.push(level);
    }

    if (status) {
      whereClauses.push("e.status = ?");
      params.push(status);
    }

    // Apply data scope filter
    const { whereClause: scopeWhere, params: scopeParams } = applyScopeFilter(
      req.userScope,
      "s",
      {
        communityIdField: "s.current_community_id",
        useJoin: false,
      }
    );

    if (scopeWhere) {
      whereClauses.push(scopeWhere);
      params.push(...scopeParams);
    }

    const whereClause = whereClauses.join(" AND ");

    // Get total count
    const countResult = await EducationModel.executeQuery(
      `SELECT COUNT(*) as total FROM education e 
       LEFT JOIN sisters s ON e.sister_id = s.id 
       WHERE ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Get data with pagination
    const items = await EducationModel.executeQuery(
      `SELECT e.*, 
              s.birth_name as sister_name, 
              s.saint_name as religious_name,
              s.code as sister_code
       FROM education e
       LEFT JOIN sisters s ON e.sister_id = s.id
       WHERE ${whereClause}
      ORDER BY e.start_date DESC, e.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("getAllEducation error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch education records" });
  }
};

module.exports = {
  getAllEducation,
  getEducationById,
  getEducationBySister,
  addEducation,
  updateEducation,
  deleteEducation,
  uploadCertificate,
  getStatisticsByLevel,
};
