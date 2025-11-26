const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS audit_logs;";

module.exports = {
  name: "012_create_audit_logs_table",
  up: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.query(upQuery);
    } finally {
      connection.release();
    }
  },
  down: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.query(downQuery);
    } finally {
      connection.release();
    }
  },
};
