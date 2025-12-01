// Migration: Add extra fields to communities table
const db = require("../config/database");

const up = async () => {
  const connection = await db.getConnection();
  try {
    // Check and add columns if not exist
    const columnsToAdd = [
      {
        name: "phone",
        sql: "ALTER TABLE communities ADD COLUMN phone VARCHAR(20) NULL AFTER address",
      },
      {
        name: "email",
        sql: "ALTER TABLE communities ADD COLUMN email VARCHAR(100) NULL AFTER phone",
      },
      {
        name: "established_date",
        sql: "ALTER TABLE communities ADD COLUMN established_date DATE NULL AFTER email",
      },
      {
        name: "status",
        sql: "ALTER TABLE communities ADD COLUMN status VARCHAR(20) DEFAULT 'active' AFTER established_date",
      },
      {
        name: "description",
        sql: "ALTER TABLE communities ADD COLUMN description TEXT NULL AFTER status",
      },
    ];

    for (const col of columnsToAdd) {
      const [columns] = await connection.execute(
        `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'communities' 
        AND COLUMN_NAME = ?
      `,
        [col.name]
      );

      if (columns.length === 0) {
        await connection.execute(col.sql);
        console.log(`✅ Added column '${col.name}' to communities table`);
      } else {
        console.log(`ℹ️ Column '${col.name}' already exists, skipping...`);
      }
    }

    console.log("✅ Migration completed successfully");
  } finally {
    connection.release();
  }
};

const down = async () => {
  const connection = await db.getConnection();
  try {
    const columnsToDrop = [
      "phone",
      "email",
      "established_date",
      "status",
      "description",
    ];

    for (const col of columnsToDrop) {
      const [columns] = await connection.execute(
        `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'communities' 
        AND COLUMN_NAME = ?
      `,
        [col]
      );

      if (columns.length > 0) {
        await connection.execute(`ALTER TABLE communities DROP COLUMN ${col}`);
        console.log(`✅ Dropped column '${col}' from communities table`);
      }
    }
  } finally {
    connection.release();
  }
};

module.exports = { up, down };

// Run directly if executed as script
if (require.main === module) {
  up()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
