const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function main() {
  const config = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    multipleStatements: true,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log("Connected to MySQL server.");

    const sqlPath = path.join(__dirname, "../db/init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Executing init.sql...");
    await connection.query(sql);
    console.log("Database initialized successfully.");

    await connection.end();
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

main();
