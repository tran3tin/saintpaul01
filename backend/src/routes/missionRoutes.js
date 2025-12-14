const express = require("express");
const missionController = require("../controllers/missionController");
const { authenticateToken, checkPermission } = require("../middlewares/auth");
const { attachDataScope } = require("../middlewares/dataScope");

const router = express.Router();

router.use(authenticateToken);
router.use(attachDataScope);

router.get(
  "/",
  checkPermission("missions.view_list"),
  missionController.getAllMissions
);
router.get(
  "/sister/:sisterId",
  checkPermission("missions.view_list"),
  missionController.getMissionsBySister
);
router.get(
  "/field/:field",
  checkPermission("missions.view_list"),
  missionController.getSistersByMissionField
);
router.get(
  "/:id",
  checkPermission("missions.view_detail"),
  missionController.getMissionById
);

router.post(
  "/",
  checkPermission("missions.create"),
  missionController.createMission
);

router.put(
  "/:id",
  checkPermission("missions.edit"),
  missionController.updateMission
);
router.delete(
  "/:id",
  checkPermission("missions.delete"),
  missionController.deleteMission
);

router.post(
  "/:id/end",
  checkPermission("missions.edit"),
  missionController.endMission
);

module.exports = router;
