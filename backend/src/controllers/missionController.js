const MissionModel = require("../models/MissionModel");
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
    const { field } = req.query;
    const whereClauses = [];
    const params = [];

    if (field) {
      whereClauses.push("m.field = ?");
      params.push(field);
    }

    // Apply data scope filter - missions are related to sisters
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

    const missions = await MissionModel.executeQuery(
      `SELECT m.*, s.saint_name as religious_name, s.birth_name as sister_name
       FROM missions m
       INNER JOIN sisters s ON s.id = m.sister_id
       ${whereClause}
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
    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    // Check scope access for the sister
    const hasAccess = await checkScopeAccess(
      req.userScope,
      sisterId,
      "sisters",
      async (sisterRecord) => sisterRecord.current_community_id
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this sister's missions",
      });
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

const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const missions = await MissionModel.executeQuery(
      `SELECT m.*, 
              s.saint_name AS sister_saint_name,
              s.birth_name AS sister_name,
              s.code AS sister_code,
              s.date_of_birth AS sister_birth_date,
              s.phone AS sister_phone,
              s.email AS sister_email,
              s.photo_url AS sister_avatar,
              c_active.name AS sister_community
       FROM missions m
       INNER JOIN sisters s ON s.id = m.sister_id
       LEFT JOIN (
         SELECT sister_id, community_id
         FROM community_assignments
         WHERE end_date IS NULL OR end_date >= CURDATE()
         ORDER BY start_date DESC
         LIMIT 1
       ) ca ON ca.sister_id = s.id
       LEFT JOIN communities c_active ON ca.community_id = c_active.id
       WHERE m.id = ?`,
      [id]
    );

    if (!missions || missions.length === 0) {
      return res.status(404).json({ message: "Mission not found" });
    }

    return res.status(200).json({ data: missions[0] });
  } catch (error) {
    console.error("getMissionById error:", error.message);
    console.error("getMissionById stack:", error.stack);
    return res.status(500).json({ message: "Failed to fetch mission" });
  }
};

const createMission = async (req, res) => {
  try {
    const {
      sister_id: sisterId,
      field,
      specific_role: specificRole,
      start_date: startDate,
      end_date: endDate,
      notes,
    } = req.body;

    const normalizedEndDate = endDate ? endDate : null;

    if (!sisterId || !field || !startDate) {
      return res
        .status(400)
        .json({ message: "sister_id, field, start_date are required" });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    // Validate date range
    if (
      normalizedEndDate &&
      new Date(normalizedEndDate) < new Date(startDate)
    ) {
      return res
        .status(400)
        .json({ message: "end_date must be after start_date" });
    }

    const payload = {
      sister_id: sisterId,
      field,
      specific_role: specificRole || null,
      start_date: startDate,
      end_date: normalizedEndDate,
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
    const { id } = req.params;
    const existingRows = await MissionModel.executeQuery(
      "SELECT * FROM missions WHERE id = ?",
      [id]
    );
    const mission = existingRows[0];
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    // Check scope access - check if user has access to the sister of this mission
    const sister = await SisterModel.findById(mission.sister_id);
    if (sister) {
      const hasAccess = await checkScopeAccess(
        req.userScope,
        mission.sister_id,
        "sisters",
        async (sisterRecord) => sisterRecord.current_community_id
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this mission",
        });
      }
    }

    const allowedFields = [
      "sister_id",
      "field",
      "specific_role",
      "start_date",
      "end_date",
      "notes",
    ];

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    if (payload.end_date === "") {
      payload.end_date = null;
    }

    if (!Object.keys(payload).length) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update" });
    }

    const startForValidation = payload.start_date ?? mission.start_date;
    const endForValidation = payload.end_date ?? mission.end_date;

    if (startForValidation && endForValidation) {
      if (new Date(endForValidation) < new Date(startForValidation)) {
        return res
          .status(400)
          .json({ message: "end_date must be after start_date" });
      }
    }

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
    const { id } = req.params;
    const existingRows = await MissionModel.executeQuery(
      "SELECT * FROM missions WHERE id = ?",
      [id]
    );
    const mission = existingRows[0];
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    // Check scope access
    const sister = await SisterModel.findById(mission.sister_id);
    if (sister) {
      const hasAccess = await checkScopeAccess(
        req.userScope,
        mission.sister_id,
        "sisters",
        async (sisterRecord) => sisterRecord.current_community_id
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to end this mission",
        });
      }
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
    const { field } = req.params;
    if (!field) {
      return res.status(400).json({ message: "Mission field is required" });
    }

    const whereClauses = [
      "m.field = ?",
      "(m.end_date IS NULL OR m.end_date >= CURDATE())",
    ];
    const params = [field];

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

    const whereClause = `WHERE ${whereClauses.join(" AND ")}`;

    const sisters = await MissionModel.executeQuery(
      `SELECT DISTINCT s.id, s.code, s.religious_name, m.field
       FROM missions m
       INNER JOIN sisters s ON s.id = m.sister_id
       ${whereClause}
       ORDER BY s.religious_name`,
      params
    );

    return res.status(200).json({ data: sisters });
  } catch (error) {
    console.error("getSistersByMissionField error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch mission field data" });
  }
};

const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    const existingRows = await MissionModel.executeQuery(
      "SELECT * FROM missions WHERE id = ?",
      [id]
    );
    const mission = existingRows[0];
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    await MissionModel.delete(id);
    await logAudit(req, "DELETE", id, mission, null);

    return res.status(200).json({ message: "Mission deleted successfully" });
  } catch (error) {
    console.error("deleteMission error:", error.message);
    return res.status(500).json({ message: "Failed to delete mission" });
  }
};

module.exports = {
  getAllMissions,
  getMissionsBySister,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  endMission,
  getSistersByMissionField,
};
