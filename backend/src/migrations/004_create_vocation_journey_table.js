const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS vocation_journey (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    stage ENUM('inquiry','postulant','aspirant','novice','temporary_vows','perpetual_vows','left') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    community_id INT UNSIGNED NULL,
    supervisor_id INT UNSIGNED NULL,
    notes TEXT NULL,
    CONSTRAINT fk_vocation_journey_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_vocation_journey_community FOREIGN KEY (community_id) REFERENCES communities(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_vocation_journey_supervisor FOREIGN KEY (supervisor_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_vocation_stage (stage),
    INDEX idx_vocation_sister (sister_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS vocation_journey;";

module.exports = {
  name: "004_create_vocation_journey_table",
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
