// controllers/chatbotController.js

const { v4: uuidv4 } = require("uuid");
const ChatConversationModel = require("../models/ChatConversationModel");
const chatbotService = require("../services/chatbotService");
const geminiService = require("../services/geminiService");

class ChatbotController {
  /**
   * Handle chat message
   */
  async chat(req, res) {
    try {
      console.log("=== CHATBOT REQUEST ===");
      const { message, conversation_id } = req.body;
      console.log("Message:", message);

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      // 1. Analyze message
      console.log("Step 1: Analyzing message...");
      const analysis = chatbotService.analyzeMessage(message);
      console.log("Analysis:", analysis);

      // 2. Extract entities
      console.log("Step 2: Extracting entities...");
      const entities = await chatbotService.extractEntities(message);
      analysis.entities = entities;
      console.log("Entities:", entities);

      // Auto-adjust intent based on entities found
      if (entities.sister_id && analysis.intent === "general") {
        analysis.intent = "sister_info";
        console.log("Intent auto-adjusted to sister_info");
      }
      if (entities.community_id && analysis.intent === "general") {
        analysis.intent = "community_info";
        console.log("Intent auto-adjusted to community_info");
      }

      // 3. Retrieve context from database
      console.log("Step 3: Retrieving context...");
      const context = await chatbotService.retrieveContext(analysis, entities);
      console.log("Context retrieved");

      // 4. Get conversation history
      console.log("Step 4: Getting conversation history...");
      let conversationHistory = [];
      if (conversation_id) {
        const history = await ChatConversationModel.getByConversationId(
          conversation_id,
          5 // Last 5 messages
        );
        conversationHistory = history
          .map((h) => ({
            role: "user",
            content: h.user_message,
          }))
          .concat(
            history.map((h) => ({
              role: "assistant",
              content: h.ai_response,
            }))
          );
      }

      // 5. Call Gemini AI
      console.log("Step 5: Calling Gemini...");
      const aiResponse = await geminiService.chat(
        message,
        context,
        conversationHistory
      );
      console.log("AI Response success:", aiResponse.success);

      if (!aiResponse.success) {
        console.log("AI Error:", aiResponse.error);
        return res.status(500).json({
          success: false,
          error: aiResponse.error || "Failed to get AI response",
        });
      }

      // 6. Save conversation
      console.log("Step 6: Saving conversation...");
      const newConversationId = conversation_id || uuidv4();
      await ChatConversationModel.create({
        conversation_id: newConversationId,
        user_id: req.user?.id,
        user_message: message,
        ai_response: aiResponse.message,
        context_used: context,
        entities_extracted: entities,
        intent: analysis.intent,
        tokens_used: aiResponse.tokens,
        cost: aiResponse.cost,
      });

      // 7. Return response
      console.log("Step 7: Sending response...");
      return res.json({
        success: true,
        response: aiResponse.message,
        conversation_id: newConversationId,
        sources: context.sources || [],
      });
    } catch (error) {
      console.error("Chat error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(req, res) {
    try {
      const { conversationId } = req.params;

      const history = await ChatConversationModel.getByConversationId(
        conversationId
      );

      const messages = [];
      history.forEach((record) => {
        messages.push({
          role: "user",
          content: record.user_message,
          timestamp: record.created_at,
        });
        messages.push({
          role: "assistant",
          content: record.ai_response,
          timestamp: record.created_at,
          sources: record.context_used?.sources || [],
        });
      });

      return res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error("Get history error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Clear conversation
   */
  async clearConversation(req, res) {
    try {
      const { conversationId } = req.params;

      await ChatConversationModel.deleteByConversationId(conversationId);

      return res.json({
        success: true,
        message: "Conversation cleared successfully",
      });
    } catch (error) {
      console.error("Clear conversation error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Submit feedback
   */
  async submitFeedback(req, res) {
    try {
      const { message_id, is_helpful, feedback } = req.body;

      await ChatConversationModel.updateFeedback(message_id, is_helpful, feedback);

      return res.json({
        success: true,
        message: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Submit feedback error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = new ChatbotController();
