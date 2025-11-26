const BaseModel = require("./BaseModel");

class CommunityModel extends BaseModel {
  constructor() {
    super({ tableName: "communities", primaryKey: "id" });
    this.allowedFields = [
      "code",
      "name",
      "address",
      "type",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = ["code", "name", "type"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Communities model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Communities model.`);
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

  async findByType(type) {
    if (!type) {
      throw new Error("findByType requires a type value.");
    }
    return this.findAll({ type }, 1000, 0);
  }

  async getMembersList(communityId) {
    if (!communityId) {
      throw new Error("getMembersList requires a community id.");
    }

    const sql = `
      SELECT ca.*, s.birth_name, s.religious_name, s.code AS sister_code
      FROM community_assignments ca
      INNER JOIN sisters s ON s.id = ca.sister_id
      WHERE ca.community_id = ?
        AND (ca.end_date IS NULL OR ca.end_date >= CURDATE())
      ORDER BY ca.role ASC, ca.start_date DESC
    `;
    return this.executeQuery(sql, [communityId]);
  }
}

module.exports = new CommunityModel();
