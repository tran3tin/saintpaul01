const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS health_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    general_health ENUM('good','average','weak') NOT NULL,
    chronic_diseases TEXT NULL,
    work_limitations TEXT NULL,
    checkup_date DATE NULL,
    checkup_place VARCHAR(150) NULL,
    diagnosis TEXT NULL,
    treatment TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_records_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_health_sister (sister_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS health_records;";

module.exports = {
  name: "009_create_health_records_table",
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
