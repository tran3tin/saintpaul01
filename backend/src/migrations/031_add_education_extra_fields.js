const pool = require("../config/database");

const upQuery = `
  ALTER TABLE education
    ADD COLUMN graduation_year INT NULL AFTER end_date,
    ADD COLUMN status ENUM('dang_hoc', 'da_tot_nghiep', 'tam_nghi', 'da_nghi') DEFAULT 'dang_hoc' AFTER graduation_year,
    ADD COLUMN gpa VARCHAR(20) NULL AFTER status,
    ADD COLUMN thesis_title VARCHAR(500) NULL AFTER gpa,
    ADD COLUMN notes TEXT NULL AFTER thesis_title,
    ADD COLUMN documents JSON NULL AFTER notes;
`;

const downQuery = `
  ALTER TABLE education
    DROP COLUMN IF EXISTS graduation_year,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS gpa,
    DROP COLUMN IF EXISTS thesis_title,
    DROP COLUMN IF EXISTS notes,
    DROP COLUMN IF EXISTS documents;
`;

module.exports = {
  name: "031_add_education_extra_fields",
  up: async () => {
    const connection = await pool.getConnection();
    try {
      await connection.query(upQuery);
      console.log("Added extra fields to education table");
    } catch (error) {
      // Nếu column đã tồn tại thì bỏ qua
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("Some columns already exist, skipping...");
      } else {
        throw error;
      }
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
