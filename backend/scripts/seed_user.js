const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function main() {
  const config = {
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log("Connected to MySQL server.");

    const username = "admin";
    const password = "password123";
    const email = "admin@example.com";
    const role = "admin";

    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      console.log("Admin user already exists.");
    } else {
      await connection.execute(
        "INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, email, role, 1]
      );
      console.log(
        `Admin user created with username: ${username} and password: ${password}`
      );
    }

    await connection.end();
  } catch (err) {
    console.error("Error seeding user:", err);
    process.exit(1);
  }
}

main();
