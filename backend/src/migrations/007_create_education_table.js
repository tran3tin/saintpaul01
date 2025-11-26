const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS education (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    level ENUM('secondary','bachelor','master','doctorate') NOT NULL,
    major VARCHAR(150) NULL,
    institution VARCHAR(200) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    certificate_url VARCHAR(255) NULL,
    CONSTRAINT fk_education_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_education_level (level)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS education;";

module.exports = {
  name: "007_create_education_table",
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
