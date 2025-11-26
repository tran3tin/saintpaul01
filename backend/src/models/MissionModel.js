const BaseModel = require("./BaseModel");

class MissionModel extends BaseModel {
  constructor() {
    super({ tableName: "missions", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "field",
      "specific_role",
      "start_date",
      "end_date",
      "notes",
    ];
    this.requiredFields = ["sister_id", "field", "start_date"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Missions model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Missions model.`);
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

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ? ORDER BY start_date DESC`;
    return this.executeQuery(sql, [sisterId]);
  }

  async findByField(field) {
    if (!field) {
      throw new Error("findByField requires a field name.");
    }

    return this.findAll({ field }, 500, 0);
  }

  async getCurrentMissions() {
    const sql = `
      SELECT mi.*, s.religious_name, s.birth_name
      FROM ${this.tableName} mi
      INNER JOIN sisters s ON s.id = mi.sister_id
      WHERE mi.end_date IS NULL OR mi.end_date >= CURDATE()
      ORDER BY mi.start_date DESC
    `;
    return this.executeQuery(sql, []);
  }
}

module.exports = new MissionModel();
