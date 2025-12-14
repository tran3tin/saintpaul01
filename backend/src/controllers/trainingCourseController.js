const TrainingCourseModel = require("../models/TrainingCourseModel");
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
      table_name: "training_courses",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Training course audit log failed:", error.message);
  }
};

const getCoursesBySister = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const { sisterId } = req.params;
    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const courses = await TrainingCourseModel.findBySisterId(sisterId);
    return res
      .status(200)
      .json({ sister: { id: sister.id, code: sister.code }, courses });
  } catch (error) {
    console.error("getCoursesBySister error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch training courses" });
  }
};

const addCourse = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const {
      sister_id: sisterId,
      course_name: courseName,
      organizer,
      start_date: startDate,
      end_date: endDate,
      content,
      notes,
    } = req.body;
    if (!sisterId || !courseName) {
      return res
        .status(400)
        .json({ message: "sister_id and course_name are required" });
    }

    const sister = await SisterModel.findById(sisterId);
    if (!sister) {
      return res.status(404).json({ message: "Sister not found" });
    }

    const payload = {
      sister_id: sisterId,
      course_name: courseName,
      organizer: organizer || null,
      start_date: startDate || null,
      end_date: endDate || null,
      content: content || null,
      notes: notes || null,
    };

    const created = await TrainingCourseModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ course: created });
  } catch (error) {
    console.error("addCourse error:", error.message);
    return res.status(500).json({ message: "Failed to add course" });
  }
};

const updateCourse = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const { id } = req.params;
    const existing = await TrainingCourseModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.body.sister_id) {
      const sister = await SisterModel.findById(req.body.sister_id);
      if (!sister) {
        return res.status(404).json({ message: "Sister not found" });
      }
    }

    const updated = await TrainingCourseModel.update(id, req.body);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({ course: updated });
  } catch (error) {
    console.error("updateCourse error:", error.message);
    return res.status(500).json({ message: "Failed to update course" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    if (!ensurePermission(req, res, editorRoles)) return;

    const { id } = req.params;
    const existing = await TrainingCourseModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Course not found" });
    }

    const deleted = await TrainingCourseModel.delete(id);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete course" });
    }

    await logAudit(req, "DELETE", id, existing, null);
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("deleteCourse error:", error.message);
    return res.status(500).json({ message: "Failed to delete course" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    if (!ensurePermission(req, res, viewerRoles)) return;

    const filters = ["1=1"];
    const params = [];

    if (req.query.year) {
      filters.push("(YEAR(tc.start_date) = ? OR YEAR(tc.end_date) = ?)");
      params.push(req.query.year, req.query.year);
    }

    if (req.query.organizer) {
      filters.push("tc.organizer LIKE ?");
      params.push(`%${req.query.organizer}%`);
    }

    if (req.query.name) {
      filters.push("tc.course_name LIKE ?");
      params.push(`%${req.query.name}%`);
    }

    // Add scope filter
    const { whereClause: scopeWhere, params: scopeParams } = applyScopeFilter(
      req.userScope,
      "s",
      {
        communityIdField: "s.current_community_id",
        useJoin: false,
      }
    );

    if (scopeWhere) {
      filters.push(scopeWhere);
      params.push(...scopeParams);
    }

    const whereClause = `WHERE ${filters.join(" AND ")}`;

    const courses = await TrainingCourseModel.executeQuery(
      `SELECT tc.*, s.saint_name as religious_name, s.birth_name
       FROM training_courses tc
       INNER JOIN sisters s ON s.id = tc.sister_id
       ${whereClause}
       ORDER BY tc.start_date DESC`,
      params
    );

    return res.status(200).json({ data: courses });
  } catch (error) {
    console.error("getAllCourses error:", error.message);
    return res.status(500).json({ message: "Failed to fetch courses" });
  }
};

module.exports = {
  getCoursesBySister,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
};
