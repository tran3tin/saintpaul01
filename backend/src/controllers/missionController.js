const MissionModel = require("../models/MissionModel");
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
      table_name: "missions",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Mission audit log failed:", error.message);
  }
};

const getAllMissions = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { field } = req.query;
    const filterClause = field ? "WHERE field = ?" : "";
    const params = field ? [field] : [];

    const missions = await MissionModel.executeQuery(
      `SELECT m.*, s.religious_name
       FROM missions m
       INNER JOIN sisters s ON s.id = m.sister_id
       ${filterClause}
       ORDER BY m.start_date DESC`,
      params
    );

    return res.status(200).json({ data: missions });
  } catch (error) {
    console.error("getAllMissions error:", error.message);
    return res.status(500).json({ message: "Failed to fetch missions" });
  }
};

const getMissionsBySister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const missions = await MissionModel.findBySisterId(sisterId);
    return res
      .status(200)
      .json({ sister: { id: sister.id, code: sister.code }, missions });
  } catch (error) {
    console.error("getMissionsBySister error:", error.message);
    return res.status(500).json({ message: "Failed to fetch missions" });
  }
};

const createMission = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const {
      sister_id: sisterId,
      field,
      specific_role: specificRole,
      start_date: startDate,
      end_date: endDate,
      notes,
    } = req.body;

    if (!sisterId || !field || !startDate) {
      return res
        .status(400)
        .json({ message: "sister_id, field, start_date are required" });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const payload = {
      sister_id: sisterId,
      field,
      specific_role: specificRole || null,
      start_date: startDate,
      end_date: endDate || null,
      notes: notes || null,
    };

    const created = await MissionModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ mission: created });
  } catch (error) {
    console.error("createMission error:", error.message);
    return res.status(500).json({ message: "Failed to create mission" });
  }
};

const updateMission = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existingRows = await MissionModel.executeQuery(
      "SELECT * FROM missions WHERE id = ?",
      [id]
    );
    const mission = existingRows[0];
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    const payload = { ...req.body };

    if (payload.sister_id) {
      const sister = await SisterModel.findById(payload.sister_id);
      if (!sister) {
        return res.status(404).json({ message: "Sister not found" });
      }
    }

    const updated = await MissionModel.update(id, payload);
    await logAudit(req, "UPDATE", id, mission, updated);

    return res.status(200).json({ mission: updated });
  } catch (error) {
    console.error("updateMission error:", error.message);
    return res.status(500).json({ message: "Failed to update mission" });
  }
};

const endMission = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existingRows = await MissionModel.executeQuery(
      "SELECT * FROM missions WHERE id = ?",
      [id]
    );
    const mission = existingRows[0];
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    const { end_date: endDate } = req.body;
    const finalDate = endDate || new Date().toISOString().split("T")[0];

    const updated = await MissionModel.update(id, { end_date: finalDate });
    await logAudit(req, "UPDATE", id, mission, updated);

    return res.status(200).json({ mission: updated });
  } catch (error) {
    console.error("endMission error:", error.message);
    return res.status(500).json({ message: "Failed to end mission" });
  }
};

const getSistersByMissionField = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { field } = req.params;
    if (!field) {
      return res.status(400).json({ message: "Mission field is required" });
    }

    const sisters = await MissionModel.executeQuery(
      `SELECT DISTINCT s.id, s.code, s.religious_name, m.field
       FROM missions m
       INNER JOIN sisters s ON s.id = m.sister_id
       WHERE m.field = ? AND (m.end_date IS NULL OR m.end_date >= CURDATE())
       ORDER BY s.religious_name`,
      [field]
    );

    return res.status(200).json({ data: sisters });
  } catch (error) {
    console.error("getSistersByMissionField error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch mission field data" });
  }
};

module.exports = {
  getAllMissions,
  getMissionsBySister,
  createMission,
  updateMission,
  endMission,
  getSistersByMissionField,
};
