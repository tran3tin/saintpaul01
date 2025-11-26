const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

// Load environment variables as early as possible
dotenv.config({ path: path.resolve(__dirname, ".env") });

const registerRoutes = require("./src/routes");
const { notFound, errorHandler } = require("./src/middlewares/errorHandler");
const { applySecurityMiddlewares } = require("./src/middlewares/security");
const db = require("./src/config/database");

const PORT = process.env.PORT || 3000;
const app = express();

// Security middlewares (helmet, CORS, sanitizers, rate limiters)
applySecurityMiddlewares(app);

// Core middlewares for parsing and static assets
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "src", "uploads"))
);

app.use(express.static(path.join(__dirname, "frontend")));

// Attach all API routes
registerRoutes(app);

// Fallback handlers for unmatched routes and errors
app.use(notFound);
app.use(errorHandler);

// Verify DB connectivity before accepting requests
const startServer = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Database connection verified successfully.");

    app.listen(PORT, () => {
      console.log(
        `HR Records Management API listening on port ${PORT} (env: ${
          process.env.NODE_ENV || "development"
        })`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
