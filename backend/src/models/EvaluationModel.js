const BaseModel = require("./BaseModel");

class EvaluationModel extends BaseModel {
  constructor() {
    super({ tableName: "evaluations", primaryKey: "id" });
    this.allowedFields = [
      "sister_id",
      "evaluation_period",
      "evaluator_id",
      "spiritual_life_score",
      "community_life_score",
      "mission_score",
      "personality_score",
      "obedience_score",
      "general_comments",
      "recommendations",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = ["sister_id", "evaluation_period"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Evaluations model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Evaluations model.`);
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

    const sql = `SELECT * FROM ${this.tableName} WHERE sister_id = ? ORDER BY created_at DESC`;
    return this.executeQuery(sql, [sisterId]);
  }

  async findByPeriod(evaluationPeriod) {
    if (!evaluationPeriod) {
      throw new Error("findByPeriod requires an evaluation period.");
    }

    return this.findAll({ evaluation_period: evaluationPeriod }, 500, 0);
  }

  async getAverageScores(sisterId) {
    if (!sisterId) {
      throw new Error("getAverageScores requires a sister id.");
    }

    const sql = `
      SELECT
        AVG(spiritual_life_score) AS spiritual_life_score,
        AVG(community_life_score) AS community_life_score,
        AVG(mission_score) AS mission_score,
        AVG(personality_score) AS personality_score,
        AVG(obedience_score) AS obedience_score
      FROM ${this.tableName}
      WHERE sister_id = ?
    `;
    const rows = await this.executeQuery(sql, [sisterId]);
    return rows[0] || null;
  }
}

module.exports = new EvaluationModel();
