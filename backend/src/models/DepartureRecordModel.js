const BaseModel = require("./BaseModel");

class DepartureRecordModel extends BaseModel {
  constructor() {
    super({ tableName: "departure_records", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "departure_date",
      "stage_at_departure",
      "reason",
      "support_notes",
    ];
    this.requiredFields = ["sister_id", "departure_date", "stage_at_departure"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(
          `Field ${key} is not allowed in DepartureRecords model.`
        );
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(
            `Field ${field} is required for DepartureRecords model.`
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

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ?`;
    return this.executeQuery(sql, [sisterId]);
  }

  async getStatistics() {
    const [byStage, totals] = await Promise.all([
      this.executeQuery(
        `SELECT stage_at_departure, COUNT(*) AS total
         FROM ${this.tableName}
         GROUP BY stage_at_departure`
      ),
      this.executeQuery(`SELECT COUNT(*) AS total FROM ${this.tableName}`),
    ]);

    return {
      total: totals[0] ? totals[0].total : 0,
      byStage,
    };
  }
}

module.exports = new DepartureRecordModel();
