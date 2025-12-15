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

  // Permission-based access control - no admin bypass
  // Actual permission checking done by checkPermission middleware in routes
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

// ============================================
// DASHBOARD & STATISTICS
// ============================================

const getDashboard = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    // Fetch all necessary data in parallel
    const [
      totalSisters,
      activeSisters,
      totalCommunities,
      stageStats,
      healthStats,
      recentActivities,
      monthlyGrowth,
    ] = await Promise.all([
      SisterModel.executeQuery("SELECT COUNT(*) as total FROM sisters"),
      SisterModel.executeQuery(
        'SELECT COUNT(*) as total FROM sisters WHERE status = "active"'
      ),
      CommunityModel.executeQuery("SELECT COUNT(*) as total FROM communities"),
      fetchStageStats(),
      fetchHealthStats(),
      fetchRecentActivities(),
      fetchMonthlyGrowth(),
    ]);

    return res.status(200).json({
      totalSisters: totalSisters[0]?.total || 0,
      activeSisters: activeSisters[0]?.total || 0,
      totalCommunities: totalCommunities[0]?.total || 0,
      journeyStages: stageStats.byStage.map((s) => s.count),
      healthStatus: healthStats.byStatus,
      sistersGrowth: monthlyGrowth,
      recentActivities,
      evaluationTrend: [75, 78, 82, 80], // Placeholder - can implement actual evaluation tracking
    });
  } catch (error) {
    console.error("getDashboard error:", error.message);
    return res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

const getStatistics = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    const report = await buildComprehensiveReport();
    const monthlyGrowth = await fetchMonthlyGrowth();

    return res.status(200).json({
      totalSisters: report.totals.overall,
      activeSisters: report.totals.active,
      sistersGrowth: monthlyGrowth,
      journeyStages: report.stages.byStage.map((s) => s.count),
      healthStatus: [0, 0, 0, 0], // Will be updated when health data is available
      evaluationTrend: [75, 78, 82, 80],
    });
  } catch (error) {
    console.error("getStatistics error:", error.message);
    return res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

// ============================================
// SISTER REPORT
// ============================================

const getSisterReport = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    // Total & Active Sisters
    const [totalRows, activeRows, newThisMonth] = await Promise.all([
      SisterModel.executeQuery("SELECT COUNT(*) as total FROM sisters"),
      SisterModel.executeQuery(
        'SELECT COUNT(*) as total FROM sisters WHERE status = "active"'
      ),
      SisterModel.executeQuery(`
        SELECT COUNT(*) as total FROM sisters 
        WHERE MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
      `),
    ]);

    // Age Distribution
    const ageRows = await SisterModel.executeQuery(`
      SELECT 
        SUM(CASE WHEN age >= 18 AND age <= 30 THEN 1 ELSE 0 END) as age_18_30,
        SUM(CASE WHEN age >= 31 AND age <= 40 THEN 1 ELSE 0 END) as age_31_40,
        SUM(CASE WHEN age >= 41 AND age <= 50 THEN 1 ELSE 0 END) as age_41_50,
        SUM(CASE WHEN age >= 51 AND age <= 60 THEN 1 ELSE 0 END) as age_51_60,
        SUM(CASE WHEN age > 60 THEN 1 ELSE 0 END) as age_60_plus,
        AVG(age) as avg_age
      FROM (
        SELECT TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) as age
        FROM sisters WHERE date_of_birth IS NOT NULL AND status = 'active'
      ) ages
    `);

    // Status Distribution
    const statusRows = await SisterModel.executeQuery(`
      SELECT status, COUNT(*) as total FROM sisters GROUP BY status
    `);

    // Community Breakdown with stage counts
    const communityBreakdown = await CommunityModel.executeQuery(`
      SELECT 
        c.id, c.name,
        COUNT(DISTINCT ca.sister_id) as total,
        SUM(CASE WHEN vj.stage = 'aspirant' THEN 1 ELSE 0 END) as aspirant,
        SUM(CASE WHEN vj.stage = 'postulant' THEN 1 ELSE 0 END) as postulant,
        SUM(CASE WHEN vj.stage = 'temporary_vows' THEN 1 ELSE 0 END) as temporary,
        SUM(CASE WHEN vj.stage = 'perpetual_vows' THEN 1 ELSE 0 END) as perpetual,
        AVG(TIMESTAMPDIFF(YEAR, s.date_of_birth, CURDATE())) as averageAge
      FROM communities c
      LEFT JOIN community_assignments ca ON ca.community_id = c.id 
        AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      LEFT JOIN sisters s ON s.id = ca.sister_id AND s.status = 'active'
      LEFT JOIN (
        SELECT vj1.sister_id, vj1.stage
        FROM vocation_journey vj1
        INNER JOIN (
          SELECT sister_id, MAX(start_date) as max_date
          FROM vocation_journey GROUP BY sister_id
        ) vj2 ON vj1.sister_id = vj2.sister_id AND vj1.start_date = vj2.max_date
      ) vj ON vj.sister_id = s.id
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `);

    // Stage totals
    const stageTotals = await VocationJourneyModel.executeQuery(`
      SELECT 
        SUM(CASE WHEN stage = 'aspirant' THEN 1 ELSE 0 END) as aspirant,
        SUM(CASE WHEN stage = 'postulant' THEN 1 ELSE 0 END) as postulant,
        SUM(CASE WHEN stage = 'temporary_vows' THEN 1 ELSE 0 END) as temporary,
        SUM(CASE WHEN stage = 'perpetual_vows' THEN 1 ELSE 0 END) as perpetual
      FROM vocation_journey vj
      INNER JOIN (
        SELECT sister_id, MAX(start_date) as max_date
        FROM vocation_journey GROUP BY sister_id
      ) latest ON vj.sister_id = latest.sister_id AND vj.start_date = latest.max_date
    `);

    const ageData = ageRows[0] || {};
    const statusData = statusRows.reduce(
      (acc, row) => {
        if (row.status === "active") acc[0] = row.total;
        else if (row.status === "inactive") acc[1] = row.total;
        else acc[2] = (acc[2] || 0) + row.total;
        return acc;
      },
      [0, 0, 0]
    );

    return res.status(200).json({
      totalSisters: totalRows[0]?.total || 0,
      activeSisters: activeRows[0]?.total || 0,
      averageAge: Math.round(ageData.avg_age || 0),
      newThisMonth: newThisMonth[0]?.total || 0,
      ageDistribution: [
        ageData.age_18_30 || 0,
        ageData.age_31_40 || 0,
        ageData.age_41_50 || 0,
        ageData.age_51_60 || 0,
        ageData.age_60_plus || 0,
      ],
      statusDistribution: statusData,
      communityBreakdown: communityBreakdown.map((c) => ({
        id: c.id,
        name: c.name,
        total: c.total || 0,
        aspirant: c.aspirant || 0,
        postulant: c.postulant || 0,
        temporary: c.temporary || 0,
        perpetual: c.perpetual || 0,
        averageAge: Math.round(c.averageAge || 0),
      })),
      totalAspirant: stageTotals[0]?.aspirant || 0,
      totalPostulant: stageTotals[0]?.postulant || 0,
      totalTemporary: stageTotals[0]?.temporary || 0,
      totalPerpetual: stageTotals[0]?.perpetual || 0,
    });
  } catch (error) {
    console.error("getSisterReport error:", error.message);
    return res.status(500).json({ message: "Failed to fetch sister report" });
  }
};

// ============================================
// JOURNEY REPORT
// ============================================

const getJourneyReport = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    // Stage distribution
    const stageRows = await VocationJourneyModel.executeQuery(`
      SELECT stage, COUNT(*) as total
      FROM vocation_journey vj
      INNER JOIN (
        SELECT sister_id, MAX(start_date) as max_date
        FROM vocation_journey GROUP BY sister_id
      ) latest ON vj.sister_id = latest.sister_id AND vj.start_date = latest.max_date
      GROUP BY stage
      ORDER BY FIELD(stage, 'inquiry', 'aspirant', 'postulant', 'novice', 'temporary_vows', 'perpetual_vows')
    `);

    // Monthly transitions
    const transitionRows = await VocationJourneyModel.executeQuery(`
      SELECT 
        MONTH(start_date) as month,
        stage,
        COUNT(*) as total
      FROM vocation_journey
      WHERE YEAR(start_date) = YEAR(CURDATE())
      GROUP BY MONTH(start_date), stage
      ORDER BY month
    `);

    // Prepare monthly data
    const months = Array(12).fill(0);
    const aspirantProgress = [...months];
    const postulantProgress = [...months];
    const temporaryProgress = [...months];

    transitionRows.forEach((row) => {
      const monthIndex = row.month - 1;
      if (row.stage === "aspirant") aspirantProgress[monthIndex] = row.total;
      else if (row.stage === "postulant")
        postulantProgress[monthIndex] = row.total;
      else if (row.stage === "temporary_vows")
        temporaryProgress[monthIndex] = row.total;
    });

    // Prepare stage distribution [Dự tu, Tập sinh, Khấn tạm, Khấn trọn]
    const stageMap = {
      aspirant: 0,
      postulant: 1,
      temporary_vows: 2,
      perpetual_vows: 3,
    };
    const stageDistribution = [0, 0, 0, 0];
    stageRows.forEach((row) => {
      if (stageMap[row.stage] !== undefined) {
        stageDistribution[stageMap[row.stage]] = row.total;
      }
    });

    // Average duration per stage
    const durationRows = await VocationJourneyModel.executeQuery(`
      SELECT 
        stage,
        AVG(DATEDIFF(COALESCE(end_date, CURDATE()), start_date)) as avg_days
      FROM vocation_journey
      WHERE start_date IS NOT NULL
      GROUP BY stage
    `);

    // Recent transitions
    const recentTransitions = await VocationJourneyModel.executeQuery(`
      SELECT 
        vj.id, vj.stage, vj.start_date,
        s.birth_name, s.code as sister_code
      FROM vocation_journey vj
      JOIN sisters s ON s.id = vj.sister_id
      ORDER BY vj.start_date DESC
      LIMIT 10
    `);

    return res.status(200).json({
      totalInJourney: stageRows.reduce((sum, r) => sum + r.total, 0),
      stageDistribution,
      aspirantProgress,
      postulantProgress,
      temporaryProgress,
      stageBreakdown: stageRows.map((row) => ({
        stage: row.stage,
        count: row.total,
        percentage: 0, // Will be calculated on frontend
      })),
      averageDuration: durationRows.map((row) => ({
        stage: row.stage,
        days: Math.round(row.avg_days || 0),
      })),
      recentTransitions: recentTransitions.map((t) => ({
        id: t.id,
        sisterName: t.birth_name,
        sisterCode: t.sister_code,
        stage: t.stage,
        date: t.start_date,
      })),
    });
  } catch (error) {
    console.error("getJourneyReport error:", error.message);
    return res.status(500).json({ message: "Failed to fetch journey report" });
  }
};

// ============================================
// HEALTH REPORT
// ============================================

const fetchHealthStats = async () => {
  try {
    const rows = await SisterModel.executeQuery(`
      SELECT 
        hr.health_status,
        COUNT(*) as total
      FROM health_records hr
      INNER JOIN (
        SELECT sister_id, MAX(check_date) as max_date
        FROM health_records GROUP BY sister_id
      ) latest ON hr.sister_id = latest.sister_id AND hr.check_date = latest.max_date
      GROUP BY hr.health_status
    `);

    const statusMap = { good: 0, fair: 1, moderate: 2, poor: 3 };
    const byStatus = [0, 0, 0, 0];
    rows.forEach((row) => {
      if (statusMap[row.health_status] !== undefined) {
        byStatus[statusMap[row.health_status]] = row.total;
      }
    });

    return { byStatus, rows };
  } catch (error) {
    return { byStatus: [0, 0, 0, 0], rows: [] };
  }
};

const getHealthReport = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    // Health status distribution
    const healthStats = await fetchHealthStats();

    // Total checkups this year
    const checkupRows = await SisterModel.executeQuery(`
      SELECT COUNT(*) as total FROM health_records
      WHERE YEAR(check_date) = YEAR(CURDATE())
    `);

    // Sisters needing monitoring (poor or moderate health)
    const monitoringRows = await SisterModel.executeQuery(`
      SELECT COUNT(DISTINCT hr.sister_id) as total
      FROM health_records hr
      INNER JOIN (
        SELECT sister_id, MAX(check_date) as max_date
        FROM health_records GROUP BY sister_id
      ) latest ON hr.sister_id = latest.sister_id AND hr.check_date = latest.max_date
      WHERE hr.health_status IN ('poor', 'moderate')
    `);

    // Common conditions/diseases
    const conditionRows = await SisterModel.executeQuery(`
      SELECT 
        diagnosis as name,
        COUNT(*) as count
      FROM health_records
      WHERE diagnosis IS NOT NULL AND diagnosis != ''
      GROUP BY diagnosis
      ORDER BY count DESC
      LIMIT 10
    `);

    // Monthly checkup trend
    const monthlyCheckups = await SisterModel.executeQuery(`
      SELECT 
        MONTH(check_date) as month,
        COUNT(*) as total
      FROM health_records
      WHERE YEAR(check_date) = YEAR(CURDATE())
      GROUP BY MONTH(check_date)
      ORDER BY month
    `);

    // Sisters on leave/absence
    const absenceRows = await SisterModel.executeQuery(`
      SELECT COUNT(*) as total FROM departure_records
      WHERE return_date IS NULL OR return_date >= CURDATE()
    `);

    // Community health breakdown
    const communityHealth = await CommunityModel.executeQuery(`
      SELECT 
        c.id, c.name,
        COUNT(DISTINCT hr.sister_id) as totalChecked,
        SUM(CASE WHEN hr.health_status = 'good' THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN hr.health_status = 'fair' THEN 1 ELSE 0 END) as fair,
        SUM(CASE WHEN hr.health_status IN ('moderate', 'poor') THEN 1 ELSE 0 END) as needAttention
      FROM communities c
      LEFT JOIN community_assignments ca ON ca.community_id = c.id 
        AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      LEFT JOIN health_records hr ON hr.sister_id = ca.sister_id
      LEFT JOIN (
        SELECT sister_id, MAX(check_date) as max_date
        FROM health_records GROUP BY sister_id
      ) latest ON hr.sister_id = latest.sister_id AND hr.check_date = latest.max_date
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    const monthlyData = Array(12).fill(0);
    monthlyCheckups.forEach((row) => {
      monthlyData[row.month - 1] = row.total;
    });

    return res.status(200).json({
      healthStatus: healthStats.byStatus,
      excellentHealth: healthStats.byStatus[0] || 0,
      needMonitoring: monitoringRows[0]?.total || 0,
      totalCheckups: checkupRows[0]?.total || 0,
      onLeave: absenceRows[0]?.total || 0,
      commonDiseases: conditionRows,
      monthlyCheckups: monthlyData,
      communityHealth: communityHealth.map((c) => ({
        id: c.id,
        name: c.name,
        totalChecked: c.totalChecked || 0,
        good: c.good || 0,
        fair: c.fair || 0,
        needAttention: c.needAttention || 0,
      })),
    });
  } catch (error) {
    console.error("getHealthReport error:", error.message);
    return res.status(500).json({ message: "Failed to fetch health report" });
  }
};

// ============================================
// EVALUATION REPORT
// ============================================

const getEvaluationReport = async (req, res) => {
  try {
    if (!ensurePermission(req, res)) return;

    // Get evaluation model
    const EvaluationModel = require("../models/EvaluationModel");

    // Total evaluations
    const totalRows = await EvaluationModel.executeQuery(`
      SELECT COUNT(*) as total FROM evaluations
    `);

    // Average score - using legacy fields that exist in model
    const avgRows = await EvaluationModel.executeQuery(`
      SELECT AVG((spiritual_life_score + community_life_score + mission_score + personality_score + obedience_score) / 5) as avg_score 
      FROM evaluations
      WHERE spiritual_life_score IS NOT NULL
    `);

    // Monthly average scores
    const monthlyRows = await EvaluationModel.executeQuery(`
      SELECT 
        MONTH(COALESCE(evaluation_date, created_at)) as month,
        AVG((COALESCE(spiritual_life_score,0) + COALESCE(community_life_score,0) + COALESCE(mission_score,0) + COALESCE(personality_score,0) + COALESCE(obedience_score,0)) / 5) as avg_score
      FROM evaluations
      WHERE YEAR(COALESCE(evaluation_date, created_at)) = YEAR(CURDATE())
      GROUP BY MONTH(COALESCE(evaluation_date, created_at))
      ORDER BY month
    `);

    // Rating distribution based on average of 5 scores
    const ratingRows = await EvaluationModel.executeQuery(`
      SELECT 
        SUM(CASE WHEN avg_score >= 9 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN avg_score >= 7.5 AND avg_score < 9 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN avg_score >= 6 AND avg_score < 7.5 THEN 1 ELSE 0 END) as average,
        SUM(CASE WHEN avg_score < 6 THEN 1 ELSE 0 END) as poor
      FROM (
        SELECT (COALESCE(spiritual_life_score,0) + COALESCE(community_life_score,0) + COALESCE(mission_score,0) + COALESCE(personality_score,0) + COALESCE(obedience_score,0)) / 5 as avg_score
        FROM evaluations
        WHERE spiritual_life_score IS NOT NULL OR community_life_score IS NOT NULL
      ) scores
    `);

    // Category averages - using legacy fields
    const categoryRows = await EvaluationModel.executeQuery(`
      SELECT 
        AVG(spiritual_life_score) as spiritual,
        AVG(community_life_score) as community,
        AVG(mission_score) as mission,
        AVG(personality_score) as personality,
        AVG(obedience_score) as obedience
      FROM evaluations
    `);

    // Count all evaluations (no status column in legacy schema)
    const pendingRows = await EvaluationModel.executeQuery(`
      SELECT COUNT(*) as total FROM evaluations
      WHERE YEAR(COALESCE(evaluation_date, created_at)) = YEAR(CURDATE())
      AND MONTH(COALESCE(evaluation_date, created_at)) >= MONTH(CURDATE())
    `);

    // Community breakdown
    const communityEval = await CommunityModel.executeQuery(`
      SELECT 
        c.id, c.name,
        COUNT(e.id) as totalEvaluations,
        AVG((COALESCE(e.spiritual_life_score,0) + COALESCE(e.community_life_score,0) + COALESCE(e.mission_score,0) + COALESCE(e.personality_score,0) + COALESCE(e.obedience_score,0)) / 5) as avgScore,
        SUM(CASE WHEN (COALESCE(e.spiritual_life_score,0) + COALESCE(e.community_life_score,0) + COALESCE(e.mission_score,0) + COALESCE(e.personality_score,0) + COALESCE(e.obedience_score,0)) / 5 >= 7.5 THEN 1 ELSE 0 END) as goodCount
      FROM communities c
      LEFT JOIN community_assignments ca ON ca.community_id = c.id 
        AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      LEFT JOIN evaluations e ON e.sister_id = ca.sister_id
      GROUP BY c.id, c.name
      ORDER BY avgScore DESC
    `);

    const monthlyAverage = Array(12).fill(0);
    monthlyRows.forEach((row) => {
      monthlyAverage[row.month - 1] = Math.round((row.avg_score || 0) * 10); // Scale to 0-100
    });

    const rating = ratingRows[0] || {};
    const category = categoryRows[0] || {};

    return res.status(200).json({
      totalEvaluations: totalRows[0]?.total || 0,
      averageScore: Math.round((avgRows[0]?.avg_score || 0) * 10), // Scale to 0-100
      pendingEvaluations: pendingRows[0]?.total || 0,
      monthlyAverage,
      ratingDistribution: [
        rating.excellent || 0,
        rating.good || 0,
        rating.average || 0,
        rating.poor || 0,
      ],
      categoryAverage: [
        Math.round((category.spiritual || 0) * 10),
        Math.round((category.community || 0) * 10),
        Math.round((category.mission || 0) * 10),
        Math.round((category.personality || 0) * 10),
        Math.round((category.obedience || 0) * 10),
      ],
      communityBreakdown: communityEval.map((c) => ({
        id: c.id,
        name: c.name,
        totalEvaluations: c.totalEvaluations || 0,
        avgScore: Math.round((c.avgScore || 0) * 10),
        goodPercentage: c.totalEvaluations
          ? Math.round((c.goodCount / c.totalEvaluations) * 100)
          : 0,
      })),
    });
  } catch (error) {
    console.error("getEvaluationReport error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch evaluation report" });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const fetchRecentActivities = async () => {
  try {
    const rows = await AuditLogModel.executeQuery(`
      SELECT action, table_name, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);
    return rows;
  } catch (error) {
    return [];
  }
};

const fetchMonthlyGrowth = async () => {
  try {
    const rows = await SisterModel.executeQuery(`
      SELECT 
        MONTH(created_at) as month,
        COUNT(*) as total
      FROM sisters
      WHERE YEAR(created_at) = YEAR(CURDATE())
      GROUP BY MONTH(created_at)
      ORDER BY month
    `);

    const monthlyData = Array(12).fill(0);
    rows.forEach((row) => {
      monthlyData[row.month - 1] = row.total;
    });

    // Make cumulative
    for (let i = 1; i < 12; i++) {
      monthlyData[i] += monthlyData[i - 1];
    }

    return monthlyData;
  } catch (error) {
    return Array(12).fill(0);
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
  // New exports
  getDashboard,
  getStatistics,
  getSisterReport,
  getJourneyReport,
  getHealthReport,
  getEvaluationReport,
};
