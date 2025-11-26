const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS departure_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    departure_date DATE NOT NULL,
    stage_at_departure ENUM('inquiry','postulant','aspirant','novice','temporary_vows','perpetual_vows','left') NOT NULL,
    reason TEXT NULL,
    support_notes TEXT NULL,
    CONSTRAINT fk_departure_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_departure_date (departure_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS departure_records;";

module.exports = {
  name: "011_create_departure_records_table",
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
