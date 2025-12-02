const pool = require("../config/database");

const adminPasswordHash =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8czPz7YT6CX4hY0MQipoZf7cFTdO2W"; // bcrypt hash for "password"

const up = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO users (username, password, email, role, is_active)
       VALUES ('admin', ?, 'admin@example.com', 'admin', 1)
       ON DUPLICATE KEY UPDATE username = username;`,
      [adminPasswordHash]
    );

    await connection.query(
      `INSERT INTO communities (code, name, address)
       VALUES
         ('MH-001', 'Motherhouse Headquarters', '123 Main St, City'),
         ('EDU-001', 'St. Joseph Education Center', '45 School Ave, City')
       ON DUPLICATE KEY UPDATE code = code;`
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "DELETE FROM communities WHERE code IN ('MH-001','EDU-001');"
    );
    await connection.query("DELETE FROM users WHERE username = 'admin';");
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  name: "013_seed_initial_data",
  up,
  down,
};
