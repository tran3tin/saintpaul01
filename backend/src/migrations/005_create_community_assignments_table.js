const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS community_assignments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    community_id INT UNSIGNED NOT NULL,
    role ENUM('superior','deputy','treasurer','member') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    decision_number VARCHAR(50) NULL,
    decision_date DATE NULL,
    decision_file_url VARCHAR(255) NULL,
    notes TEXT NULL,
    CONSTRAINT fk_assignments_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_assignments_community FOREIGN KEY (community_id) REFERENCES communities(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_assignments_role (role),
    INDEX idx_assignments_sister (sister_id),
    INDEX idx_assignments_community (community_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS community_assignments;";

module.exports = {
  name: "005_create_community_assignments_table",
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
