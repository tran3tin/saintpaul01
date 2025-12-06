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

// Get all departure records with pagination
const getDepartureRecords = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { page = 1, limit = 10, search = "", sister_id } = req.query;

    const result = await DepartureRecordModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sister_id: sister_id ? parseInt(sister_id) : null,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("getDepartureRecords error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch departure records" });
  }
};

// Get single departure record by ID
const getDepartureRecordById = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { id } = req.params;
    const record = await DepartureRecordModel.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Departure record not found" });
    }

    // Get sister info
    const sister = await SisterModel.findById(record.sister_id);

    return res.status(200).json({
      ...record,
      sister: sister
        ? {
            id: sister.id,
            code: sister.code,
            saint_name: sister.saint_name,
            birth_name: sister.birth_name,
          }
        : null,
    });
  } catch (error) {
    console.error("getDepartureRecordById error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch departure record" });
  }
};

// Delete departure record
const deleteDepartureRecord = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await DepartureRecordModel.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Departure record not found" });
    }

    await DepartureRecordModel.delete(id);
    await logAudit(req, "DELETE", id, existing, null);

    return res.status(200).json({ message: "Departure record deleted" });
  } catch (error) {
    console.error("deleteDepartureRecord error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to delete departure record" });
  }
};

const createDepartureRecord = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    console.log("[createDepartureRecord] body:", req.body);

    const {
      sister_id: sisterId,
      departure_date: departureDate,
      stage_at_departure: stageAtDeparture,
      type,
      expected_return_date: expectedReturnDate,
      return_date: returnDate,
      destination,
      reason,
      contact_phone: contactPhone,
      contact_address: contactAddress,
      approved_by: approvedBy,
      notes,
      support_notes: supportNotes,
      documents,
    } = req.body;

    if (!sisterId || !departureDate) {
      return res.status(400).json({
        message: "sister_id and departure_date are required",
      });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const payload = {
      sister_id: sisterId,
      departure_date: departureDate,
      stage_at_departure:
        stageAtDeparture === undefined ||
        stageAtDeparture === null ||
        stageAtDeparture === ""
          ? null
          : stageAtDeparture,
      type: type || null,
      expected_return_date: expectedReturnDate || null,
      return_date: returnDate || null,
      destination: destination || null,
      reason: reason || null,
      contact_phone: contactPhone || null,
      contact_address: contactAddress || null,
      approved_by: approvedBy || null,
      notes: notes || null,
      support_notes: supportNotes || null,
      documents: documents || null,
    };

    const created = await DepartureRecordModel.create(payload);
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
      "type",
      "expected_return_date",
      "return_date",
      "destination",
      "reason",
      "contact_phone",
      "contact_address",
      "approved_by",
      "notes",
      "support_notes",
      "documents",
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
  getDepartureRecords,
  getDepartureRecordById,
  createDepartureRecord,
  updateDepartureRecord,
  deleteDepartureRecord,
  getDepartureRecordBySister,
  getDepartureStatistics,
};
