const express = require("express");
const missionController = require("../controllers/missionController");
const { authenticateToken, authorize } = require("../middlewares/auth");

const router = express.Router();

const editorRoles = [
  "admin",
  "superior_general",
  "superior_provincial",
  "superior_community",
  "secretary",
];

router.use(authenticateToken);

router.get("/", missionController.getAllMissions);
router.get("/sister/:sisterId", missionController.getMissionsBySister);
router.get("/field/:field", missionController.getSistersByMissionField);

router.post("/", authorize(...editorRoles), missionController.createMission);

router.put("/:id", authorize(...editorRoles), missionController.updateMission);

router.post(
  "/:id/end",
  authorize(...editorRoles),
  missionController.endMission
);

module.exports = router;
