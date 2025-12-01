// Migration: Drop type column from communities table
const db = require("../config/database");

const up = async () => {
  const connection = await db.getConnection();
  try {
    // Check if column exists before dropping
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'communities' 
      AND COLUMN_NAME = 'type'
    `);

    if (columns.length > 0) {
      await connection.execute(`ALTER TABLE communities DROP COLUMN type`);
      console.log("✅ Dropped 'type' column from communities table");
    } else {
      console.log("ℹ️ Column 'type' does not exist, skipping...");
    }
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await db.getConnection();
  try {
    await connection.execute(`
      ALTER TABLE communities 
      ADD COLUMN type VARCHAR(50) DEFAULT 'other' AFTER name
    `);
    console.log("✅ Added 'type' column back to communities table");
  } finally {
    connection.release();
  }
};

module.exports = { up, down };

// Run directly if executed as script
if (require.main === module) {
  up()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
