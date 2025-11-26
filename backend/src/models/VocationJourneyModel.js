const BaseModel = require("./BaseModel");

class VocationJourneyModel extends BaseModel {
  constructor() {
    super({ tableName: "vocation_journey", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "stage",
      "start_date",
      "end_date",
      "community_id",
      "supervisor_id",
      "notes",
    ];
    this.requiredFields = ["sister_id", "stage", "start_date"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(
          `Field ${key} is not allowed in VocationJourney model.`
        );
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(
            `Field ${field} is required for VocationJourney model.`
          );
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

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ? ORDER BY start_date ASC`;
    return this.executeQuery(sql, [sisterId]);
  }

  async getCurrentStage(sisterId) {
    if (!sisterId) {
      throw new Error("getCurrentStage requires a sister id.");
    }

    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE sister_id = ?
      ORDER BY COALESCE(end_date, '9999-12-31') DESC, start_date DESC
      LIMIT 1
    `;
    const rows = await this.executeQuery(sql, [sisterId]);
    return rows[0] || null;
  }

  async getTimeline(sisterId) {
    return this.findBySisterId(sisterId);
  }
}

module.exports = new VocationJourneyModel();
