const BaseModel = require("./BaseModel");

class DepartureRecordModel extends BaseModel {
  constructor() {
    super({ tableName: "departure_records", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "departure_date",
      "stage_at_departure",
      "type",
      "expected_return_date",
      "return_date",
      "destination",
      "reason",
      "contact_phone",
      "contact_address",
      "approved_by",
      "notes",
      "support_notes",
      "documents",
    ];
    this.requiredFields = ["sister_id", "departure_date"];
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

  async findAll({ page = 1, limit = 10, search = "", sister_id = null } = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (sister_id) {
      whereClauses.push("d.sister_id = ?");
      params.push(sister_id);
    }

    if (search) {
      whereClauses.push(
        "(s.saint_name LIKE ? OR s.birth_name LIKE ? OR d.destination LIKE ? OR d.reason LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSQL = `
      SELECT COUNT(*) as total 
      FROM ${this.tableName} d
      LEFT JOIN sisters s ON d.sister_id = s.id
      ${whereSQL}
    `;
    const countResult = await this.executeQuery(countSQL, params);
    const total = countResult[0]?.total || 0;

    const dataSQL = `
      SELECT d.*, 
             s.saint_name, s.birth_name, s.code as sister_code
      FROM ${this.tableName} d
      LEFT JOIN sisters s ON d.sister_id = s.id
      ${whereSQL}
      ORDER BY d.departure_date DESC
      LIMIT ? OFFSET ?
    `;
    const items = await this.executeQuery(dataSQL, [...params, limit, offset]);
    return { items, total, page, limit };
  }
}

module.exports = new DepartureRecordModel();
