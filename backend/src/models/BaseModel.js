const pool = require("../config/database");

class BaseModel {
  constructor({ tableName, primaryKey = "id", softDeleteColumn = null } = {}) {
    if (!tableName) {
      throw new Error("BaseModel requires a tableName.");
    }

    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.softDeleteColumn = softDeleteColumn;
    this.pool = pool; // Make pool accessible to child classes
  }

  buildWhereClause(conditions = {}, includeSoftDeleteFilter = true) {
    const clauses = [];
    const params = [];

    Object.entries(conditions || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        clauses.push(`${key} IN (${value.map(() => "?").join(", ")})`);
        params.push(...value);
      } else {
        clauses.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (includeSoftDeleteFilter && this.softDeleteColumn) {
      clauses.push(`${this.softDeleteColumn} IS NULL`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

    return { where, params };
  }

  async findAll(conditions = {}, limit = 50, offset = 0) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 50;
    const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    const { where, params } = this.buildWhereClause(conditions, true);
    const sql = `SELECT * FROM ${this.tableName} ${where} LIMIT ? OFFSET ?`;
    return this.executeQuery(sql, [...params, safeLimit, safeOffset]);
  }

  async findById(id) {
    if (id === undefined || id === null) {
      throw new Error("findById requires an id.");
    }

    const clauses = [`${this.primaryKey} = ?`];
    const params = [id];

    if (this.softDeleteColumn) {
      clauses.push(`${this.softDeleteColumn} IS NULL`);
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE ${clauses.join(
      " AND "
    )} LIMIT 1`;
    const rows = await this.executeQuery(sql, params);
    return rows[0] || null;
  }

  async create(data = {}) {
    const fields = Object.keys(data);
    if (!fields.length) {
      throw new Error("create requires a data object with at least one field.");
    }

    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((field) => data[field]);
    const sql = `INSERT INTO ${this.tableName} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;
    const result = await this.executeQuery(sql, values);
    return this.findById(result.insertId);
  }

  async update(id, data = {}) {
    if (id === undefined || id === null) {
      throw new Error("update requires an id.");
    }

    const fields = Object.keys(data);
    if (!fields.length) {
      throw new Error("update requires a data object with at least one field.");
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    const clauses = [`${this.primaryKey} = ?`];

    if (this.softDeleteColumn) {
      clauses.push(`${this.softDeleteColumn} IS NULL`);
    }

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${clauses.join(
      " AND "
    )}`;
    await this.executeQuery(sql, [...values, id]);
    return this.findById(id);
  }

  async delete(id) {
    if (id === undefined || id === null) {
      throw new Error("delete requires an id.");
    }

    if (this.softDeleteColumn) {
      const sql = `UPDATE ${this.tableName} SET ${this.softDeleteColumn} = ? WHERE ${this.primaryKey} = ? AND ${this.softDeleteColumn} IS NULL`;
      const result = await this.executeQuery(sql, [new Date(), id]);
      return result.affectedRows > 0;
    }

    const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const result = await this.executeQuery(sql, [id]);
    return result.affectedRows > 0;
  }

  async executeQuery(sql, params = []) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error(`[${this.tableName}] Query failed: ${error.message}`);
      console.error(`[${this.tableName}] SQL: ${sql}`);
      console.error(`[${this.tableName}] Params: ${JSON.stringify(params)}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = BaseModel;
