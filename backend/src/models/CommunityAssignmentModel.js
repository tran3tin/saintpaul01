const BaseModel = require("./BaseModel");

class CommunityAssignmentModel extends BaseModel {
  constructor() {
    super({ tableName: "community_assignments", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "community_id",
      "role",
      "start_date",
      "end_date",
      "decision_number",
      "decision_date",
      "decision_file_url",
      "notes",
    ];
    this.requiredFields = ["sister_id", "community_id", "role", "start_date"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(
          `Field ${key} is not allowed in CommunityAssignment model.`
        );
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(
            `Field ${field} is required for CommunityAssignment model.`
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

  async getCurrentAssignment(sisterId) {
    if (!sisterId) {
      throw new Error("getCurrentAssignment requires a sister id.");
    }

    const sql = `
      SELECT ca.*, c.name AS community_name
      FROM ${this.tableName} ca
      INNER JOIN communities c ON c.id = ca.community_id
      WHERE ca.sister_id = ?
        AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      ORDER BY ca.start_date DESC
      LIMIT 1
    `;
    const rows = await this.executeQuery(sql, [sisterId]);
    return rows[0] || null;
  }

  async getHistory(sisterId) {
    if (!sisterId) {
      throw new Error("getHistory requires a sister id.");
    }

    const sql = `
      SELECT ca.*, c.name AS community_name
      FROM ${this.tableName} ca
      INNER JOIN communities c ON c.id = ca.community_id
      WHERE ca.sister_id = ?
      ORDER BY ca.start_date DESC
    `;
    return this.executeQuery(sql, [sisterId]);
  }

  async findByCommunity(communityId) {
    if (!communityId) {
      throw new Error("findByCommunity requires a community id.");
    }

    const sql = `
      SELECT ca.*, s.religious_name, s.birth_name
      FROM ${this.tableName} ca
      INNER JOIN sisters s ON s.id = ca.sister_id
      WHERE ca.community_id = ?
      ORDER BY ca.start_date DESC
    `;
    return this.executeQuery(sql, [communityId]);
  }
}

module.exports = new CommunityAssignmentModel();
