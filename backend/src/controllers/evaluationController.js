const PDFDocument = require("pdfkit");
const EvaluationModel = require("../models/EvaluationModel");
const SisterModel = require("../models/SisterModel");
const CommunityAssignmentModel = require("../models/CommunityAssignmentModel");
const AuditLogModel = require("../models/AuditLogModel");
const UserModel = require("../models/UserModel");
const { applyScopeFilter, checkScopeAccess } = require("../utils/scopeHelper");

const globalAccessRoles = ["admin", "superior_general", "superior_provincial"];
const communityRole = "superior_community";

const SCORE_FIELD_MAPPINGS = {
  spiritual_life_score: ["spiritual_life_score", "spiritual_life", "spiritual"],
  community_life_score: ["community_life_score", "community_life", "community"],
  mission_score: ["mission_score", "mission"],
  personality_score: ["personality_score", "personality"],
  obedience_score: ["obedience_score", "obedience"],
};

const hasGlobalAccess = (user) =>
  !!(user && globalAccessRoles.includes(user.role));

const ensureEditorRole = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (hasGlobalAccess(req.user) || req.user.role === communityRole) {
    return true;
  }

  res.status(403).json({ message: "Forbidden" });
  return false;
};

const verifySisterScope = async (req, res, sisterId) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const sister = await SisterModel.findById(sisterId);
  if (!sister) {
    res.status(404).json({ message: "Sister not found" });
    return null;
  }

  const assignment = await CommunityAssignmentModel.getCurrentAssignment(
    sisterId
  );

  if (hasGlobalAccess(req.user)) {
    return { sister, assignment };
  }

  if (req.user.role === communityRole) {
    if (!req.user.community_id) {
      res.status(403).json({ message: "User context missing community scope" });
      return null;
    }

    const sameCommunity =
      assignment && `${assignment.community_id}` === `${req.user.community_id}`;

    if (!sameCommunity) {
      res
        .status(403)
        .json({ message: "You can only access sisters in your community" });
      return null;
    }

    return { sister, assignment };
  }

  res.status(403).json({ message: "Forbidden" });
  return null;
};

const coerceScoreValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric;
};

const extractScores = (source = {}) => {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return {};
  }

  return Object.entries(SCORE_FIELD_MAPPINGS).reduce((acc, [field, keys]) => {
    const matchedKey = keys.find((key) =>
      Object.prototype.hasOwnProperty.call(source, key)
    );
    if (matchedKey) {
      const coerced = coerceScoreValue(source[matchedKey]);
      if (coerced !== null) {
        acc[field] = coerced;
      }
    }
    return acc;
  }, {});
};

const logAudit = async (req, action, recordId, oldValue, newValue) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "evaluations",
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Evaluation audit log failed:", error.message);
  }
};

const getEvaluations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      sortBy = "evaluation_date",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build SQL query manually for complex search and sorting
    let sql = `SELECT e.*, 
               s.saint_name, s.birth_name, s.code as sister_code,
               ev.saint_name as evaluator_saint_name, 
               ev.birth_name as evaluator_birth_name 
               FROM evaluations e 
               LEFT JOIN sisters s ON e.sister_id = s.id 
               LEFT JOIN sisters ev ON CAST(e.evaluator AS UNSIGNED) = ev.id
               WHERE 1=1`;

    const params = [];

    // Add search filter
    if (search && search.trim()) {
      sql += ` AND (
        e.period LIKE ? OR 
        s.saint_name LIKE ? OR 
        s.birth_name LIKE ? OR
        ev.saint_name LIKE ? OR 
        ev.birth_name LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const validSortFields = [
      "evaluation_date",
      "period",
      "created_at",
      "overall_rating",
    ];
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "evaluation_date";
    const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
    sql += ` ORDER BY e.${sortField} ${sortDirection}`;

    // Add pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const evaluations = await EvaluationModel.executeQuery(sql, params);

    // Format evaluator name for each evaluation
    const formattedEvaluations = evaluations.map((e) => {
      let evaluatorName = "-";

      // Check if evaluator is a number (sister ID) and we have sister info
      if (e.evaluator_saint_name || e.evaluator_birth_name) {
        evaluatorName = `${e.evaluator_saint_name || ""} ${
          e.evaluator_birth_name || ""
        }`.trim();
      }
      // If evaluator exists but no sister info found, it might be a text name or invalid ID
      else if (e.evaluator) {
        evaluatorName = e.evaluator;
      }

      // Format sister name
      let sisterName = "-";
      if (e.saint_name || e.birth_name) {
        sisterName = `${e.saint_name || ""} ${e.birth_name || ""}`.trim();
      }

      return {
        ...e,
        evaluator_name: evaluatorName,
        sister_name: sisterName,
      };
    });

    // Count total
    let countSql = `SELECT COUNT(*) as total 
                    FROM evaluations e 
                    LEFT JOIN sisters s ON e.sister_id = s.id 
                    LEFT JOIN sisters ev ON CAST(e.evaluator AS UNSIGNED) = ev.id
                    WHERE 1=1`;
    const countParams = [];

    if (search && search.trim()) {
      countSql += ` AND (
        e.period LIKE ? OR 
        s.saint_name LIKE ? OR 
        s.birth_name LIKE ? OR
        ev.saint_name LIKE ? OR 
        ev.birth_name LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      countParams.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    const countResult = await EvaluationModel.executeQuery(
      countSql,
      countParams
    );
    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        items: formattedEvaluations,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getEvaluations error:", error.message);
    return res.status(500).json({ message: "Failed to fetch evaluations" });
  }
};

const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await EvaluationModel.findById(id);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Get sister information
    const sister = await SisterModel.findById(evaluation.sister_id);

    // Get evaluator information (if evaluator is a sister ID)
    let evaluatorName = evaluation.evaluator || "-";
    if (evaluation.evaluator && !isNaN(evaluation.evaluator)) {
      const evaluatorSister = await SisterModel.findById(evaluation.evaluator);
      if (evaluatorSister) {
        evaluatorName = `${evaluatorSister.saint_name || ""} ${
          evaluatorSister.birth_name || ""
        }`.trim();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        ...evaluation,
        sister_name: sister
          ? `${sister.saint_name || ""} ${sister.birth_name || ""}`.trim()
          : "",
        sister_code: sister?.code,
        evaluator_name: evaluatorName,
      },
    });
  } catch (error) {
    console.error("getEvaluationById error:", error.message);
    return res.status(500).json({ message: "Failed to fetch evaluation" });
  }
};

const getEvaluationsBySister = async (req, res) => {
  try {
    const { sisterId } = req.params;
    const context = await verifySisterScope(req, res, sisterId);
    if (!context) {
      return;
    }

    const evaluations = await EvaluationModel.findBySisterId(sisterId);

    return res.status(200).json({
      sister: {
        id: context.sister.id,
        code: context.sister.code,
        religious_name: context.sister.religious_name,
        community: context.assignment
          ? {
              id: context.assignment.community_id,
              name: context.assignment.community_name,
            }
          : null,
      },
      evaluations,
    });
  } catch (error) {
    console.error("getEvaluationsBySister error:", error.message);
    return res.status(500).json({ message: "Failed to fetch evaluations" });
  }
};

const validateEvaluator = async (evaluatorId) => {
  if (!evaluatorId) {
    return null;
  }

  const evaluator = await UserModel.findById(evaluatorId);
  return evaluator;
};

const buildCreatePayload = (body = {}) => {
  const {
    sister_id: sisterId,
    evaluation_period: evaluationPeriod,
    period,
    evaluator_id: evaluatorId,
    evaluator,
    evaluation_type: evaluationType,
    evaluation_date: evaluationDate,
    spiritual_life: spiritualLife,
    community_life: communityLife,
    apostolic_work: apostolicWork,
    personal_development: personalDevelopment,
    overall_rating: overallRating,
    strengths,
    weaknesses,
    general_comments: generalComments,
    recommendations,
    notes,
    documents,
  } = body;

  const scoreSource =
    body.scores && typeof body.scores === "object" ? body.scores : body;
  const scorePayload = extractScores(scoreSource);

  return {
    sisterId,
    evaluationPeriod: evaluationPeriod || period,
    evaluatorId: evaluatorId || evaluator,
    evaluationType,
    evaluationDate,
    spiritualLife,
    communityLife,
    apostolicWork,
    personalDevelopment,
    overallRating,
    strengths,
    weaknesses,
    generalComments: generalComments || null,
    recommendations: recommendations || null,
    notes: notes || null,
    documents: documents || null,
    scorePayload,
  };
};

const createEvaluation = async (req, res) => {
  try {
    if (!ensureEditorRole(req, res)) {
      return;
    }

    const {
      sisterId,
      evaluationPeriod,
      evaluatorId,
      evaluationType,
      evaluationDate,
      spiritualLife,
      communityLife,
      apostolicWork,
      personalDevelopment,
      overallRating,
      strengths,
      weaknesses,
      generalComments,
      recommendations,
      notes,
      documents,
      scorePayload,
    } = buildCreatePayload(req.body);

    if (!sisterId) {
      return res.status(400).json({
        message: "sister_id là bắt buộc",
      });
    }

    const context = await verifySisterScope(req, res, sisterId);
    if (!context) {
      return;
    }

    const payload = {
      sister_id: sisterId,
      evaluation_type: evaluationType,
      period: evaluationPeriod,
      evaluation_date: evaluationDate,
      evaluator: evaluatorId,
      spiritual_life: spiritualLife,
      community_life: communityLife,
      apostolic_work: apostolicWork,
      personal_development: personalDevelopment,
      overall_rating: overallRating,
      strengths,
      weaknesses,
      general_comments: generalComments,
      recommendations,
      notes,
      documents,
      ...scorePayload,
    };

    const created = await EvaluationModel.create(payload);
    await logAudit(req, "CREATE", created.id, null, created);

    return res.status(201).json({ evaluation: created });
  } catch (error) {
    console.error("createEvaluation error:", error.message);
    return res.status(500).json({ message: "Failed to create evaluation" });
  }
};

const buildUpdatePayload = (body = {}) => {
  const payload = {};
  const mutableFields = [
    // New fields
    "evaluation_type",
    "period",
    "evaluation_date",
    "evaluator",
    "spiritual_life",
    "community_life",
    "apostolic_work",
    "personal_development",
    "overall_rating",
    "strengths",
    "weaknesses",
    "recommendations",
    "notes",
    "documents",
    // Legacy fields
    "evaluation_period",
    "evaluator_id",
    "general_comments",
  ];

  mutableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }
  });

  // Handle legacy scores if present
  const scoreSource =
    body.scores && typeof body.scores === "object" ? body.scores : body;
  const scores = extractScores(scoreSource);

  return { ...payload, ...scores };
};

const updateEvaluation = async (req, res) => {
  try {
    if (!ensureEditorRole(req, res)) {
      return;
    }

    const { id } = req.params;
    const existing = await EvaluationModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    const context = await verifySisterScope(req, res, existing.sister_id);
    if (!context) {
      return;
    }

    const payload = buildUpdatePayload(req.body);

    // Debug log
    console.log("Update payload:", JSON.stringify(payload, null, 2));
    console.log("evaluation_date in payload:", payload.evaluation_date);

    if (!Object.keys(payload).length) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    if (payload.evaluator_id) {
      const evaluator = await validateEvaluator(payload.evaluator_id);
      if (!evaluator) {
        return res.status(404).json({ message: "Evaluator not found" });
      }
    }

    const updated = await EvaluationModel.update(id, payload);
    await logAudit(req, "UPDATE", id, existing, updated);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("updateEvaluation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update evaluation",
    });
  }
};

const deleteEvaluation = async (req, res) => {
  try {
    if (!ensureEditorRole(req, res)) {
      return;
    }

    const { id } = req.params;
    const existing = await EvaluationModel.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    const context = await verifySisterScope(req, res, existing.sister_id);
    if (!context) {
      return;
    }

    await EvaluationModel.delete(id);
    await logAudit(req, "DELETE", id, existing, null);

    return res.status(200).json({ message: "Evaluation deleted successfully" });
  } catch (error) {
    console.error("deleteEvaluation error:", error.message);
    return res.status(500).json({ message: "Failed to delete evaluation" });
  }
};

const formatScoreValue = (value) =>
  value === null || value === undefined ? "Chưa có" : `${value}`;

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return `${value}`;
  }

  return date.toISOString().split("T")[0];
};

const drawScoreSection = (doc, evaluation) => {
  doc.fontSize(12).text("I. ĐÁNH GIÁ THEO CÁC LĨNH VỰC", {
    underline: true,
  });
  doc.moveDown(0.5);

  const rows = [
    { label: "Đời sống thiêng liêng", field: "spiritual_life_score" },
    { label: "Đời sống cộng đoàn", field: "community_life_score" },
    { label: "Sứ vụ", field: "mission_score" },
    { label: "Tính cách", field: "personality_score" },
    { label: "Vâng phục", field: "obedience_score" },
  ];

  rows.forEach((row) => {
    doc
      .font("Helvetica-Bold")
      .text(`${row.label}: `, { continued: true })
      .font("Helvetica")
      .text(formatScoreValue(evaluation[row.field]));
  });

  doc.moveDown();
};

const drawRemarksSection = (doc, evaluation) => {
  doc.font("Helvetica-Bold").text("II. NHẬN XÉT CHUNG");
  doc.font("Helvetica").text(evaluation.general_comments || "Không có");
  doc.moveDown();

  doc.font("Helvetica-Bold").text("III. ĐỀ NGHỊ");
  doc.font("Helvetica").text(evaluation.recommendations || "Không có");
  doc.moveDown();
};

const exportEvaluationPDF = async (req, res) => {
  let doc;
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const evaluation = await EvaluationModel.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    const context = await verifySisterScope(req, res, evaluation.sister_id);
    if (!context) {
      return;
    }

    const evaluator = await validateEvaluator(evaluation.evaluator_id);
    const evaluatorName = evaluator
      ? evaluator.username
      : evaluation.evaluator_id;

    const fileSafePeriod = (evaluation.evaluation_period || "evaluation")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase();
    const fileSafeCode = (context.sister.code || context.sister.id)
      .toString()
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="evaluation_${fileSafeCode}_${fileSafePeriod}.pdf"`
    );

    doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("HỘI DÒNG OSP", { align: "center" });
    doc
      .fontSize(14)
      .text("PHIẾU ĐÁNH GIÁ NỮ TU", { align: "center" })
      .moveDown();

    doc.fontSize(12).font("Helvetica");
    doc.text(
      `Nữ tu: ${context.sister.religious_name || context.sister.birth_name} (${
        context.sister.code || "N/A"
      })`
    );
    doc.text(`Kỳ đánh giá: ${evaluation.evaluation_period}`);
    doc.text(`Người đánh giá: ${evaluatorName}`);
    doc.text(
      `Cộng đoàn: ${
        context.assignment ? context.assignment.community_name : "Chưa phân"
      }`
    );
    doc.text(`Ngày lập phiếu: ${formatDate(evaluation.created_at)}`);
    doc.moveDown();

    drawScoreSection(doc, evaluation);
    drawRemarksSection(doc, evaluation);

    doc
      .moveDown(2)
      .font("Helvetica-Bold")
      .text("Chữ ký Superior", { align: "right" });

    await logAudit(req, "EXPORT_PDF", evaluation.id, null, null);

    doc.end();
  } catch (error) {
    console.error("exportEvaluationPDF error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to export evaluation" });
    }

    res.end();
  }
};

module.exports = {
  getEvaluations,
  getEvaluationById,
  getEvaluationsBySister,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  exportEvaluationPDF,
};
