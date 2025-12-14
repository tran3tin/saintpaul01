const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const SisterModel = require("../models/SisterModel");
const VocationJourneyModel = require("../models/VocationJourneyModel");
const CommunityModel = require("../models/CommunityModel");
const MissionModel = require("../models/MissionModel");
const EducationModel = require("../models/EducationModel");
const DepartureRecordModel = require("../models/DepartureRecordModel");
const AuditLogModel = require("../models/AuditLogModel");
const { applyScopeFilter } = require("../utils/scopeHelper");

const viewerRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
  "viewer",
];

const ensurePermission = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  // Check if user is admin or super admin - they have all permissions
  if (
    req.user.isAdmin ||
    req.user.is_admin === 1 ||
    req.user.is_super_admin === 1
  ) {
    return true;
  }

  if (!viewerRoles.includes(req.user.role)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }

  return true;
};

const computePercentage = (value, total) => {
  const safeValue = Number(value || 0);
  const safeTotal = Number(total || 0);
  if (!safeTotal) {
    return 0;
  }

  return Number(((safeValue / safeTotal) * 100).toFixed(2));
};

const logReportAudit = async (req, action, meta = null) => {
  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action,
      table_name: "reports",
      record_id: null,
      old_value: null,
      new_value: meta ? JSON.stringify(meta) : null,
      ip_address: req.ip,
    });
  } catch (error) {
    console.error("Report audit log failed:", error.message);
  }
};

const fetchAgeStats = async () => {
  const rows = await SisterModel.executeQuery(
    `SELECT
        SUM(CASE WHEN age < 30 THEN 1 ELSE 0 END) AS under_30,
        SUM(CASE WHEN age >= 30 AND age < 40 THEN 1 ELSE 0 END) AS between_30_40,
        SUM(CASE WHEN age >= 40 AND age < 50 THEN 1 ELSE 0 END) AS between_40_50,
        SUM(CASE WHEN age >= 50 AND age < 60 THEN 1 ELSE 0 END) AS between_50_60,
        SUM(CASE WHEN age >= 60 AND age < 70 THEN 1 ELSE 0 END) AS between_60_70,
        SUM(CASE WHEN age >= 70 THEN 1 ELSE 0 END) AS over_70,
        SUM(1) AS total
      FROM (
        SELECT TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age
        FROM sisters
        WHERE status = 'active' AND date_of_birth IS NOT NULL
      ) age_data`
  );

  const row = rows[0] || {};
  const total = Number(row.total || 0);
  const mapping = [
    { label: "<30", field: "under_30" },
    { label: "30-40", field: "between_30_40" },
    { label: "40-50", field: "between_40_50" },
    { label: "50-60", field: "between_50_60" },
    { label: "60-70", field: "between_60_70" },
    { label: ">70", field: "over_70" },
  ];

  const groups = mapping.map(({ label, field }) => {
    const count = Number(row[field] || 0);
    return {
      label,
      count,
      percentage: computePercentage(count, total),
    };
  });

  return {
    total,
    groups,
  };
};

const fetchStageStats = async () => {
  const rows = await VocationJourneyModel.executeQuery(
    `SELECT v.stage, COUNT(*) AS total
     FROM vocation_journey v
     INNER JOIN (
       SELECT sister_id, MAX(start_date) AS max_start
       FROM vocation_journey
       GROUP BY sister_id
     ) latest
       ON latest.sister_id = v.sister_id AND latest.max_start = v.start_date
     GROUP BY v.stage
     ORDER BY total DESC`
  );

  const total = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const byStage = rows.map((row) => ({
    stage: row.stage || "unknown",
    count: Number(row.total || 0),
    percentage: computePercentage(row.total, total),
  }));

  return {
    total,
    byStage,
  };
};

const fetchCommunityStats = async () => {
  const memberRows = await CommunityModel.executeQuery(
    `SELECT c.id, c.name, COUNT(ca.id) AS total_members
     FROM communities c
     LEFT JOIN community_assignments ca
       ON ca.community_id = c.id
       AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
     GROUP BY c.id, c.name
     ORDER BY total_members DESC, c.name ASC`
  );

  const roleRows = await CommunityModel.executeQuery(
    `SELECT c.id, c.name, ca.role, COUNT(*) AS total
     FROM communities c
     LEFT JOIN community_assignments ca
       ON ca.community_id = c.id
       AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
     WHERE ca.role IS NOT NULL
     GROUP BY c.id, c.name, ca.role
     ORDER BY c.name, total DESC`
  );

  const communityMap = new Map();
  memberRows.forEach((row) => {
    communityMap.set(row.id, {
      id: row.id,
      name: row.name,
      memberCount: Number(row.total_members || 0),
      percentage: 0,
      roles: {},
    });
  });

  roleRows.forEach((row) => {
    const existing = communityMap.get(row.id) || {
      id: row.id,
      name: row.name,
      memberCount: 0,
      percentage: 0,
      roles: {},
    };
    existing.roles[row.role] = Number(row.total || 0);
    communityMap.set(row.id, existing);
  });

  const communities = Array.from(communityMap.values());
  const totalMembers = communities.reduce(
    (sum, community) => sum + Number(community.memberCount || 0),
    0
  );

  communities.forEach((community) => {
    community.percentage = computePercentage(
      community.memberCount,
      totalMembers
    );
  });

  return {
    totalMembers,
    communities,
  };
};

const fetchMissionStats = async () => {
  const rows = await MissionModel.executeQuery(
    `SELECT field, COUNT(*) AS total
     FROM missions
     WHERE field IS NOT NULL
       AND (end_date IS NULL OR end_date >= CURDATE())
     GROUP BY field
     ORDER BY total DESC`
  );

  const totalAssignments = rows.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0
  );

  const byField = rows.map((row) => ({
    field: row.field || "unknown",
    count: Number(row.total || 0),
    percentage: computePercentage(row.total, totalAssignments),
  }));

  return {
    totalAssignments,
    byField,
  };
};

const fetchEducationStats = async () => {
  const rows = await EducationModel.executeQuery(
    `SELECT e.level, COUNT(*) AS total
     FROM education e
     INNER JOIN (
       SELECT sister_id, MAX(COALESCE(start_date, '1900-01-01')) AS max_start
       FROM education
       GROUP BY sister_id
     ) latest
       ON latest.sister_id = e.sister_id AND latest.max_start = COALESCE(e.start_date, '1900-01-01')
     GROUP BY e.level
     ORDER BY total DESC`
  );

  const totalProfiles = rows.reduce(
    (sum, row) => sum + Number(row.total || 0),
    0
  );

  const byLevel = rows.map((row) => ({
    level: row.level || "unknown",
    count: Number(row.total || 0),
    percentage: computePercentage(row.total, totalProfiles),
  }));

  return {
    totalProfiles,
    byLevel,
  };
};

const fetchStatusBreakdown = async () => {
  const rows = await SisterModel.executeQuery(
    `SELECT status, COUNT(*) AS total
     FROM sisters
     GROUP BY status`
  );

  const total = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);

  return rows.map((row) => ({
    status: row.status || "unknown",
    total: Number(row.total || 0),
    percentage: computePercentage(row.total, total),
  }));
};

const fetchTrendData = async () => {
  const [entryRows, departureRows] = await Promise.all([
    SisterModel.executeQuery(
      `SELECT YEAR(created_at) AS year, COUNT(*) AS total
       FROM sisters
       WHERE created_at IS NOT NULL
       GROUP BY YEAR(created_at)
       ORDER BY year ASC`
    ),
    DepartureRecordModel.executeQuery(
      `SELECT YEAR(departure_date) AS year, COUNT(*) AS total
       FROM departure_records
       WHERE departure_date IS NOT NULL
       GROUP BY YEAR(departure_date)
       ORDER BY year ASC`
    ),
  ]);

  const entries = entryRows.map((row) => ({
    year: row.year,
    total: Number(row.total || 0),
  }));
  const departures = departureRows.map((row) => ({
    year: row.year,
    total: Number(row.total || 0),
  }));

  return { entries, departures };
};

const buildComprehensiveReport = async () => {
  const [
    statusBreakdown,
    age,
    stages,
    communities,
    missionFields,
    educationLevels,
    trends,
  ] = await Promise.all([
    fetchStatusBreakdown(),
    fetchAgeStats(),
    fetchStageStats(),
    fetchCommunityStats(),
    fetchMissionStats(),
    fetchEducationStats(),
    fetchTrendData(),
  ]);

  const totals = statusBreakdown.reduce(
    (acc, item) => {
      acc.overall += item.total;
      if (item.status === "active") {
        acc.active = item.total;
      }
      if (item.status === "left") {
        acc.left = item.total;
      }
      return acc;
    },
    { overall: 0, active: 0, left: 0 }
  );

  return {
    totals: {
      ...totals,
      byStatus: statusBreakdown,
    },
    age,
    stages,
    communities,
    missionFields,
    educationLevels,
    trends,
  };
};

const getStatisticsByAge = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const ageStats = await fetchAgeStats();
    return res.status(200).json(ageStats);
  } catch (error) {
    console.error("getStatisticsByAge error:", error.message);
    return res.status(500).json({ message: "Failed to fetch age statistics" });
  }
};

const getStatisticsByStage = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const stageStats = await fetchStageStats();
    return res.status(200).json(stageStats);
  } catch (error) {
    console.error("getStatisticsByStage error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch stage statistics" });
  }
};

const getStatisticsByCommunity = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const communityStats = await fetchCommunityStats();
    return res.status(200).json(communityStats);
  } catch (error) {
    console.error("getStatisticsByCommunity error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch community statistics" });
  }
};

const getStatisticsByMissionField = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const missionStats = await fetchMissionStats();
    return res.status(200).json(missionStats);
  } catch (error) {
    console.error("getStatisticsByMissionField error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch mission statistics" });
  }
};

const getStatisticsByEducationLevel = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const educationStats = await fetchEducationStats();
    return res.status(200).json(educationStats);
  } catch (error) {
    console.error("getStatisticsByEducationLevel error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch education statistics" });
  }
};

const getComprehensiveReport = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const report = await buildComprehensiveReport();
    return res.status(200).json(report);
  } catch (error) {
    console.error("getComprehensiveReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to build comprehensive report" });
  }
};

const getStatisticsByAgeLabel = (group) =>
  `${group.label}: ${group.count} (${group.percentage}%)`;

const buildExcelSheet = (worksheet, rows) => {
  worksheet.addRow(rows.headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  rows.data.forEach((row) => {
    worksheet.addRow(row);
  });
  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.header?.length || 15, 15);
  });
};

const exportReportExcel = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const report = await buildComprehensiveReport();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "OSP HR API";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];
    summarySheet.addRow({
      metric: "Tổng số nữ tu",
      value: report.totals.overall,
    });
    summarySheet.addRow({
      metric: "Đang phục vụ",
      value: report.totals.active,
    });
    summarySheet.addRow({ metric: "Đã rời", value: report.totals.left });
    summarySheet.addRow({
      metric: "Ngày báo cáo",
      value: new Date().toISOString(),
    });
    summarySheet.getRow(1).font = { bold: true };

    const ageSheet = workbook.addWorksheet("Age");
    ageSheet.columns = [
      { header: "Nhóm tuổi", key: "label", width: 15 },
      { header: "Số lượng", key: "count", width: 15 },
      { header: "%", key: "percentage", width: 10 },
    ];
    buildExcelSheet(ageSheet, {
      headers: ["Nhóm tuổi", "Số lượng", "%"],
      data: report.age.groups.map((group) => [
        group.label,
        group.count,
        group.percentage,
      ]),
    });

    const stageSheet = workbook.addWorksheet("Stage");
    stageSheet.columns = [
      { header: "Giai đoạn", key: "stage", width: 25 },
      { header: "Số lượng", key: "count", width: 15 },
      { header: "%", key: "percentage", width: 10 },
    ];
    buildExcelSheet(stageSheet, {
      headers: ["Giai đoạn", "Số lượng", "%"],
      data: report.stages.byStage.map((stage) => [
        stage.stage,
        stage.count,
        stage.percentage,
      ]),
    });

    const missionSheet = workbook.addWorksheet("Mission");
    missionSheet.columns = [
      { header: "Lĩnh vực", key: "field", width: 25 },
      { header: "Số lượng", key: "count", width: 15 },
      { header: "%", key: "percentage", width: 10 },
    ];
    buildExcelSheet(missionSheet, {
      headers: ["Lĩnh vực", "Số lượng", "%"],
      data: report.missionFields.byField.map((field) => [
        field.field,
        field.count,
        field.percentage,
      ]),
    });

    const educationSheet = workbook.addWorksheet("Education");
    educationSheet.columns = [
      { header: "Trình độ", key: "level", width: 25 },
      { header: "Số lượng", key: "count", width: 15 },
      { header: "%", key: "percentage", width: 10 },
    ];
    buildExcelSheet(educationSheet, {
      headers: ["Trình độ", "Số lượng", "%"],
      data: report.educationLevels.byLevel.map((level) => [
        level.level,
        level.count,
        level.percentage,
      ]),
    });

    const communitySheet = workbook.addWorksheet("Communities");
    communitySheet.columns = [
      { header: "Cộng đoàn", key: "name", width: 25 },
      { header: "Thành viên", key: "members", width: 15 },
      { header: "%", key: "percentage", width: 10 },
      { header: "Vai trò", key: "roles", width: 50 },
    ];
    communitySheet.addRow(["Cộng đoàn", "Thành viên", "%", "Vai trò"]);
    communitySheet.getRow(1).font = { bold: true };
    report.communities.communities.forEach((community) => {
      const rolesText = Object.entries(community.roles || {})
        .map(([role, count]) => `${role}: ${count}`)
        .join(", ");
      communitySheet.addRow([
        community.name,
        community.memberCount,
        community.percentage,
        rolesText,
      ]);
    });

    const trendsSheet = workbook.addWorksheet("Trends");
    trendsSheet.addRow(["Năm", "Gia nhập", "Rời"]);
    trendsSheet.getRow(1).font = { bold: true };
    const yearSet = new Set([
      ...report.trends.entries.map((item) => item.year).filter(Boolean),
      ...report.trends.departures.map((item) => item.year).filter(Boolean),
    ]);
    const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
    sortedYears.forEach((year) => {
      const entry = report.trends.entries.find((row) => row.year === year);
      const departure = report.trends.departures.find(
        (row) => row.year === year
      );
      trendsSheet.addRow([
        year,
        entry ? entry.total : 0,
        departure ? departure.total : 0,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="osp-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
    await logReportAudit(req, "EXPORT_REPORT_EXCEL", {
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("exportReportExcel error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to export Excel report" });
    }
    res.end();
  }
};

const limitList = (items, max = 10) => items.slice(0, max);

const exportReportPDF = async (req, res) => {
  let doc;
  try {
    if (!ensurePermission(req, res)) {
      return;
    }

    const report = await buildComprehensiveReport();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="osp-report-${
        new Date().toISOString().split("T")[0]
      }.pdf"`
    );

    doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BÁO CÁO THỐNG KÊ HỘI DÒNG OSP", { align: "center" });
    doc
      .moveDown(0.5)
      .fontSize(12)
      .font("Helvetica")
      .text(`Ngày báo cáo: ${new Date().toLocaleDateString("vi-VN")}`, {
        align: "center",
      });

    doc.moveDown();
    doc.font("Helvetica-Bold").text("I. Tổng quan");
    doc.font("Helvetica").text(`Tổng số nữ tu: ${report.totals.overall}`);
    doc.font("Helvetica").text(`Đang phục vụ: ${report.totals.active}`);
    doc.font("Helvetica").text(`Đã rời: ${report.totals.left}`);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("II. Phân bổ độ tuổi");
    report.age.groups.forEach((group) => {
      doc.font("Helvetica").text(getStatisticsByAgeLabel(group));
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("III. Giai đoạn ơn gọi");
    limitList(report.stages.byStage).forEach((stage) => {
      doc
        .font("Helvetica")
        .text(`${stage.stage}: ${stage.count} (${stage.percentage}%)`);
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("IV. Lĩnh vực sứ vụ (Top 10)");
    limitList(report.missionFields.byField).forEach((field) => {
      doc
        .font("Helvetica")
        .text(`${field.field}: ${field.count} (${field.percentage}%)`);
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("V. Trình độ học vấn");
    limitList(report.educationLevels.byLevel).forEach((level) => {
      doc
        .font("Helvetica")
        .text(`${level.level}: ${level.count} (${level.percentage}%)`);
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("VI. Cộng đoàn có số thành viên cao nhất");
    limitList(report.communities.communities).forEach((community) => {
      const rolesText = Object.entries(community.roles || {})
        .map(([role, count]) => `${role}: ${count}`)
        .join(", ");
      doc
        .font("Helvetica")
        .text(
          `${community.name}: ${community.memberCount} (${community.percentage}%)` +
            (rolesText ? ` | Vai trò: ${rolesText}` : "")
        );
    });
    doc.moveDown();

    doc.font("Helvetica-Bold").text("VII. Xu hướng theo năm");
    const years = new Set([
      ...report.trends.entries.map((item) => item.year).filter(Boolean),
      ...report.trends.departures.map((item) => item.year).filter(Boolean),
    ]);
    Array.from(years)
      .sort((a, b) => a - b)
      .forEach((year) => {
        const entry = report.trends.entries.find((row) => row.year === year);
        const departure = report.trends.departures.find(
          (row) => row.year === year
        );
        doc
          .font("Helvetica")
          .text(
            `${year}: Gia nhập ${entry ? entry.total : 0} | Rời ${
              departure ? departure.total : 0
            }`
          );
      });

    doc.end();
    doc.on("finish", () => {
      logReportAudit(req, "EXPORT_REPORT_PDF", {
        generated_at: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error("exportReportPDF error:", error.message);
    if (doc && !doc.ended) {
      doc.end();
    }
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to export PDF report" });
    }
    res.end();
  }
};

module.exports = {
  getStatisticsByAge,
  getStatisticsByStage,
  getStatisticsByCommunity,
  getStatisticsByMissionField,
  getStatisticsByEducationLevel,
  getComprehensiveReport,
  exportReportExcel,
  exportReportPDF,
};
