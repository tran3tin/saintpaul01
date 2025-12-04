const BaseModel = require("./BaseModel");

class EducationModel extends BaseModel {
  constructor() {
    super({ tableName: "education", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "level",
      "major",
      "institution",
      "start_date",
      "end_date",
      "graduation_year",
      "status",
      "gpa",
      "thesis_title",
      "notes",
      "documents",
      "certificate_url",
    ];
    this.requiredFields = ["sister_id", "level"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Education model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Education model.`);
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

  async findByLevel(level) {
    if (!level) {
      throw new Error("findByLevel requires an education level.");
    }

    return this.findAll({ level }, 500, 0);
  }
}

module.exports = new EducationModel();
