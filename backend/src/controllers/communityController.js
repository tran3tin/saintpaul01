const CommunityModel = require("../models/CommunityModel");
const CommunityAssignmentModel = require("../models/CommunityAssignmentModel");
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
      table_name: "communities",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Community audit log failed:", error.message);
  }
};

const getPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getAllCommunities = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { page, limit, offset } = getPagination(req);
    const { type } = req.query;

    let whereClause = "";
    const params = [];

    if (type) {
      whereClause = "WHERE type = ?";
      params.push(type);
    }

    const totalRows = await CommunityModel.executeQuery(
      `SELECT COUNT(*) AS total FROM communities ${whereClause}`,
      params
    );
    const total = totalRows[0] ? totalRows[0].total : 0;

    const data = await CommunityModel.executeQuery(
      `SELECT * FROM communities ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("getAllCommunities error:", error.message);
    return res.status(500).json({ message: "Failed to fetch communities" });
  }
};

const getCommunityById = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { id } = req.params;
    const community = await CommunityModel.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const members = await CommunityModel.getMembersList(id);

    return res.status(200).json({
      community,
      members,
    });
  } catch (error) {
    console.error("getCommunityById error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch community detail" });
  }
};

const createCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const payload = req.body;
    const created = await CommunityModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ community: created });
  } catch (error) {
    console.error("createCommunity error:", error.message);
    return res.status(500).json({ message: "Failed to create community" });
  }
};

const updateCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await CommunityModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Community not found" });
    }

    const updated = await CommunityModel.update(id, req.body);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({ community: updated });
  } catch (error) {
    console.error("updateCommunity error:", error.message);
    return res.status(500).json({ message: "Failed to update community" });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await CommunityModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Community not found" });
    }

    const memberCountRows = await CommunityAssignmentModel.executeQuery(
      `SELECT COUNT(*) AS total FROM community_assignments WHERE community_id = ? AND (end_date IS NULL OR end_date >= CURDATE())`,
      [id]
    );
    const memberCount = memberCountRows[0] ? memberCountRows[0].total : 0;
    if (memberCount > 0) {
      return res
        .status(400)
        .json({
          message: "Cannot delete community while members are assigned",
        });
    }

    const deleted = await CommunityModel.delete(id);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete community" });
    }

    await logAudit(req, "DELETE", id, existing, null);
    return res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("deleteCommunity error:", error.message);
    return res.status(500).json({ message: "Failed to delete community" });
  }
};

const getCommunityMembers = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { id } = req.params;
    const community = await CommunityModel.findById(id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const members = await CommunityModel.getMembersList(id);
    return res.status(200).json({ members });
  } catch (error) {
    console.error("getCommunityMembers error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch community members" });
  }
};

module.exports = {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
};
