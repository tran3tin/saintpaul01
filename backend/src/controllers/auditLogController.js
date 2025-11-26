const AuditLogModel = require("../models/AuditLogModel");

const privilegedRoles = ["admin", "superior_general"];

const ensurePrivileged = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (!privilegedRoles.includes(req.user.role)) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }

  return true;
};

const parsePagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const buildFilters = ({
  userId,
  tableName,
  action,
  startDate,
  endDate,
  recordId,
}) => {
  const clauses = [];
  const params = [];

  if (userId) {
    clauses.push("al.user_id = ?");
    params.push(userId);
  }

  if (tableName) {
    clauses.push("al.table_name = ?");
    params.push(tableName);
  }

  if (action) {
    clauses.push("al.action = ?");
    params.push(action);
  }

  if (recordId) {
    clauses.push("al.record_id = ?");
    params.push(recordId);
  }

  if (startDate) {
    clauses.push("al.created_at >= ?");
    params.push(startDate);
  }

  if (endDate) {
    clauses.push("al.created_at <= ?");
    params.push(endDate);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return { whereClause, params };
};

const queryAuditLogs = async ({ filters = {}, limit = 25, offset = 0 }) => {
  const { whereClause, params } = buildFilters(filters);

  const totalRows = await AuditLogModel.executeQuery(
    `SELECT COUNT(*) AS total FROM audit_logs al ${whereClause}`,
    params
  );
  const total = totalRows[0] ? Number(totalRows[0].total || 0) : 0;

  const rows = await AuditLogModel.executeQuery(
    `SELECT al.*, u.username
     FROM audit_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { total, rows };
};

const getAuditLogs = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) {
      return;
    }

    const { page, limit, offset } = parsePagination(req);
    const { user, table, action, startDate, endDate } = req.query;

    const { total, rows } = await queryAuditLogs({
      filters: {
        userId: user,
        tableName: table,
        action,
        startDate,
        endDate,
      },
      limit,
      offset,
    });

    return res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("getAuditLogs error:", error.message);
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

const getAuditLogsByUser = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) {
      return;
    }

    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const { page, limit, offset } = parsePagination(req);
    const { total, rows } = await queryAuditLogs({
      filters: { userId },
      limit,
      offset,
    });

    return res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("getAuditLogsByUser error:", error.message);
    return res.status(500).json({ message: "Failed to fetch user audit logs" });
  }
};

const getAuditLogsByTable = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) {
      return;
    }

    const { tableName } = req.params;
    if (!tableName) {
      return res.status(400).json({ message: "tableName is required" });
    }

    const { page, limit, offset } = parsePagination(req);
    const { total, rows } = await queryAuditLogs({
      filters: { tableName },
      limit,
      offset,
    });

    return res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("getAuditLogsByTable error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch table audit logs" });
  }
};

const getAuditLogsByRecord = async (req, res) => {
  try {
    if (!ensurePrivileged(req, res)) {
      return;
    }

    const { tableName, recordId } = req.params;
    if (!tableName || !recordId) {
      return res
        .status(400)
        .json({ message: "tableName and recordId are required" });
    }

    const { page, limit, offset } = parsePagination(req);
    const { total, rows } = await queryAuditLogs({
      filters: { tableName, recordId },
      limit,
      offset,
    });

    return res.status(200).json({
      data: rows,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    console.error("getAuditLogsByRecord error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch record audit logs" });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByTable,
  getAuditLogsByRecord,
};
