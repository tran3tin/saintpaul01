const VocationJourneyModel = require("../models/VocationJourneyModel");
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
      table_name: "vocation_journey",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

const parseDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateOnly = (date) => date.toISOString().split("T")[0];

// Get all journeys with pagination
const getAllJourneys = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Build query with filters
    let whereClause = "1=1";
    const params = [];

    if (req.query.sister_id) {
      whereClause += " AND vj.sister_id = ?";
      params.push(parseInt(req.query.sister_id, 10));
    }

    if (req.query.stage) {
      whereClause += " AND vj.stage = ?";
      params.push(req.query.stage);
    }

    // Search by sister name, location, etc.
    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      whereClause +=
        " AND (s.birth_name LIKE ? OR s.saint_name LIKE ? OR s.code LIKE ? OR vj.location LIKE ?)";
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Build ORDER BY clause
    let orderByClause = "vj.start_date DESC"; // default
    const sortBy = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    if (sortBy) {
      // Map frontend column keys to database columns
      const sortMapping = {
        sister_name: "s.saint_name",
        stage: "vj.stage",
        start_date: "vj.start_date",
        end_date: "vj.end_date",
        location: "vj.location",
        superior: "vj.superior",
      };

      if (sortMapping[sortBy]) {
        orderByClause = `${sortMapping[sortBy]} ${sortOrder}`;
      }
    }

    // Check if journey_stages table exists first (for count query)
    let hasJourneyStagesTable = false;
    try {
      await VocationJourneyModel.executeQuery(
        "SELECT 1 FROM journey_stages LIMIT 1"
      );
      hasJourneyStagesTable = true;
    } catch (e) {
      // Table doesn't exist
    }

    // Get total count - need to join sisters for search to work
    const countSql = `
      SELECT COUNT(*) as total 
      FROM vocation_journey vj 
      LEFT JOIN sisters s ON vj.sister_id = s.id
      WHERE ${whereClause}
    `;
    const countResult = await VocationJourneyModel.executeQuery(countSql, [
      ...params,
    ]);
    const total = countResult[0].total;

    // Get data with sister info and stage info
    let sql;
    if (hasJourneyStagesTable) {
      sql = `
        SELECT vj.*, 
               s.birth_name, 
               s.saint_name, 
               s.code as sister_code,
               js.name as stage_name,
               js.color as stage_color
        FROM vocation_journey vj
        LEFT JOIN sisters s ON vj.sister_id = s.id
        LEFT JOIN journey_stages js ON vj.stage COLLATE utf8mb4_unicode_ci = js.code COLLATE utf8mb4_unicode_ci
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT ? OFFSET ?
      `;
    } else {
      sql = `
        SELECT vj.*, 
               s.birth_name, 
               s.saint_name, 
               s.code as sister_code,
               vj.stage as stage_name,
               '#6c757d' as stage_color
        FROM vocation_journey vj
        LEFT JOIN sisters s ON vj.sister_id = s.id
        WHERE ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT ? OFFSET ?
      `;
    }

    params.push(limit, offset);
    const data = await VocationJourneyModel.executeQuery(sql, params);

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllJourneys error:", error.message);
    return res.status(500).json({ message: "Failed to fetch journeys" });
  }
};

// Get journey by ID
const getJourneyById = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ message: "Invalid journey id" });
    }

    // Check if journey_stages table exists
    let hasJourneyStagesTable = false;
    try {
      await VocationJourneyModel.executeQuery(
        "SELECT 1 FROM journey_stages LIMIT 1"
      );
      hasJourneyStagesTable = true;
    } catch (e) {
      // Table doesn't exist
    }

    let sql;
    if (hasJourneyStagesTable) {
      sql = `
        SELECT vj.*, 
               s.id as sister_id,
               s.birth_name as sister_name, 
               s.saint_name as sister_religious_name,
               s.code as sister_code,
               s.date_of_birth as sister_birth_date,
               s.phone as sister_phone,
               s.email as sister_email,
               s.photo_url as sister_avatar,
               c.name as sister_community,
               js.name as stage_name,
               js.color as stage_color
        FROM vocation_journey vj
        LEFT JOIN sisters s ON vj.sister_id = s.id
        LEFT JOIN communities c ON s.current_community_id = c.id
        LEFT JOIN journey_stages js ON vj.stage COLLATE utf8mb4_unicode_ci = js.code COLLATE utf8mb4_unicode_ci
        WHERE vj.id = ?
      `;
    } else {
      sql = `
        SELECT vj.*, 
               s.id as sister_id,
               s.birth_name as sister_name, 
               s.saint_name as sister_religious_name,
               s.code as sister_code,
               s.date_of_birth as sister_birth_date,
               s.phone as sister_phone,
               s.email as sister_email,
               s.photo_url as sister_avatar,
               c.name as sister_community,
               vj.stage as stage_name,
               '#6c757d' as stage_color
        FROM vocation_journey vj
        LEFT JOIN sisters s ON vj.sister_id = s.id
        LEFT JOIN communities c ON s.current_community_id = c.id
        WHERE vj.id = ?
      `;
    }

    const rows = await VocationJourneyModel.executeQuery(sql, [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Journey not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("getJourneyById error:", error.message);
    return res.status(500).json({ message: "Failed to fetch journey" });
  }
};

// Create new journey with sister_id in body
const createJourney = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const {
      sister_id: sisterId,
      stage,
      start_date: startDate,
      end_date: endDate,
      location,
      superior,
      formation_director: formationDirector,
      notes,
      community_id: communityId,
      supervisor_id: supervisorId,
    } = req.body;

    // Validate required fields
    if (!sisterId) {
      return res.status(400).json({ message: "sister_id is required" });
    }
    if (!stage) {
      return res.status(400).json({ message: "stage is required" });
    }
    if (!startDate) {
      return res.status(400).json({ message: "start_date is required" });
    }

    // Verify sister exists
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const startDateObj = parseDateOnly(startDate);
    if (!startDateObj) {
      return res
        .status(400)
        .json({ message: "start_date must be a valid date" });
    }

    let endDateFormatted = null;
    if (endDate) {
      const endDateObj = parseDateOnly(endDate);
      if (!endDateObj) {
        return res
          .status(400)
          .json({ message: "end_date must be a valid date" });
      }
      if (endDateObj < startDateObj) {
        return res
          .status(400)
          .json({ message: "end_date must be after start_date" });
      }
      endDateFormatted = formatDateOnly(endDateObj);
    }

    const payload = {
      sister_id: sisterId,
      stage,
      start_date: formatDateOnly(startDateObj),
      end_date: endDateFormatted,
      location: location || null,
      superior: superior || null,
      formation_director: formationDirector || null,
      community_id: communityId || null,
      supervisor_id: supervisorId || null,
      notes: notes || null,
    };

    const createdJourney = await VocationJourneyModel.create(payload);
    await logAudit(req, "CREATE", createdJourney.id, null, createdJourney);

    // Return with additional info
    const sql = `
      SELECT vj.*, 
             s.birth_name, 
             s.saint_name, 
             s.code as sister_code
      FROM vocation_journey vj
      LEFT JOIN sisters s ON vj.sister_id = s.id
      WHERE vj.id = ?
    `;
    const rows = await VocationJourneyModel.executeQuery(sql, [
      createdJourney.id,
    ]);

    return res.status(201).json({
      success: true,
      data: rows[0] || createdJourney,
    });
  } catch (error) {
    console.error("createJourney error:", error.message);
    return res.status(500).json({ message: "Failed to create journey" });
  }
};

const getJourneyBySister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const sisterId = parseInt(req.params.sisterId, 10);
    if (!sisterId) {
      return res.status(400).json({ message: "Invalid sister id" });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const timeline = await VocationJourneyModel.findBySisterId(sisterId);
    return res.status(200).json({
      sister: {
        id: sister.id,
        code: sister.code,
        religious_name: sister.religious_name,
      },
      timeline,
    });
  } catch (error) {
    console.error("getJourneyBySister error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch vocation journey" });
  }
};

const addJourneyStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const sisterId = parseInt(req.params.sisterId, 10);
    if (!sisterId) {
      return res.status(400).json({ message: "Invalid sister id" });
    }

    const {
      stage,
      start_date: startDate,
      community_id: communityId,
      supervisor_id: supervisorId,
      notes,
    } = req.body;
    if (!stage || !startDate) {
      return res
        .status(400)
        .json({ message: "stage and start_date are required" });
    }

    const startDateObj = parseDateOnly(startDate);
    if (!startDateObj) {
      return res
        .status(400)
        .json({ message: "start_date must be a valid date" });
    }

    const journey = await VocationJourneyModel.findBySisterId(sisterId);
    const lastStage = journey[journey.length - 1];

    if (lastStage) {
      const lastStart = parseDateOnly(lastStage.start_date);
      if (lastStart && startDateObj <= lastStart) {
        return res
          .status(400)
          .json({ message: "New stage must start after the previous stage" });
      }

      const previousEnd = new Date(startDateObj);
      previousEnd.setDate(previousEnd.getDate() - 1);
      const endDateToSet = formatDateOnly(previousEnd);
      await VocationJourneyModel.update(lastStage.id, {
        end_date: endDateToSet,
      });
    }

    const payload = {
      sister_id: sisterId,
      stage,
      start_date: formatDateOnly(startDateObj),
      community_id: communityId || null,
      supervisor_id: supervisorId || null,
      notes: notes || null,
    };

    const createdStage = await VocationJourneyModel.create(payload);
    await logAudit(req, "CREATE", createdStage.id, null, createdStage);

    return res.status(201).json({ stage: createdStage });
  } catch (error) {
    console.error("addJourneyStage error:", error.message);
    return res.status(500).json({ message: "Failed to add journey stage" });
  }
};

const updateJourneyStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const stageId = parseInt(req.params.stageId, 10);
    if (!stageId) {
      return res.status(400).json({ message: "Invalid stage id" });
    }

    const existingRows = await VocationJourneyModel.executeQuery(
      "SELECT * FROM vocation_journey WHERE id = ?",
      [stageId]
    );
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: "Stage not found" });
    }

    const payload = { ...req.body };
    if (payload.start_date) {
      const parsed = parseDateOnly(payload.start_date);
      if (!parsed) {
        return res
          .status(400)
          .json({ message: "start_date must be a valid date" });
      }
      payload.start_date = formatDateOnly(parsed);
    }
    if (payload.end_date) {
      const parsedEnd = parseDateOnly(payload.end_date);
      if (!parsedEnd) {
        return res
          .status(400)
          .json({ message: "end_date must be a valid date" });
      }
      payload.end_date = formatDateOnly(parsedEnd);
    }

    const updated = await VocationJourneyModel.update(stageId, payload);
    await logAudit(req, "UPDATE", stageId, existing, updated);

    return res.status(200).json({ stage: updated });
  } catch (error) {
    console.error("updateJourneyStage error:", error.message);
    return res.status(500).json({ message: "Failed to update journey stage" });
  }
};

const deleteJourneyStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const stageId = parseInt(req.params.stageId, 10);
    if (!stageId) {
      return res.status(400).json({ message: "Invalid stage id" });
    }

    const rows = await VocationJourneyModel.executeQuery(
      "SELECT * FROM vocation_journey WHERE id = ?",
      [stageId]
    );
    const stage = rows[0];
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    const journey = await VocationJourneyModel.findBySisterId(stage.sister_id);
    const stageIndex = journey.findIndex((item) => item.id === stageId);
    const previousStage = stageIndex > 0 ? journey[stageIndex - 1] : null;
    const nextStage =
      stageIndex >= 0 && stageIndex < journey.length - 1
        ? journey[stageIndex + 1]
        : null;

    const deleted = await VocationJourneyModel.delete(stageId);
    if (!deleted) {
      return res
        .status(500)
        .json({ message: "Failed to delete journey stage" });
    }

    if (previousStage && nextStage) {
      // Bridge the gap by setting previous end_date to the day before next stage start
      const nextStart = parseDateOnly(nextStage.start_date);
      if (nextStart) {
        const bridgeDate = new Date(nextStart);
        bridgeDate.setDate(bridgeDate.getDate() - 1);
        await VocationJourneyModel.update(previousStage.id, {
          end_date: formatDateOnly(bridgeDate),
        });
      }
    } else if (previousStage && !nextStage) {
      await VocationJourneyModel.update(previousStage.id, { end_date: null });
    }

    await logAudit(req, "DELETE", stageId, stage, null);
    return res
      .status(200)
      .json({ message: "Journey stage deleted successfully" });
  } catch (error) {
    console.error("deleteJourneyStage error:", error.message);
    return res.status(500).json({ message: "Failed to delete journey stage" });
  }
};

const getCurrentStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const sisterId = parseInt(req.params.sisterId, 10);
    if (!sisterId) {
      return res.status(400).json({ message: "Invalid sister id" });
    }

    const stage = await VocationJourneyModel.getCurrentStage(sisterId);
    if (!stage) {
      return res.status(404).json({ message: "No active stage found" });
    }

    return res.status(200).json({ stage });
  } catch (error) {
    console.error("getCurrentStage error:", error.message);
    return res.status(500).json({ message: "Failed to fetch current stage" });
  }
};

const getStatisticsByStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const stats = await VocationJourneyModel.executeQuery(
      `SELECT stage, COUNT(*) AS total
       FROM (
         SELECT sister_id, stage
         FROM vocation_journey
         WHERE end_date IS NULL OR end_date >= CURDATE()
       ) AS current_stages
       GROUP BY stage`
    );

    return res.status(200).json({ data: stats });
  } catch (error) {
    console.error("getStatisticsByStage error:", error.message);
    return res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

module.exports = {
  getAllJourneys,
  getJourneyById,
  createJourney,
  getJourneyBySister,
  addJourneyStage,
  updateJourneyStage,
  deleteJourneyStage,
  getCurrentStage,
  getStatisticsByStage,
};
