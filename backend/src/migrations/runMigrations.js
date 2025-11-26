const fs = require("fs");
const path = require("path");

const direction =
  (process.argv[2] || "up").toLowerCase() === "down" ? "down" : "up";
const migrationsDir = __dirname;

const loadMigrations = () => {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".js") && file !== "runMigrations.js")
    .sort();
};

const run = async () => {
  const migrationFiles = loadMigrations();
  const orderedFiles =
    direction === "up" ? migrationFiles : migrationFiles.slice().reverse();

  for (const fileName of orderedFiles) {
    const migrationPath = path.join(migrationsDir, fileName);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const migration = require(migrationPath);
    if (typeof migration[direction] !== "function") {
      console.warn(`Skipping ${fileName}; missing ${direction} handler.`);
      continue;
    }

    console.log(`Running ${direction} for ${fileName}`);
    await migration[direction]();
  }

  console.log(`All migrations ${direction} executed.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Migration run failed:", error);
  process.exit(1);
});
