const BaseModel = require("./BaseModel");

class TrainingCourseModel extends BaseModel {
  constructor() {
    super({ tableName: "training_courses", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "course_name",
      "organizer",
      "start_date",
      "end_date",
      "content",
      "notes",
    ];
    this.requiredFields = ["sister_id", "course_name"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in TrainingCourse model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(
            `Field ${field} is required for TrainingCourse model.`
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

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ? ORDER BY start_date DESC`;
    return this.executeQuery(sql, [sisterId]);
  }

  async findByYear(year) {
    if (!year || Number.isNaN(Number(year))) {
      throw new Error("findByYear requires a valid year.");
    }

    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE YEAR(start_date) = ? OR YEAR(end_date) = ?
      ORDER BY start_date DESC
    `;
    return this.executeQuery(sql, [year, year]);
  }
}

module.exports = new TrainingCourseModel();
