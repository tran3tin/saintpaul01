const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS training_courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sister_id INT UNSIGNED NOT NULL,
    course_name VARCHAR(180) NOT NULL,
    organizer VARCHAR(180) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    content TEXT NULL,
    notes TEXT NULL,
    CONSTRAINT fk_training_courses_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_training_courses_sister (sister_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS training_courses;";

module.exports = {
  name: "008_create_training_courses_table",
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
