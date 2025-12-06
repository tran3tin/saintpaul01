// Migration: Ensure departure_records has all required columns for Đi vắng features
// Run: node src/migrations/025_ensure_departure_records_columns.js

const pool = require("../config/database");

const columnsToAdd = [
  {
    name: "type",
    definition: "VARCHAR(50) NULL AFTER departure_date",
  },
  {
    name: "expected_return_date",
    definition: "DATE NULL AFTER type",
  },
  {
    name: "return_date",
    definition: "DATE NULL AFTER expected_return_date",
  },
  {
    name: "destination",
    definition: "VARCHAR(255) NULL AFTER return_date",
  },
  {
    name: "contact_phone",
    definition: "VARCHAR(50) NULL AFTER destination",
  },
  {
    name: "contact_address",
    definition: "TEXT NULL AFTER contact_phone",
  },
  {
    name: "approved_by",
    definition: "INT UNSIGNED NULL AFTER contact_address",
  },
  {
    name: "notes",
    definition: "TEXT NULL AFTER approved_by",
  },
  {
    name: "documents",
    definition: "JSON NULL AFTER notes",
  },
];

async function up() {
  const connection = await pool.getConnection();
  try {
    console.log("Checking departure_records columns...");

    const [rows] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'departure_records'`
    );
    const existing = rows.map((r) => r.COLUMN_NAME);

    for (const col of columnsToAdd) {
      if (!existing.includes(col.name)) {
        const sql = `ALTER TABLE departure_records ADD COLUMN ${col.definition}`;
        console.log(`Adding column ${col.name}...`);
        await connection.query(sql);
      }
    }

    // Ensure stage_at_departure allows NULL (older schema required NOT NULL)
    console.log("Ensuring stage_at_departure allows NULL...");
    await connection.query(
      `ALTER TABLE departure_records MODIFY COLUMN stage_at_departure ENUM('inquiry','postulant','aspirant','novice','temporary_vows','perpetual_vows','left') NULL`
    );

    console.log("Migration 025_ensure_departure_records_columns completed.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();
  try {
    console.log("Down migration: no columns dropped (safe migration).");
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  up()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { up, down };
