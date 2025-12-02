// routes/chatbot.js

const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const { authenticateToken } = require("../middlewares/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post("/chat", chatbotController.chat);
router.get("/history/:conversationId", chatbotController.getHistory);
router.delete(
  "/conversation/:conversationId",
  chatbotController.clearConversation
);
router.post("/feedback", chatbotController.submitFeedback);

module.exports = router;
