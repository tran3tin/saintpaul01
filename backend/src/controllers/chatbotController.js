// controllers/chatbotController.js

const { v4: uuidv4 } = require("uuid");
const ChatConversationModel = require("../models/ChatConversationModel");
const chatbotService = require("../services/chatbotService");
const geminiService = require("../services/geminiService");

class ChatbotController {
  /**
   * Handle chat message with enhanced understanding
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

      // Normalize and clean message
      const cleanedMessage = message.trim();

      // 1. Analyze message with enhanced intent detection
      console.log("Step 1: Analyzing message...");
      const analysis = chatbotService.analyzeMessage(cleanedMessage);
      console.log("Analysis:", JSON.stringify(analysis, null, 2));

      // 2. Extract entities with fuzzy matching
      console.log("Step 2: Extracting entities...");
      const entities = await chatbotService.extractEntities(cleanedMessage);
      analysis.entities = entities;
      console.log("Entities:", JSON.stringify(entities, null, 2));

      // 3. Smart intent adjustment based on entities and question type
      this.adjustIntentBasedOnContext(analysis, entities);
      console.log("Adjusted intent:", analysis.intent);

      // 4. Retrieve context from database with enhanced queries
      console.log("Step 3: Retrieving context...");
      const context = await chatbotService.retrieveContext(analysis, entities);
      console.log("Context retrieved, length:", context.text?.length || 0);

      // 5. Get conversation history for continuity
      console.log("Step 4: Getting conversation history...");
      let conversationHistory = [];
      if (conversation_id) {
        try {
          const history = await ChatConversationModel.getByConversationId(
            conversation_id,
            5 // Last 5 exchanges
          );
          conversationHistory = history.flatMap((h) => [
            { role: "user", content: h.user_message },
            { role: "assistant", content: h.ai_response },
          ]);
        } catch (historyError) {
          console.warn("Could not load history:", historyError.message);
        }
      }

      // 6. Check for special intents that don't need AI
      if (analysis.intent === "greeting") {
        const greetingResponse = this.handleGreeting(req.user);
        return res.json({
          success: true,
          response: greetingResponse,
          conversation_id: conversation_id || uuidv4(),
          sources: [],
        });
      }

      // 7. Call Gemini AI with enhanced context
      console.log("Step 5: Calling Gemini...");
      const aiResponse = await geminiService.chat(
        cleanedMessage,
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

      // 8. Post-process response
      const processedResponse = this.postProcessResponse(
        aiResponse.message,
        analysis
      );

      // 9. Save conversation for future context
      console.log("Step 6: Saving conversation...");
      const newConversationId = conversation_id || uuidv4();
      try {
        await ChatConversationModel.create({
          conversation_id: newConversationId,
          user_id: req.user?.id,
          user_message: cleanedMessage,
          ai_response: processedResponse,
          context_used: context,
          entities_extracted: entities,
          intent: analysis.intent,
          sub_intent: analysis.subIntent,
          confidence: analysis.confidence,
          tokens_used: aiResponse.tokens,
          cost: aiResponse.cost,
        });
      } catch (saveError) {
        console.warn("Could not save conversation:", saveError.message);
      }

      // 10. Return response
      console.log("Step 7: Sending response...");
      return res.json({
        success: true,
        response: processedResponse,
        conversation_id: newConversationId,
        sources: context.sources || [],
        metadata: {
          intent: analysis.intent,
          confidence: analysis.confidence,
          questionType: analysis.questionType,
        },
      });
    } catch (error) {
      console.error("Chat error:", error);
      return res.status(500).json({
        success: false,
        error: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  }

  /**
   * Adjust intent based on context clues
   */
  adjustIntentBasedOnContext(analysis, entities) {
    // If found specific sister, prioritize sister_info
    if (entities.sister_id && analysis.intent === "general") {
      analysis.intent = "sister_info";
      console.log("Intent auto-adjusted to sister_info (found sister)");
    }

    // If found specific community, prioritize community_info
    if (
      entities.community_id &&
      analysis.intent === "general" &&
      !entities.sister_id
    ) {
      analysis.intent = "community_info";
      console.log("Intent auto-adjusted to community_info (found community)");
    }

    // If found stage, might be journey_info
    if (entities.stage && analysis.intent === "general") {
      analysis.intent = "journey_info";
      console.log("Intent auto-adjusted to journey_info (found stage)");
    }

    // Count questions should be statistics
    if (analysis.questionType === "count" && analysis.intent === "general") {
      analysis.intent = "statistics";
      console.log("Intent auto-adjusted to statistics (count question)");
    }

    // List questions might need specific handling
    if (analysis.questionType === "list" && analysis.intent === "general") {
      if (analysis.keywords.some((k) => /nữ tu|chị|sơ/i.test(k))) {
        analysis.intent = "sister_info";
      } else if (analysis.keywords.some((k) => /cộng đoàn/i.test(k))) {
        analysis.intent = "community_info";
      }
    }
  }

  /**
   * Handle greeting messages
   */
  handleGreeting(user) {
    const greetings = [
      `Xin chào ${user?.full_name || "bạn"}! 👋\n\nTôi là trợ lý AI của hệ thống quản lý Hội Dòng. Tôi có thể giúp bạn:\n\n📋 Tìm thông tin về nữ tu\n📍 Xem hành trình ơn gọi\n🏠 Tra cứu cộng đoàn\n📊 Xem thống kê\n\nBạn cần tôi giúp gì?`,
      `Chào ${user?.full_name || "bạn"}! 🙏\n\nTôi sẵn sàng hỗ trợ bạn tra cứu thông tin về Hội Dòng. Hãy hỏi tôi bất cứ điều gì nhé!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Post-process AI response for better formatting
   */
  postProcessResponse(response, analysis) {
    let processed = response;

    // Clean up excessive whitespace
    processed = processed.replace(/\n{3,}/g, "\n\n");

    // Ensure proper Vietnamese formatting
    processed = processed.replace(/(\d+)\/(\d+)\/(\d+)/g, (match, d, m, y) => {
      if (y.length === 4) return match;
      return `${d}/${m}/${y}`;
    });

    // Add helpful follow-up suggestions for certain intents
    if (
      analysis.intent === "statistics" &&
      !processed.includes("Bạn có thể hỏi")
    ) {
      processed +=
        "\n\n💡 *Bạn có thể hỏi thêm về chi tiết của từng cộng đoàn hoặc giai đoạn cụ thể.*";
    }

    return processed.trim();
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

      await ChatConversationModel.updateFeedback(
        message_id,
        is_helpful,
        feedback
      );

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
