const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS missions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    field ENUM('education','pastoral','publishing','media','healthcare','social') NOT NULL,
    specific_role VARCHAR(150) NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    notes TEXT NULL,
    CONSTRAINT fk_missions_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_missions_field (field),
    INDEX idx_missions_sister (sister_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS missions;";

module.exports = {
  name: "006_create_missions_table",
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
