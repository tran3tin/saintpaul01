const BaseModel = require("./BaseModel");

class UserModel extends BaseModel {
  constructor() {
    super({ tableName: "users", primaryKey: "id" });
    this.allowedFields = [
      "username",
      "password",
      "email",
      "role",
      "last_login",
      "is_active",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = ["username", "password", "email", "role"];
  }

  validateData(data = {}, { partial = false } = {}) {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!this.allowedFields.includes(key)) {
        throw new Error(`Field ${key} is not allowed in Users model.`);
      }
      sanitized[key] = value;
    });

    if (!partial) {
      this.requiredFields.forEach((field) => {
        if (sanitized[field] === undefined || sanitized[field] === null) {
          throw new Error(`Field ${field} is required for Users model.`);
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

  async findByUsername(username) {
    if (!username) {
      throw new Error("findByUsername requires a username value.");
    }

    const sql = `SELECT * FROM ${this.tableName} WHERE username = ? LIMIT 1`;
    const rows = await this.executeQuery(sql, [username]);
    return rows[0] || null;
  }

  async updatePassword(id, hashedPassword) {
    if (!hashedPassword) {
      throw new Error("updatePassword requires a hashed password.");
    }
    return this.update(id, { password: hashedPassword });
  }

  async updateLastLogin(id) {
    if (!id) {
      throw new Error("updateLastLogin requires a user id.");
    }

    const now = new Date();
    await this.executeQuery(
      `UPDATE ${this.tableName} SET last_login = ? WHERE ${this.primaryKey} = ?`,
      [now, id]
    );
    return this.findById(id);
  }
}

module.exports = new UserModel();
