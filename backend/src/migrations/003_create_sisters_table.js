const pool = require("../config/database");

const upQuery = `
  CREATE TABLE IF NOT EXISTS sisters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    birth_name VARCHAR(120) NOT NULL,
    religious_name VARCHAR(120) NOT NULL,
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(150) NULL,
    nationality VARCHAR(80) NULL,
    father_name VARCHAR(120) NULL,
    mother_name VARCHAR(120) NULL,
    family_religion VARCHAR(80) NULL,
    baptism_date DATE NULL,
    baptism_place VARCHAR(150) NULL,
    confirmation_date DATE NULL,
    first_communion_date DATE NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(120) NULL,
    emergency_contact_name VARCHAR(120) NULL,
    emergency_contact_phone VARCHAR(30) NULL,
    photo_url VARCHAR(255) NULL,
    status ENUM('active','left') NOT NULL DEFAULT 'active',
    created_by INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sisters_created_by FOREIGN KEY (created_by) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_sisters_status (status),
    INDEX idx_sisters_dob (date_of_birth)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

const downQuery = "DROP TABLE IF EXISTS sisters;";

module.exports = {
  name: "003_create_sisters_table",
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
