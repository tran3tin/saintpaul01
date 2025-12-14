const path = require("path");
const fs = require("fs");
const CommunityAssignmentModel = require("../models/CommunityAssignmentModel");
const CommunityModel = require("../models/CommunityModel");
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

  // Permission-based access control - no admin bypass
  // Actual permission checking done by checkPermission middleware in routes
  return true;
};

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "community_assignments",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Assignment audit log failed:", error.message);
  }
};

const ensureEntitiesExist = async (sisterId, communityId) => {
  const [sister, community] = await Promise.all([
    SisterModel.findById(sisterId),
    CommunityModel.findById(communityId),
  ]);

  if (!sister) {
    return { error: "Sister not found" };
  }
  if (!community) {
    return { error: "Community not found" };
  }

  return { sister, community };
};

const assignSisterToCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const {
      sister_id: sisterId,
      community_id: communityId,
      role,
      start_date: startDate,
      end_date: endDate,
      decision_number: decisionNumber,
      decision_date: decisionDate,
      decision_file_url: decisionFileUrl,
      notes,
    } = req.body;

    if (!sisterId || !communityId || !role || !startDate) {
      return res.status(400).json({
        message: "sister_id, community_id, role, start_date are required",
      });
    }

    const validation = await ensureEntitiesExist(sisterId, communityId);
    if (validation.error) {
      return res.status(404).json({ message: validation.error });
    }

    const currentAssignment =
      await CommunityAssignmentModel.getCurrentAssignment(sisterId);
    if (currentAssignment) {
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() - 1);
      await CommunityAssignmentModel.update(currentAssignment.id, {
        end_date: newEndDate.toISOString().split("T")[0],
      });
    }

    const payload = {
      sister_id: sisterId,
      community_id: communityId,
      role,
      start_date: startDate,
      end_date: endDate || null,
      decision_number: decisionNumber || null,
      decision_date: decisionDate || null,
      decision_file_url: decisionFileUrl || null,
      notes: notes || null,
    };

    const created = await CommunityAssignmentModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ assignment: created });
  } catch (error) {
    console.error("assignSisterToCommunity error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to assign sister to community" });
  }
};

const updateAssignment = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existing = await CommunityAssignmentModel.executeQuery(
      "SELECT * FROM community_assignments WHERE id = ?",
      [id]
    );
    const assignment = existing[0];
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const payload = { ...req.body };

    if (payload.community_id || payload.sister_id) {
      const targetSisterId = payload.sister_id || assignment.sister_id;
      const targetCommunityId = payload.community_id || assignment.community_id;
      const validation = await ensureEntitiesExist(
        targetSisterId,
        targetCommunityId
      );
      if (validation.error) {
        return res.status(404).json({ message: validation.error });
      }
    }

    const updated = await CommunityAssignmentModel.update(id, payload);
    await logAudit(req, "UPDATE", id, assignment, updated);

    return res.status(200).json({ assignment: updated });
  } catch (error) {
    console.error("updateAssignment error:", error.message);
    return res.status(500).json({ message: "Failed to update assignment" });
  }
};

const endAssignment = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existingRows = await CommunityAssignmentModel.executeQuery(
      "SELECT * FROM community_assignments WHERE id = ?",
      [id]
    );
    const assignment = existingRows[0];
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { end_date: endDate } = req.body;
    const finalDate = endDate || new Date().toISOString().split("T")[0];

    const updated = await CommunityAssignmentModel.update(id, {
      end_date: finalDate,
    });
    await logAudit(req, "UPDATE", id, assignment, updated);

    return res.status(200).json({ assignment: updated });
  } catch (error) {
    console.error("endAssignment error:", error.message);
    return res.status(500).json({ message: "Failed to end assignment" });
  }
};

const getAssignmentHistory = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const history = await CommunityAssignmentModel.getHistory(sisterId);
    return res
      .status(200)
      .json({ sister: { id: sister.id, code: sister.code }, history });
  } catch (error) {
    console.error("getAssignmentHistory error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch assignment history" });
  }
};

const getAssignmentsByCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { communityId } = req.params;
    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const assignments = await CommunityAssignmentModel.findByCommunity(
      communityId
    );
    return res.status(200).json({
      community: {
        id: community.id,
        name: community.name,
        address: community.address,
        diocese: community.diocese,
        established_date: community.established_date,
      },
      assignments,
    });
  } catch (error) {
    console.error("getAssignmentsByCommunity error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch community assignments" });
  }
};

const getCurrentAssignment = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) {
      return;
    }

    const { sisterId } = req.params;
    const assignment = await CommunityAssignmentModel.getCurrentAssignment(
      sisterId
    );
    if (!assignment) {
      return res.status(404).json({ message: "No current assignment found" });
    }

    return res.status(200).json({ assignment });
  } catch (error) {
    console.error("getCurrentAssignment error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch current assignment" });
  }
};

const UPLOADS_ROOT = path.resolve(__dirname, "../uploads");
const DECISION_DIR = path.join(UPLOADS_ROOT, "documents");

const uploadDecisionFile = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) {
      return;
    }

    const { id } = req.params;
    const existingRows = await CommunityAssignmentModel.executeQuery(
      "SELECT * FROM community_assignments WHERE id = ?",
      [id]
    );
    const assignment = existingRows[0];
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    if (assignment.decision_file_url) {
      const oldPath = path.join(
        UPLOADS_ROOT,
        assignment.decision_file_url.replace("/uploads/", "")
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const relativePath = path
      .relative(UPLOADS_ROOT, req.file.path)
      .replace(/\\/g, "/");
    const fileUrl = `/uploads/${relativePath}`;

    const updated = await CommunityAssignmentModel.update(id, {
      decision_file_url: fileUrl,
    });
    await logAudit(req, "UPDATE", id, assignment, updated);

    return res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("uploadDecisionFile error:", error.message);
    return res.status(500).json({ message: "Failed to upload decision file" });
  }
};

module.exports = {
  assignSisterToCommunity,
  updateAssignment,
  endAssignment,
  getAssignmentHistory,
  getAssignmentsByCommunity,
  getCurrentAssignment,
  uploadDecisionFile,
};
