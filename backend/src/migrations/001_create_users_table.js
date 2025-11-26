const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role ENUM('admin','superior_general','superior_provincial','superior_community','secretary','viewer') NOT NULL DEFAULT 'viewer',
    last_login DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS users;";

module.exports = {
  name: "001_create_users_table",
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
