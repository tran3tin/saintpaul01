const BaseModel = require("./BaseModel");

class AuditLogModel extends BaseModel {
  constructor() {
    super({ tableName: "audit_logs", primaryKey: "id" });
    this.allowedFields = [
      "user_id",
      "action",
      "table_name",
      "record_id",
      "old_value",
      "new_value",
      "ip_address",
      "created_at",
    ];
    this.requiredFields = ["action", "table_name"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in AuditLogs model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for AuditLogs model.`);
        }
      });
    }

    return sanitized;
  }

  async create(data = {}) {
    const sanitized = this.validateData(data);
    return super.create(sanitized);
  }

  async update(id, data = {}) {
    const sanitized = this.validateData(data, { partial: true });
    return super.update(id, sanitized);
  }

  async findByUser(userId) {
    if (!userId) {
      throw new Error("findByUser requires a user id.");
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE user_id = ? ORDER BY created_at DESC`;
    return this.executeQuery(sql, [userId]);
  }

  async findByTable(tableName) {
    if (!tableName) {
      throw new Error("findByTable requires a table name.");
    }

    return this.findAll({ table_name: tableName }, 1000, 0);
  }

  async findByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error("findByDateRange requires both start and end dates.");
    }

    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `;
    return this.executeQuery(sql, [startDate, endDate]);
  }
}

module.exports = new AuditLogModel();
