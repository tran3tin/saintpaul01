const pool = require('../src/config/database');

async function addEducationColumns() {
  const connection = await pool.getConnection();
  try {
    const queries = [
      "ALTER TABLE education ADD COLUMN graduation_year INT NULL",
      "ALTER TABLE education ADD COLUMN status ENUM('dang_hoc', 'da_tot_nghiep', 'tam_nghi', 'da_nghi') DEFAULT 'dang_hoc'",
      "ALTER TABLE education ADD COLUMN gpa VARCHAR(20) NULL",
      "ALTER TABLE education ADD COLUMN thesis_title VARCHAR(500) NULL",
      "ALTER TABLE education ADD COLUMN notes TEXT NULL",
      "ALTER TABLE education ADD COLUMN documents JSON NULL"
    ];

    for (const query of queries) {
      try {
        await connection.query(query);
        console.log('Success:', query.substring(0, 60) + '...');
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists, skipping...');
        } else {
          console.error('Error:', e.message);
        }
      }
    }

    console.log('\nDone! Columns added to education table.');
  } finally {
    connection.release();
    process.exit(0);
  }
}

addEducationColumns();
