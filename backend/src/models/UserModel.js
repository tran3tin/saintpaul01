const BaseModel = require("./BaseModel");

class UserModel extends BaseModel {
  constructor() {
    super({ tableName: "users", primaryKey: "id" });
    this.allowedFields = [
      "username",
      "password",
      "email",
      "full_name",
      "phone",
      "avatar",
      "is_admin",
      "last_login",
      "is_active",
      "created_at",
      "updated_at",
    ];
    this.requiredFields = ["username", "password", "email"];
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

  /**
   * Check if user is admin
   */
  async isAdmin(userId) {
    if (!userId) return false;
    const sql = `SELECT is_admin FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
    const rows = await this.executeQuery(sql, [userId]);
    return rows.length > 0 && rows[0].is_admin === 1;
  }

  /**
   * Get user permissions (admin gets all)
   */
  async getPermissions(userId) {
    if (!userId) return [];

    // Check if admin first
    const isAdmin = await this.isAdmin(userId);

    if (isAdmin) {
      // Admin has all permissions
      const sql = "SELECT * FROM permissions WHERE is_active = 1";
      return await this.executeQuery(sql);
    }

    // Regular user - get assigned permissions
    const sql = `
      SELECT p.*
      FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ? AND p.is_active = 1
    `;

    return await this.executeQuery(sql, [userId]);
  }

  /**
   * Assign permissions to user
   */
  async assignPermissions(userId, permissionIds, grantedBy) {
    // Get connection for transaction
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Remove old permissions
      await connection.execute(
        "DELETE FROM user_permissions WHERE user_id = ?",
        [userId]
      );

      // Add new permissions
      if (permissionIds && permissionIds.length > 0) {
        const values = permissionIds.map((permId) => [
          userId,
          permId,
          grantedBy,
        ]);
        await connection.query(
          "INSERT INTO user_permissions (user_id, permission_id, granted_by) VALUES ?",
          [values]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if user can be deleted
   */
  async canDelete(userId) {
    const isAdmin = await this.isAdmin(userId);
    if (isAdmin) {
      return { canDelete: false, reason: "Không thể xóa tài khoản admin" };
    }
    return { canDelete: true };
  }

  /**
   * Get user with permissions
   */
  async findByIdWithPermissions(userId) {
    const user = await this.findById(userId);
    if (!user) return null;

    const permissions = await this.getPermissions(userId);
    return {
      ...user,
      permissions: permissions.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
      })),
    };
  }
}

module.exports = new UserModel();
