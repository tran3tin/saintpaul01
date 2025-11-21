const authRoutes = require("./authRoutes");
const sisterRoutes = require("./sisterRoutes");
const vocationJourneyRoutes = require("./vocationJourneyRoutes");
const communityRoutes = require("./communityRoutes");
const communityAssignmentRoutes = require("./communityAssignmentRoutes");
const missionRoutes = require("./missionRoutes");
const educationRoutes = require("./educationRoutes");
const trainingCourseRoutes = require("./trainingCourseRoutes");
const healthRecordRoutes = require("./healthRecordRoutes");
const evaluationRoutes = require("./evaluationRoutes");
const departureRecordRoutes = require("./departureRecordRoutes");
const reportRoutes = require("./reportRoutes");
const userRoutes = require("./userRoutes");
const auditLogRoutes = require("./auditLogRoutes");

module.exports = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/sisters", sisterRoutes);
  app.use("/api/vocation-journey", vocationJourneyRoutes);
  app.use("/api/communities", communityRoutes);
  app.use("/api/assignments", communityAssignmentRoutes);
  app.use("/api/missions", missionRoutes);
  app.use("/api/education", educationRoutes);
  app.use("/api/training-courses", trainingCourseRoutes);
  app.use("/api/health-records", healthRecordRoutes);
  app.use("/api/evaluations", evaluationRoutes);
  app.use("/api/departure-records", departureRecordRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/audit-logs", auditLogRoutes);

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
};
