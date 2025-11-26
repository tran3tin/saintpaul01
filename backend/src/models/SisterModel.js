const BaseModel = require("./BaseModel");

class SisterModel extends BaseModel {
  constructor() {
    super({ tableName: "sisters", primaryKey: "id" });
    this.allowedFields = [
      "code",
      "birth_name",
      "religious_name",
      "saint_name",
      "prefer_name",
      "date_of_birth",
      "place_of_birth",
      "hometown",
      "permanent_address",
      "nationality",
      "id_number",
      "father_name",
      "mother_name",
      "family_religion",
      "baptism_date",
      "baptism_place",
      "confirmation_date",
      "first_communion_date",
      "phone",
      "email",
      "emergency_contact_name",
      "emergency_contact_phone",
      "photo_url",
      "documents_url",
      "notes",
      "status",
      "created_by",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = [
      "code",
      "birth_name",
      "religious_name",
      "date_of_birth",
    ];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Sisters model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Sisters model.`);
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

  async findByCode(code) {
    if (!code) {
      throw new Error("findByCode requires a code value.");
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE code = ? LIMIT 1`;
    const rows = await this.executeQuery(sql, [code]);
    return rows[0] || null;
  }

  async searchByName(keyword = "") {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return [];
    }

    const like = `%${trimmed}%`;
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE (birth_name LIKE ? OR religious_name LIKE ?)
    `;
    return this.executeQuery(sql, [like, like]);
  }

  async filterByStatus(status) {
    if (!status) {
      return this.findAll();
    }
    return this.findAll({ status });
  }

  async filterByAge(minAge, maxAge) {
    const clauses = [];
    const params = [];

    if (typeof minAge === "number") {
      clauses.push("TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= ?");
      params.push(minAge);
    }

    if (typeof maxAge === "number") {
      clauses.push("TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) <= ?");
      params.push(maxAge);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT * FROM ${this.tableName} ${whereClause}`;
    return this.executeQuery(sql, params);
  }

  async getFullProfile(id) {
    const sister = await this.findById(id);
    if (!sister) {
      return null;
    }

    const [
      vocationJourney,
      communityAssignments,
      missions,
      education,
      trainingCourses,
      healthRecords,
      evaluations,
      departureRecords,
    ] = await Promise.all([
      this.executeQuery(
        `SELECT vj.*, c.name AS community_name, u.username AS supervisor_name
         FROM vocation_journey vj
         LEFT JOIN communities c ON c.id = vj.community_id
         LEFT JOIN users u ON u.id = vj.supervisor_id
         WHERE vj.sister_id = ?
         ORDER BY vj.start_date ASC`,
        [id]
      ),
      this.executeQuery(
        `SELECT ca.*, c.name AS community_name
         FROM community_assignments ca
         INNER JOIN communities c ON c.id = ca.community_id
         WHERE ca.sister_id = ?
         ORDER BY ca.start_date DESC`,
        [id]
      ),
      this.executeQuery(
        `SELECT * FROM missions WHERE sister_id = ? ORDER BY start_date DESC`,
        [id]
      ),
      this.executeQuery(
        `SELECT * FROM education WHERE sister_id = ? ORDER BY start_date DESC`,
        [id]
      ),
      this.executeQuery(
        `SELECT * FROM training_courses WHERE sister_id = ? ORDER BY start_date DESC`,
        [id]
      ),
      this.executeQuery(
        `SELECT * FROM health_records WHERE sister_id = ? ORDER BY checkup_date DESC`,
        [id]
      ),
      this.executeQuery(
        `SELECT ev.*, u.username AS evaluator_name
         FROM evaluations ev
         LEFT JOIN users u ON u.id = ev.evaluator_id
         WHERE ev.sister_id = ?
         ORDER BY ev.created_at DESC`,
        [id]
      ),
      this.executeQuery(`SELECT * FROM departure_records WHERE sister_id = ?`, [
        id,
      ]),
    ]);

    return {
      ...sister,
      vocationJourney,
      communityAssignments,
      missions,
      education,
      trainingCourses,
      healthRecords,
      evaluations,
      departureRecords,
    };
  }

  async updatePhoto(id, photoUrl) {
    if (!photoUrl) {
      throw new Error("updatePhoto requires a photoUrl.");
    }
    return this.update(id, { photo_url: photoUrl });
  }
}

module.exports = new SisterModel();
