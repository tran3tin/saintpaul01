/**
 * Migration: Add new fields to sisters table
 * - saint_name (tên thánh)
 * - prefer_name (tên thường gọi)
 * - permanent_address (địa chỉ thường trú)
 * - id_number (CCCD/Passport)
 * - hometown (nguyên quán)
 * - notes (ghi chú khác)
 * - documents_url (upload giấy tờ - JSON array)
 */

const pool = require("../config/database");

async function up() {
  const connection = await pool.getConnection();
  try {
    console.log("Adding new fields to sisters table...");

    // Check if columns already exist
    const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'sisters'
        `);

    const existingColumns = columns.map((col) => col.COLUMN_NAME);

    // Add saint_name column
    if (!existingColumns.includes("saint_name")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN saint_name VARCHAR(120) NULL 
                AFTER code
            `);
      console.log("Added column: saint_name");
    }

    // Add prefer_name column
    if (!existingColumns.includes("prefer_name")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN prefer_name VARCHAR(120) NULL 
                AFTER religious_name
            `);
      console.log("Added column: prefer_name");
    }

    // Add hometown column (nguyên quán)
    if (!existingColumns.includes("hometown")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN hometown VARCHAR(200) NULL 
                AFTER place_of_birth
            `);
      console.log("Added column: hometown");
    }

    // Add permanent_address column
    if (!existingColumns.includes("permanent_address")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN permanent_address VARCHAR(255) NULL 
                AFTER hometown
            `);
      console.log("Added column: permanent_address");
    }

    // Add id_number column (CCCD/Passport)
    if (!existingColumns.includes("id_number")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN id_number VARCHAR(50) NULL 
                AFTER permanent_address
            `);
      console.log("Added column: id_number");
    }

    // Add notes column
    if (!existingColumns.includes("notes")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN notes TEXT NULL 
                AFTER emergency_contact_phone
            `);
      console.log("Added column: notes");
    }

    // Add documents_url column (JSON array for multiple files)
    if (!existingColumns.includes("documents_url")) {
      await connection.query(`
                ALTER TABLE sisters 
                ADD COLUMN documents_url JSON NULL 
                AFTER photo_url
            `);
      console.log("Added column: documents_url");
    }

    // Modify status ENUM to include more options
    await connection.query(`
            ALTER TABLE sisters 
            MODIFY COLUMN status ENUM('active', 'left', 'deceased', 'transferred') NOT NULL DEFAULT 'active'
        `);
    console.log("Modified column: status (added more options)");

    console.log("Migration 014_add_sister_fields completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function down() {
  const connection = await pool.getConnection();
  try {
    console.log("Reverting migration 014_add_sister_fields...");

    // Drop added columns
    const columnsToRemove = [
      "saint_name",
      "prefer_name",
      "permanent_address",
      "id_number",
      "hometown",
      "notes",
      "documents_url",
    ];

    for (const column of columnsToRemove) {
      try {
        await connection.query(`ALTER TABLE sisters DROP COLUMN ${column}`);
        console.log(`Dropped column: ${column}`);
      } catch (err) {
        console.log(`Column ${column} does not exist or could not be dropped`);
      }
    }

    // Revert status ENUM
    await connection.query(`
            ALTER TABLE sisters 
            MODIFY COLUMN status ENUM('active', 'left') NOT NULL DEFAULT 'active'
        `);

    console.log("Migration 014_add_sister_fields reverted successfully!");
  } catch (error) {
    console.error("Revert failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { up, down };

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
