const HealthRecordModel = require("../models/HealthRecordModel");
const SisterModel = require("../models/SisterModel");
const AuditLogModel = require("../models/AuditLogModel");
const { applyScopeFilter, checkScopeAccess } = require("../utils/scopeHelper");
const { logSensitiveAccess } = require("../middlewares/auditLog");

const privilegedRoles = ["admin", "superior_general", "superior_provincial"];
const extendedViewRoles = [...privilegedRoles, "secretary"];
const generalHealthRoles = [...extendedViewRoles, "superior_community"];

const hasDelegatedPermission = (user, permission) =>
  !!(
    user &&
    Array.isArray(user.permissions) &&
    user.permissions.includes(permission)
  );

const ensurePermission = (
  req,
  res,
  roles,
  { allowDelegate = false, permission = "" } = {}
) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (roles.includes(req.user.role)) {
    return true;
  }

  if (
    allowDelegate &&
    permission &&
    hasDelegatedPermission(req.user, permission)
  ) {
    return true;
  }

  res.status(403).json({ message: "Forbidden" });
  return false;
};

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "health_records",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Health record audit log failed:", error.message);
  }
};

const logSensitiveRead = async (req, sisterId) => {
  await logAudit(req, "READ_SENSITIVE", sisterId, null, null);
};

const validateSister = async (sisterId) => SisterModel.findById(sisterId);

const getHealthRecordBySister = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, extendedViewRoles, {
        allowDelegate: true,
        permission: "HEALTH_READ",
      })
    ) {
      return;
    }

    const { sisterId } = req.params;
    const sister = await validateSister(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const records = await HealthRecordModel.findBySisterId(sisterId);
    await logSensitiveRead(req, sisterId);

    return res.status(200).json({
      sister: {
        id: sister.id,
        code: sister.code,
        religious_name: sister.religious_name,
      },
      records,
    });
  } catch (error) {
    console.error("getHealthRecordBySister error:", error.message);
    return res.status(500).json({ message: "Failed to fetch health records" });
  }
};

const addHealthRecord = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, privilegedRoles, {
        allowDelegate: true,
        permission: "HEALTH_WRITE",
      })
    ) {
      return;
    }

    const { sister_id: sisterId, general_health: generalHealth } = req.body;
    if (!sisterId || !generalHealth) {
      return res
        .status(400)
        .json({ message: "sister_id and general_health are required" });
    }

    const sister = await validateSister(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const payload = {
      sister_id: sisterId,
      general_health: generalHealth,
      chronic_diseases: req.body.chronic_diseases || null,
      work_limitations: req.body.work_limitations || null,
      checkup_date: req.body.checkup_date || null,
      checkup_place: req.body.checkup_place || null,
      diagnosis: req.body.diagnosis || null,
      treatment: req.body.treatment || null,
      notes: req.body.notes || null,
      doctor: req.body.doctor || null,
      blood_pressure: req.body.blood_pressure || null,
      heart_rate: req.body.heart_rate || null,
      weight: req.body.weight || null,
      height: req.body.height || null,
      next_checkup_date:
        req.body.next_check_date || req.body.next_checkup_date || null,
      documents: req.body.documents || null,
    };

    const created = await HealthRecordModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ record: created });
  } catch (error) {
    console.error("addHealthRecord error:", error.message);
    console.error("addHealthRecord error stack:", error.stack);
    return res.status(500).json({ message: "Failed to create health record" });
  }
};

const updateHealthRecord = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, privilegedRoles, {
        allowDelegate: true,
        permission: "HEALTH_WRITE",
      })
    ) {
      return;
    }

    const { id } = req.params;
    const existing = await HealthRecordModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Health record not found" });
    }

    if (req.body.sister_id) {
      const sister = await validateSister(req.body.sister_id);
      if (!sister) {
        return res.status(404).json({ message: "Sister not found" });
      }
    }

    const updated = await HealthRecordModel.update(id, req.body);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({ record: updated });
  } catch (error) {
    console.error("updateHealthRecord error:", error.message);
    return res.status(500).json({ message: "Failed to update health record" });
  }
};

const getGeneralHealthStatus = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, generalHealthRoles, {
        allowDelegate: true,
        permission: "HEALTH_SUMMARY",
      })
    ) {
      return;
    }

    const { sisterId } = req.params;
    const sister = await validateSister(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const latest = await HealthRecordModel.getLatestRecord(sisterId);
    if (!latest) {
      return res.status(404).json({ message: "No health records found" });
    }

    return res.status(200).json({
      sister: {
        id: sister.id,
        code: sister.code,
        religious_name: sister.religious_name,
      },
      summary: {
        general_health: latest.general_health,
        work_limitations: latest.work_limitations,
      },
    });
  } catch (error) {
    console.error("getGeneralHealthStatus error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch general health status" });
  }
};

const healthRecordAccessLogger = logSensitiveAccess({
  tableName: "health_records",
  getRecordId: (req) => req.params.sisterId || null,
});

const getAllHealthRecords = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, extendedViewRoles, {
        allowDelegate: true,
        permission: "HEALTH_READ",
      })
    ) {
      return;
    }

    const {
      page = 1,
      limit = 12,
      search = "",
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await HealthRecordModel.findAllWithSister({
      limit: parseInt(limit),
      offset,
      search,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getAllHealthRecords error:", error.message);
    console.error("getAllHealthRecords error stack:", error.stack);
    return res.status(500).json({ message: "Failed to fetch health records" });
  }
};

const getHealthRecordById = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, extendedViewRoles, {
        allowDelegate: true,
        permission: "HEALTH_READ",
      })
    ) {
      return;
    }

    const { id } = req.params;

    // Join with sisters table to get full sister info
    const sql = `
      SELECT 
        hr.*,
        s.code as sister_code,
        s.saint_name as sister_saint_name,
        s.birth_name as sister_birth_name
      FROM health_records hr
      LEFT JOIN sisters s ON hr.sister_id = s.id
      WHERE hr.id = ?
    `;
    const records = await HealthRecordModel.executeQuery(sql, [id]);
    const record = records[0];

    if (!record) {
      return res.status(404).json({ message: "Health record not found" });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("getHealthRecordById error:", error.message);
    return res.status(500).json({ message: "Failed to fetch health record" });
  }
};

const deleteHealthRecord = async (req, res) => {
  try {
    if (
      !ensurePermission(req, res, privilegedRoles, {
        allowDelegate: true,
        permission: "HEALTH_WRITE",
      })
    ) {
      return;
    }

    const { id } = req.params;
    const existing = await HealthRecordModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Health record not found" });
    }

    await HealthRecordModel.delete(id);
    await logAudit(req, "DELETE", id, existing, null);

    return res.status(200).json({
      success: true,
      message: "Health record deleted successfully",
    });
  } catch (error) {
    console.error("deleteHealthRecord error:", error.message);
    return res.status(500).json({ message: "Failed to delete health record" });
  }
};

module.exports = {
  getAllHealthRecords,
  getHealthRecordById,
  getHealthRecordBySister,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getGeneralHealthStatus,
  healthRecordAccessLogger,
};
