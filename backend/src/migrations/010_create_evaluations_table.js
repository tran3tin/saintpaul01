const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS evaluations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    evaluation_period VARCHAR(50) NOT NULL,
    evaluator_id INT UNSIGNED NULL,
    spiritual_life_score TINYINT UNSIGNED NULL,
    community_life_score TINYINT UNSIGNED NULL,
    mission_score TINYINT UNSIGNED NULL,
    personality_score TINYINT UNSIGNED NULL,
    obedience_score TINYINT UNSIGNED NULL,
    general_comments TEXT NULL,
    recommendations TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluations_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evaluations_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_evaluations_period (evaluation_period)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS evaluations;";

module.exports = {
  name: "010_create_evaluations_table",
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
