const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

// Ensure environment variables are loaded when this module is imported
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error("Missing required database environment variables.");
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("MySQL connection pool established successfully.");
  } catch (error) {
    console.error("Failed to initialize MySQL connection pool:", error.message);
    throw error;
  }
})();

module.exports = pool;
