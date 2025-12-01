// Migration: Alter community type column to allow more values and be nullable
const db = require("../config/database");

const up = async () => {
  const connection = await db.getConnection();
  try {
    // Alter type column to VARCHAR with default value
    await connection.execute(`
      ALTER TABLE communities 
      MODIFY COLUMN type VARCHAR(50) DEFAULT 'other'
    `);
    console.log(
      "✅ Altered communities.type column to VARCHAR(50) with default 'other'"
    );
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await db.getConnection();
  try {
    await connection.execute(`
      ALTER TABLE communities 
      MODIFY COLUMN type ENUM('motherhouse','education','healthcare','media','social') NOT NULL
    `);
    console.log("✅ Reverted communities.type column to ENUM");
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
