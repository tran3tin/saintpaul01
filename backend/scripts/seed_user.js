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

    // Admin user với mật khẩu mặc định "123"
    const username = "admin";
    const password = "123"; // Mật khẩu mặc định
    const email = "admin@hoidong.osp";
    const role = "admin";

    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      // Update password nếu admin đã tồn tại
      await connection.execute(
        "UPDATE users SET password = ?, email = ? WHERE username = ?",
        [hashedPassword, email, username]
      );
      console.log(`Admin user updated with password: ${password}`);
    } else {
      await connection.execute(
        "INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, email, role, 1]
      );
      console.log(
        `Admin user created with username: ${username} and password: ${password}`
      );
    }

    // Tạo thêm các user mẫu khác
    const sampleUsers = [
      {
        username: "betrentong",
        password: "123",
        email: "betrentong@hoidong.osp",
        role: "superior_general",
      },
      {
        username: "thuky",
        password: "123",
        email: "thuky@hoidong.osp",
        role: "secretary",
      },
      {
        username: "betrencongdoan",
        password: "123",
        email: "btcd@hoidong.osp",
        role: "superior_community",
      },
    ];

    for (const user of sampleUsers) {
      const [existingRows] = await connection.execute(
        "SELECT * FROM users WHERE username = ?",
        [user.username]
      );

      const userHashedPassword = await bcrypt.hash(user.password, 10);

      if (existingRows.length > 0) {
        await connection.execute(
          "UPDATE users SET password = ?, email = ?, role = ? WHERE username = ?",
          [userHashedPassword, user.email, user.role, user.username]
        );
        console.log(`User "${user.username}" updated.`);
      } else {
        await connection.execute(
          "INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, ?, ?)",
          [user.username, userHashedPassword, user.email, user.role, 1]
        );
        console.log(
          `User "${user.username}" created with password: ${user.password}`
        );
      }
    }

    console.log("\n=== Thông tin đăng nhập ===");
    console.log("Admin: username=admin, password=123");
    console.log("Bề Trên Tổng: username=betrentong, password=123");
    console.log("Thư ký: username=thuky, password=123");
    console.log("Bề Trên Cộng Đoàn: username=betrencongdoan, password=123");

    await connection.end();
  } catch (err) {
    console.error("Error seeding user:", err);
    process.exit(1);
  }
}

main();
