const BaseModel = require("./BaseModel");

class HealthRecordModel extends BaseModel {
  constructor() {
    super({ tableName: "health_records", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "general_health",
      "chronic_diseases",
      "work_limitations",
      "checkup_date",
      "checkup_place",
      "diagnosis",
      "treatment",
      "notes",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = ["sister_id", "general_health"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in HealthRecord model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for HealthRecord model.`);
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

  async findBySisterId(sisterId) {
    if (!sisterId) {
      throw new Error("findBySisterId requires a sister id.");
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ? ORDER BY checkup_date DESC`;
    return this.executeQuery(sql, [sisterId]);
  }

  async getLatestRecord(sisterId) {
    if (!sisterId) {
      throw new Error("getLatestRecord requires a sister id.");
    }

    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE sister_id = ?
      ORDER BY checkup_date DESC, id DESC
      LIMIT 1
    `;
    const rows = await this.executeQuery(sql, [sisterId]);
    return rows[0] || null;
  }
}

module.exports = new HealthRecordModel();
