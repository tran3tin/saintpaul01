const DepartureRecordModel = require("../models/DepartureRecordModel");
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

const LEFT_STATUS = "left";

const ensurePermission = (req, res, allowedRoles) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (!allowedRoles.includes(req.user.role)) {
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
      table_name: "departure_records",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Departure audit log failed:", error.message);
  }
};

const createDepartureRecord = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const {
      sister_id: sisterId,
      departure_date: departureDate,
      stage_at_departure: stageAtDeparture,
      reason,
      support_notes: supportNotes,
    } = req.body;

    if (!sisterId || !departureDate || !stageAtDeparture) {
      return res.status(400).json({
        message: "sister_id, departure_date, stage_at_departure are required",
      });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const existing = await DepartureRecordModel.findBySisterId(sisterId);
    if (existing && existing.length) {
      return res
        .status(409)
        .json({ message: "Departure record already exists for this sister" });
    }

    const payload = {
      sister_id: sisterId,
      departure_date: departureDate,
      stage_at_departure: stageAtDeparture,
      reason: reason || null,
      support_notes: supportNotes || null,
    };

    const created = await DepartureRecordModel.create(payload);
    await SisterModel.update(sisterId, { status: LEFT_STATUS });
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ departure: created });
  } catch (error) {
    console.error("createDepartureRecord error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to create departure record" });
  }
};

const updateDepartureRecord = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await DepartureRecordModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Departure record not found" });
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "sister_id") &&
      `${req.body.sister_id}` !== `${existing.sister_id}`
    ) {
      return res
        .status(400)
        .json({ message: "Cannot change sister for departure record" });
    }

    const mutableFields = [
      "departure_date",
      "stage_at_departure",
      "reason",
      "support_notes",
    ];
    const payload = {};

    mutableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        payload[field] = req.body[field];
      }
    });

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const updated = await DepartureRecordModel.update(id, payload);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({ departure: updated });
  } catch (error) {
    console.error("updateDepartureRecord error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to update departure record" });
  }
};

const getDepartureRecordBySister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const records = await DepartureRecordModel.findBySisterId(sisterId);

    return res.status(200).json({
      sister: {
        id: sister.id,
        code: sister.code,
        religious_name: sister.religious_name,
        status: sister.status,
      },
      departures: records,
    });
  } catch (error) {
    console.error("getDepartureRecordBySister error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch departure records" });
  }
};

const getDepartureStatistics = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const [byStage, byYear, totalRows] = await Promise.all([
      DepartureRecordModel.executeQuery(
        `SELECT stage_at_departure AS stage, COUNT(*) AS total
         FROM departure_records
         GROUP BY stage_at_departure
         ORDER BY total DESC`
      ),
      DepartureRecordModel.executeQuery(
        `SELECT YEAR(departure_date) AS year, COUNT(*) AS total
         FROM departure_records
         GROUP BY YEAR(departure_date)
         ORDER BY year DESC`
      ),
      DepartureRecordModel.executeQuery(
        `SELECT COUNT(*) AS total FROM departure_records`
      ),
    ]);

    const total = totalRows[0] ? totalRows[0].total : 0;

    return res.status(200).json({
      total,
      byStage,
      byYear,
    });
  } catch (error) {
    console.error("getDepartureStatistics error:", error.message);
    return res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

module.exports = {
  createDepartureRecord,
  updateDepartureRecord,
  getDepartureRecordBySister,
  getDepartureStatistics,
};
