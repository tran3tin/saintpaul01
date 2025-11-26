const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function checkUser() {
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
    const passwordToCheck = "password123";

    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      console.log(`User '${username}' NOT FOUND.`);
    } else {
      const user = rows[0];
      console.log(`User '${username}' FOUND.`);
      console.log("User details:", { ...user, password: "[HIDDEN]" });

      const isMatch = await bcrypt.compare(passwordToCheck, user.password);
      console.log(`Password '${passwordToCheck}' match: ${isMatch}`);

      if (!user.is_active) {
        console.log("WARNING: User is NOT active.");
      }
    }

    await connection.end();
  } catch (err) {
    console.error("Error checking user:", err);
  }
}

checkUser();
